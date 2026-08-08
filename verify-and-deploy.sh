#!/usr/bin/env bash
# Luvina — verification + deploy runbook
# Run from the repo root, in an environment with real network access
# (your machine, CI, or Claude Code). Stops on the first failure.
set -euo pipefail

echo "== 0. Toolchain =="
node --version   # expect >=20
pnpm --version   # expect >=9 (repo pins 11.20.0 via packageManager)

echo "== 1. Install =="
pnpm install --frozen-lockfile

echo "== 2. Lint =="
pnpm lint

echo "== 3. Typecheck =="
pnpm typecheck

echo "== 4. Unit tests =="
pnpm test

echo "== 5. Production build (static export) =="
pnpm build
test -f out/index.html && echo "out/index.html present"

echo "== 6. Playwright E2E (dev-server suite + offline/prod suite) =="
pnpm exec playwright install --with-deps chromium
pnpm e2e
# playwright.config.ts starts `pnpm dev` for the main suite and
# `node scripts/serve-out.mjs` (serving out/ from step 5) for
# e2e/offline.spec.ts automatically — no extra steps needed.

echo "== ALL VERIFICATION STEPS PASSED =="

echo "== 7. Commit & push =="
git add -A
git status --short
# Only commit if there's something to commit (e.g. a lockfile refresh)
git diff --cached --quiet || git commit -m "Verify: lint/typecheck/test/build/e2e all green"
git remote -v
# If no remote yet:
#   git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main

echo "== 8. Watch GitHub Actions =="
echo "Open: https://github.com/<owner>/<repo>/actions"
echo "Wait for 'CI & Deploy' workflow: 'verify' job then 'build-deploy' job, both green."
# With GitHub CLI installed, you can instead do:
#   gh run watch --exit-status

echo "== 9. Enable Pages (one-time only) =="
echo "GitHub repo -> Settings -> Pages -> Source: 'GitHub Actions'."
echo "After that, every push to main auto-deploys (build-deploy job runs actions/deploy-pages)."

echo "== 10. Get the live URL =="
echo "Either:"
echo "  gh api repos/<owner>/<repo>/pages --jq .html_url"
echo "Or check the 'build-deploy' job summary in Actions for the deployment URL."
