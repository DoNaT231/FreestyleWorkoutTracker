/**
 * Freestyle Workout Tracker – gyakorlat összegzés kártya (poszt-edzés)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { formatLoadScore } from '../../utils/trainingLoad'

export default function ExerciseSummaryCard({ exercise, comparison }) {
  const timeBased = exercise.type === 'time'

  const bestLabel = timeBased
    ? exercise.bestSet
      ? `${exercise.bestSet.value} mp`
      : '—'
    : exercise.bestSet
      ? `${exercise.bestSet.value} ismétlés`
      : '—'

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="font-semibold text-white">{exercise.name}</h3>

      <p className="mt-2 text-sm text-slate-300">{exercise.setCount} szett</p>

      {timeBased ? (
        <p className="text-sm text-slate-400">
          {exercise.totalTimeSeconds ?? 0} mp összesen
        </p>
      ) : (
        <p className="text-sm text-slate-400">
          {exercise.totalReps ?? 0} ismétlés összesen
        </p>
      )}

      <p className="mt-2 text-sm text-slate-400">
        {timeBased ? 'Legjobb tartás' : 'Legjobb szett'}:{' '}
        <span className="text-white">{bestLabel}</span>
      </p>

      {exercise.loadScore != null && exercise.loadScore > 0 && (
        <p className="mt-2 text-sm text-emerald-400">
          Edzésterhelés:{' '}
          <span className="font-medium text-white">
            {formatLoadScore(exercise.loadScore)}
          </span>
        </p>
      )}

      {exercise.hasAdditionalWeight && exercise.maxAdditionalWeightKg > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          +{exercise.maxAdditionalWeightKg} kg súly használva
        </p>
      )}

      {exercise.missingSetCount > 0 && (
        <p className="mt-2 text-xs text-amber-400">
          {exercise.missingSetCount} szett még nincs kitöltve
        </p>
      )}

      {comparison && (
        <p className="mt-2 text-xs text-slate-500">{comparison.message}</p>
      )}
    </article>
  )
}
