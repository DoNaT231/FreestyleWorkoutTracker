/**
 * Freestyle Workout Tracker – progress szekció wrapper
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export default function ProgressSection({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 ${className}`.trim()}
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function ProgressStatRow({ label, value, detail }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-slate-800/80 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold tabular-nums text-white">
          {value}
        </span>
        {detail && (
          <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
        )}
      </div>
    </div>
  )
}

export function ProgressMiniCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-white">{value}</p>
    </div>
  )
}
