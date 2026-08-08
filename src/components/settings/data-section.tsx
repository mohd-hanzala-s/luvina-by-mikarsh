'use client'

import { Database, Eraser, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { seedSampleData } from '@/lib/db/seed'
import { clearAllData } from '@/lib/backup/service'
import { hapticFeedback } from '@/lib/utils'
import { SettingsSection, SettingsRow } from '@/components/settings/settings-card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function DataSection() {
  const handleSample = async () => {
    await seedSampleData()
    hapticFeedback(true)
    toast.success('Sample data loaded')
  }

  const handleErase = async () => {
    await clearAllData()
    hapticFeedback(true)
    toast.success('All data erased')
  }

  return (
    <SettingsSection
      title="Data"
      description="Everything is stored locally on this device."
      data-tour="settings-data"
    >
      <SettingsRow
        icon={<Database className="size-4" aria-hidden="true" />}
        title="Local storage"
        description="Your cycles, notes and settings live in this browser's IndexedDB. Uninstalling the app may remove them — make a backup first."
        right={
          <Button variant="outline" size="sm" onClick={handleSample}>
            <Sparkles className="size-4" aria-hidden="true" />
            Sample data
          </Button>
        }
      />
      <SettingsRow
        icon={<Eraser className="size-4 text-destructive" aria-hidden="true" />}
        title="Erase everything"
        description="Permanently delete all cycles, notes and reminders from this device."
        right={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                Erase
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Erase all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes every cycle, note and reminder stored on this device.
                  This cannot be undone. Consider creating an encrypted backup first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleErase} className="bg-destructive hover:bg-destructive/90">
                  Erase everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />
    </SettingsSection>
  )
}
