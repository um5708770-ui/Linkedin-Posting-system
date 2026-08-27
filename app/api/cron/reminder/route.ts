import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { db, ensureDbReady } from '@/lib/db';
import { getSettings } from '@/lib/settings';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BKDw0WDT1YaWIjFRR5tkYU-YkI4S5hxBxhOzu1yHedBGlLsFDX6TAKWI7O_AA86eeqkGIhCALhUVvnV08XTHQe0';

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  '8iaISx4HTJo3bC5zqhZB0WMfPYhdEFi3SHuPRvOXt3c';

try {
  webpush.setVapidDetails(
    'mailto:admin@linkedin-studio.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (err) {
  console.error('Failed to configure web-push VAPID details:', err);
}

export async function GET(request: Request) {
  return handleCronNotification(request);
}

export async function POST(request: Request) {
  return handleCronNotification(request);
}

async function handleCronNotification(request: Request) {
  try {
    await ensureDbReady();
    const url = new URL(request.url);
    const isTest = url.searchParams.get('test') === 'true';

    const settings = await getSettings();

    if (!isTest && settings.reminder_enabled === 'false') {
      return NextResponse.json({
        success: true,
        message: 'Daily reminder is currently stopped/disabled in settings.',
        skipped: true,
      });
    }

    if (!isTest) {
      const targetTimeStr = settings.reminder_time || '20:00';
      const targetHour = parseInt(targetTimeStr.split(':')[0], 10) || 20;

      const now = new Date();
      const currentPktHour = (now.getUTCHours() + 5) % 24;

      if (currentPktHour !== targetHour) {
        return NextResponse.json({
          success: true,
          message: `Skipped: Current PKT hour (${currentPktHour}:00) does not match target reminder time (${targetTimeStr}).`,
          skipped: true,
          currentPktHour,
          targetHour,
        });
      }
    }

    const subscriptions = await db.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active devices subscribed for daily reminder.',
        sent: 0,
      });
    }

    const formattedTime = settings.reminder_time || '8:00 PM';
    const payload = JSON.stringify({
      title: isTest ? '⚡ TEST: LinkedIn Reminder Working!' : '🚀 LinkedIn Post Reminder',
      body: isTest
        ? 'Great news! Your daily notification reminder module is working perfectly on this device.'
        : `It's ${formattedTime}! Time to create & post your daily LinkedIn content.`,
      url: '/',
      icon: '/favicon.ico',
    });

    let sentCount = 0;
    let failedCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sentCount++;
        } catch (err: any) {
          failedCount++;
          console.error(`Error sending push notification to endpoint ${sub.endpoint}:`, err);

          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.pushSubscription.deleteMany({
              where: { endpoint: sub.endpoint },
            });
          }
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: isTest
        ? `Instant test notification sent to ${sentCount} device(s)!`
        : `Daily reminder notification process completed for ${formattedTime}.`,
      totalSubscriptions: subscriptions.length,
      sent: sentCount,
      failed: failedCount,
      isTest,
    });
  } catch (error: any) {
    console.error('Error in reminder route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process reminder notification' },
      { status: 500 }
    );
  }
}
