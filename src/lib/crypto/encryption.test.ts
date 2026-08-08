import { describe, expect, it } from 'vitest'
import {
  base64ToBytes,
  bytesToBase64,
  decryptBytes,
  encryptBytes,
} from '@/lib/crypto/encryption'

const encoder = new TextEncoder()

describe('encryption', () => {
  it('round-trips plaintext with a passphrase', async () => {
    const plaintext = encoder.encode('sensitive health data')
    const { salt, iv, ciphertext, iterations } = await encryptBytes(plaintext, 'correct horse battery staple')
    expect(ciphertext.length).toBeGreaterThan(0)
    expect(salt.length).toBe(16)
    expect(iv.length).toBe(12)
    expect(iterations).toBeGreaterThan(0)

    const restored = await decryptBytes(ciphertext, iv, salt, 'correct horse battery staple', iterations)
    expect(new TextDecoder().decode(restored)).toBe('sensitive health data')
  })

  it('uses a fresh salt and iv for every encryption', async () => {
    const plaintext = encoder.encode('same data')
    const a = await encryptBytes(plaintext, 'pw')
    const b = await encryptBytes(plaintext, 'pw')
    expect(a.salt).not.toEqual(b.salt)
    expect(a.iv).not.toEqual(b.iv)
    expect(a.ciphertext).not.toEqual(b.ciphertext)
  })

  it('rejects a wrong passphrase', async () => {
    const plaintext = encoder.encode('secret')
    const { salt, iv, ciphertext, iterations } = await encryptBytes(plaintext, 'right-password')
    await expect(
      decryptBytes(ciphertext, iv, salt, 'wrong-password', iterations),
    ).rejects.toThrow(/check your password/i)
  })

  it('throws when Web Crypto is unavailable', async () => {
    const original = globalThis.crypto
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    await expect(encryptBytes(encoder.encode('x'), 'pw')).rejects.toThrow(/Web Crypto/i)
    Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true })
  })
})

describe('base64 helpers', () => {
  it('round-trips binary data through base64', () => {
    const bytes = new Uint8Array([0, 1, 2, 253, 254, 255, 128])
    const encoded = bytesToBase64(bytes)
    const decoded = base64ToBytes(encoded)
    expect(decoded).toEqual(bytes)
  })

  it('handles large payloads without stack overflow', () => {
    const bytes = new Uint8Array(200_000)
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 256
    const decoded = base64ToBytes(bytesToBase64(bytes))
    expect(decoded).toEqual(bytes)
  })
})
