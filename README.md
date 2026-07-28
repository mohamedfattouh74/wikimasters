# Wikimasters

A modern wiki platform for creating, editing, and sharing knowledge articles. Built with Next.js App Router, Neon Postgres, AI summarization, Redis caching, blob storage, and transactional email — deployed on Vercel.

## Features

- **Markdown articles** — write and preview wiki content with a live markdown editor
- **Auth-protected editing** — Neon Auth (Better Auth) for sign-in / sign-up; edit routes are middleware-protected
- **Image uploads** — cover images stored on Vercel Blob
- **AI summaries** — Gemini generates concise article summaries on create/update; a weekly cron backfills missing ones
- **Comments** — authenticated users can comment on articles
- **Pageviews & milestones** — Redis-backed view counters with celebration emails at 10 / 25 / 50 / 100 / 1000 views
- **Home feed caching** — article list cached in Upstash Redis (60s TTL) with invalidation on writes
- **Toast feedback** — success/error notifications on article and comment actions
- **Analytics** — Vercel Analytics + Speed Insights

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  React 19 · MD Editor · Markdown viewer · Auth forms · Toasts   │
└────────────────────────────┬────────────────────────────────────┘
                             │ Server Actions / RSC / API
┌────────────────────────────▼────────────────────────────────────┐
│                     Next.js 16 (App Router)                      │
│  proxy.ts (auth middleware) · app/actions/* · app/api/summary   │
└───┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
 Neon Auth   Neon DB    Upstash   Vercel     Resend
 (session)   + Drizzle  Redis     Blob       (email)
                │          │
                │          ├─ articles:all cache
                │          └─ pageviews:article:{id}
                ▼
         Google Gemini
      (AI SDK summarize)
```

### Request flow (high level)

| Flow | Path |
|------|------|
| Browse articles | RSC → Redis cache → Neon (miss) → render cards with AI summaries |
| View article | RSC loads article + comments; client increments Redis pageview; milestone → Resend email |
| Create / edit | Auth middleware → WikiEditor → upload to Blob → Server Action → Zod/Drizzle validation → Gemini summary → Neon → cache invalidate |
| Comments | Server Action → session check → Zod → insert → `revalidatePath` |
| Weekly summaries | Vercel Cron → `GET /api/summary` (Bearer `CRON_SECRET`) → Gemini for rows missing `summary` |

### Layering

| Layer | Responsibility |
|-------|----------------|
| `app/` | Routes, layouts, metadata, API cron |
| `app/actions/` | Server Actions (articles, comments, upload, pageviews) |
| `components/` | UI (editor, viewer, comments, auth, shadcn primitives) |
| `lib/data/` | Data access (articles, comments, session helpers) |
| `lib/auth/` | Neon Auth server + client |
| `db/` | Drizzle schema, relations, authorization, seed |
| `ai/` | Gemini summarization |
| `cache/` | Upstash Redis client |
| `email/` | Resend client + React email templates |

## Tech stack & library usage

### Core framework

| Library | Usage in this project |
|---------|------------------------|
| **[Next.js](https://nextjs.org) 16** | App Router, React Server Components, Server Actions, Route Handlers, `proxy.ts` middleware matcher for protected edit routes, image remote patterns for Blob |
| **[React](https://react.dev) 19** / **react-dom** | UI components; client islands for editor, viewer pageviews, auth forms, comments |
| **[TypeScript](https://www.typescriptlang.org)** | End-to-end typing for schema, actions, and components |

### Database & ORM

| Library | Usage |
|---------|--------|
| **[@neondatabase/serverless](https://neon.tech)** | HTTP SQL client (`neon`) wired to `DATABASE_URL` |
| **[drizzle-orm](https://orm.drizzle.team)** | Schema (`articles`, `comments`, `neon_auth.user`), queries, joins, relations |
| **[drizzle-kit](https://orm.drizzle.team/docs/kit-overview)** | Migrations (`db:generate`, `db:migrate`) and Drizzle Studio |
| **[drizzle-zod](https://orm.drizzle.team/docs/zod)** | Insert/update/select Zod schemas derived from Drizzle tables |
| **[drizzle-seed](https://orm.drizzle.team/docs/seed)** | Dev seed script (`db:seed`) |
| **[dotenv](https://github.com/motdotla/dotenv)** | Load env vars for DB / scripts |

### Auth

| Library | Usage |
|---------|--------|
| **[@neondatabase/neon-js](https://neon.tech/docs/neon-auth)** / **@neondatabase/auth** | `createNeonAuth` (server) and `createAuthClient` (client); session cookies |
| **[@neondatabase/auth-ui](https://neon.tech/docs/neon-auth)** | Auth UI primitives used by sign-in / sign-up flows |
| **Neon Auth schema** | Users live in managed `neon_auth` Postgres schema; articles/comments FK to `user.id` |

### AI

| Library | Usage |
|---------|--------|
| **[ai](https://ai-sdk.dev) (Vercel AI SDK)** | `generateText` for article summaries |
| **[@ai-sdk/google](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai)** | Google Gemini model (`gemini-3.5-flash`) in `ai/summarize.ts` |

Summaries run on article create/update, and via weekly cron at `/api/summary` for rows where `summary` is null.

### Caching & counters

| Library | Usage |
|---------|--------|
| **[@upstash/redis](https://upstash.com)** | Cache key `articles:all` (60s); atomic `INCR` for `pageviews:article:{id}`; cache delete on article writes / cron updates |

### Storage

| Library | Usage |
|---------|--------|
| **[@vercel/blob](https://vercel.com/docs/storage/vercel-blob)** | `put()` in `uploadFile` server action for public cover images (JPEG/PNG/GIF/WebP, max 10MB) |

### Email

| Library | Usage |
|---------|--------|
| **[resend](https://resend.com)** | Send milestone celebration emails to article authors |
| **[@react-email/render](https://react.email)** | Renders React email templates (used by Resend’s `react` option) |
| **Celebration template** | `email/templates/celebration-template.tsx` — HTML email for view milestones |

### UI & styling

| Library | Usage |
|---------|--------|
| **[Tailwind CSS](https://tailwindcss.com) 4** | Utility styling via `@tailwindcss/postcss` |
| **[shadcn/ui](https://ui.shadcn.com)** (`shadcn` CLI + Base UI) | Card, Button, Input, Label, Badge, Navigation Menu |
| **[@base-ui/react](https://base-ui.com)** | Headless primitives behind shadcn “base-vega” style |
| **[lucide-react](https://lucide.dev)** | Icons (edit, trash, upload, home, etc.) |
| **[class-variance-authority](https://cva.style)** | Variant classes on UI primitives |
| **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** | `cn()` helper for conditional class names |
| **[tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)** | Animation utilities used with the UI kit |
| **[@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor)** | Markdown editor in `WikiEditor` |
| **[react-markdown](https://github.com/remarkjs/react-markdown)** | Render article markdown in the viewer |
| **[nextjs-toast-notify](https://www.npmjs.com/package/nextjs-toast-notify)** | Success/error toasts after form actions |

### Validation & utilities

| Library | Usage |
|---------|--------|
| **[zod](https://zod.dev)** | Runtime validation in Server Actions (articles, comments); error formatting |
| **[slugify](https://github.com/simov/slugify)** | Generate URL-friendly slugs from article titles |

### Observability & hosting

| Library | Usage |
|---------|--------|
| **[@vercel/analytics](https://vercel.com/docs/analytics)** | Page analytics in root layout |
| **[@vercel/speed-insights](https://vercel.com/docs/speed-insights)** | Performance insights in root layout |
| **Vercel Cron** (`vercel.json`) | Weekly `GET /api/summary` (`0 0 * * 0`) |

### Tooling

| Library | Usage |
|---------|--------|
| **ESLint** + **eslint-config-next** | Linting (`npm run lint`) |
| **tsx** | Run TypeScript scripts (e.g. `db:seed`) |

## Project structure

```
app/
  actions/          # Server Actions (articles, comments, upload, pageviews)
  api/summary/      # Cron job: backfill AI summaries
  auth/             # Sign-in / sign-up pages
  wiki/             # View + edit/new article pages
  layout.tsx        # Nav, fonts, Analytics, Speed Insights
ai/
  summarize.ts      # Gemini summarization
cache/
  index.ts          # Upstash Redis client
components/
  auth/             # Sign-in, sign-up, sign-out
  ui/               # shadcn primitives
  wiki-editor.tsx   # Create/edit form + MD editor + upload
  wiki-article-viewer.tsx
  comments.tsx
db/
  schema.ts         # Tables + Zod schemas
  relations.ts
  authorization.ts  # Author-only edit/delete checks
  seed.ts
email/
  celebration-email.tsx
  templates/
lib/
  auth/             # Neon Auth server + client
  data/             # Articles, comments, session helpers
proxy.ts            # Auth middleware for /wiki/edit/*
vercel.json         # Cron schedule
```

## Getting started

### Prerequisites

- Node.js 20+
- Accounts / projects for: **Neon** (DB + Auth), **Upstash Redis**, **Vercel Blob**, **Resend**, **Google AI** (Gemini API key)

### Install

```bash
npm install
```

### Environment variables

Create a `.env` (or `.env.local`) with:

```env
# Neon Postgres
DATABASE_URL=

# Neon Auth
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Resend
RESEND_API_KEY=

# Google AI (Gemini) — typically GOOGLE_GENERATIVE_AI_API_KEY
GOOGLE_GENERATIVE_AI_API_KEY=

# Cron protection (production)
CRON_SECRET=
```

### Database

```bash
npm run db:generate   # generate migrations from schema
npm run db:migrate    # apply migrations
npm run db:studio     # optional Drizzle Studio
npm run db:seed       # optional seed data
```

### Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Next.js development server |
| `build` / `start` | Production build and serve |
| `lint` | ESLint |
| `db:generate` | Drizzle Kit generate migrations |
| `db:migrate` | Apply migrations |
| `db:studio` | Open Drizzle Studio |
| `db:seed` | Seed the database |

## Security notes

- Edit routes (`/wiki/edit/*`) are gated by Neon Auth middleware in `proxy.ts`; Server Actions are excluded from redirects and check the session themselves
- Article update/delete requires the current user to be the author (`db/authorization.ts`)
- File uploads require a signed-in session and validate type/size
- Production cron calls must send `Authorization: Bearer ${CRON_SECRET}`

## Deploy

Designed for **[Vercel](https://vercel.com)**:

1. Connect the repo and set the env vars above
2. Ensure Blob, Neon, Upstash, Resend, and Gemini credentials are available in the project
3. Cron in `vercel.json` will hit `/api/summary` weekly once deployed

---

Built as a full-stack Next.js wiki demonstrating Neon Auth, Drizzle, Redis caching, Blob uploads, Gemini summaries, Resend email, and Vercel Cron.
