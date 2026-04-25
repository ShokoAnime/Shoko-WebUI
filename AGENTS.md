# Shoko WebUI

React 19 + Vite frontend for the Shoko Anime Management Server.

## Build & Development

> **Node >=22, pnpm only.** CI uses Node 24 and pnpm 10.

```bash
pnpm install
pnpm start          # Dev server at http://localhost:3000, base /webui/
pnpm build          # Production build (dist/)
pnpm build:debug    # Development build
```

**Lint chain (runs in this exact order):**
```bash
pnpm lint           # tscheck -> dprint -> eslint -> stylelint
pnpm tscheck        # tsc --noEmit
pnpm eslint:fix     # eslint --fix --cache src
pnpm dprint:fix     # dprint fmt
```

**Dev proxy:** Copy `proxy.config.default.js` to `proxy.config.js` and set the target if Shoko Server is not at `http://localhost:8111`.

## Repo Structure

- `src/pages` – Route-level components.
- `src/components` – Reusable UI components.
- `src/core` – API client (axios), Redux store, React Query, SignalR, router.
- `src/hooks` – Custom React hooks.
- `src/css` – Global styles and Tailwind entry.
- `public/` – Static assets; `version.json` is generated here at build time.

## Architecture

- **Entry:** `index.html` → `src/main.tsx` → `src/core/app.tsx` → `src/core/router`
- **State:** React Query for server state; Redux Toolkit for global UI state.
- **API clients:** Four axios instances in `src/core/axios.ts`:
  - `axios` — Shoko API v3 (`/api/v3`)
  - `axiosV2` — Shoko API v2 (`/api`)
  - `axiosPlex` — Plex endpoints (`/plex`)
  - `axiosExternal` — Unconfigured base for external calls
  - v3/v2/Plex clients auto-attach `apikey` from Redux; all unwrap `response.data`.
- **Real-time:** SignalR client in `src/core/signalr`, integrated as Redux middleware.
- **Redux:** Store in `src/core/store.ts` — root reducer clears all state on `AUTH_LOGOUT`, persists to localStorage (throttled 1s). Re-exported `useDispatch`/`useSelector` from this module (not `react-redux` directly).
- **React Query:** Organized by API sub-path under `src/core/react-query/<endpoint>/` with `queries.ts`, `mutations.ts`, `types.ts`, and optional `helpers.ts`.
- **Build:** Vite 8 with Rolldown. Base path `/webui/`. Hidden sourcemaps. React Compiler enabled via `@rolldown/plugin-babel`. Sentry plugin requires `SENTRY_AUTH_TOKEN`.
- **Tailwind:** v4 via Vite plugin. Entry point is `src/css/tailwind.css`.
- **Path alias:** `@/` maps to `src/` (configured in `vite.config.mjs` and `tsconfig.json`).

## Code Style

- **Formatter:** `dprint` (`.dprint.json`). Covers `src/**` only. Line width 120, single quotes, always semicolons.
- **Linter:** ESLint flat config (`eslint.config.mjs`). Airbnb Extended + TypeScript + React + Tailwind + Query.
- **TypeScript:** Prefer `type` over `interface`. Prefer `Array<T>` syntax. Use consistent type imports.
- **Functions:** Arrow-function expressions only (`const Foo = () => ...`).
- **Imports:** Use `@/` alias instead of relative `../` paths. Import order is enforced and alphabetized.
- **Restricted imports** (will error if imported directly):
  - `react-redux`: `useDispatch`, `useSelector` → use `@/core/store/useDispatch` and `useSelector`
  - `react-router`: `useNavigate` → use `@/hooks/useNavigateVoid`
  - `react-toastify`: `toast` → use `@/components/Toast`
  - `usehooks-ts`: `useEventCallback`, `useCopyToClipboard` → use `@/hooks/useEventCallback` and `@/core/util`
- **State mutations:** `no-param-reassign` allows `sliceState` and `draft*` properties for Immer/Redux.
- **Console:** Only `console.warn` and `console.error` are allowed.

## Verification & CI

- **No unit/integration tests** are configured. Verification is `pnpm lint`.
- **Pre-commit:** Husky runs `lint-staged`, which executes `tsc --noEmit`, `dprint fmt`, `eslint --cache`, and `stylelint` on staged files.
- **PR CI:** `.github/workflows/Lint-PR.yml` runs `pnpm lint --quiet`.

## Guardrails

- Do NOT modify `pnpm-lock.yaml`, `eslint.config.mjs`, or `.dprint.json` unless explicitly asked.
- Do NOT use `npm` or `yarn`; always use `pnpm add` / `pnpm remove`.
- Do not add explicit type annotations where TS inference is sufficient.
- Treat changes to `src/core/axios.ts`, `src/core/store.ts`, and auth-related logic with extra scrutiny.