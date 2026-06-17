/**
 * Freestyle Workout Tracker – 30 napos edzés pont rács
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export default function ProgressDotGrid({ days }) {
  if (!days?.length) return null

  return (
    <div className="mt-4">
      <p className="text-xs text-slate-500">Utolsó 30 nap</p>
      <div className="mt-2 grid grid-cols-10 gap-1.5">
        {days.map((day) => (
          <div
            key={day.date}
            className={`aspect-square rounded-md ${
              day.hasWorkout
                ? 'bg-emerald-500'
                : 'border border-slate-700 bg-slate-900'
            }`}
            title={
              day.hasWorkout
                ? `Edzés: ${new Date(day.date).toLocaleDateString('hu-HU')}`
                : new Date(day.date).toLocaleDateString('hu-HU')
            }
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          Edzés nap
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-slate-700 bg-slate-900" />
          Pihenő
        </span>
      </div>
    </div>
  )
}
