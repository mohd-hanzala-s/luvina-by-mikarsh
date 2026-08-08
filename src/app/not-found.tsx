'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Logo className="size-16" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h1 className="font-display text-3xl font-semibold tracking-tight">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page does not exist or has been moved.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="flex gap-3"
      >
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" aria-hidden="true" />
            Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/settings">
            <Search className="size-4" aria-hidden="true" />
            Settings
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}
