# NextMatchNews

Sports news, match information, and affiliate media platform (football, NFL, boxing), built with Next.js and Payload CMS.

See [CLAUDE.md](./CLAUDE.md) for the full engineering constitution governing this codebase.

## Stack

Next.js · Payload CMS 3 · Neon PostgreSQL · Upstash Redis (Phase 6+) · S3-compatible storage · Cloudflare · TypeScript · pnpm

## Getting started

1. Copy the environment template and fill in your real values (never commit `.env.local`):

   ```bash
   cp .env.example .env.local
   ```

   At minimum you need `DATABASE_URL` (a Neon Postgres connection string) and `PAYLOAD_SECRET`. `S3_*` variables are optional in development — media falls back to local disk storage if `S3_BUCKET` is unset.

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Visit [http://localhost:3000/admin](http://localhost:3000/admin) to create your first admin user, then visit [http://localhost:3000](http://localhost:3000) for the public site.

## Scripts

```bash
pnpm dev              # start the dev server
pnpm build            # production build
pnpm start            # run the production build
pnpm lint             # eslint
pnpm generate:types   # regenerate src/payload-types.ts from the current collections
pnpm generate:importmap  # regenerate the admin panel's import map
```

## Project structure

- `src/collections/` — Payload collections (Users, Media, Authors, Categories, Tags, Articles)
- `src/access/` — reusable access-control functions
- `src/fields/` — reusable field configs (e.g. auto-generated slugs)
- `src/app/(payload)/` — Payload's admin panel and REST/GraphQL API routes (generated, do not hand-edit)
- `src/app/(frontend)/` — the public website
- `src/lib/` — data-fetching (Payload Local API) and SEO helpers
- `src/components/` — shared UI components

## Status

This is Phase 1 (Foundation) + Phase 2 (Editorial CMS) of the project. Football, NFL, and boxing data models, the sports provider abstraction, and the affiliate system are not built yet — see the project spec for the full phase plan.
