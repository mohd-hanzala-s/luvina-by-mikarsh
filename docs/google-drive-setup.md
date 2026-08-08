# Enabling Google Drive backup

Luvina's Drive backup is a client-side feature: it uses the Google Identity
Services (GIS) *token* model with the narrow `drive.file` scope, so the app can
only ever create files in its own private Drive space and never browse your
Drive. It needs no backend and no refresh tokens — but it does need a Google
Cloud OAuth client id baked into the build.

## Prerequisites

- A Google Cloud project you control.
- The ability to rebuild Luvina (the client id is embedded at build time).

## Steps

1. Open the Google Cloud Console and create/select a project.
2. **APIs & Services → Enable APIs** → enable **Google Drive API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**.
   - Add the scopes required by the Drive API (the app requests
     `https://www.googleapis.com/auth/drive.file`).
   - Add your own email as a test user while the app is in *Testing* mode.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Under **Authorized JavaScript origins**, add the origin the app is served
     from (for a local build that is e.g. `http://localhost:3000`; in
     production, your deployed HTTPS origin).
   - Leave **Authorized redirect URIs** empty — the token flow does not use
     redirects.
5. Copy the client id (the long `….apps.googleusercontent.com` string) and set
   it at build time:

   ```bash
   NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=xxx.apps.googleusercontent.com pnpm build
   ```

   In `.env` / `.env.local`:

   ```bash
   NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=xxx.apps.googleusercontent.com
   ```

6. Rebuild and open **Settings → Backup → Google Drive backup → Connect**.

## Notes

- If the client id is absent, the Connect button is disabled and the settings
  row explains that Drive is not configured in this build.
- While the OAuth app is in *Testing* mode, only accounts you list as test
  users can connect. Publish the app (submit for verification or set
  production status) before wide rollout.
- Backups are encrypted before upload, so Google can store them without ever
  being able to read the contents. Automatic backups only run while a Google
  session exists in the browser (no refresh tokens are stored).
- The on-device passphrase used for automatic backups is stored only in
  IndexedDB and is never included inside exported backups.
