import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      'public/sw.js',
      'public/workbox-*.js',
      'public/swe-worker-*.js',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'android/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]

export default eslintConfig
