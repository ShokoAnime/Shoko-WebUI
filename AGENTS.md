# Shoko WebUI

React 19 + Vite frontend for the Shoko Anime Management Server.

## Repo Structure

- `src/pages` – Route-level components.
- `src/components` – Reusable UI components.
- `src/core` – API client (axios), Redux store, React Query, SignalR, router.
- `src/hooks` – Custom React hooks.
- `src/css` – Global styles and Tailwind entry.
- `public/` – Static assets; `version.json` is generated here at build time.

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

## Dev Proxy

API calls are proxied during dev. Copy `proxy.config.default.js` to `proxy.config.js` and change the target if Shoko Server is not at `http://localhost:8111`.

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

## Architecture

- **Entry:** `index.html` → `src/main.tsx` → `src/core/app.tsx` → `src/core/router`
- **State:** React Query for server state; Redux Toolkit for global UI state.
- **API:** Axios client in `src/core/axios.ts`. SignalR real-time client in `src/core/signalr`.
- **Build:** Vite 8 with Rolldown. Base path is `/webui/`. Hidden sourcemaps. Sentry plugin requires `SENTRY_AUTH_TOKEN`.
- **Tailwind:** v4 via Vite plugin. Entry point is `src/css/tailwind.css`.

## Verification & CI

- **No unit/integration tests** are configured. Verification is `pnpm lint`.
- **Pre-commit:** Husky runs `lint-staged`, which executes `tsc --noEmit`, `dprint fmt`, `eslint --cache`, and `stylelint` on staged files.
- **PR CI:** `.github/workflows/Lint-PR.yml` runs `pnpm lint --quiet`.

## Guardrails

- Do NOT modify `pnpm-lock.yaml`, `eslint.config.mjs`, or `.dprint.json` unless explicitly asked.
- Do NOT use `npm` or `yarn`; always use `pnpm add` / `pnpm remove`.
- Do not add explicit type annotations where TS inference is sufficient.
- Treat changes to `src/core/axios.ts`, `src/core/store.ts`, and auth-related logic with extra scrutiny.
