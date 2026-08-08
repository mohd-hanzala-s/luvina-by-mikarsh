# Luvina — Verification & Deploy Runbook

Everything I can do without network access is done: the repo is cleaned, committed
locally (`git log` shows one commit, branch `main`), and the commands below are the
exact sequence to finish the job in an environment that has real network access
(your machine, a CI runner, or Claude Code).

`verify-and-deploy.sh` in this same folder is the copy-paste version of everything
below. Both are in sync — use whichever is easier.

---

## 0. One-time setup

```bash
cd luvina                    # the extracted project root (has .git already)
node --version                # need >=20
corepack enable                # or: npm i -g pnpm@11.20.0
pnpm --version                 # need >=9
```

If this is a brand-new GitHub repo, create it first (empty, no README/license —
this repo already has both) and note the remote URL.

---

## 1. Local verification (must all pass before pushing)

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build                     # static export into out/
pnpm exec playwright install --with-deps chromium
pnpm e2e
```

Notes on `pnpm e2e`:
- `playwright.config.ts` runs **two** local servers automatically: `pnpm dev`
  (for the main smoke suite, `e2e/smoke.spec.ts`) and
  `node scripts/serve-out.mjs` serving the `out/` directory from step 5 above
  (for `e2e/offline.spec.ts`, which needs a real static export + real service
  worker — it won't work against the dev server).
- If any offline test is skipped rather than passing, it means `out/` wasn't
  built first — run `pnpm build` before `pnpm e2e`, as above.

**If anything fails:** stop, fix only the genuine defect (don't touch unrelated
code), re-run the single failing command to confirm, then re-run the full
sequence from the top once before moving on — a fix in one layer (e.g. a type
fix) can occasionally surface a new lint/test issue.

---

## 2. Commit & push

The repo already has one commit ("Release prep: production readiness review") on
branch `main`. If verification above required code changes, commit those too:

```bash
git add -A
git status --short             # sanity-check what's staged
git commit -m "Fix: <describe the genuine issue fixed>"   # skip if nothing changed

git remote add origin git@github.com:<owner>/<repo>.git   # first time only
git push -u origin main
```

---

## 3. Watch GitHub Actions

`.github/workflows/deploy.yml` triggers on push to `main`:

1. **`verify`** job — installs deps, runs `pnpm lint`, `pnpm typecheck`, `pnpm test`.
2. **`build-deploy`** job (only runs if `verify` passes) — computes
   `NEXT_PUBLIC_BASE_PATH` from the repo name (root path for a
   `<owner>.github.io` repo, `/<repo-name>` otherwise), runs `pnpm build`, and
   deploys `out/` via `actions/deploy-pages`.

Watch it at `https://github.com/<owner>/<repo>/actions`, or with the GitHub CLI:

```bash
gh run watch --exit-status
```

The workflow does **not** run Playwright e2e in CI (kept out of the deploy gate
for speed/stability) — that's why step 1 above runs it locally first.

---

## 4. Enable GitHub Pages (one-time)

Repo → **Settings → Pages → Source: "GitHub Actions."** After this one-time
setting, every future green push to `main` auto-deploys — no manual Pages
configuration needed again.

Get the live URL once deployed:

```bash
gh api repos/<owner>/<repo>/pages --jq .html_url
```

or read it from the `build-deploy` job's environment URL in the Actions run summary.

---

## 5. Manual verification on the live site

Do this in an actual mobile or desktop browser against the live Pages URL, not
`localhost`.

- [ ] **Install as PWA** — browser shows an install prompt / "Install app" option;
      after installing, it opens in standalone mode (no browser chrome).
- [ ] **Create data** — start a period from Home, add a note and a couple of
      symptoms, confirm the calendar and Home stats update immediately.
- [ ] **Edit/delete data** — edit the period you just logged (change start/end
      date), then delete a log entry; confirm the UI and stats reflect it.
- [ ] **Backup** — Settings → create an encrypted backup with a password, confirm
      the file downloads.
- [ ] **Restore** — clear or use a second browser profile, import the backup file
      with the same password, confirm all data returns exactly as logged.
- [ ] **Wrong-password restore** — attempt restore with an incorrect password,
      confirm it fails with a clear error and does not corrupt existing data.
- [ ] **Offline mode** — with the app already opened once (so the service worker
      has installed), turn on airplane mode / disconnect network, reload the
      app, confirm it still loads and every tab (Home, Calendar, History,
      Insights, Settings) still works, and new data logged offline persists
      after reconnecting.
- [ ] **No sync step needed** — Luvina has no backend/account, so there is no
      cross-device sync to test; "sync" in this app only ever means the manual
      encrypted backup/restore flow already covered above. If you *do* connect
      the optional Google Drive backup path in Settings, test that its
      upload/restore round-trip separately.

Report back anything that fails at either the CI or manual-testing stage — I'll
fix the genuine issue and you re-run the relevant part of this runbook.

---

## 6. Android app (standalone APK/AAB)

The `android/` project is independent of the web deploy. It bundles the static
export into the APK, so it works offline without any hosted backend.

```bash
# From the repo root: rebuild the web app and bundle it into android assets
pnpm android:sync

# From android/: build the APK
./gradlew assembleDebug
```

- Requires JDK 17+ and the Android SDK (compileSdk 35); Android Studio bundles both.
- Release builds need a signing keystore — see `android/README.md`.
- If you change the web app, re-run `pnpm android:sync` so the APK contains the
  updated bundle.

---

## 7. Deploying the web app to Vercel (alternative to GitHub Pages)

The web export is static, so Vercel deployment is trivial:

1. Import the repo into Vercel (framework preset **Next.js**).
2. Build command `pnpm build`, output directory `out`, `NEXT_PUBLIC_BASE_PATH` empty.
3. Push to the default branch to auto-deploy.
