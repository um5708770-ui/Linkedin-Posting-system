import { NextResponse } from 'next/server';
import { generatePostDraftFromAI } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { ideaTitle, ideaDescription } = await request.json();

    if (!ideaTitle) {
      return NextResponse.json({ error: 'ideaTitle is required' }, { status: 400 });
    }

    const postText = await generatePostDraftFromAI(ideaTitle, ideaDescription || '');
    return NextResponse.json({ postText });
  } catch (error: any) {
    console.error('Error drafting post:', error);
    const isMissingKey = error?.message?.includes('MISSING_API_KEY');
    return NextResponse.json(
      {
        error: isMissingKey
          ? 'Gemini API Key is missing. Please add your Gemini API Key in Settings.'
          : error?.message || 'Failed to generate post draft.',
        isMissingKey,
      },
      { status: isMissingKey ? 400 : 500 }
    );
  }
}
