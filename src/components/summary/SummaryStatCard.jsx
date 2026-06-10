/**
 * Freestyle Workout Tracker – összegzés stat kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export default function SummaryStatCard({ label, value, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 ${className}`.trim()}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
