import { NextResponse } from 'next/server';
import { db, ensureDbReady } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await ensureDbReady();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { ideaTitle: { contains: search } },
        { postText: { contains: search } },
        { seoTags: { contains: search } },
      ];
    }

    const posts = await db.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const {
      status = 'draft',
      ideaTitle,
      ideaDescription,
      postText,
      seoTags,
      imagePrompt,
      imageUrl,
      imageOptions,
      scheduledFor,
    } = body;

    const post = await db.post.create({
      data: {
        status,
        ideaTitle,
        ideaDescription,
        postText,
        seoTags: Array.isArray(seoTags) ? JSON.stringify(seoTags) : seoTags,
        imagePrompt,
        imageUrl,
        imageOptions: Array.isArray(imageOptions) ? JSON.stringify(imageOptions) : imageOptions,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create post' }, { status: 500 });
  }
}

