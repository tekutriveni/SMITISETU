# SmritiSetu (స్మృతి సేతు)

A full-stack AI-powered spiritual ancestor remembrance app for Telugu/Indian families. Tracks death anniversaries using both English calendar and Telugu Panchangam (Tithi, Nakshatram, Masam).

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at /api)
- `pnpm --filter @workspace/smriti-setu run dev` — run the frontend (port 24045, served at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT stored in localStorage, Bearer token via setAuthTokenGetter
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- UI: shadcn/ui components + framer-motion + lucide-react

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — database schema (users, ancestors, notifications tables)
- `lib/api-zod/src/generated/` — auto-generated Zod schemas (do not edit)
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks (do not edit)
- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/api-server/src/lib/panchangam.ts` — Panchangam calculation logic
- `artifacts/smriti-setu/src/pages/` — all frontend pages
- `artifacts/smriti-setu/src/components/layout.tsx` — shared sidebar layout

## Architecture decisions

- JWT auth stored in localStorage (not cookies) — setAuthTokenGetter wires token into every API call
- Reminders are virtual (computed from ancestor dateOfDeath), not stored in DB
- Panchangam is simplified cyclic calculation (no external API dependency)
- `lib/api-zod/src/index.ts` must stay as single `export * from "./generated/api"` line after codegen
- All API routes mount at /api prefix per artifact.toml path config

## Product

- Landing page with live Panchangam data and spiritual quotes from Bhagavad Gita
- Auth: register/login with name, email, password, language preference
- Ancestors: add/edit/delete with rich Panchangam fields (Tithi, Nakshatram, Masam, Gotram, Paksham)
- Dashboard: stats, upcoming anniversaries, today's reminders, daily quote
- Panchangam calendar: month view with anniversary/reminder markers + auspicious timings
- Notifications: system and reminder alerts with mark-read functionality
- AI remembrance: generated messages by occasion, ritual suggestions, food offerings
- Settings: profile management, language preference, sign out

## User preferences

- Telugu/Indian cultural aesthetic: saffron, turmeric gold, sandalwood palette
- Playfair Display serif font for headings, Inter for body
- Telugu script support (Noto Serif Telugu font loaded)

## Gotchas

- After running `pnpm --filter @workspace/api-spec run codegen`, immediately overwrite `lib/api-zod/src/index.ts` to only have `export * from "./generated/api"` (codegen adds a duplicate line)
- Reminders are computed on the fly from ancestors — they don't have real IDs in the DB
- Panchangam calculations are simplified/cyclic approximations, not astronomical

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
