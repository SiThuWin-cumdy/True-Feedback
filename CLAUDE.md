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

`.env` (see `.env.example`) provides `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api/v1`, a separate backend). `VITE_`-prefixed vars are shipped to the browser, so never put a secret in one; AI keys belong in the backend.

## Architecture

TrueFeedback: authenticated users create shareable feedback links; anyone can open a link by its slug and submit anonymous replies.

### Routing (`src/App.jsx`)
- `/login`, `/signup` — inside `GuestRoute`, which redirects to `/dashboard` if logged in
- `/dashboard`, `/links/:id`, `/links/:id/replies` — inside `ProtectedRoute`
- `/:slug` — public feedback page (`PublicLink.jsx`), a catch-all. Add any new top-level path to `RESERVED_SLUGS` in `src/lib/links.js`

### API layer (`src/api/axiosInstance.js`)
The single axios instance is central to how data flows:
- Attaches `Authorization: Bearer <token>` from `localStorage.token`, unless the request sets `{ anonymous: true }`. Use that for every public endpoint: replies are promised to be anonymous, so the writer's token must not go with them.
- The backend wraps responses as `{ status, message, data }`. The response interceptor **unwraps and returns `data` directly**, so callers receive the payload, not an axios response. `status: 'error'` is converted into a rejected `Error`.
- It automatically shows a toast for every success `message` and every error. Pass `{ suppressToast: true }` in the request config for GET/background calls to avoid toast noise (existing `get*` calls already do).

- Errors are rejected as `Error` with `message` and `status` (HTTP status; undefined when the server is unreachable).
- A 401 on a request that carried the current token signs the user out (handler wired in `store.js`).
- Route params reach the API as URL path segments and arrive decoded, so always `encodeURIComponent` them (path traversal otherwise).

### State (`src/store/store.js`, `src/features/*`)
Each feature folder has an `*API.js` (thin object of axios calls) and an `*Slice.js` (thunks + reducer + selectors). Slices: `auth`, `feedbackLinks`, `replies`. Create thunks with `createApiThunk` (`src/lib/createApiThunk.js`), so rejections carry `{ message, status }`.

- Slices reset on `isSessionChange` (sign in/out, or a change in another tab) so one account never sees another's data. New slices holding user data must do the same. `publicLink` is deliberately kept.
- Reducers ignore responses whose `requestId` was superseded.
- `store.js` persists the token; reducers stay pure. `App` restores the session with `fetchMe()` when there is a token but no user. Only a 401 drops the token; other failures show a retry screen.
- Login/Signup call `authAPI` directly rather than through thunks, to keep passwords out of Redux actions.

### API field names
Links: `_id`, `owner` (user id), `isActive`, `replyCount`, `createdAt`. Links are created closed (`isActive: false`). Replies: `message` (max 2000), `createdAt`, `user` (an ObjectId, never a display name). The auth slice normalizes the user to `{ id, username, email }`.

### AI feedback suggestions
`useFeedbackSuggestions` gets suggestions from the backend (`POST /feedback-suggestions` with `topicTitle`/`topicDescription`, both required).

### Content Security Policy
`cspPlugin.js` adds a CSP to the production build (not dev). New external origins (fonts, images, APIs, scripts) must be allowed there; check with `npm run build && npm run preview`.

### Styling
- Colors are semantic CSS variables on `:root` / `.dark` in `src/index.css`, exposed to Tailwind via `@theme inline`: `paper`, `surface`, `sunken`, `ink`, `muted`, `line`, `accent`, `accent-soft`, `on-accent`, `note` (sticky-note yellow), `danger`. Use these (`bg-surface`, `text-muted`, `border-line`) instead of raw gray/indigo — they switch with the theme, so `dark:` prefixes are rarely needed.
- Type: `font-sans` = Schibsted Grotesk (UI, headings); `font-voice` = Literata, reserved for text people wrote (feedback, replies, suggestions). Fonts load from Google Fonts in `index.html`.
- Reusable `@utility` classes: `btn`, `btn-sm`, `btn-primary|secondary|ghost|danger`, `card`, `alert`, `input` (style errors via `aria-invalid`), `label`, `hint`, `field-error`, `badge`, `badge-active|inactive`.
- Shared components: `PageState.jsx` (`Spinner`, `PageLoader`, `PageMessage`, `ConnectionError`, `BackLink`), `OwnedLinkPage.jsx` (loads a link for `/links/:id*`), `RepliesSection.jsx` (loads and lists replies), `LinkHeader.jsx`, `AuthLayout.jsx`, `TextField.jsx` (react-hook-form input), `Logo.jsx`. Hooks: `useLink.js` (`useOwnedLink`, `usePublicLink`). `src/lib/links.js` has `publicUrl` (use it for public hrefs; it includes the base path), `copyLink`, `slugify`; `src/lib/storage.js` is a safe `localStorage` wrapper.
- Dark mode: `ThemeToggle` toggles `.dark` on `<html>` (persisted as `localStorage.theme`); an inline script in `index.html` applies it before first paint. `@custom-variant dark` is declared, so `dark:` follows the toggle.

### Conventions
- Pages live in `src/Pages/` (capital P) and components in `src/components/`; both use named exports (`export const Dashboard = ...`), except `App`.
