/**
 * Freestyle Workout Tracker – edzés scoring összegzés
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { getCategoryLabel } from '../../constants/exerciseMeta'
import { SET_STATUS } from '../../constants/workout'
import { formatWorkoutDate } from '../formatDate'
import { formatWorkoutDuration, getWorkoutDurationSeconds } from '../workoutDuration'
import { calculateExerciseHoldScore, findBestHoldSetForExercise } from './holdScore'
import { calculateExerciseTrainingLoad, calculateWorkoutTrainingLoad } from './loadScore'
import {
  findBestStrengthSetForExercise,
} from './strengthScore'
import {
  getExercisePrimaryCategory,
  getSetRepsOrSeconds,
  getWorkoutBodyWeightKg,
  isTimeExercise,
  parseNonNegativeNumber,
  roundScore,
} from './helpers'

function calculateExerciseSummaryEntry(exercise, workout) {
  const sets = exercise.sets ?? []
  const timeBased = isTimeExercise(exercise)
  const missingSetCount = sets.filter(
    (s) => s.status === SET_STATUS.MISSING_REPS,
  ).length

  let totalReps = 0
  let totalTimeSeconds = 0
  let bestSetReps = null
  let maxAdditionalWeight = 0

  for (const set of sets) {
    const value = getSetRepsOrSeconds(set)
    const extra = parseNonNegativeNumber(set.additionalWeightKg) ?? 0
    if (extra > maxAdditionalWeight) maxAdditionalWeight = extra

    if (value == null) continue

    if (timeBased) {
      totalTimeSeconds += value
    } else {
      totalReps += value
      if (bestSetReps == null || value > bestSetReps) bestSetReps = value
    }
  }

  const bestHold = findBestHoldSetForExercise(exercise, workout)
  const bestStrength = findBestStrengthSetForExercise(exercise, workout)

  const trainingLoadScore = timeBased
    ? null
    : roundScore(calculateExerciseTrainingLoad(exercise, workout))
  const holdScore = timeBased
    ? roundScore(calculateExerciseHoldScore(exercise, workout))
    : null

  return {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    type: exercise.type,
    primaryCategory: getExercisePrimaryCategory(exercise),
    totalSets: sets.length,
    setCount: sets.length,
    totalReps: timeBased ? null : totalReps,
    totalTimeSeconds: timeBased ? totalTimeSeconds : null,
    trainingLoadScore,
    holdScore,
    bestSetReps: timeBased ? null : bestSetReps,
    bestHoldSeconds: bestHold?.seconds ?? null,
    bestEstimated1RM: bestStrength?.estimated1RM ?? null,
    bestRelativeStrength: bestStrength?.relativeStrength ?? null,
    strengthReliability: bestStrength?.reliability ?? null,
    hasAdditionalWeight: sets.some(
      (s) => (parseNonNegativeNumber(s.additionalWeightKg) ?? 0) > 0,
    ),
    maxAdditionalWeightKg: maxAdditionalWeight > 0 ? maxAdditionalWeight : 0,
    missingSetCount,
    bestSet: timeBased
      ? bestHold
        ? { value: bestHold.seconds, setNumber: bestHold.set.setNumber }
        : null
      : bestSetReps != null
        ? { value: bestSetReps, setNumber: null }
        : null,
  }
}

function calculateCategoryBreakdownForWorkout(workout, exerciseSummaries) {
  const breakdown = {}

  for (const summary of exerciseSummaries) {
    const category = summary.primaryCategory
    if (!category) continue

    if (!breakdown[category]) {
      breakdown[category] = {
        sets: 0,
        reps: 0,
        timeSeconds: 0,
        trainingLoadScore: 0,
        holdScore: 0,
      }
    }

    const bucket = breakdown[category]
    bucket.sets += summary.totalSets
    bucket.reps += summary.totalReps ?? 0
    bucket.timeSeconds += summary.totalTimeSeconds ?? 0
    bucket.trainingLoadScore += summary.trainingLoadScore ?? 0
    bucket.holdScore += summary.holdScore ?? 0
  }

  return Object.entries(breakdown)
    .map(([category, stats]) => ({
      category,
      label: getCategoryLabel(category),
      ...stats,
      trainingLoadScore: roundScore(stats.trainingLoadScore),
      holdScore: roundScore(stats.holdScore),
      loadScore: roundScore(stats.trainingLoadScore),
    }))
    .sort((a, b) => b.trainingLoadScore - a.trainingLoadScore)
}

/**
 * @param {object} workout
 */
export function calculateWorkoutSummary(workout) {
  const exerciseSummaries = (workout.exercises ?? []).map((exercise) =>
    calculateExerciseSummaryEntry(exercise, workout),
  )

  let totalSets = 0
  let totalReps = 0
  let totalTimeSeconds = 0
  let holdScore = 0
  let bestEstimated1RM = null
  let bestRelativeStrength = null
  let bestStrengthReliability = null

  for (const ex of exerciseSummaries) {
    totalSets += ex.totalSets
    totalReps += ex.totalReps ?? 0
    totalTimeSeconds += ex.totalTimeSeconds ?? 0
    holdScore += ex.holdScore ?? 0

    if (ex.bestEstimated1RM != null) {
      if (bestEstimated1RM == null || ex.bestEstimated1RM > bestEstimated1RM) {
        bestEstimated1RM = ex.bestEstimated1RM
        bestRelativeStrength = ex.bestRelativeStrength
        bestStrengthReliability = ex.strengthReliability
      }
    }
  }

  const bodyWeightMissing = getWorkoutBodyWeightKg(workout) == null
  const trainingLoadScore = calculateWorkoutTrainingLoad(workout)
  const categoryBreakdown = calculateCategoryBreakdownForWorkout(
    workout,
    exerciseSummaries,
  )

  return {
    workoutName: workout.name ?? 'Edzés',
    workoutDate: formatWorkoutDate(workout.finishedAt ?? workout.startedAt),
    durationLabel: formatWorkoutDuration(workout),
    durationSeconds: getWorkoutDurationSeconds(workout),
    totalExercises: exerciseSummaries.length,
    totalSets,
    totalReps,
    totalTimeSeconds,
    trainingLoadScore,
    holdScore: roundScore(holdScore),
    bestStrengthScore: bestEstimated1RM,
    bestEstimated1RM,
    bestRelativeStrength,
    bestStrengthReliability,
    bodyWeightMissing,
    bodyWeightKgAtWorkout: workout.bodyWeightKgAtWorkout ?? null,
    categoryBreakdown,
    categoryLoadBreakdown: categoryBreakdown,
    exerciseSummaries,
    exercises: exerciseSummaries,
  }
}
