import { NextResponse } from 'next/server';
import { generateIdeasFromAI } from '@/lib/gemini';

export async function POST() {
  try {
    const ideas = await generateIdeasFromAI();
    return NextResponse.json({ ideas });
  } catch (error: any) {
    console.error('Error generating ideas:', error);
    const isMissingKey = error?.message?.includes('MISSING_API_KEY');
    return NextResponse.json(
      {
        error: isMissingKey
          ? 'Gemini API Key is missing. Please add your Gemini API Key in Settings.'
          : error?.message || 'Failed to generate ideas. Please check your Gemini API Key.',
        isMissingKey,
      },
      { status: isMissingKey ? 400 : 500 }
    );
  }
}
