/**
 * Generates the Android launcher icon set (legacy PNGs at every density plus
 * the adaptive-icon foreground/background) from the official Luvina brand mark
 * (scripts/assets/luvina-mark-source.png). Run with: pnpm icons:android
 *
 * The gradient tile and mark placement mirror the PWA icons produced by
 * scripts/generate-icons.mjs so both platforms share the same brand art.
 */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const markPath = join(__dirname, 'assets', 'luvina-mark-source.png')
const resDir = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res')

const GRADIENT = [
  { offset: 0, color: '#2C1856' },
  { offset: 55, color: '#4B297A' },
  { offset: 100, color: '#6D28D9' },
]

/** Gradient tile. `shape` is 'roundRect' (PWA look), 'circle' or 'square'. */
function tileSvg(size, shape) {
  const stops = GRADIENT.map(
    (s) => `<stop offset="${s.offset}%" stop-color="${s.color}"/>`,
  ).join('')
  const half = size / 2
  let body
  if (shape === 'circle') {
    body = `<circle cx="${half}" cy="${half}" r="${half}" fill="url(#tileBg)"/>`
  } else if (shape === 'square') {
    body = `<rect width="${size}" height="${size}" fill="url(#tileBg)"/>`
  } else {
    const rx = Math.round(size * (114 / 512))
    body = `<rect width="${size}" height="${size}" rx="${rx}" fill="url(#tileBg)"/>`
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tileBg" x1="0.1" y1="0" x2="0.9" y2="1">
      ${stops}
    </linearGradient>
  </defs>
  ${body}
</svg>`
}

/** Composite the brand mark, scaled to `fraction` of `size`, onto a base image. */
async function compositeMark(base, size, fraction) {
  const markMax = Math.round(size * fraction)
  const mark = await sharp(markPath)
    .resize(markMax, markMax, { fit: 'inside' })
    .toBuffer()
  const meta = await sharp(mark).metadata()
  return base
    .composite([
      {
        input: mark,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toBuffer()
}

// Legacy launcher icons at the standard Android densities. The tile matches
// the PWA mark (rounded square); a circular variant is used for the round icon.
const LEGACY_DENSITIES = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

// Adaptive icon foreground: the mark on a transparent 108dp canvas rendered at
// 4x (432px) so it stays crisp on high-density launchers. The mark is kept
// inside the central safe zone (the inner 66/108 band) so launcher masks can
// never clip the artwork.
const FOREGROUND_SIZE = 432
const FOREGROUND_MARK_FRACTION = 0.62

async function main() {
  await mkdir(join(resDir, 'drawable'), { recursive: true })

  for (const { dir, size } of LEGACY_DENSITIES) {
    const outDir = join(resDir, dir)
    await mkdir(outDir, { recursive: true })

    const tile = sharp(Buffer.from(tileSvg(size, 'roundRect'))).resize(size, size)
    await compositeMark(tile, size, 0.78).then((buf) =>
      sharp(buf).toFile(join(outDir, 'ic_launcher.png')),
    )

    const roundTile = sharp(Buffer.from(tileSvg(size, 'circle'))).resize(size, size)
    await compositeMark(roundTile, size, 0.78).then((buf) =>
      sharp(buf).toFile(join(outDir, 'ic_launcher_round.png')),
    )
    console.log('generated legacy icons @', dir)
  }

  // Adaptive icon foreground PNG (mark on transparent).
  const adaptiveDir = join(resDir, 'mipmap-xxxhdpi')
  await mkdir(adaptiveDir, { recursive: true })
  const transparent = sharp({
    create: {
      width: FOREGROUND_SIZE,
      height: FOREGROUND_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
  await compositeMark(transparent, FOREGROUND_SIZE, FOREGROUND_MARK_FRACTION).then((buf) =>
    sharp(buf).toFile(join(adaptiveDir, 'ic_launcher_foreground.png')),
  )
  console.log('generated adaptive foreground (432x432)')

  // Brand mark used by the native splash screen.
  const splashMark = await sharp(markPath)
    .resize(512, 512, { fit: 'inside' })
    .png()
    .toFile(join(resDir, 'drawable', 'ic_splash_mark.png'))
  console.log('generated splash mark', splashMark.width, 'x', splashMark.height)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
