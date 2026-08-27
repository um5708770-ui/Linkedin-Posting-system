import { NextResponse } from 'next/server';
import { db, ensureDbReady } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbReady();
    const post = await db.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch post' }, { status: 500 });
  }
}

async function handleUpdate(id: string, body: any) {
  await ensureDbReady();
  const updateData: any = { ...body, updatedAt: new Date() };

  if (body.seoTags && Array.isArray(body.seoTags)) {
    updateData.seoTags = JSON.stringify(body.seoTags);
  }
  if (body.imageOptions && Array.isArray(body.imageOptions)) {
    updateData.imageOptions = JSON.stringify(body.imageOptions);
  }
  if (body.scheduledFor !== undefined) {
    updateData.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
  }

  const post = await db.post.update({
    where: { id },
    data: updateData,
  });

  // Enforce Max 10 Published Posts FIFO Rule
  if (updateData.status === 'published') {
    const publishedPosts = await db.post.findMany({
      where: { status: 'published' },
      orderBy: { updatedAt: 'desc' },
    });

    if (publishedPosts.length > 10) {
      const excess = publishedPosts.slice(10);
      const excessIds = excess.map((p) => p.id);
      await db.post.deleteMany({
        where: { id: { in: excessIds } },
      });
    }
  }

  return post;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const post = await handleUpdate(params.id, body);
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const post = await handleUpdate(params.id, body);
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDbReady();
    await db.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete post' }, { status: 500 });
  }
}

