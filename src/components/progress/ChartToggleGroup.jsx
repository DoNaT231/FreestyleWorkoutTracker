/**
 * Freestyle Workout Tracker – közös diagram váltógombok
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export default function ChartToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === opt.id
              ? 'bg-emerald-500 text-slate-950'
              : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
