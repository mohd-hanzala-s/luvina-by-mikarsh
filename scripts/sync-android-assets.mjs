import { readdirSync, statSync, copyFileSync, mkdirSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'

const OUT_DIR = resolve('out')
const DEST_DIR = resolve('android/app/src/main/assets/www')

const isDir = (p) => statSync(p).isDirectory()

function collectFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry)
    if (isDir(abs)) {
      files.push(...collectFiles(abs))
    } else {
      files.push(abs)
    }
  }
  return files
}

function main() {
  if (!statSync(OUT_DIR).isDirectory()) {
    console.error(
      `[android:sync] Missing static export at ${OUT_DIR}. ` +
        'Run `pnpm build` first (or use `pnpm android:sync` which builds first).',
    )
    process.exit(1)
  }

  const files = collectFiles(OUT_DIR)
  let bytes = 0

  for (const file of files) {
    const rel = relative(OUT_DIR, file)
    const target = join(DEST_DIR, rel)
    mkdirSync(join(target, '..'), { recursive: true })
    copyFileSync(file, target)
    bytes += statSync(file).size
  }

  console.log(
    `[android:sync] Copied ${files.length} files (${(bytes / 1024 / 1024).toFixed(2)} MiB) ` +
      `into ${DEST_DIR}`,
  )
}

main()
