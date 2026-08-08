/**
 * Generates the PWA icon set by compositing the official Luvina brand mark
 * (scripts/assets/luvina-mark-source.png) onto a rounded-square, brand-
 * gradient tile. Run with: pnpm icons
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const markPath = join(__dirname, 'assets', 'luvina-mark-source.png')
const outDir = join(__dirname, '..', 'public', 'icons')

function tileSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tileBg" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#2C1856"/>
      <stop offset="55%" stop-color="#4B297A"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="114" fill="url(#tileBg)"/>
</svg>`
}

// { name, size, padding (fraction of the tile reserved as empty margin on each side), tile (draw the rounded gradient tile behind the mark, or leave transparent) }
// The maskable icon keeps the recommended safe-zone padding (0.2) so launcher
// masks never clip the artwork; the "any"/apple icons use less padding so the
// logo reads clearly at launcher sizes.
const TARGETS = [
  { name: 'icon-192.png', size: 192, padding: 0.06, tile: true },
  { name: 'icon-512.png', size: 512, padding: 0.06, tile: true },
  { name: 'icon-512-maskable.png', size: 512, padding: 0.2, tile: true },
  { name: 'apple-touch-icon.png', size: 180, padding: 0.08, tile: true },
  { name: 'icon-32.png', size: 32, padding: 0.04, tile: true },
  { name: 'icon-16.png', size: 16, padding: 0.02, tile: true },
]

async function compositeIcon({ size, padding, tile }) {
  const markMaxSize = Math.round(size * (1 - padding * 2))
  const markBuffer = await sharp(markPath)
    .resize(markMaxSize, markMaxSize, { fit: 'inside' })
    .toBuffer()
  const markMeta = await sharp(markBuffer).metadata()

  const base = tile
    ? sharp(Buffer.from(tileSvg(size))).resize(size, size)
    : sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })

  return base
    .composite([
      {
        input: markBuffer,
        left: Math.round((size - markMeta.width) / 2),
        top: Math.round((size - markMeta.height) / 2),
      },
    ])
    .png()
    .toBuffer()
}

async function main() {
  await mkdir(outDir, { recursive: true })
  for (const target of TARGETS) {
    const buffer = await compositeIcon(target)
    await sharp(buffer).toFile(join(outDir, target.name))
    console.log('generated', target.name)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
