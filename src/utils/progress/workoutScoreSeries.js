/**
 * Freestyle Workout Tracker – edzésenkénti volume / erőszint idősor
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { EXERCISE_CATEGORIES } from '../../constants/exerciseMeta'
import { formatWorkoutDateShort } from '../formatDate'
import { calculateWorkoutSummary } from '../scoring/workoutSummary'
import { sortWorkoutsChronologically } from './periods'

export const WORKOUT_CATEGORY_KEYS = EXERCISE_CATEGORIES.map((c) => c.value)

/**
 * @param {object[]} workouts – befejezett edzések az időszakban
 */
export function buildWorkoutScoreSeries(workouts) {
  return sortWorkoutsChronologically(workouts).map((workout) => {
    const summary = calculateWorkoutSummary(workout)
    const dateSource = workout.finishedAt ?? workout.startedAt

    return {
      id: workout.firestoreId ?? workout.localId,
      label: formatWorkoutDateShort(dateSource),
      workoutName: workout.name ?? 'Edzés',
      dateLabel: summary.workoutDate,
      trainingLoad: summary.trainingLoadScore ?? 0,
      bestEstimated1RM: summary.bestEstimated1RM,
      bestRelativeStrength: summary.bestRelativeStrength,
      title: `${workout.name ?? 'Edzés'} · ${summary.workoutDate}`,
    }
  })
}

/**
 * Edzésenkénti kategória-terhelés (húzó, toló, láb, …) – halmozott diagramhoz.
 * @param {object[]} workouts – befejezett edzések az időszakban
 */
export function buildWorkoutCategorySeries(workouts) {
  return sortWorkoutsChronologically(workouts).map((workout) => {
    const summary = calculateWorkoutSummary(workout)
    const dateSource = workout.finishedAt ?? workout.startedAt
    const row = {
      id: workout.firestoreId ?? workout.localId,
      label: formatWorkoutDateShort(dateSource),
      workoutName: workout.name ?? 'Edzés',
      title: `${workout.name ?? 'Edzés'} · ${summary.workoutDate}`,
    }

    for (const key of WORKOUT_CATEGORY_KEYS) {
      row[key] = 0
    }

    for (const bucket of summary.categoryBreakdown ?? []) {
      if (bucket.category && Object.hasOwn(row, bucket.category)) {
        row[bucket.category] = bucket.trainingLoadScore ?? 0
      }
    }

    return row
  })
}
