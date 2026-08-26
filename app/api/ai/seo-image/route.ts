import { NextResponse } from 'next/server';
import { generateSeoAndImagePromptFromAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { postText } = await request.json();

    if (!postText) {
      return NextResponse.json({ error: 'postText is required' }, { status: 400 });
    }

    const data = await generateSeoAndImagePromptFromAI(postText);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error generating SEO/Image prompt:', error);
    const isMissingKey = error?.message?.includes('MISSING_API_KEY');
    return NextResponse.json(
      {
        error: isMissingKey
          ? 'Gemini API Key is missing. Please add your Gemini API Key in Settings.'
          : error?.message || 'Failed to generate SEO tags and image prompt.',
        isMissingKey,
      },
      { status: isMissingKey ? 400 : 500 }
    );
  }
}
