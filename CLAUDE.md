# Wine Cellar App

A personal wine cellar management app. The owner has two separate physical cellars and wants to track stock across both, plus enrich wine data with Vivino scores and info.

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Postgres via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel

## Key commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npx prisma studio    # Visual DB browser
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema to DB without creating a migration file (use during prototyping)
```

## Environment variables

Required in `.env.local` (copy `.env.example` and fill in values):
- `DATABASE_URL` — Supabase Postgres connection string (Transaction mode, port 6543)
- `DIRECT_URL` — Supabase Postgres direct connection (port 5432, for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

## Data model (see prisma/schema.prisma)

Four tables:
- **Cellar** — the two physical cellars (name, location)
- **Wine** — reference data for each wine (producer, name, vintage, region, grape, vivino_url)
- **StockItem** — physical bottles in a cellar (links wine ↔ cellar, stores quantity, price, bin location, drink window)
- **VivinoData** — cached scores and review counts fetched from Vivino (linked 1:1 to Wine)

Key design rule: `Wine` is the catalog entry; `StockItem` is the physical inventory. One wine can have stock items in both cellars simultaneously.

## Vivino integration approach

Vivino has no official public API. We use a semi-manual approach:
- Each Wine row stores a `vivinoUrl` field (the Vivino page URL)
- An "Enrich" button on the wine detail page calls a Next.js API route `/api/wines/[id]/enrich`
- That route uses a third-party scraping service (Apify Vivino actor) to fetch score + review count
- Results are cached in the `VivinoData` table with a `fetchedAt` timestamp
- Scores are re-fetched on demand (button) or when `fetchedAt` is more than 30 days old

The Apify API key goes in `APIFY_API_KEY` env var. If not set, enrichment is disabled gracefully.

## Project structure

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (app)/
      layout.tsx              # App shell with sidebar nav
      page.tsx                # Dashboard — stock summary per cellar
      cellars/
        page.tsx              # List both cellars
        [id]/page.tsx         # Cellar detail — stock list, filter/search
      wines/
        page.tsx              # Wine catalog
        new/page.tsx          # Add wine form
        [id]/page.tsx         # Wine detail — stock across cellars, Vivino data, notes
      stock/
        new/page.tsx          # Add bottles to a cellar
  components/
    ui/                       # shadcn/ui primitives
    wine-card.tsx
    stock-table.tsx
    cellar-summary.tsx
    enrich-button.tsx
  lib/
    prisma.ts                 # Prisma client singleton
    supabase/
      client.ts               # Browser Supabase client
      server.ts               # Server Supabase client
  actions/                    # Next.js Server Actions
    wine.actions.ts
    stock.actions.ts
    cellar.actions.ts
  api/
    wines/[id]/enrich/route.ts   # Vivino enrichment endpoint
prisma/
  schema.prisma
```

## Current phase

**Phase 1 (now)**: Core CRUD — cellars, wines, stock items. Get the two-cellar dashboard working with add/edit/delete bottles.

**Phase 2**: Vivino enrichment button, score display, drink window alerts.

**Phase 3**: PWA setup (home screen install, offline-friendly list view), barcode scan to add bottles.

## Coding conventions

- Use **Server Actions** for all mutations (no separate API routes except `/api/wines/[id]/enrich`)
- Use **server components** by default; add `"use client"` only when needed for interactivity
- All DB access goes through **Prisma** — never raw SQL
- Use **shadcn/ui** components for all UI primitives (Button, Input, Select, Table, Dialog, etc.)
- Wrap every Prisma call in try/catch and return typed `{ data, error }` objects from Server Actions
- Keep pages thin — logic lives in Server Actions or lib functions