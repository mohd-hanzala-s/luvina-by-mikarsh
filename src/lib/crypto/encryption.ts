import { KDF_ITERATIONS } from '@/constants'

/**
 * Local encryption helpers built on the Web Crypto API (AES-256-GCM).
 *
 * Everything is encrypted and decrypted on-device. Keys are derived from a
 * user passphrase using PBKDF2-SHA-256 with a random salt; passphrases are
 * never stored anywhere.
 */

export const AES_GCM = 'AES-GCM'
export const PBKDF2 = 'PBKDF2'
const SALT_BYTES = 16
const IV_BYTES = 12
const KEY_BITS = 256

function subtle(): SubtleCrypto {
  const cryptoImpl = globalThis.crypto
  if (!cryptoImpl?.subtle) {
    throw new Error('Web Crypto API is unavailable in this context.')
  }
  return cryptoImpl.subtle
}

function getRandomBytes(size: number): Uint8Array<ArrayBuffer> {
  const cryptoImpl = globalThis.crypto
  if (!cryptoImpl?.getRandomValues) {
    throw new Error('Web Crypto API is unavailable in this context.')
  }
  const bytes = new Uint8Array(size) as Uint8Array<ArrayBuffer>
  cryptoImpl.getRandomValues(bytes)
  return bytes
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const material = await subtle().importKey(
    'raw',
    enc.encode(passphrase),
    PBKDF2,
    false,
    ['deriveKey'],
  )
  return subtle().deriveKey(
    { name: PBKDF2, salt, iterations, hash: 'SHA-256' },
    material,
    { name: AES_GCM, length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptBytes(
  plaintext: Uint8Array<ArrayBuffer>,
  passphrase: string,
  iterations = KDF_ITERATIONS,
): Promise<{
  salt: Uint8Array<ArrayBuffer>
  iv: Uint8Array<ArrayBuffer>
  ciphertext: Uint8Array<ArrayBuffer>
  iterations: number
}> {
  const salt = getRandomBytes(SALT_BYTES)
  const iv = getRandomBytes(IV_BYTES)
  const key = await deriveKey(passphrase, salt, iterations)
  const ciphertext = new Uint8Array(
    await subtle().encrypt({ name: AES_GCM, iv }, key, plaintext),
  ) as Uint8Array<ArrayBuffer>
  return { salt, iv, ciphertext, iterations }
}

export async function decryptBytes(
  ciphertext: Uint8Array<ArrayBuffer>,
  iv: Uint8Array<ArrayBuffer>,
  salt: Uint8Array<ArrayBuffer>,
  passphrase: string,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await deriveKey(passphrase, salt, iterations)
  try {
    const plaintext = await subtle().decrypt({ name: AES_GCM, iv }, key, ciphertext)
    return new Uint8Array(plaintext) as Uint8Array<ArrayBuffer>
  } catch {
    throw new Error('Unable to decrypt. Check your password and try again.')
  }
}

/** Encode binary data as a base64 string (chunked to avoid call-stack limits). */
export function bytesToBase64(bytes: Uint8Array): string {
  const chunks: string[] = []
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + chunkSize)))
  }
  return btoa(chunks.join(''))
}

/** Decode a base64 string into binary data. */
export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length) as Uint8Array<ArrayBuffer>
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
