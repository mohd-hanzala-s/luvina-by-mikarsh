# Luvina by Mikarsh

_Understand your cycle. Embrace your flow._

Luvina is a premium, offline-first app for tracking menstrual cycles, shipped as
a Progressive Web App (web) **and** a standalone Android app — both built from
this single repository. It runs entirely on-device: all data is stored locally in
IndexedDB, there is no backend, no account, no analytics, and no ads. Optional
encrypted backups let you export/import your data, or archive it to a private
GitHub repository under your control.

## Features

- **Home** — current cycle day, phase, days until next period, quick actions and a
  monthly calendar preview
- **Calendar** — swipeable monthly view with color-coded period, predicted period,
  ovulation and fertile-window days
- **History** — a timeline of past cycles with per-cycle detail
- **Insights** — averages, consistency score, prediction accuracy and simple charts,
  all computed locally
- **Settings** — Light/Dark/Default appearance, cycle defaults, reminders, and encrypted backup/restore
- **Offline-first PWA** — installable, fully usable with no network connection after
  first load
- **Standalone Android app** — a native WebView shell bundling the same web build,
  offline-first, with its own branded launcher icon and splash screen
- **Encrypted backups** — AES-256-GCM (via the Web Crypto API), key derived from your
  passphrase with PBKDF2-SHA-256; nothing is ever uploaded unencrypted

## Tech stack

Next.js (static export) · TypeScript · Tailwind CSS · shadcn/ui · Zustand ·
React Hook Form + Zod · Framer Motion · date-fns · Dexie.js (IndexedDB) ·
next-pwa · Vitest · Playwright · Android: Kotlin + WebView (Gradle)

## Getting started

Requirements: Node.js ≥ 20, [pnpm](https://pnpm.io) ≥ 9.

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. The service worker is disabled in
development (see `next.config.mjs`), so offline behavior can only be verified
against a production build (below).

## Available scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a static production export in `out/` |
| `pnpm start` | Serve the Next.js production server (not used for GitHub Pages) |
| `pnpm lint` / `pnpm lint:fix` | Lint the project with ESLint |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm test` / `pnpm test:coverage` | Run unit tests with Vitest |
| `pnpm e2e` | Run Playwright end-to-end tests (dev server + a production export) |
| `pnpm icons` | Regenerate PWA icons from the Luvina brand mark |
| `pnpm icons:android` | Regenerate Android launcher icons + splash mark |
| `pnpm android:sync` | Build the static export and bundle it into `android/app/src/main/assets/www/` |
| `pnpm verify` | Run lint, typecheck, unit tests and build, in that order |

`pnpm build` and `pnpm dev` automatically regenerate `public/manifest.json` first
(see `scripts/generate-manifest.mjs`), and `next build` regenerates the service
worker (`public/sw.js`) via `next-pwa`. Neither file needs to be edited by hand.

## Verifying offline behavior locally

```bash
pnpm build
node scripts/serve-out.mjs      # serves out/ on http://localhost:4173
```

Open the served URL, let the service worker install, then disconnect the network
(or use your browser's offline mode) and reload — the app should continue to work.
This is also what `e2e/offline.spec.ts` automates.

## Data & privacy

- All cycle, log, reminder and settings data lives in IndexedDB on your device via
  Dexie.js and never leaves it unless you explicitly export a backup.
- Backups are encrypted locally (AES-256-GCM, PBKDF2-SHA-256 key derivation) before
  they touch disk or any remote storage.
- There is no analytics, telemetry, or third-party tracking of any kind.
- You can always manually export an encrypted backup file to store wherever
  you like. Optionally, Google Drive backup (uploading that same encrypted
  file to your own private Drive space) can be connected in Settings; it is
  off by default and the app is fully functional without it.

## Android app

The `android/` directory is an independent Gradle project that builds a
standalone APK/AAB. It bundles the static web export into the APK and shows it
in a WebView (via `WebViewAssetLoader`, so everything works offline with zero
network or web-deployment dependency). The launcher icon and native splash use
the same Luvina branding as the web app.

Build it:

```bash
pnpm android:sync         # rebuild the web app and bundle it into android assets
cd android
./gradlew assembleDebug   # debug APK (or open android/ in Android Studio)
```

Release signing, icon regeneration and more are documented in
[`android/README.md`](android/README.md).

## Deploying to Vercel

The web app is a pure static export (`output: 'export'`), so it deploys to
Vercel as-is:

1. Push the repository to GitHub/GitLab and import it into Vercel.
2. Framework preset: **Next.js** (Vercel auto-detects it).
3. Build command: `pnpm build`, output directory: `out`.
4. Leave `NEXT_PUBLIC_BASE_PATH` empty (root path).

Every push to the default branch auto-deploys. No server, database, or
environment variables are required.

## Deploying to GitHub Pages (alternative)

Deployment is automated with `.github/workflows/deploy.yml`:

1. Push to `main`. The `verify` job installs dependencies and runs lint, typecheck
   and unit tests.
2. If `verify` passes, `build-deploy` builds a static export with the correct
   `NEXT_PUBLIC_BASE_PATH` for your repository (root path for a
   `<owner>.github.io` user/org site, `/<repo-name>` for a project site) and
   publishes `out/` to GitHub Pages via the official Pages actions.

To enable it once, in your repository on GitHub go to **Settings → Pages** and set
**Source** to **GitHub Actions**. After that, deployment only requires:

```bash
git push
```

No paid hosting, backend server, or database is required.

## Project structure

```
src/
  app/          Route pages (Home, Calendar, History, Insights, Settings)
  components/   UI, layout and feature components
  hooks/        Reusable hooks (app data, media queries, PWA updates)
  lib/          Domain logic: cycle calculations, db repositories, backup, crypto,
                notifications
  store/        Zustand app store
  types/        Shared TypeScript types
  constants/    App-wide constants and defaults
e2e/            Playwright end-to-end tests
android/        Standalone native Android app (Kotlin WebView shell, Gradle)
scripts/        Build-time helper scripts (manifest, icons, android sync, static server)
```

## License

MIT
