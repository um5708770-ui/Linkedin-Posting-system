import { PrismaClient } from '@prisma/client';
import path from 'path';

function ensureDatabaseUrl() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      process.env.DATABASE_URL = 'file:/tmp/dev.db';
    } else {
      const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
      process.env.DATABASE_URL = `file:${localDbPath}`;
    }
  }
}

ensureDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  initPromise?: Promise<void>;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export async function ensureDbReady() {
  ensureDatabaseUrl();

  if (!globalForPrisma.initPromise) {
    globalForPrisma.initPromise = (async () => {
      try {
        const url = process.env.DATABASE_URL || '';
        if (url.startsWith('file:') || url.includes('.db')) {
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Post" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "status" TEXT NOT NULL DEFAULT 'idea',
                "ideaTitle" TEXT,
                "ideaDescription" TEXT,
                "postText" TEXT,
                "seoTags" TEXT,
                "imagePrompt" TEXT,
                "imageUrl" TEXT,
                "imageOptions" TEXT,
                "scheduledFor" DATETIME,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Settings" (
                "key" TEXT NOT NULL PRIMARY KEY,
                "value" TEXT NOT NULL,
                "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "PushSubscription" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "endpoint" TEXT NOT NULL UNIQUE,
                "p256dh" TEXT NOT NULL,
                "auth" TEXT NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
        } else if (url.startsWith('postgres') || url.startsWith('postgresql')) {
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Post" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "status" TEXT NOT NULL DEFAULT 'idea',
                "ideaTitle" TEXT,
                "ideaDescription" TEXT,
                "postText" TEXT,
                "seoTags" TEXT,
                "imagePrompt" TEXT,
                "imageUrl" TEXT,
                "imageOptions" TEXT,
                "scheduledFor" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Settings" (
                "key" TEXT NOT NULL PRIMARY KEY,
                "value" TEXT NOT NULL,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
          await db.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "PushSubscription" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "endpoint" TEXT NOT NULL UNIQUE,
                "p256dh" TEXT NOT NULL,
                "auth" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
          `);
        }
      } catch (err) {
        console.error('Auto-initializing DB tables error:', err);
      }
    })();
  }
  await globalForPrisma.initPromise;
}
