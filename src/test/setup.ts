import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import 'fake-indexeddb/auto'

/**
 * Test setup.
 * - Registers jest-dom matchers for component tests.
 * - Installs a pure-JS IndexedDB implementation for the Dexie repositories.
 * - Exposes the Web Crypto API (used by the backup/encryption modules) in the
 *   jsdom environment where `crypto.subtle` is not available.
 */
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  })
}
