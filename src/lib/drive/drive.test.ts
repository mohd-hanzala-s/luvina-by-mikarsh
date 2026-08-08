import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/constants')>()
  return { ...actual, GOOGLE_DRIVE_CLIENT_ID: 'test-client.apps.googleusercontent.com' }
})

import {
  DriveError,
  buildBackupUploadBody,
  fetchDriveUserInfo,
  isDriveConfigured,
  requestDriveToken,
  revokeDriveAccess,
  shouldAutoBackup,
  uploadBackupToDrive,
} from '@/lib/drive/drive'

interface GsiConfig {
  client_id: string
  scope: string
  callback: (response: { access_token?: string; error?: string }) => void
}

let gsiCallback: GsiConfig['callback'] | null = null
let gsiPrompt: string | undefined
let gsiError: string | undefined

function installFakeGsi() {
  const windowWithGoogle = window as unknown as {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GsiConfig) => unknown
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
  gsiCallback = null
  gsiPrompt = undefined
  gsiError = undefined
  windowWithGoogle.google = {
    accounts: {
      oauth2: {
        initTokenClient: (config: GsiConfig) => {
          gsiCallback = config.callback
          return {
            requestAccessToken: (opts?: { prompt?: string }) => {
              gsiPrompt = opts?.prompt
              const response = gsiError ? { error: gsiError } : { access_token: 'tok-123' }
              setTimeout(() => gsiCallback?.(response), 0)
            },
          }
        },
        revoke: (_token: string, done?: () => void) => {
          done?.()
        },
      },
    },
  }
}

function installFakeFetch(handler: (url: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => Promise.resolve(handler(url, init))),
  )
}

beforeEach(() => {
  installFakeGsi()
})

afterEach(() => {
  vi.unstubAllGlobals()
  gsiCallback = null
  gsiPrompt = undefined
  gsiError = undefined
})

describe('drive configuration', () => {
  it('reports the build as configured when a client id is present', () => {
    expect(isDriveConfigured()).toBe(true)
  })
})

describe('buildBackupUploadBody', () => {
  it('embeds metadata and the backup payload in a multipart body', async () => {
    const { body, boundary } = buildBackupUploadBody('luvina-drive-2026-01-01.json', '{"ciphertext":"x"}')
    expect(boundary).toContain('luvina-boundary-')
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(body)
    })
    expect(text).toContain('"name":"luvina-drive-2026-01-01.json"')
    expect(text).toContain('"mimeType":"application/json"')
    expect(text).toContain('{"ciphertext":"x"}')
    expect(text).toContain(`--${boundary}--`)
  })
})

describe('uploadBackupToDrive', () => {
  it('POSTs a multipart upload with the bearer token and returns the file id', async () => {
    const call: { url?: string; init?: RequestInit } = {}
    installFakeFetch((url, init) => {
      call.url = url
      call.init = init
      return { ok: true, json: async () => ({ id: 'file-abc' }) }
    })

    const id = await uploadBackupToDrive('tok-123', '{"ciphertext":"x"}', 'luvina-drive-2026-01-01.json')

    expect(id).toBe('file-abc')
    expect(call.url).toContain('https://www.googleapis.com/upload/drive/v3/files')
    expect(call.init?.method).toBe('POST')
    const headers = call.init?.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer tok-123')
    expect(headers['Content-Type']).toContain('multipart/related; boundary=')
  })

  it('rejects with a reconnect hint on 401', async () => {
    installFakeFetch(() => ({ ok: false, status: 401 }))
    await expect(
      uploadBackupToDrive('tok', 'x', 'luvina-drive-2026-01-01.json'),
    ).rejects.toThrow('Reconnect your account')
  })

  it('rejects when Google returns a failure status', async () => {
    installFakeFetch(() => ({ ok: false, status: 500 }))
    await expect(
      uploadBackupToDrive('tok', 'x', 'luvina-drive-2026-01-01.json'),
    ).rejects.toBeInstanceOf(DriveError)
  })

  it('rejects when no file id is returned', async () => {
    installFakeFetch(() => ({ ok: true, json: async () => ({}) }))
    await expect(
      uploadBackupToDrive('tok', 'x', 'luvina-drive-2026-01-01.json'),
    ).rejects.toThrow('did not return a file id')
  })
})

describe('fetchDriveUserInfo', () => {
  it('returns the account email', async () => {
    installFakeFetch((url, init) => {
      expect(url).toBe('https://www.googleapis.com/oauth2/v2/userinfo')
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer tok')
      return { ok: true, json: async () => ({ email: 'me@example.com' }) }
    })
    await expect(fetchDriveUserInfo('tok')).resolves.toBe('me@example.com')
  })

  it('rejects when the request fails', async () => {
    installFakeFetch(() => ({ ok: false, status: 400 }))
    await expect(fetchDriveUserInfo('tok')).rejects.toBeInstanceOf(DriveError)
  })

  it('rejects when no email is present', async () => {
    installFakeFetch(() => ({ ok: true, json: async () => ({}) }))
    await expect(fetchDriveUserInfo('tok')).rejects.toBeInstanceOf(DriveError)
  })
})

describe('revokeDriveAccess', () => {
  it('POSTs the revoke endpoint with the token', async () => {
    let url = ''
    installFakeFetch((u, init) => {
      url = u
      expect(init?.method).toBe('POST')
      return { ok: true }
    })
    await revokeDriveAccess('tok')
    expect(url).toBe('https://oauth2.googleapis.com/revoke?token=tok')
  })
})

describe('requestDriveToken', () => {
  it('resolves the access token and passes the silent prompt flag', async () => {
    const token = await requestDriveToken({ silent: true })
    expect(token).toBe('tok-123')
    expect(gsiPrompt).toBe('')
  })

  it('uses an undefined prompt for interactive requests', async () => {
    await requestDriveToken()
    expect(gsiPrompt).toBeUndefined()
  })

  it('rejects with a DriveError when the callback reports an error', async () => {
    gsiError = 'access_denied'
    await expect(requestDriveToken()).rejects.toBeInstanceOf(DriveError)
  })
})

describe('shouldAutoBackup', () => {
  const base = {
    driveEmail: 'me@example.com',
    drivePassphrase: 'secret',
    driveAutoBackup: true,
    lastDriveBackupAt: null as number | null,
  }

  it('is false until an account, passphrase and opt-in all exist', () => {
    expect(shouldAutoBackup({ ...base, driveEmail: null })).toBe(false)
    expect(shouldAutoBackup({ ...base, drivePassphrase: null })).toBe(false)
    expect(shouldAutoBackup({ ...base, driveAutoBackup: false })).toBe(false)
  })

  it('is true when configured and the last upload is stale', () => {
    const old = Date.now() - 100 * 60 * 60 * 1000
    expect(shouldAutoBackup({ ...base, lastDriveBackupAt: old }, new Date())).toBe(true)
  })

  it('is false when the last upload is fresh', () => {
    const now = new Date()
    expect(
      shouldAutoBackup({ ...base, lastDriveBackupAt: now.getTime() }, now),
    ).toBe(false)
  })
})
