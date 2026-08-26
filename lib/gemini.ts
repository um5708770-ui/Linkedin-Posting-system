import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSettings, getParsedGeminiKeys, getParsedSelectedModels } from './settings';

// Global pair rotation tracker
let globalPairIndex = 0;

// Helper to sanitize and parse JSON response with fallback
function parseJsonWithFallback(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (err) {}
    }
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch (err) {}
    }
    throw e;
  }
}

/**
 * Rotated AI Call Engine
 * Revolving Loop Sequence: (Key 1, Model 1) -> (Key 1, Model 2) -> (Key 2, Model 1) -> (Key 2, Model 2)...
 */
async function executeRotatedAiCall(
  promptCallback: (settings: any) => string,
  transformOutput?: (text: string) => any,
  jsonMode: boolean = false
): Promise<any> {
  const settings = await getSettings();
  const keys = getParsedGeminiKeys(settings);
  const models = getParsedSelectedModels(settings);

  if (keys.length === 0) {
    throw new Error('MISSING_API_KEY: Gemini API Key is missing. Please add your key in Settings.');
  }

  // Build the ordered revolving pairs: (Key 1, Model 1) -> (Key 1, Model 2) -> (Key 2, Model 1) -> (Key 2, Model 2)...
  const pairs: { key: string; model: string }[] = [];
  for (const k of keys) {
    for (const m of models) {
      pairs.push({ key: k, model: m });
    }
  }

  const maxAttempts = Math.max(pairs.length * 2, 4);
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick current rotated (Key, Model) pair
    const currentPair = pairs[globalPairIndex % pairs.length];

    // Advance pair index for next API call
    globalPairIndex = (globalPairIndex + 1) % pairs.length;

    try {
      const genAI = new GoogleGenerativeAI(currentPair.key);
      const modelConfig: any = { model: currentPair.model };
      if (jsonMode) {
        modelConfig.generationConfig = { responseMimeType: 'application/json' };
      }
      const model = genAI.getGenerativeModel(modelConfig);
      const prompt = promptCallback(settings);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (transformOutput) {
        return transformOutput(responseText);
      }
      return responseText.trim();
    } catch (err: any) {
      lastError = err;
      console.warn(
        `Gemini API rotation attempt ${attempt + 1}/${maxAttempts} failed [Model: ${currentPair.model}, Key ends in: ...${currentPair.key.slice(-4)}]:`,
        err?.message || err
      );
    }
  }

  throw lastError || new Error('All rotated Gemini API keys and models failed to generate a response.');
}

/**
 * Step 1: Idea Generation
 */
export async function generateIdeasFromAI(): Promise<{ title: string; description: string }[]> {
  return await executeRotatedAiCall(
    (settings) => settings.ideas_prompt,
    (responseText) => {
      try {
        const parsed = parseJsonWithFallback(responseText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .map((item) => ({
              title: item.title || item.idea || 'Podcast Growth Strategy',
              description: item.description || item.concept || item.title || '',
            }))
            .slice(0, 8);
        }
      } catch (e) {}

      // Fallback text parser
      const lines = responseText.split('\n').map((l) => l.trim()).filter(Boolean);
      const fallbackIdeas: { title: string; description: string }[] = [];
      let currentTitle = '';
      let currentDesc = '';

      for (const line of lines) {
        if (line.match(/^(IDEA|\d+[\.\)]|Title:)/i)) {
          if (currentTitle) {
            fallbackIdeas.push({ title: currentTitle, description: currentDesc || currentTitle });
          }
          currentTitle = line.replace(/^(IDEA \d+:?|\d+[\.\)]|Title:?)/i, '').trim();
          currentDesc = '';
        } else if (currentTitle) {
          currentDesc += (currentDesc ? ' ' : '') + line;
        }
      }
      if (currentTitle) {
        fallbackIdeas.push({ title: currentTitle, description: currentDesc || currentTitle });
      }

      if (fallbackIdeas.length > 0) {
        return fallbackIdeas.slice(0, 8);
      }

      throw new Error('Invalid ideas array structure received from Gemini API.');
    },
    true
  );
}

/**
 * Step 2: Post Drafting
 */
export async function generatePostDraftFromAI(ideaTitle: string, ideaDescription: string): Promise<string> {
  return await executeRotatedAiCall((settings) => {
    let prompt = settings.post_prompt;
    prompt = prompt.replace('{brand_voice}', settings.brand_voice || 'Direct, punchy, authoritative, fluff-free.');
    prompt = prompt.replace('{selected_idea}', `Title: ${ideaTitle}\nDescription: ${ideaDescription}`);
    prompt = prompt.replace('{idea_title}', ideaTitle);
    prompt = prompt.replace('{idea_description}', ideaDescription);
    return prompt;
  });
}

/**
 * Step 3: SEO Tags + Image Prompt Generation
 */
export async function generateSeoAndImagePromptFromAI(postText: string): Promise<{ tags: string[]; imagePrompt: string }> {
  const imagePrompt = await executeRotatedAiCall((settings) => {
    let prompt = settings.seo_image_prompt;
    return prompt.replace('{post_text}', postText);
  });

  return {
    tags: [],
    imagePrompt: imagePrompt || '3D vector microphone icon on a dark background with blue highlights.',
  };
}

/**
 * Step 4: 4 Image Variation Generation (with Key Rotation)
 */
export async function generateImageVariationsFromAI(
  imagePrompt: string,
  ideaTitle?: string,
  postText?: string
): Promise<string[]> {
  const settings = await getSettings();
  const keys = getParsedGeminiKeys(settings);
  const fullPrompt = `Specific Visual Theme: ${imagePrompt}\nTitle context: ${ideaTitle || 'Podcast Growth Blueprint'}`;

  const images: string[] = [];

  if (keys.length > 0) {
    // Try rotated keys for Imagen API request
    for (let i = 0; i < keys.length; i++) {
      const currentApiKey = keys[(globalPairIndex + i) % keys.length];
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${currentApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt: fullPrompt }],
              parameters: { sampleCount: 4, aspectRatio: '1:1', outputMimeType: 'image/jpeg' },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data?.predictions && Array.isArray(data.predictions)) {
            for (const pred of data.predictions) {
              if (pred.bytesBase64Encoded) {
                images.push(`data:image/jpeg;base64,${pred.bytesBase64Encoded}`);
              }
            }
            if (images.length === 4) {
              globalPairIndex = (globalPairIndex + 1) % keys.length;
              return images;
            }
          }
        }
      } catch (e) {
        console.warn('Gemini Imagen REST API attempt failed for key, trying next rotated key:', e);
      }
    }
  }

  // Fallback graphic generator (generates 4 stylized SVG variations encoded as Data URIs)
  return generateBrandedTemplateSvgs(imagePrompt, ideaTitle || 'Podcast Growth Strategy');
}

function generateBrandedTemplateSvgs(visualPrompt: string, titleText: string): string[] {
  const cleanTitle = titleText.length > 50 ? titleText.substring(0, 48) + '...' : titleText;

  const styles = [
    {
      bgGrad: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
      accentColor: '#38BDF8',
      cardBg: 'rgba(255, 255, 255, 0.08)',
      icon: '🎙️',
      badge: 'PODCAST GROWTH INSIGHTS',
      themeName: 'Electric Navy',
    },
    {
      bgGrad: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #0F172A 100%)',
      accentColor: '#FDE047',
      cardBg: 'rgba(15, 23, 42, 0.4)',
      icon: '📈',
      badge: 'STRATEGY BREAKDOWN',
      themeName: 'Deep Cobalt',
    },
    {
      bgGrad: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      accentColor: '#60A5FA',
      cardBg: 'rgba(37, 99, 235, 0.15)',
      icon: '🚀',
      badge: 'HIGH IMPACT PLAYBOOK',
      themeName: 'Cyber Dark',
    },
    {
      bgGrad: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
      accentColor: '#34D399',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      icon: '🎧',
      badge: 'AUTHORITY BUILDER',
      themeName: 'Emerald Glow',
    },
  ];

  return styles.map((style) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <defs>
        <linearGradient id="bg-${style.themeName.replace(' ', '')}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${style.bgGrad.split(' ')[1]}" />
          <stop offset="100%" stop-color="${style.bgGrad.split(' ').slice(-1)[0].replace(')', '')}" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="800" height="800" fill="url(#bg-${style.themeName.replace(' ', '')})" />

      <!-- Subtle background grid lines -->
      <path d="M0 200 H800 M0 400 H800 M0 600 H800 M200 0 V800 M400 0 V800 M600 0 V800" stroke="rgba(255,255,255,0.03)" stroke-width="1" />

      <!-- Left Content Box -->
      <g transform="translate(60, 140)">
        <!-- Badge -->
        <rect x="0" y="0" width="240" height="36" rx="18" fill="${style.accentColor}" opacity="0.2" />
        <text x="18" y="23" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" fill="${style.accentColor}" letter-spacing="1.5">${style.badge}</text>

        <!-- Main Title -->
        <foreignObject x="0" y="60" width="420" height="320">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; font-size: 38px; font-weight: 800; color: #FFFFFF; line-height: 1.25; letter-spacing: -0.5px;">
            ${cleanTitle}
          </div>
        </foreignObject>

        <!-- Subtext -->
        <foreignObject x="0" y="320" width="400" height="120">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, -apple-system, sans-serif; font-size: 18px; font-weight: 400; color: #94A3B8; line-height: 1.5;">
            ${visualPrompt.length > 90 ? visualPrompt.substring(0, 88) + '...' : visualPrompt}
          </div>
        </foreignObject>
      </g>

      <!-- Right 3D Visual Icon Container -->
      <g transform="translate(500, 240)">
        <!-- Ambient Glow -->
        <circle cx="110" cy="110" r="130" fill="${style.accentColor}" opacity="0.15" filter="url(#glow)" />
        <!-- 3D Card Backdrop -->
        <rect x="0" y="0" width="220" height="220" rx="32" fill="${style.cardBg}" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <!-- 3D Icon Emoji render -->
        <text x="110" y="145" font-size="100" text-anchor="middle">${style.icon}</text>
      </g>

      <!-- Bottom Brand Footer Pill -->
      <g transform="translate(60, 680)">
        <rect x="0" y="0" width="680" height="60" rx="16" fill="rgba(15, 23, 42, 0.6)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
        <circle cx="35" cy="30" r="12" fill="#2563EB" />
        <text x="35" y="35" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">L</text>
        <text x="62" y="36" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="#FFFFFF">LinkedIn Content Studio</text>
        <text x="650" y="36" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="13" fill="${style.accentColor}" text-anchor="end">Follow for Podcast Growth 🔔</text>
      </g>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  });
}
