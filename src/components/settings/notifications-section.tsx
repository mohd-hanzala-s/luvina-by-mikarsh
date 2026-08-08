'use client'

import { useState } from 'react'
import {
  BellRing,
  CalendarClock,
  Droplet,
  HeartPulse,
  Pencil,
  Pill,
  ShieldCheck,
  Stethoscope,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateSettings } from '@/lib/db/settings'
import { deleteReminder, updateReminder } from '@/lib/db/reminders'
import { requestNotificationPermission, scheduleReminderNotifications } from '@/lib/notifications'
import { formatTime } from '@/lib/utils'
import { useAppData } from '@/hooks/useAppData'
import type { Reminder, ReminderType } from '@/types'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { AddReminderButton, ReminderFormDialog } from '@/components/settings/reminder-form'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

const REMINDER_ICONS: Record<ReminderType, LucideIcon> = {
  period: CalendarClock,
  medication: Pill,
  hydration: Droplet,
  doctor: Stethoscope,
  custom: HeartPulse,
  // Managed from the Backup section's own toggle, not this generic list —
  // still needed here so this lookup stays exhaustive over ReminderType.
  backup: ShieldCheck,
}

export function NotificationsSection() {
  const { reminders, prediction, settings, loaded } = useAppData()
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const enabled = settings?.notificationsEnabled ?? true
  // The daily backup reminder is managed by its own toggle in the Backup
  // section, so it's excluded from this general-purpose reminder list.
  const visibleReminders = reminders.filter((reminder) => reminder.type !== 'backup')

  const toggleMaster = async (value: boolean) => {
    await updateSettings({ notificationsEnabled: value })
    if (value && !(await requestNotificationPermission())) {
      toast.warning('Notifications are blocked in your browser settings.')
      return
    }
    scheduleReminderNotifications(reminders, prediction?.predictedNextStart ?? null, value)
    toast.success(value ? 'Notifications enabled' : 'Notifications paused')
  }

  const toggleReminder = async (reminder: Reminder, value: boolean) => {
    await updateReminder(reminder.id, { enabled: value })
    scheduleReminderNotifications(
      reminders.map((r) => (r.id === reminder.id ? { ...r, enabled: value } : r)),
      prediction?.predictedNextStart ?? null,
      enabled,
    )
  }

  const removeReminder = async (reminder: Reminder) => {
    await deleteReminder(reminder.id)
    toast.success('Reminder deleted')
  }

  return (
    <SettingsSection
      title="Reminders & notifications"
      description="Notifications work best in the installed app. Nothing is sent over the network."
      data-tour="settings-notifications"
    >
      <SettingsRow
        icon={<BellRing className="size-4" aria-hidden="true" />}
        title="Notifications"
        description="Allow Luvina to show reminders."
        right={
          <Switch checked={enabled} onCheckedChange={toggleMaster} aria-label="Notifications" />
        }
      />

      {loaded && visibleReminders.length > 0 && (
        <div className="divide-y divide-border/50">
          {visibleReminders.map((reminder) => {
            const Icon = REMINDER_ICONS[reminder.type]
            return (
              <div key={reminder.id} className="flex items-center gap-3 px-5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{reminder.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(reminder.time)}
                    {reminder.type === 'period'
                      ? ` · ${reminder.daysBefore} day${reminder.daysBefore === 1 ? '' : 's'} before expected`
                      : reminder.repeat === 'daily'
                        ? ' · every day'
                        : ''}
                  </p>
                </div>
                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={(value) => toggleReminder(reminder, value)}
                  aria-label={`Toggle ${reminder.title}`}
                />
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`Edit ${reminder.title}`}
                  onClick={() => {
                    setEditing(reminder)
                    setFormOpen(true)
                  }}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="iconSm"
                  aria-label={`Delete ${reminder.title}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeReminder(reminder)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-xs text-muted-foreground">
          {visibleReminders.length === 0
            ? 'No reminders yet. Add one to get gentle nudges.'
            : `${visibleReminders.length} reminder${visibleReminders.length === 1 ? '' : 's'}.`}
        </p>
        <AddReminderButton />
      </div>

      <ReminderFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        reminder={editing}
      />
    </SettingsSection>
  )
}
