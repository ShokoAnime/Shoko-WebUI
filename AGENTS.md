# Shoko WebUI

React 19 + Vite frontend for the Shoko Anime Management Server.

## Build & Development

> **Node >=22, pnpm only.** CI uses Node 24 and pnpm 10.

```bash
pnpm install          # Also sets up Husky via the `prepare` script
pnpm start          # Dev server at http://localhost:3000, base /webui/
pnpm build          # Production build (dist/)
pnpm build:debug    # Development build
```

**Lint chain (runs in this exact order):**
```bash
pnpm dprint:fix     # dprint fmt (auto-fix formatting)
pnpm eslint:fix     # eslint --fix --cache src (auto-fix lint rules)
pnpm lint           # tscheck -> dprint -> eslint -> stylelint
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
- **Redux:** Store in `src/core/store.ts` — root reducer clears all state on `AUTH_LOGOUT`. The full store is persisted to `sessionStorage`; only `apiSession` is persisted to `localStorage` (when `rememberUser` is true). Re-exported `useDispatch`/`useSelector` from this module (not `react-redux` directly).
- **React Query:** Organized by API sub-path under `src/core/react-query/<endpoint>/` with `queries.ts`, `mutations.ts`, `types.ts`, and optional `helpers.ts`.
- **Build:** Vite 8 with Rolldown. Base path `/webui/`. Hidden sourcemaps. React Compiler enabled via `@rolldown/plugin-babel`. Sentry plugin requires `SENTRY_AUTH_TOKEN`.
- **Tailwind:** v4 via Vite plugin. Entry point is `src/css/tailwind.css`.
- **Path alias:** `@/` maps to `src/` (configured in `vite.config.mjs` and `tsconfig.json`).

## React Patterns

This project uses the **React Compiler** (via `@rolldown/plugin-babel`). The compiler automatically memoizes components and values, so **do not use `useMemo`, `useCallback`, or `React.memo` unless absolutely required** (e.g., for a library boundary or a very specific measured performance issue). Let the compiler handle optimization instead of manually adding memoization.

## Code Style

- **Formatter:** `dprint` (`.dprint.json`). Covers `src/**` only. Line width 120, single quotes (double quotes in JSX), always semicolons.
- **Linter:** ESLint flat config (`eslint.config.mjs`). Airbnb Extended + TypeScript + React + Tailwind + Query + typescript-eslint (type-checked + stylistic) + @stylistic + react-refresh + sort-destructure-keys.
- **TypeScript:** Prefer `type` over `interface`. Prefer `T[]` syntax. Use consistent type imports. Multiline type members use semicolons; single-line members use commas.
- **Functions:** Arrow-function expressions only (`const Foo = () => ...`). Omit parens for single parameters; require them for block bodies.
- **Identifiers:** Minimum 3 characters. Exceptions: `cx`, `ID`, `id`, `_`, `__`. Object properties are exempt.
- **Unused variables:** Prefix with `_` to suppress `no-unused-vars` (applies to args, vars, and caught errors).
- **Nullish coalescing:** Use `??` instead of `||`, except for boolean values where `||` is acceptable.
- **Imports:** Use `@/` alias instead of relative `../` paths. Import order is enforced with blank lines between groups (builtin → external → internal → parent → sibling → index → type), alphabetized within each group. `react*` imports sort first among externals. Named imports/exports are sorted alphabetically (case-sensitive) within each declaration.
- **Destructuring:** Object destructuring keys must be sorted alphabetically.
- **Restricted imports** (will error if imported directly):
  - `../*` (relative parent imports) → use `@/` alias instead
  - `react-redux`: `useDispatch`, `useSelector` → use `@/core/store/useDispatch` and `@/core/store/useSelector`
  - `react-router`: `useNavigate` → use `@/hooks/useNavigateVoid`
  - `react-toastify`: `toast` → use `@/components/Toast`
  - `usehooks-ts`: `useCopyToClipboard` → use `copyToClipboard` from `@/core/util`
- **State mutations:** `no-param-reassign` allows `sliceState` and `draft*` properties for Immer/Redux.
- **Console:** Only `console.warn` and `console.error` are allowed.
- **Control flow:** `for-of` and `for-in` loops are allowed (`no-restricted-syntax` is disabled).
- **React components:** Nested components are allowed when passed as props.

## Verification & CI

- **No unit/integration tests** are configured. Verification is `pnpm lint`.
- **Pre-commit:** Husky runs `lint-staged`, which executes `tsc --noEmit`, `dprint fmt`, `eslint --cache`, and `stylelint` on staged files.
- **PR CI:** `.github/workflows/Lint-PR.yml` runs `pnpm lint --quiet`.

## Guardrails

- Do NOT modify `pnpm-lock.yaml`, `eslint.config.mjs`, or `.dprint.json` unless explicitly asked.
- Do NOT use `npm` or `yarn`; always use `pnpm add` / `pnpm remove`.
- Do not add explicit type annotations where TS inference is sufficient.
- Treat changes to `src/core/axios.ts`, `src/core/store.ts`, and auth-related logic with extra scrutiny.
- If you modify files, styles, structures, configurations, or workflows mentioned in this file, update the corresponding `AGENTS.md` sections to keep them accurate.

## Specifications

Implementation specs and planning artifacts may exist under `specs/`.
Use them as historical/reference material when relevant, but prefer the current source code and API contracts as the source of truth.
