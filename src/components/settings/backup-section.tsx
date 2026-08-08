'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { BellRing, Cloud, CloudUpload, Download, LockKeyhole, RefreshCw, ShieldCheck, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  setDriveAutoBackup,
  setDriveConnection,
  setDrivePassphrase,
  setLastBackupAt,
  setLastDriveBackupAt,
} from '@/lib/db/settings'
import { createReminder, deleteReminder, updateReminder } from '@/lib/db/reminders'
import { exportBackup, importBackup } from '@/lib/backup/service'
import { backupFileName, isBackupStale } from '@/lib/backup/backup'
import {
  DriveError,
  fetchDriveUserInfo,
  isDriveConfigured,
  requestDriveToken,
  revokeDriveAccess,
  uploadBackupToDrive,
} from '@/lib/drive/drive'
import { requestNotificationPermission, scheduleReminderNotifications } from '@/lib/notifications'
import {
  BACKUP_PASSWORD_MIN_LENGTH,
  BACKUP_REMINDER_DEFAULT_TIME,
  BACKUP_REMINDER_TITLE,
} from '@/constants'
import { useAppData } from '@/hooks/useAppData'
import { useAppStore } from '@/store/appStore'
import { hapticFeedback } from '@/lib/utils'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Flow = 'create' | 'import' | 'drive' | null

export function BackupSection() {
  const { settings, reminders, prediction } = useAppData()
  const [flow, setFlow] = useState<Flow>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [reminderBusy, setReminderBusy] = useState(false)
  const [driveBusy, setDriveBusy] = useState(false)
  const [driveRemember, setDriveRemember] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingFile = useRef<string | null>(null)

  const requestBackupPrompt = useAppStore((state) => state.requestBackupPrompt)
  const setRequestBackupPrompt = useAppStore((state) => state.setRequestBackupPrompt)

  const openCreate = () => {
    setPassword('')
    setConfirm('')
    setFlow('create')
  }

  // A "Back up now" tap elsewhere in the app (e.g. the Home screen nudge)
  // sets this flag; consume it once on arrival and open the create dialog.
  useEffect(() => {
    if (requestBackupPrompt) {
      setPassword('')
      setConfirm('')
      setFlow('create')
      setRequestBackupPrompt(false)
    }
  }, [requestBackupPrompt, setRequestBackupPrompt])

  const backupReminder = reminders.find((reminder) => reminder.type === 'backup') ?? null

  const toggleBackupReminder = async (value: boolean) => {
    setReminderBusy(true)
    try {
      if (value) {
        const granted = await requestNotificationPermission()
        if (!granted) {
          toast.warning('Notifications are blocked in your browser settings.')
          return
        }
        if (backupReminder) {
          await updateReminder(backupReminder.id, { enabled: true })
        } else {
          await createReminder({
            type: 'backup',
            title: BACKUP_REMINDER_TITLE,
            time: BACKUP_REMINDER_DEFAULT_TIME,
            daysBefore: 0,
            repeat: 'daily',
            enabled: true,
          })
        }
        toast.success('Daily backup reminder enabled')
      } else if (backupReminder) {
        await deleteReminder(backupReminder.id)
        toast.success('Daily backup reminder turned off')
      }
      scheduleReminderNotifications(
        reminders.map((reminder) =>
          reminder.id === backupReminder?.id ? { ...reminder, enabled: value } : reminder,
        ),
        prediction?.predictedNextStart ?? null,
        settings?.notificationsEnabled ?? true,
      )
    } finally {
      setReminderBusy(false)
    }
  }

  const openImport = () => {
    fileRef.current?.click()
  }

  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      pendingFile.current = text
      setPassword('')
      setFlow('import')
    } catch {
      toast.error('Could not read this file. Make sure it is a valid JSON backup.')
    }
  }

  const doCreate = async () => {
    if (password.length < BACKUP_PASSWORD_MIN_LENGTH) {
      toast.error(`Use at least ${BACKUP_PASSWORD_MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const payload = await exportBackup(password)
      downloadTextFile(payload, backupFileName())
      await setLastBackupAt(Date.now())
      hapticFeedback(true)
      toast.success('Encrypted backup created')
      setFlow(null)
    } catch {
      toast.error('Could not create the backup.')
    } finally {
      setBusy(false)
    }
  }

  const doImport = async () => {
    if (!pendingFile.current) return
    setBusy(true)
    try {
      const data = await importBackup(pendingFile.current, password)
      await setLastBackupAt(Date.now())
      hapticFeedback(true)
      toast.success(
        `Restored ${data.cycles.length} cycle${data.cycles.length === 1 ? '' : 's'} from backup`,
      )
      setFlow(null)
    } catch {
      toast.error('Could not restore this backup. Check the password and file.')
    } finally {
      setBusy(false)
    }
  }

  const lastBackup = settings?.lastBackupAt

  const connected = Boolean(settings?.driveEmail)
  const driveConfigured = isDriveConfigured()

  const driveDescription = () => {
    if (!driveConfigured) return 'Not configured in this build — set NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID.'
    if (!connected) return 'Connect a Google account to store encrypted backups in your Drive.'
    const parts = [`Connected as ${settings?.driveEmail}`]
    if (settings?.lastDriveBackupAt) {
      parts.push(`last upload ${format(new Date(settings.lastDriveBackupAt), 'MMM d, yyyy')}`)
    }
    return parts.join(' · ')
  }

  const connectDrive = async () => {
    if (!driveConfigured) {
      toast.error('Google Drive is not configured in this build.')
      return
    }
    setDriveBusy(true)
    try {
      const token = await requestDriveToken()
      const email = await fetchDriveUserInfo(token)
      await setDriveConnection(email)
      hapticFeedback(true)
      toast.success(`Connected as ${email}`)
    } catch (err) {
      toast.error(err instanceof DriveError ? err.message : 'Could not connect Google Drive.')
    } finally {
      setDriveBusy(false)
    }
  }

  const disconnectDrive = async () => {
    setDriveBusy(true)
    try {
      try {
        const token = await requestDriveToken({ silent: true })
        await revokeDriveAccess(token)
      } catch {
        // Token may already be invalid; still clear the connection.
      }
      await setDriveConnection(null)
      await setDrivePassphrase(null)
      await setLastDriveBackupAt(null)
      await setDriveAutoBackup(false)
      hapticFeedback(true)
      toast.success('Google Drive disconnected')
    } finally {
      setDriveBusy(false)
    }
  }

  const openDriveBackup = () => {
    setPassword('')
    setConfirm('')
    setDriveRemember(false)
    setFlow('drive')
  }

  const doDriveBackup = async () => {
    if (password.length < BACKUP_PASSWORD_MIN_LENGTH) {
      toast.error(`Use at least ${BACKUP_PASSWORD_MIN_LENGTH} characters.`)
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.')
      return
    }
    setDriveBusy(true)
    try {
      const token = await requestDriveToken()
      const payload = await exportBackup(password)
      const fileName = `luvina-drive-${new Date().toISOString().slice(0, 10)}.json`
      await uploadBackupToDrive(token, payload, fileName)
      await setLastBackupAt(Date.now())
      await setLastDriveBackupAt(Date.now())
      if (driveRemember) {
        await setDrivePassphrase(password)
        await setDriveAutoBackup(true)
      }
      hapticFeedback(true)
      toast.success('Encrypted backup uploaded to Google Drive')
      setFlow(null)
    } catch (err) {
      toast.error(err instanceof DriveError ? err.message : 'Could not upload to Google Drive.')
    } finally {
      setDriveBusy(false)
    }
  }

  const toggleDriveAuto = async (value: boolean) => {
    setDriveBusy(true)
    try {
      if (value && !settings?.drivePassphrase) {
        toast.error('Back up to Drive once and tick “Remember password” to enable automatic backups.')
        return
      }
      await setDriveAutoBackup(value)
      hapticFeedback(true)
      toast.success(value ? 'Automatic Drive backups enabled' : 'Automatic Drive backups turned off')
    } finally {
      setDriveBusy(false)
    }
  }

  return (
    <SettingsSection
      title="Backup"
      description="Export an encrypted copy of your data. Restore it on any device — no cloud required."
      data-tour="settings-backup"
    >
      <SettingsRow
        icon={<ShieldCheck className="size-4 text-primary" aria-hidden="true" />}
        title="Encrypted backup"
        description={
          lastBackup
            ? `Last backup ${format(new Date(lastBackup), 'MMM d, yyyy')}`
            : 'No backup created yet.'
        }
        right={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={openCreate}>
              <Download className="size-4" aria-hidden="true" />
              Create
            </Button>
            <Button variant="outline" size="sm" onClick={openImport}>
              <Upload className="size-4" aria-hidden="true" />
              Import
            </Button>
          </div>
        }
      />
      <SettingsRow
        icon={<BellRing className="size-4 text-primary" aria-hidden="true" />}
        title="Daily backup reminder"
        description={
          typeof lastBackup === 'number' && !isBackupStale(lastBackup)
            ? "You're up to date — you'll get a nudge if it goes stale."
            : 'Get a daily notification to keep your backup current.'
        }
        right={
          <Switch
            checked={Boolean(backupReminder?.enabled)}
            onCheckedChange={toggleBackupReminder}
            disabled={reminderBusy}
            aria-label="Daily backup reminder"
          />
        }
      />
      <SettingsRow
        icon={<CloudUpload className="size-4 text-primary" aria-hidden="true" />}
        title="Google Drive backup"
        description={driveDescription()}
        right={
          connected ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" size="sm" onClick={openDriveBackup} disabled={driveBusy}>
                <CloudUpload className="size-4" aria-hidden="true" />
                Back up now
              </Button>
              <Button variant="ghost" size="sm" onClick={disconnectDrive} disabled={driveBusy}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={connectDrive}
              disabled={driveBusy || !driveConfigured}
            >
              <Cloud className="size-4" aria-hidden="true" />
              Connect
            </Button>
          )
        }
      />
      {connected && (
        <SettingsRow
          icon={<RefreshCw className="size-4 text-primary" aria-hidden="true" />}
          title="Automatic Drive backup"
          description={
            settings?.drivePassphrase
              ? 'A fresh encrypted backup is uploaded whenever it goes stale and you open Luvina.'
              : 'Back up to Drive once and tick “Remember password” to enable this.'
          }
          right={
            <Switch
              checked={Boolean(settings?.driveAutoBackup)}
              onCheckedChange={toggleDriveAuto}
              disabled={driveBusy || !settings?.drivePassphrase}
              aria-label="Automatic Drive backup"
            />
          }
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Select a backup file"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />

      <div className="px-5 py-4">
        <div className="flex items-start gap-2 rounded-card bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <Cloud className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Backups are portable, encrypted files. For an extra safety net, store them in your
            private Drive, iCloud or any cloud folder you trust. Your health data never leaves the
            device unencrypted.
          </p>
        </div>
      </div>

      <Dialog open={flow === 'create'} onOpenChange={(open) => !open && setFlow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
              Create encrypted backup
            </DialogTitle>
            <DialogDescription>
              Choose a password you&apos;ll remember. Luvina can&apos;t recover it for you — there is
              no server to reset it on.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="backup-password">Password</Label>
              <Input
                id="backup-password"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="backup-confirm">Confirm password</Label>
              <Input
                id="backup-confirm"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlow(null)}>
              Cancel
            </Button>
            <Button onClick={doCreate} disabled={busy}>
              {busy ? 'Encrypting…' : 'Create backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={flow === 'import'} onOpenChange={(open) => !open && setFlow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import backup</DialogTitle>
            <DialogDescription>
              Enter the password that was used to create this backup. Restoring replaces all current
              data on this device.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="import-password">Password</Label>
            <Input
              id="import-password"
              type="password"
              autoComplete="off"
              className="mt-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlow(null)}>
              Cancel
            </Button>
            <Button onClick={doImport} disabled={busy}>
              {busy ? 'Restoring…' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={flow === 'drive'} onOpenChange={(open) => !open && setFlow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CloudUpload className="size-4 text-primary" aria-hidden="true" />
              Back up to Google Drive
            </DialogTitle>
            <DialogDescription>
              The backup is encrypted on this device before upload — Google only stores the file and
              cannot read it without your password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="drive-password">Password</Label>
              <Input
                id="drive-password"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="drive-confirm">Confirm password</Label>
              <Input
                id="drive-confirm"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
              <Checkbox
                checked={driveRemember}
                onCheckedChange={(value) => setDriveRemember(value === true)}
                className="mt-0.5"
              />
              <span>
                Remember this password on this device so automatic backups can encrypt without
                asking.
              </span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlow(null)}>
              Cancel
            </Button>
            <Button onClick={doDriveBackup} disabled={driveBusy}>
              {driveBusy ? 'Encrypting…' : 'Back up to Drive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  )
}

function downloadTextFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
