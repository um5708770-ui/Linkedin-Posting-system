import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { publishToLinkedIn } from '@/lib/linkedin-stub';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await db.post.findUnique({
      where: { id: params.id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Call the isolated stub function
    const result = await publishToLinkedIn(post.postText || '', post.imageUrl);

    if (result.success) {
      await db.post.update({
        where: { id: params.id },
        data: { status: 'published', updatedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: result.message, status: 'published' });
    } else {
      // Mark post as ready to publish if scheduled time was met
      await db.post.update({
        where: { id: params.id },
        data: { status: 'ready', updatedAt: new Date() },
      });
      return NextResponse.json({
        success: false,
        message: result.message,
        status: 'ready',
        copyHelper: true,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Publishing failed' }, { status: 500 });
  }
}
