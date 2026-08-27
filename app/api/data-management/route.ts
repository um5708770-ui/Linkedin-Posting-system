import { NextResponse } from 'next/server';
import { db, ensureDbReady } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbReady();
    const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } });
    const settings = await db.settings.findMany();

    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      postsCount: posts.length,
      settingsCount: settings.length,
      posts,
      settings,
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="linkedin-studio-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Export failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    const backup = await request.json();

    if (!backup || !Array.isArray(backup.posts)) {
      return NextResponse.json({ error: 'Invalid JSON backup format. Must contain a "posts" array.' }, { status: 400 });
    }

    let restoredPostsCount = 0;
    let restoredSettingsCount = 0;

    // Restore posts
    for (const post of backup.posts) {
      await db.post.upsert({
        where: { id: post.id },
        update: {
          status: post.status,
          ideaTitle: post.ideaTitle,
          ideaDescription: post.ideaDescription,
          postText: post.postText,
          seoTags: typeof post.seoTags === 'object' ? JSON.stringify(post.seoTags) : post.seoTags,
          imagePrompt: post.imagePrompt,
          imageUrl: post.imageUrl,
          imageOptions: typeof post.imageOptions === 'object' ? JSON.stringify(post.imageOptions) : post.imageOptions,
          scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
          updatedAt: new Date(),
        },
        create: {
          id: post.id,
          status: post.status || 'draft',
          ideaTitle: post.ideaTitle,
          ideaDescription: post.ideaDescription,
          postText: post.postText,
          seoTags: typeof post.seoTags === 'object' ? JSON.stringify(post.seoTags) : post.seoTags,
          imagePrompt: post.imagePrompt,
          imageUrl: post.imageUrl,
          imageOptions: typeof post.imageOptions === 'object' ? JSON.stringify(post.imageOptions) : post.imageOptions,
          scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          updatedAt: new Date(),
        },
      });
      restoredPostsCount++;
    }

    // Restore settings if present
    if (Array.isArray(backup.settings)) {
      for (const item of backup.settings) {
        if (item.key && item.value !== undefined) {
          await db.settings.upsert({
            where: { key: item.key },
            update: { value: item.value, updatedAt: new Date() },
            create: { key: item.key, value: item.value, updatedAt: new Date() },
          });
          restoredSettingsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully restored ${restoredPostsCount} posts and ${restoredSettingsCount} settings.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Restore failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbReady();
    const { confirmation } = await request.json();

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Confirmation mismatch. You must type "DELETE" exactly.' }, { status: 400 });
    }

    const deleted = await db.post.deleteMany();
    return NextResponse.json({
      success: true,
      message: `Successfully deleted all ${deleted.count} posts.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Delete operation failed' }, { status: 500 });
  }
}

