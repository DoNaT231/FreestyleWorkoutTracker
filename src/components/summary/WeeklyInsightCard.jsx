/**
 * Freestyle Workout Tracker – heti összegzés kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export default function WeeklyInsightCard({ weekly }) {
  if (!weekly || weekly.workoutCount === 0) return null

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Heti összegzés
      </h2>
      <p className="mt-3 text-sm text-slate-300">Ezen a héten:</p>
      <ul className="mt-2 space-y-1 text-sm text-white">
        <li>{weekly.workoutCount} edzés</li>
        <li>{weekly.totalSets} szett</li>
        <li>{weekly.totalReps} ismétlés</li>
        {weekly.totalTimeSeconds > 0 && (
          <li>{weekly.totalTimeSeconds} mp tartás összesen</li>
        )}
        {(weekly.totalTrainingLoad ?? 0) > 0 && (
          <li>{Math.round(weekly.totalTrainingLoad)} pont edzésterhelés</li>
        )}
      </ul>

      {weekly.categoryBreakdown?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500">Kategóriák:</p>
          <ul className="mt-2 space-y-1">
            {weekly.categoryBreakdown.map(({ category, label, setCount }) => (
              <li
                key={category}
                className="flex justify-between text-sm text-slate-400"
              >
                <span>{label}</span>
                <span>{setCount} szett</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
