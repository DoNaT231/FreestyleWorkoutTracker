/**
 * Freestyle Workout Tracker – demó mód figyelmeztető sáv
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function GuestModeBanner() {
  const { isGuest } = useAuth()

  if (!isGuest) return null

  return (
    <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <p className="text-sm font-medium text-amber-200">Demó mód</p>
      <p className="mt-0.5 text-xs leading-relaxed text-amber-100/80">
        Az edzéseid a böngésző localStorage-jében maradnak. A gyakorlatok a
        beépített katalógusból töltődnek. Regisztrálj a felhőben mentett saját
        naplódhoz.
      </p>
      <Link
        to="/register"
        className="mt-2 inline-block text-xs font-medium text-emerald-400 hover:text-emerald-300"
      >
        Regisztráció →
      </Link>
    </div>
  )
}
