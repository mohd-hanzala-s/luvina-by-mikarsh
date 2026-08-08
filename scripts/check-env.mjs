#!/usr/bin/env node
/**
 * Post-install environment check.
 * Verifies the toolchain versions expected by the project and prints a
 * friendly warning instead of failing silently when something is off.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { engines } = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
)
const semverish = (v) => {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v || '')
  return match ? match.slice(1).map(Number) : null
}

const meets = (current, range) => {
  const req = /^\s*(\^|~|>=|<=|>|<)?\s*(\d+)\.(\d+)\.(\d+)/.exec(range || '')
  if (!req) return true
  const cur = semverish(current)
  if (!cur) return true
  const [op, ...rv] = req.slice(1)
  const [maj, min, pat] = rv.map(Number)
  const cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0)
  const c = cmp([cur[0], cur[1], cur[2]], [maj, min, pat])
  switch (op) {
    case '>':
      return c > 0
    case '>=':
      return c >= 0
    case '<':
      return c < 0
    case '<=':
      return c <= 0
    case '~':
      return cur[0] === maj && cur[1] === min
    case '^':
    default:
      return cur[0] === maj && c >= 0
  }
}

const checks = [
  { name: 'Node.js', current: process.version, range: engines.node },
  { name: 'pnpm', current: process.env.npm_config_user_agent || '', range: engines.pnpm },
]

for (const check of checks) {
  const ok = meets(check.current, check.range)
  if (ok) {
    console.log(`- ${check.name} ok (${check.current || 'unknown'})`)
  } else {
    console.warn(
      `- ${check.name} ${check.current || 'unknown'} does not match required ${check.range}`,
    )
  }
}
