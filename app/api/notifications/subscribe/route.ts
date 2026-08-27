import { NextResponse } from 'next/server';
import { db, ensureDbReady } from '@/lib/db';

const DEFAULT_VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BKDw0WDT1YaWIjFRR5tkYU-YkI4S5hxBxhOzu1yHedBGlLsFDX6TAKWI7O_AA86eeqkGIhCALhUVvnV08XTHQe0';

export async function GET() {
  try {
    await ensureDbReady();
    const count = await db.pushSubscription.count();
    return NextResponse.json({
      publicKey: DEFAULT_VAPID_PUBLIC_KEY,
      activeSubscriptions: count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch subscription info' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Invalid subscription object' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Missing p256dh or auth keys in subscription' },
        { status: 400 }
      );
    }

    await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh,
        auth,
      },
      create: {
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json({ success: true, message: 'Subscribed to Daily Reminders!' });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required to unsubscribe' },
        { status: 400 }
      );
    }

    await db.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error: any) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete push subscription' },
      { status: 500 }
    );
  }
}
