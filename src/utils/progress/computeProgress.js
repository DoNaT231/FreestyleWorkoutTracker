/**
 * Freestyle Workout Tracker – progress statisztikák összesítése
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { isTimeExercise } from '../scoring/helpers'
import { findBestStrengthSetForExercise } from '../scoring/strengthScore'
import { calculateWorkoutSummary } from '../scoring/workoutSummary'
import { calculateConsistency } from './consistency'
import {
  buildExerciseMetricTimeline,
  getBestMetricPoint,
  getLatestMetricPoint,
  getMetricChangeInPeriod,
  listExercisesFromHistory,
  resolveKeyExercise,
} from './exerciseProgress'
import { getProgressCategoryLabel } from './labels'
import {
  collectProgressRecords,
  countNewRecordsInPeriod,
} from './progressRecords'
import {
  filterWorkoutsByPeriod,
  getCompletedWorkouts,
  sortWorkoutsChronologically,
} from './periods'
import {
  buildWeeklyLoadSeries,
  getThisWeekLoad,
  getWeekOverWeekChange,
} from './weeklyLoads'

function aggregatePeriodStats(workouts) {
  let totalSets = 0
  let totalReps = 0
  let totalTrainingLoad = 0
  let totalHoldTimeSeconds = 0
  let totalHoldScore = 0
  const categoryMap = {}

  for (const w of workouts) {
    const summary = calculateWorkoutSummary(w)
    totalSets += summary.totalSets
    totalReps += summary.totalReps
    totalTrainingLoad += summary.trainingLoadScore ?? 0
    totalHoldScore += summary.holdScore ?? 0

    for (const ex of summary.exerciseSummaries) {
      if (ex.type === 'time') {
        totalHoldTimeSeconds += ex.totalTimeSeconds ?? 0
      }
    }

    for (const row of summary.categoryBreakdown) {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = {
          category: row.category,
          label: getProgressCategoryLabel(row.category),
          sets: 0,
          reps: 0,
          timeSeconds: 0,
          trainingLoadScore: 0,
          holdScore: 0,
        }
      }
      const bucket = categoryMap[row.category]
      bucket.sets += row.sets
      bucket.reps += row.reps
      bucket.timeSeconds += row.timeSeconds
      bucket.trainingLoadScore += row.trainingLoadScore
      bucket.holdScore += row.holdScore
    }
  }

  const categoryBreakdown = Object.values(categoryMap).sort(
    (a, b) => b.trainingLoadScore - a.trainingLoadScore,
  )

  return {
    workoutCount: workouts.length,
    totalSets,
    totalReps,
    totalTrainingLoad: Math.round(totalTrainingLoad),
    totalHoldTimeSeconds,
    totalHoldScore: Math.round(totalHoldScore),
    categoryBreakdown,
  }
}

function buildStaticHoldStats(workouts) {
  const timeExercises = listExercisesFromHistory(workouts).filter(
    (e) => e.type === 'time',
  )

  if (!timeExercises.length) {
    return { hasData: false }
  }

  let longestHold = 0
  let longestHoldExercise = null
  let totalHoldTime = 0
  let totalHoldScore = 0
  let bestHoldExercise = null
  let bestHoldScore = 0

  for (const w of workouts) {
    const summary = calculateWorkoutSummary(w)
    for (const ex of summary.exerciseSummaries) {
      if (ex.type !== 'time') continue
      totalHoldTime += ex.totalTimeSeconds ?? 0
      totalHoldScore += ex.holdScore ?? 0

      if ((ex.bestHoldSeconds ?? 0) > longestHold) {
        longestHold = ex.bestHoldSeconds
        longestHoldExercise = ex.name
      }
      if ((ex.holdScore ?? 0) > bestHoldScore) {
        bestHoldScore = ex.holdScore
        bestHoldExercise = ex.name
      }
    }
  }

  return {
    hasData: totalHoldTime > 0 || totalHoldScore > 0,
    longestHold,
    longestHoldExercise,
    totalHoldTime,
    totalHoldScore: Math.round(totalHoldScore),
    bestHoldExercise,
    bestHoldScore,
  }
}

function buildStrengthDetail(workouts, exerciseId) {
  let latest = null
  let best = null

  for (const w of sortWorkoutsChronologically(workouts)) {
    const exercise = (w.exercises ?? []).find((ex) => ex.exerciseId === exerciseId)
    if (!exercise || isTimeExercise(exercise)) continue

    const strength = findBestStrengthSetForExercise(exercise, w)
    if (!strength) continue

    const entry = {
      estimated1RM: strength.estimated1RM,
      relativeStrength: strength.relativeStrength,
      reps: strength.reps,
      reliability: strength.reliability,
      setNumber: strength.set?.setNumber ?? null,
      date: w.finishedAt ?? w.startedAt,
      workoutName: w.name,
    }

    latest = entry
    if (!best || strength.estimated1RM > best.estimated1RM) {
      best = entry
    }
  }

  return { latest, best }
}

/**
 * @param {object[]} allWorkouts
 * @param {{ periodId: string, keyExerciseId?: string|null, selectedExerciseId?: string|null }} options
 */
export function computeProgressData(allWorkouts, options) {
  const { periodId, keyExerciseId = null, selectedExerciseId = null } = options
  const completed = getCompletedWorkouts(allWorkouts)
  const periodWorkouts = filterWorkoutsByPeriod(completed, periodId)
  const periodStats = aggregatePeriodStats(periodWorkouts)
  const allTimeStats = aggregatePeriodStats(completed)

  const keyExercise = resolveKeyExercise(completed, keyExerciseId)
  const exercises = listExercisesFromHistory(completed)
  const selectedExercise =
    exercises.find((e) => e.exerciseId === selectedExerciseId) ??
    keyExercise

  const relativeTimeline = keyExercise
    ? buildExerciseMetricTimeline(
        periodWorkouts,
        keyExercise.exerciseId,
        'relativeStrength',
      )
    : []

  const strengthDetail = keyExercise
    ? buildStrengthDetail(periodWorkouts, keyExercise.exerciseId)
    : { latest: null, best: null }

  const weeklySeries = buildWeeklyLoadSeries(completed, 8)
  const thisWeek = getThisWeekLoad(weeklySeries)
  const weekChange = getWeekOverWeekChange(weeklySeries)

  const selectedTimeline = selectedExercise
    ? {
        totalReps: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'totalReps',
        ),
        bestSetReps: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'bestSetReps',
        ),
        estimated1RM: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'estimated1RM',
        ),
        relativeStrength: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'relativeStrength',
        ),
        totalTime: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'totalTime',
        ),
        bestHold: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'bestHold',
        ),
        holdScore: buildExerciseMetricTimeline(
          periodWorkouts,
          selectedExercise.exerciseId,
          'holdScore',
        ),
      }
    : null

  const staticHolds = buildStaticHoldStats(periodWorkouts)
  const records = collectProgressRecords(completed)
  const newRecordsCount = countNewRecordsInPeriod(completed, periodWorkouts)
  const consistency = calculateConsistency(completed)

  return {
    hasWorkouts: completed.length > 0,
    hasMultipleWorkouts: completed.length >= 2,
    hasPeriodWorkouts: periodWorkouts.length > 0,
    periodStats,
    allTimeStats,
    newRecordsCount,
    keyExercise,
    relativeStrength: {
      latest: getLatestMetricPoint(relativeTimeline),
      best: getBestMetricPoint(relativeTimeline),
      change: getMetricChangeInPeriod(relativeTimeline),
      timeline: relativeTimeline,
    },
    strength: strengthDetail,
    weeklyLoad: {
      series: weeklySeries,
      thisWeek,
      weekChange,
    },
    activity: periodStats,
    categoryBreakdown: periodStats.categoryBreakdown,
    exercises,
    selectedExercise,
    selectedTimeline,
    staticHolds,
    records,
    consistency,
  }
}
