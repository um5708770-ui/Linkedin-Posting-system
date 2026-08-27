# 🚀 Deployment Guide: GitHub & Vercel

This folder (`d:\My Ai Tools\Linkedin Posting system`) is fully configured and prepared for pushing to **GitHub** and deploying live on **Vercel**.

---

## 📌 Step 1: Create a GitHub Repository & Push

1. Open your terminal or command prompt in this folder, or open **GitHub Desktop / VS Code**.
2. Go to [GitHub](https://github.com/new) and create a **New Repository** (e.g. `linkedin-posting-system`).
3. Run the following commands in your terminal:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/linkedin-posting-system.git
git branch -M main
git push -u origin main
```

---

## 📌 Step 2: Set Up Database for Vercel (Production)

Vercel functions run in a serverless environment where local files (like SQLite `dev.db`) reset on each request. For production data persistence, connect a free cloud database (e.g., **Neon** or **Supabase** or **Vercel Postgres**):

1. **Option A: Neon (Free Serverless Postgres - Recommended)**
   - Go to [Neon.tech](https://neon.tech) and create a free PostgreSQL database.
   - Copy the Connection String `postgres://...`.
   - Update `prisma/schema.prisma` datasource provider to `postgresql`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - Run `npx prisma db push` to initialize tables on Neon.

2. **Option B: Turso (Free SQLite Cloud)**
   - If keeping SQLite syntax, use [Turso.tech](https://turso.tech) with Prisma adapter.

---

## 📌 Step 3: Deploy on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** ➔ **"Project"**.
3. Import your GitHub repository (`linkedin-posting-system`).
4. Under **Environment Variables**, add the following key-value pairs:

| Variable Name | Value / Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `APP_PASSWORD` | Your login password (e.g. `admin123`) |
| `JWT_SECRET` | A secure random string for JWT auth |
| `DATABASE_URL` | Your cloud database URL (e.g., Neon Postgres URL or Turso URL) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `BKDw0WDT1YaWIjFRR5tkYU-YkI4S5hxBxhOzu1yHedBGlLsFDX6TAKWI7O_AA86eeqkGIhCALhUVvnV08XTHQe0` |
| `VAPID_PRIVATE_KEY` | `8iaISx4HTJo3bC5zqhZB0WMfPYhdEFi3SHuPRvOXt3c` |

5. Click **Deploy**. Vercel will automatically build and publish your app live!



---

## 📁 Repository Cleanliness Check
- `node_modules/` ignored via `.gitignore`
- `.next/` build output ignored via `.gitignore`
- `.env` secret keys ignored via `.gitignore`
- Build verified with zero errors (`npm run build`)

