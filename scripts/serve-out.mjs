/**
 * Minimal static server for the production `out/` export.
 *
 * Serves the same extensionless → .html mapping that GitHub Pages uses so
 * the offline/PWA end-to-end tests can run against a production build.
 * Run after `pnpm build` (creates `out/`).
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', 'out')
const port = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

async function exists() {
  try {
    await readFile(join(root, 'index.html'))
    return true
  } catch {
    return false
  }
}

const ready = await exists()
if (!ready) {
  console.warn(`No production export found at ${root}. Run \`pnpm build\` first. Offline tests will be skipped.`)
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`)
    let urlPath = decodeURIComponent(url.pathname)
    if (urlPath.endsWith('/')) urlPath += 'index.html'
    if (urlPath === '/index') urlPath = '/index.html'
    let filePath = join(root, normalize(urlPath))
    if (!extname(filePath)) filePath += '.html'
    const data = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    })
    res.end(data)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found')
  }
}).listen(port, () => {
  console.log(`Serving ${root} on http://localhost:${port}`)
})
