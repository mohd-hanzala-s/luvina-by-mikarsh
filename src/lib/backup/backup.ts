import {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  BACKUP_STALE_HOURS,
  KDF_ITERATIONS,
} from '@/constants'
import { base64ToBytes, bytesToBase64, decryptBytes, encryptBytes } from '@/lib/crypto/encryption'
import type { BackupData } from '@/types'

/**
 * Encrypted backup system.
 *
 * A backup is a JSON envelope whose payload is AES-256-GCM encrypted with a
 * key derived from the user's passphrase. The envelope is safe to store on
 * any host (GitHub, filesystem, etc.) because the data is unreadable without
 * the passphrase.
 */

export interface BackupEnvelope {
  format: typeof BACKUP_FORMAT
  version: number
  app: 'luvina'
  createdAt: string
  kdf: { name: string; iterations: number; hash: string; salt: string }
  cipher: { name: string; iv: string }
  ciphertext: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** Encrypt a BackupData payload into a portable backup envelope string. */
export async function createBackup(data: BackupData, passphrase: string): Promise<string> {
  const plaintext = encoder.encode(JSON.stringify(data))
  const { salt, iv, ciphertext, iterations } = await encryptBytes(
    plaintext,
    passphrase,
    KDF_ITERATIONS,
  )

  const envelope: BackupEnvelope = {
    format: BACKUP_FORMAT,
    version: BACKUP_SCHEMA_VERSION,
    app: 'luvina',
    createdAt: new Date().toISOString(),
    kdf: { name: 'PBKDF2', iterations, hash: 'SHA-256', salt: bytesToBase64(salt) },
    cipher: { name: 'AES-GCM', iv: bytesToBase64(iv) },
    ciphertext: bytesToBase64(ciphertext),
  }

  return JSON.stringify(envelope, null, 2)
}

/** Decrypt a backup envelope string back into BackupData. */
export async function openBackup(payload: string, passphrase: string): Promise<BackupData> {
  let envelope: BackupEnvelope
  try {
    envelope = JSON.parse(payload) as BackupEnvelope
  } catch {
    throw new Error('This file is not a valid Luvina backup.')
  }

  if (envelope.format !== BACKUP_FORMAT || envelope.app !== 'luvina') {
    throw new Error('This file is not a Luvina backup.')
  }
  if (envelope.version > BACKUP_SCHEMA_VERSION) {
    throw new Error('This backup was created by a newer version of Luvina.')
  }

  const salt = base64ToBytes(envelope.kdf.salt)
  const iv = base64ToBytes(envelope.cipher.iv)
  const ciphertext = base64ToBytes(envelope.ciphertext)
  const iterations = envelope.kdf.iterations || KDF_ITERATIONS

  const plaintext = await decryptBytes(ciphertext, iv, salt, passphrase, iterations)
  const data = JSON.parse(decoder.decode(plaintext)) as BackupData
  if (data.app !== 'luvina' || !Array.isArray(data.cycles) || !Array.isArray(data.logs)) {
    throw new Error('The backup contents could not be validated.')
  }
  return data
}

/** Suggested file name for a downloaded backup. */
export function backupFileName(): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `luvina-backup-${stamp}.json`
}

/**
 * Whether the last backup is old enough to nudge the user again.
 * `lastBackupAt` of `null` (never backed up) always counts as stale.
 */
export function isBackupStale(lastBackupAt: number | null, now: Date = new Date()): boolean {
  if (lastBackupAt === null) return true
  const elapsedHours = (now.getTime() - lastBackupAt) / (1000 * 60 * 60)
  return elapsedHours >= BACKUP_STALE_HOURS
}
