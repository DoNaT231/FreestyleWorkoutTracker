/**
 * Freestyle Workout Tracker – gyakorlat fejlődés idővonal
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { isTimeExercise } from '../scoring/helpers'
import { calculateWorkoutSummary } from '../scoring/workoutSummary'
import { getWorkoutDate, sortWorkoutsChronologically } from './periods'

const KEY_EXERCISE_ID = 'normal_pullup'

export function listExercisesFromHistory(workouts) {
  const map = new Map()

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      const id = exercise.exerciseId
      if (!id) continue

      const existing = map.get(id) ?? {
        exerciseId: id,
        name: exercise.name,
        type: exercise.type,
        count: 0,
      }
      existing.count += 1
      existing.name = exercise.name
      existing.type = exercise.type
      map.set(id, existing)
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count)
}

export function resolveKeyExercise(workouts, preferredId = null) {
  const exercises = listExercisesFromHistory(workouts)
  if (!exercises.length) return null

  if (preferredId) {
    const match = exercises.find((e) => e.exerciseId === preferredId)
    if (match) return match
  }

  const pullup = exercises.find((e) => e.exerciseId === KEY_EXERCISE_ID)
  if (pullup && !isTimeExercise(pullup)) return pullup

  const repsBased = exercises.filter((e) => e.type !== 'time')
  return repsBased[0] ?? exercises[0]
}

/**
 * @param {'totalReps'|'bestSetReps'|'estimated1RM'|'relativeStrength'|'totalTime'|'bestHold'|'holdScore'} metric
 */
export function buildExerciseMetricTimeline(workouts, exerciseId, metric) {
  const points = []

  for (const workout of sortWorkoutsChronologically(workouts)) {
    const exercise = (workout.exercises ?? []).find(
      (ex) => ex.exerciseId === exerciseId,
    )
    if (!exercise) continue

    const summary = calculateWorkoutSummary(workout)
    const exSummary = summary.exerciseSummaries.find(
      (s) => s.exerciseId === exerciseId,
    )
    if (!exSummary) continue

    let value = null
    switch (metric) {
      case 'totalReps':
        value = exSummary.totalReps
        break
      case 'bestSetReps':
        value = exSummary.bestSetReps
        break
      case 'estimated1RM':
        value = exSummary.bestEstimated1RM
        break
      case 'relativeStrength':
        value = exSummary.bestRelativeStrength
        break
      case 'totalTime':
        value = exSummary.totalTimeSeconds
        break
      case 'bestHold':
        value = exSummary.bestHoldSeconds
        break
      case 'holdScore':
        value = exSummary.holdScore
        break
      default:
        break
    }

    if (value == null || !Number.isFinite(value)) continue

    points.push({
      date: getWorkoutDate(workout),
      value,
      workoutId: workout.firestoreId,
      workoutName: workout.name,
      reliability: exSummary.strengthReliability ?? null,
      setNumber: exSummary.bestSet?.setNumber ?? null,
    })
  }

  return points
}

export function getLatestMetricPoint(points) {
  if (!points?.length) return null
  return points[points.length - 1]
}

export function getBestMetricPoint(points) {
  if (!points?.length) return null
  return points.reduce((best, p) => (p.value > best.value ? p : best), points[0])
}

export function getMetricChangeInPeriod(points) {
  if (!points || points.length < 2) return null
  const first = points[0].value
  const last = points[points.length - 1].value
  return last - first
}
