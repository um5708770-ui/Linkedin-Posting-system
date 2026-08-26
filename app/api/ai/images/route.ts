import { NextResponse } from 'next/server';
import { generateImageVariationsFromAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { imagePrompt, ideaTitle, postText } = await request.json();

    if (!imagePrompt) {
      return NextResponse.json({ error: 'imagePrompt is required' }, { status: 400 });
    }

    const images = await generateImageVariationsFromAI(imagePrompt, ideaTitle, postText);
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Error generating images:', error);
    const isMissingKey = error?.message?.includes('MISSING_API_KEY');
    return NextResponse.json(
      {
        error: isMissingKey
          ? 'Gemini API Key is missing. Please add your Gemini API Key in Settings.'
          : error?.message || 'Failed to generate images.',
        isMissingKey,
      },
      { status: isMissingKey ? 400 : 500 }
    );
  }
}
