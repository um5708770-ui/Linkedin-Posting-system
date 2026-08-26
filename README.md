# 🎙️ LinkedIn Content Studio

> **Podcast Growth Partner — Personal AI Content Studio**  
> A single-user, password-protected web application for transforming ideas into high-performing, human-approved LinkedIn post campaigns with custom visuals.

---

## 🌟 Features

- **Guided 6-Step Workflow**: Idea Generation → Post Drafting → SEO Tags & Visual Prompt → Image Generation → Save Draft → Calendar Scheduling.
- **Human-in-the-Loop Approval**: Full control at every step. AI never posts without your explicit approval.
- **Runtime-Customizable AI Engine**: Edit all system prompts, Gemini API key, and brand voice directly in the UI without redeploying.
- **4 Branded Image Candidates**: Generates 4 high-contrast graphics (3D icon right layout, bold text, blue/black/white palette) per post.
- **Content Calendar & Library**: View scheduled posts in Month Grid or List view, filter by status, search, copy formatted text, and download image artwork.
- **Data Management**: Full JSON backup export, restore from backup, and safe database reset.
- **Mobile First**: Built for fast mobile & desktop operation.

---

## ⚙️ Environment Variables

Set the following variables in your `.env` file (locally) or in the **Vercel Dashboard** (under Settings → Environment Variables):

| Variable Name | Description | Default / Example |
| :--- | :--- | :--- |
| `APP_PASSWORD` | Password required to log into the studio | `admin123` |
| `JWT_SECRET` | Secret key used for signing session cookies | `linkedin-studio-secret-key-123` |
| `DATABASE_URL` | Local SQLite path or PostgreSQL connection string | `file:./dev.db` |
| `GEMINI_API_KEY` | (Optional) Initial Gemini API Key (Can be set in Settings UI) | `AIzaSy...` |
| `POSTGRES_PRISMA_URL` | Auto-configured by Vercel Postgres when connected | `postgres://...` |

---

## 🚀 Local Development Setup

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database Schema**:
   ```bash
   npx prisma db push
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser and log in with the password `admin123`.

---

## ☁️ How to Deploy to Vercel (Step-by-Step)

1. **Push your code to GitHub / GitLab**.
2. **Import Project in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**.
   - Select your repository.
3. **Attach Vercel Postgres**:
   - In your Vercel Project Dashboard, click **Storage** → **Create Database** → **Vercel Postgres**.
   - Click **Connect** to link the database to your project. Vercel automatically populates `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`.
4. **Set Environment Variables**:
   - Under Project **Settings** → **Environment Variables**, add:
     - `APP_PASSWORD`: Your secret personal login password.
     - `JWT_SECRET`: Any random long secret string.
     - `DATABASE_URL`: Set to `${POSTGRES_PRISMA_URL}`.
5. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `prisma generate && next build` and launch your app live!
