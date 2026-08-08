'use client'

import React from 'react'

interface CompanionAvatarProps {
  className?: string
  size?: number
}

/**
 * Luvi — Luvina's warm, gentle, patient, relatable Female Robot Doctor companion.
 * Features a soft warm smile, glossy visor screen with cute LED eyes & blush spots,
 * doctor's coat, stethoscope, and holding a cozy steaming mug of herbal tea & a flower!
 */
export function CompanionAvatar({ className = 'size-12', size }: CompanionAvatarProps) {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 overflow-hidden rounded-full shadow-soft transition-transform duration-300 hover:scale-105 ${className}`}
      style={style}
      aria-hidden="true"
    >
      <defs>
        {/* Soft warm pastel background gradient */}
        <radialGradient id="luviBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FCE7F3" />
          <stop offset="60%" stopColor="#F3E8FF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </radialGradient>

        {/* Metallic Robot Shell Gradient (Soft Pearl White) */}
        <linearGradient id="luviShell" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        {/* Soft Pink Accent Gradient */}
        <linearGradient id="luviPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        {/* Visor Screen Gradient */}
        <linearGradient id="luviVisor" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        {/* Steaming Tea Gradient */}
        <linearGradient id="teaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* LED Eye Glow */}
        <filter id="luviEyeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="60" cy="60" r="58" fill="url(#luviBg)" stroke="#F472B6" strokeWidth="2.5" />

      {/* Cute Ears / Antennae with Soft Pink Spheres */}
      <path d="M34 38 L24 22 C22 19, 26 16, 29 19 L40 32 Z" fill="url(#luviShell)" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="25" cy="20" r="3.5" fill="url(#luviPink)" />

      <path d="M86 38 L96 22 C98 19, 94 16, 91 19 L80 32 Z" fill="url(#luviShell)" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="95" cy="20" r="3.5" fill="url(#luviPink)" />

      {/* Robot Head Shell */}
      <rect x="28" y="26" width="64" height="48" rx="24" fill="url(#luviShell)" stroke="#E2E8F0" strokeWidth="2" />

      {/* Doctor Cap with Heart Emblem */}
      <rect x="42" y="22" width="36" height="9" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M60 23.5 C59 22.5, 57.5 23.5, 57.5 24.5 C57.5 26.5, 60 27.5, 60 28.5 C60 27.5, 62.5 26.5, 62.5 24.5 C62.5 23.5, 61 22.5, 60 23.5 Z" fill="url(#luviPink)" />

      {/* Visor Screen */}
      <rect x="34" y="34" width="52" height="32" rx="16" fill="url(#luviVisor)" stroke="#818CF8" strokeWidth="1.5" />

      {/* Warm Expressive Glowing LED Eyes (^ ^) */}
      <path d="M42 49 C44 44, 50 44, 52 49" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#luviEyeGlow)" />
      <path d="M68 49 C70 44, 76 44, 78 49" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#luviEyeGlow)" />

      {/* Rosy LED Blush */}
      <circle cx="40" cy="55" r="3.5" fill="#FB7185" opacity="0.85" />
      <circle cx="80" cy="55" r="3.5" fill="#FB7185" opacity="0.85" />

      {/* Gentle Soft Smile */}
      <path d="M54 56 C57 59, 63 59, 66 56" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Robot Neck */}
      <rect x="52" y="72" width="16" height="8" rx="3" fill="#94A3B8" />

      {/* Doctor Coat & Torso */}
      <path d="M46 78 L60 90 L74 78 Z" fill="url(#luviPink)" />
      <path d="M20 114 C20 90, 36 80, 46 78 L60 98 L74 78 C84 80, 100 90, 100 114 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Stethoscope */}
      <path d="M42 80 C42 94, 50 104, 60 104 C70 104, 78 94, 78 80" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="68" cy="98" r="4.5" fill="#FFFFFF" stroke="hsl(var(--primary))" strokeWidth="2" />
      <circle cx="68" cy="98" r="2" fill="#38BDF8" />

      {/* Relatable Prop: Holding a Warm Steaming Tea Mug */}
      {/* Robot Left Hand holding Tea Mug */}
      <rect x="52" y="94" width="16" height="18" rx="4" fill="url(#teaGradient)" stroke="#B45309" strokeWidth="1" />
      {/* Mug Handle */}
      <path d="M68 98 C72 98, 72 108, 68 108" stroke="#B45309" strokeWidth="2" fill="none" />
      {/* Steam Wisps */}
      <path d="M56 90 C56 86, 58 86, 58 82" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M62 92 C62 88, 64 88, 64 84" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* Flower Petal Accent in Mug */}
      <circle cx="60" cy="95" r="2" fill="#FB7185" />
    </svg>
  )
}
