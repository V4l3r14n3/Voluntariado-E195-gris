# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo holds the **Voluntariado-E195-gris** volunteer-management project (Grupo Gris). Two distinct trees:

- `mockup_code/` — the actual working React SPA. All build, lint, and dev commands run from here.
- `mockups/{admin,dashboard,organizaciones,voluntarios}/` — placeholder dirs for static HTML mockups (currently empty except for READMEs). Not built or wired into the SPA.
- `MANUAL_BASE_DATOS.md` — documentation-only proposal for a future PostgreSQL schema. No DB is implemented in code.
- `README.md` — one-line project description in Spanish.

When asked to "run", "build", "fix the app", etc., the target is always `mockup_code/`.

## Common commands

All run from `mockup_code/`:

```
npm install          # install deps
npm run dev          # vite dev server
npm run build        # production build (vite build)
npm run build:dev    # development-mode build
npm run preview      # serve the built bundle
npm run lint         # eslint .
```

No test framework is configured — there is no `test` script and no test files exist.

## Architecture

**Stack:** React 19 + TypeScript + Vite 7 + TanStack Router (file-based routes) + Tailwind v4 + shadcn/ui (new-york style, slate base) + Radix primitives + sonner toasts + react-hook-form + zod.

**Entry / routing:**
- `src/main.tsx` is the SPA entry — uses `createRoot` + `RouterProvider`. The app is a **client-rendered SPA**, not SSR. (Recent commit `c678c7d` explicitly replaced an SSR shell with a SPA-compatible version. The `wrangler.jsonc` / `@tanstack/react-start` reference is legacy and should be ignored — Vercel deploys via `vercel.json` rewrites every path to `/index.html`.)
- `src/router.tsx` exports `getRouter()` with a custom error component, but `main.tsx` constructs its own router from `routeTree` directly. Keep both in sync if editing router config.
- `src/routeTree.gen.ts` is **generated** by `@tanstack/router-plugin`. Never edit by hand — it regenerates from files in `src/routes/`.
- `src/routes/__root.tsx` wraps every route in `<AuthProvider>` → `<AppLayout>` → `<Outlet/>` + sonner `<Toaster>`. Add a new page by dropping a file in `src/routes/` (or `src/routes/admin/` etc. for nested segments).

**Auth model (mock):**
- `src/lib/auth-context.tsx` holds a React Context with `user`, `login`, `logout`, `register`, `updateProfile`. State lives in `useState` only — no persistence; refresh logs the user out.
- `login(email, password)` ignores the password. Role is derived from substring: email containing `admin` → admin, `org` → organization, else volunteer. Seeded accounts in `mockUsers` take precedence.
- Three roles drive UI gating throughout: `'admin' | 'organization' | 'volunteer'` (see `UserRole` in `mock-data.ts`).
- `AppLayout` shows the sidebar only when `isAuthenticated`; unauthenticated routes (login, register, public landing) render bare.

**Data layer:**
- All domain data is hard-coded in `src/lib/mock-data.ts` as TypeScript arrays. Six entities: `User`, `Organization`, `Opportunity`, `ForumMessage`, `BlogPost`, `Certificate`. No backend, no database, no API calls (no `fetch`/`axios` usage for data). Mutations happen in component state and are lost on reload.
- When adding a feature that needs new data, extend the relevant interface + mock array in this file — don't introduce a fetch layer without checking first.

**UI components:**
- `src/components/ui/` contains shadcn/ui components — generated via the shadcn CLI per `components.json` (style: new-york, baseColor: slate, css vars enabled, icon library: lucide). Treat these as project source, but prefer regenerating via `npx shadcn add <component>` over hand-editing when adding new ones.
- App-specific components (sidebar, layout, motion wrapper) sit one level up at `src/components/`.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json` and `components.json`).

**Styling:** Tailwind v4 via the `@tailwindcss/vite` plugin (not PostCSS). Global styles + CSS variables in `src/styles.css`. `tw-animate-css` provides animation utilities; `framer-motion` is used for richer transitions.

**Motion primitives:** `src/components/motion.tsx` exports ready-made wrappers — use these instead of raw `framer-motion`:
- `<PageTransition>` — wrap page-level content for enter/exit fade+slide
- `<StaggerContainer>` + `<StaggerItem>` — animated lists (children stagger by 60ms)
- `<HoverCard>` — lift-on-hover card wrapper
- `<FadeIn delay?>` — simple opacity fade

**Route-level role gating:** Pages redirect unauthenticated users manually (`if (!user) { navigate({ to: '/' }); return null; }`). No centralized route guard exists. Multi-role routes (e.g. `/dashboard`, `/reports`) branch on `user.role` inside the component — follow this pattern when building new role-sensitive pages.

**Sidebar nav by role:**
- `admin` — Dashboard, Organizations (`/admin/organizations`), Forum, Profile
- `organization` — Dashboard, Opportunities, Forum, Blog, Reports, Profile
- `volunteer` — Dashboard, Find Opportunities (`/search`), Forum, Blog, My Reports, Profile

## Conventions worth knowing

- **TS strict mode is on**, but `noUnusedLocals`/`noUnusedParameters` are off and `@typescript-eslint/no-unused-vars` is disabled — unused imports/vars won't fail lint. Don't rely on this catching dead code.
- ESLint flat config (`eslint.config.js`) ignores `dist`, `.output`, `.vinxi`. React hooks rules + react-refresh are enforced.
- Project UI strings and docs are primarily in **Spanish**; match the existing language when editing user-facing copy.
- The `mockup_code/components copy.json` and `mockup_code/vite.config copy.ts` files are stray backups — don't reference them.
