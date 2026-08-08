#!/usr/bin/env bash
set -euo pipefail

# Install the Chromium browser used by Playwright (downloads once).
pnpm exec playwright install chromium

# Playwright manages its own dev server lifecycle via the `webServer` option
# in playwright.config.ts. This script is a thin convenience wrapper.
pnpm e2e
