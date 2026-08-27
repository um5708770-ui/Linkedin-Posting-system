import { db, ensureDbReady } from './db';
import { DEFAULT_PROMPTS } from './default-prompts';

export type SettingsMap = {
  gemini_api_key: string;
  selected_models: string;
  ideas_prompt: string;
  post_prompt: string;
  seo_image_prompt: string;
  brand_voice: string;
};

export async function getSettings(): Promise<SettingsMap> {
  await ensureDbReady();

  const defaults: SettingsMap = {
    gemini_api_key: process.env.GEMINI_API_KEY || '',
    selected_models: 'gemini-3.5-flash,gemini-3.6-flash',
    ideas_prompt: DEFAULT_PROMPTS.ideas_prompt,
    post_prompt: DEFAULT_PROMPTS.post_prompt,
    seo_image_prompt: DEFAULT_PROMPTS.seo_image_prompt,
    brand_voice: DEFAULT_PROMPTS.brand_voice,
  };

  try {
    const dbSettings = await db.settings.findMany();
    const result = { ...defaults };

    for (const item of dbSettings) {
      if (item.key in result) {
        result[item.key as keyof SettingsMap] = item.value;
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching settings from DB:', error);
    return defaults;
  }
}

export function getParsedGeminiKeys(settings: SettingsMap): string[] {
  const raw = settings.gemini_api_key || process.env.GEMINI_API_KEY || '';
  const keys = raw
    .split(/[\n\r,;]+/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);

  return keys.length > 0 ? keys : [];
}

export function getParsedSelectedModels(settings: SettingsMap): string[] {
  const raw = settings.selected_models || 'gemini-3.5-flash,gemini-3.6-flash';
  const models = raw
    .split(/[\n\r,;]+/)
    .map((m) => m.trim())
    .filter((m) => m === 'gemini-3.5-flash' || m === 'gemini-3.6-flash');

  return models.length > 0 ? models : ['gemini-3.5-flash', 'gemini-3.6-flash'];
}

export async function saveSetting(key: keyof SettingsMap, value: string) {
  await ensureDbReady();
  return await db.settings.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: { key, value, updatedAt: new Date() },
  });
}

export async function saveAllSettings(settings: Partial<SettingsMap>) {
  await ensureDbReady();
  const keys = Object.keys(settings) as (keyof SettingsMap)[];
  for (const key of keys) {
    if (settings[key] !== undefined) {
      await saveSetting(key, settings[key] as string);
    }
  }
}

export async function resetSettingToDefault(key: keyof SettingsMap) {
  await ensureDbReady();
  const defaultValue = key === 'gemini_api_key'
    ? (process.env.GEMINI_API_KEY || '')
    : DEFAULT_PROMPTS[key as keyof typeof DEFAULT_PROMPTS] || '';

  await saveSetting(key, defaultValue);
  return defaultValue;
}

