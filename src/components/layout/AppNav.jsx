/**
 * Freestyle Workout Tracker – alsó navigáció
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobilbarát alsó nav: Főoldal, Gyakorlatok, Edzésnapló.
 * Az aktív oldal kiemelve (emerald).
 */

import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Főoldal', end: true },
  { to: '/exercises', label: 'Gyakorlatok', end: false },
  { to: '/history', label: 'Napló', end: false },
]

export default function AppNav() {
  return (
    <nav
      className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1"
      aria-label="Fő navigáció"
    >
      {NAV_ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center rounded-xl px-2 py-3 text-center text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
