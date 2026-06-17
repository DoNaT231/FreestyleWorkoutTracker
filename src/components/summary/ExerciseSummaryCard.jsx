/**
 * Freestyle Workout Tracker – gyakorlat összegzés kártya (poszt-edzés)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import {
  formatEstimated1RM,
  formatRelativeStrength,
  formatReliability,
  formatScorePoints,
} from '../../utils/scoring/format'

export default function ExerciseSummaryCard({ exercise, comparison }) {
  const timeBased = exercise.type === 'time'

  const bestLabel = timeBased
    ? exercise.bestHoldSeconds != null
      ? `${exercise.bestHoldSeconds} mp`
      : '—'
    : exercise.bestSetReps != null
      ? `${exercise.bestSetReps} ismétlés`
      : '—'

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="font-semibold text-white">{exercise.name}</h3>

      <p className="mt-2 text-sm text-slate-300">{exercise.totalSets} szett</p>

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

      {!timeBased &&
        exercise.trainingLoadScore != null &&
        exercise.trainingLoadScore > 0 && (
          <p className="mt-2 text-sm text-emerald-400">
            Edzésterhelés:{' '}
            <span className="font-medium text-white">
              {formatScorePoints(exercise.trainingLoadScore)}
            </span>
          </p>
        )}

      {timeBased && (exercise.holdScore ?? 0) > 0 && (
        <p className="mt-2 text-sm text-emerald-400">
          Statikus tartás pont:{' '}
          <span className="font-medium text-white">
            {formatScorePoints(exercise.holdScore)}
          </span>
        </p>
      )}

      {!timeBased && exercise.bestEstimated1RM != null && (
        <p className="mt-2 text-sm text-slate-400">
          Becsült 1RM:{' '}
          <span className="text-white">
            {formatEstimated1RM(exercise.bestEstimated1RM)}
          </span>
          {exercise.strengthReliability && (
            <span className="ml-2 text-xs text-slate-500">
              Megbízhatóság: {formatReliability(exercise.strengthReliability)}
            </span>
          )}
        </p>
      )}

      {!timeBased && exercise.bestRelativeStrength != null && (
        <p className="mt-1 text-sm text-slate-400">
          Relatív erő:{' '}
          <span className="text-white">
            {formatRelativeStrength(exercise.bestRelativeStrength)}
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
