# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/`
- `npm run lint` — Oxlint (config in `.oxlintrc.json`; `react/rules-of-hooks` is an error)

There is no test framework set up.

## Stack

React 19 + Vite 8, plain JavaScript (`.jsx`), Redux Toolkit, React Router 7, react-hook-form, axios, react-hot-toast, lucide-react icons, Tailwind CSS v4 via `@tailwindcss/vite` (no `tailwind.config.js`; theme and utilities live in `src/index.css`).

## Environment

`.env` provides `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api/v1`, a separate backend) and `VITE_AI_GATEWAY_API_KEY`. Only `VITE_`-prefixed vars are exposed to client code.

## Architecture

TrueFeedback: authenticated users create shareable feedback links; anyone can open a link by its slug and submit anonymous replies.

### Routing (`src/App.jsx`)
- `/login`, `/signup` — redirect to `/dashboard` if logged in
- `/dashboard`, `/links/:id`, `/links/:id/replies` — wrapped in `ProtectedRoute`
- `/:slug` — public feedback page (`PublicLink.jsx`), a catch-all; declare any new top-level routes **before** it

### API layer (`src/api/axiosInstance.js`)
The single axios instance is central to how data flows:
- Attaches `Authorization: Bearer <token>` from `localStorage.token`.
- The backend wraps responses as `{ status, message, data }`. The response interceptor **unwraps and returns `data` directly**, so callers receive the payload, not an axios response. `status: 'error'` is converted into a rejected `Error`.
- It automatically shows a toast for every success `message` and every error. Pass `{ suppressToast: true }` in the request config for GET/background calls to avoid toast noise (existing `get*` calls already do).

### State (`src/store/store.js`, `src/features/*`)
Each feature folder has an `*API.js` (thin object of axios calls) and an `*Slice.js` (`createAsyncThunk` thunks + reducer + selectors). Slices: `auth`, `feedbackLinks`, `replies`.

Auth quirks:
- Login/Signup pages call `authAPI` directly rather than dispatching thunks; `authSlice` also handles `auth/login/*` and `auth/register/*` action types by string, but no thunks with those names exist currently.
- The token is persisted in `localStorage` from inside reducers. `ProtectedRoute` dispatches `fetchMe()` when a token exists but no user is loaded, and redirects to `/login` otherwise; a failed `fetchMe` clears the token.

### AI feedback suggestions
`PublicLink.jsx` gets suggestions from the backend (`POST /feedback-suggestions` with `topicTitle`/`topicDescription`). `src/lib/ai.ts` is an unused client-side alternative: it imports the `ai` package (not in `package.json`) and reads non-`VITE_` env vars, so it would not work as-is.

### Styling
- Colors are semantic CSS variables on `:root` / `.dark` in `src/index.css`, exposed to Tailwind via `@theme inline`: `paper`, `surface`, `sunken`, `ink`, `muted`, `line`, `accent`, `accent-soft`, `on-accent`, `note` (sticky-note yellow), `danger`. Use these (`bg-surface`, `text-muted`, `border-line`) instead of raw gray/indigo — they switch with the theme, so `dark:` prefixes are rarely needed.
- Type: `font-sans` = Schibsted Grotesk (UI, headings); `font-voice` = Literata, reserved for text people wrote (feedback, replies, suggestions). Fonts load from Google Fonts in `index.html`.
- Reusable `@utility` classes: `btn`, `btn-sm`, `btn-primary|secondary|ghost|danger`, `card`, `alert`, `input` (style errors via `aria-invalid`), `label`, `hint`, `field-error`, `badge`, `badge-active|inactive`.
- Shared components: `PageState.jsx` (`Spinner`, `PageLoader`, `PageMessage`, `BackLink`), `Replies.jsx` (`ReplyList`, `ReplyItem`), `LinkHeader.jsx`, `AuthLayout.jsx`, `Logo.jsx`. `src/lib/links.js` has `publicUrl`, `copyLink`, `slugify`.
- Dark mode: `ThemeToggle` toggles `.dark` on `<html>` (persisted as `localStorage.theme`); an inline script in `index.html` applies it before first paint. `@custom-variant dark` is declared, so `dark:` follows the toggle.

### Conventions
- Pages live in `src/Pages/` (capital P) and components in `src/components/`; both use named exports (`export const Dashboard = ...`), except `App`.
