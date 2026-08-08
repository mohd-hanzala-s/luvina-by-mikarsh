'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { NetworkProvider } from '@/components/providers/network-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { usePwaUpdater } from '@/hooks/usePwaUpdater'

function PwaBridge() {
  usePwaUpdater()
  return null
}

/**
 * Marks the document as hydrated once React has attached event listeners so
 * that consumers (e.g. end-to-end tests) can wait for interactivity instead
 * of racing against server-rendered markup.
 */
function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              classNames: {
                toast: 'rounded-card shadow-lifted border border-border/60',
              },
            }}
          />
          <PwaBridge />
          <HydrationMarker />
        </TooltipProvider>
      </NetworkProvider>
    </ThemeProvider>
  )
}
