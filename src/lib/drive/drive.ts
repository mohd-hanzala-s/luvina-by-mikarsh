import { DRIVE_SCOPE, GOOGLE_DRIVE_CLIENT_ID } from '@/constants'
import { isBackupStale } from '@/lib/backup/backup'
import type { Settings } from '@/types'

/**
 * Client-side Google Drive backup.
 *
 * This app is a static export with no backend, so it uses the Google Identity
 * Services (GIS) *token* model: an access token is issued in the browser and
 * used directly against the Drive API. Tokens are short-lived; a silent
 * `prompt: ''` request re-issues one from the user's Google session cookie,
 * which is what powers "automatic" backups on app open. No refresh tokens and
 * no server are involved.
 */

export class DriveError extends Error {}

const GSI_SRC = 'https://accounts.google.com/gsi/client'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke'

/** Minimal shapes of the Google Identity Services API (globally injected). */
interface GsiTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}
interface GsiTokenClient {
  requestAccessToken: (config?: { prompt?: string }) => void
}
interface GsiOauth2 {
  initTokenClient: (config: {
    client_id: string
    scope: string
    callback: (response: GsiTokenResponse) => void
  }) => GsiTokenClient
  revoke: (accessToken: string, done?: () => void) => void
}
interface GsiWindow {
  google?: { accounts?: { oauth2?: GsiOauth2 } }
}

declare global {
  interface Window {
    google?: GsiWindow['google']
  }
}

let gsiPromise: Promise<GsiOauth2> | null = null

/** Whether a Google OAuth client id has been configured in this build. */
export function isDriveConfigured(): boolean {
  return GOOGLE_DRIVE_CLIENT_ID.length > 0
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new DriveError('Could not load Google sign-in. Check your connection.'))
    document.head.appendChild(script)
  })
}

/** Load and return the GIS oauth2 API, caching the in-flight load. */
export function loadGsiClient(): Promise<GsiOauth2> {
  if (typeof window === 'undefined') return Promise.reject(new DriveError('Not available in SSR.'))
  if (!isDriveConfigured()) return Promise.reject(new DriveError('Google Drive is not configured.'))
  if (gsiPromise) return gsiPromise
  gsiPromise = (async () => {
    const g = (window as GsiWindow).google
    if (!g?.accounts?.oauth2) {
      await loadScript(GSI_SRC)
    }
    const oauth2 = (window as GsiWindow).google?.accounts?.oauth2
    if (!oauth2) throw new DriveError('Google sign-in failed to initialise.')
    return oauth2
  })()
  return gsiPromise
}

/**
 * Request a Drive access token.
 * With `silent: true` the request re-uses the user's Google session cookie
 * without showing the account chooser (used for automatic backups). Otherwise
 * the user may be prompted to pick an account / approve access.
 */
export async function requestDriveToken(opts: { silent?: boolean } = {}): Promise<string> {
  const oauth2 = await loadGsiClient()
  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token)
        } else {
          reject(
            new DriveError(
              response.error_description ||
                response.error ||
                'Google sign-in was not completed.',
            ),
          )
        }
      },
    })
    client.requestAccessToken({ prompt: opts.silent ? '' : undefined })
  })
}

/** Resolve the email of the connected Google account from its token. */
export async function fetchDriveUserInfo(token: string): Promise<string> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new DriveError('Could not read your Google account.')
  const data = (await res.json()) as { email?: string }
  if (typeof data.email !== 'string' || data.email.length === 0) {
    throw new DriveError('Could not read your Google account.')
  }
  return data.email
}

export interface BackupUploadBody {
  body: Blob
  boundary: string
}

/** Build a `multipart/related` upload body containing JSON metadata + the backup file. */
export function buildBackupUploadBody(fileName: string, payload: string): BackupUploadBody {
  const boundary = `luvina-boundary-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const metadata = JSON.stringify({ name: fileName, mimeType: 'application/json' })
  const body = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: application/json\r\n\r\n${payload}\r\n`,
      `--${boundary}--\r\n`,
    ],
    { type: 'application/octet-stream' },
  )
  return { body, boundary }
}

/**
 * Upload an encrypted backup to the app's private Drive space (scope
 * `drive.file`). Returns the created file id.
 */
export async function uploadBackupToDrive(
  token: string,
  payload: string,
  fileName: string,
): Promise<string> {
  const { body, boundary } = buildBackupUploadBody(fileName, payload)
  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  })
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new DriveError('Google Drive access expired. Reconnect your account.')
    }
    throw new DriveError('Could not upload the backup to Google Drive.')
  }
  const data = (await res.json()) as { id?: string }
  if (typeof data.id !== 'string' || data.id.length === 0) {
    throw new DriveError('Google Drive did not return a file id.')
  }
  return data.id
}

/** Revoke an issued token. Fails silently so disconnect always completes. */
export async function revokeDriveAccess(token: string): Promise<void> {
  await fetch(`${REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' })
}

/**
 * Whether an automatic Drive backup should run now: the user has connected an
 * account, remembered a passphrase, opted in, and the last upload is stale.
 */
export function shouldAutoBackup(
  drive: Pick<
    Settings,
    'driveEmail' | 'drivePassphrase' | 'driveAutoBackup' | 'lastDriveBackupAt'
  >,
  now: Date = new Date(),
): boolean {
  if (!drive.driveEmail || !drive.drivePassphrase || !drive.driveAutoBackup) return false
  return isBackupStale(drive.lastDriveBackupAt ?? null, now)
}
