'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createReminder, updateReminder } from '@/lib/db/reminders'
import { REMINDER_TYPES, MAX_TITLE_LENGTH } from '@/constants'
import type { Reminder, ReminderType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const reminderSchema = z.object({
  type: z.enum([
    'period',
    'medication',
    'hydration',
    'doctor',
    'custom',
    'backup',
  ] satisfies ReminderType[] as [ReminderType, ...ReminderType[]]),
  title: z
    .string()
    .min(1, 'Add a title.')
    .max(MAX_TITLE_LENGTH, `Keep titles under ${MAX_TITLE_LENGTH} characters.`)
    .transform((v) => v.trim()),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid time.'),
  daysBefore: z.coerce.number().int().min(0, 'Min 0').max(14, 'Max 14'),
  repeat: z.enum(['daily', 'none']),
})

type ReminderFormValues = z.infer<typeof reminderSchema>

interface ReminderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reminder: Reminder | null
}

export function ReminderFormDialog({ open, onOpenChange, reminder }: ReminderFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      type: 'custom',
      title: '',
      time: '09:00',
      daysBefore: 1,
      repeat: 'daily',
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (open) {
      reset(
        reminder
          ? {
              type: reminder.type,
              title: reminder.title,
              time: reminder.time,
              daysBefore: reminder.daysBefore,
              repeat: reminder.repeat,
            }
          : { type: 'custom', title: '', time: '09:00', daysBefore: 1, repeat: 'daily' },
      )
    }
  }, [open, reminder, reset])

  const onSubmit = async (values: ReminderFormValues) => {
    try {
      if (reminder) {
        await updateReminder(reminder.id, values)
        toast.success('Reminder updated')
      } else {
        await createReminder({ ...values, enabled: true })
        toast.success('Reminder added')
      }
      onOpenChange(false)
    } catch {
      toast.error('Could not save the reminder. Please try again.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit reminder' : 'New reminder'}</DialogTitle>
          <DialogDescription>
            Reminders fire while Luvina is open. Notifications may require permission.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="reminder-type">Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as ReminderType, { shouldValidate: true })}
            >
              <SelectTrigger id="reminder-type" className="mt-2">
                <SelectValue placeholder="Choose a type" />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="mt-1 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="reminder-title">Title</Label>
            <Input
              id="reminder-title"
              className="mt-2"
              placeholder="e.g. Take medication"
              maxLength={MAX_TITLE_LENGTH}
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="reminder-time">Time</Label>
              <Input id="reminder-time" type="time" className="mt-2" {...register('time')} />
              {errors.time && <p className="mt-1 text-xs text-destructive">{errors.time.message}</p>}
            </div>
            {selectedType === 'period' && (
              <div>
                <Label htmlFor="reminder-before">Days before</Label>
                <Input
                  id="reminder-before"
                  type="number"
                  min={0}
                  max={14}
                  className="mt-2"
                  {...register('daysBefore')}
                />
                {errors.daysBefore && (
                  <p className="mt-1 text-xs text-destructive">{errors.daysBefore.message}</p>
                )}
              </div>
            )}
          </div>

          {selectedType !== 'period' && (
            <div>
              <Label htmlFor="reminder-repeat">Repeats</Label>
              <Select
                value={watch('repeat')}
                onValueChange={(value) => setValue('repeat', value as 'daily' | 'none')}
              >
                <SelectTrigger id="reminder-repeat" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every day</SelectItem>
                  <SelectItem value="none">Once</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="size-4" aria-hidden="true" />
              {reminder ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AddReminderButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        New reminder
      </Button>
      <ReminderFormDialog open={open} onOpenChange={setOpen} reminder={null} />
    </>
  )
}
