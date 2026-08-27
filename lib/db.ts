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
  initialized?: boolean;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

async function initTablesIfNeeded() {
  if (globalForPrisma.initialized) return;
  globalForPrisma.initialized = true;

  try {
    const url = process.env.DATABASE_URL || '';
    if (url.startsWith('file:')) {
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
    }
  } catch (err) {
    console.error('Auto-initializing SQLite tables error:', err);
  }
}

initTablesIfNeeded();

