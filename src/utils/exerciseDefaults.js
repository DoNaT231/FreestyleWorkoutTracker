/**
 * Freestyle Workout Tracker – gyakorlat alapértelmezett ismétlés / idő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { WORKOUT_STATUS } from '../constants/workout'

/**
 * Legutóbbi befejezett edzésből az adott gyakorlat utolsó kitöltött szett értéke.
 * @returns {number|null}
 */
export function getLastExerciseSetValue(
  exerciseId,
  pastWorkouts,
  currentWorkoutId = null,
) {
  if (!exerciseId || !pastWorkouts?.length) return null

  const completed = [...pastWorkouts]
    .filter((w) => w.status === WORKOUT_STATUS.COMPLETED)
    .filter((w) => {
      if (!currentWorkoutId) return true
      return w.firestoreId !== currentWorkoutId
    })
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? b.startedAt).getTime() -
        new Date(a.finishedAt ?? a.startedAt).getTime(),
    )

  for (const w of completed) {
    const match = (w.exercises ?? []).find((ex) => ex.exerciseId === exerciseId)
    if (!match?.sets?.length) continue

    for (let i = match.sets.length - 1; i >= 0; i -= 1) {
      const reps = match.sets[i]?.reps
      if (reps != null && reps !== '') return Number(reps)
    }
  }

  return null
}

/**
 * Pihenő fázisban javasolt picker érték.
 * 1. szett: előző edzés utolsó szettje; későbbi szettek: előző szett az aktuális gyakorlatban.
 */
export function getSuggestedRestPickerValue({
  sets,
  historyDefault = null,
  fallback = 8,
}) {
  const lastSet = sets[sets.length - 1]
  if (lastSet?.reps != null && lastSet.reps !== '') {
    return Number(lastSet.reps)
  }

  if (sets.length >= 2) {
    const prevSet = sets[sets.length - 2]
    if (prevSet?.reps != null && prevSet.reps !== '') {
      return Number(prevSet.reps)
    }
  }

  if (historyDefault != null) return historyDefault

  return fallback
}
