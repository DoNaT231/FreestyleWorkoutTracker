/**
 * Freestyle Workout Tracker – progress rekordok összegyűjtése
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { parseNonNegativeNumber } from '../scoring/helpers'
import {
  findBestEstimated1RM,
  findBestHoldTime,
  findBestRelativeStrength,
  findBestSetReps,
  findHighestWorkoutTrainingLoad,
  findWorkoutRecords,
} from '../scoring/records'
import { calculateWeeklySummary } from '../scoring/weeklySummary'
import { getWeekStartMonday, sortWorkoutsChronologically } from './periods'

function findBestAdditionalWeight(workouts) {
  let best = null

  for (const workout of workouts) {
    for (const exercise of workout.exercises ?? []) {
      for (const set of exercise.sets ?? []) {
        const kg = parseNonNegativeNumber(set.additionalWeightKg) ?? 0
        if (kg <= 0) continue

        if (!best || kg > best.kg) {
          best = {
            kg,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.name,
            workoutId: workout.firestoreId,
            setNumber: set.setNumber,
          }
        }
      }
    }
  }

  return best
}

function findHighestWeeklyTrainingLoadAllTime(workouts) {
  const weekMap = new Map()

  for (const workout of workouts) {
    const date = workout.finishedAt ?? workout.startedAt
    if (!date) continue
    const weekKey = getWeekStartMonday(new Date(date)).toISOString().slice(0, 10)
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, [])
    weekMap.get(weekKey).push(workout)
  }

  let best = null
  for (const [weekKey, weekWorkouts] of weekMap) {
    const summary = calculateWeeklySummary(weekWorkouts, new Date(weekKey))
    if (summary.totalTrainingLoad <= 0) continue
    if (!best || summary.totalTrainingLoad > best.totalTrainingLoad) {
      best = { weekKey, ...summary }
    }
  }

  return best
}

function findBestSetRepsAnyExercise(workouts) {
  let best = null
  const exerciseIds = new Set()

  for (const w of workouts) {
    for (const ex of w.exercises ?? []) {
      if (ex.exerciseId) exerciseIds.add(ex.exerciseId)
    }
  }

  for (const id of exerciseIds) {
    const record = findBestSetReps(workouts, id)
    if (!record) continue
    if (!best || record.reps > best.reps) best = record
  }

  return best
}

/**
 * @returns {{ id: string, title: string, value: string, detail?: string }[]}
 */
export function collectProgressRecords(workouts) {
  const cards = []

  const bestSet = findBestSetRepsAnyExercise(workouts)
  if (bestSet) {
    cards.push({
      id: 'best-set-reps',
      title: 'Legjobb szett ismétlés',
      value: `${bestSet.reps} ismétlés`,
      detail: `${bestSet.exerciseName}`,
    })
  }

  const best1RM = findBestEstimated1RM(workouts)
  if (best1RM) {
    cards.push({
      id: 'best-1rm',
      title: 'Legjobb becsült 1RM',
      value: `${best1RM.estimated1RM} kg`,
      detail: `${best1RM.exerciseName} · ${best1RM.reps} ism.`,
    })
  }

  const bestRelative = findBestRelativeStrength(workouts)
  if (bestRelative) {
    cards.push({
      id: 'best-relative',
      title: 'Legjobb relatív erő',
      value: `${bestRelative.relativeStrength}× testsúly`,
      detail: bestRelative.exerciseName,
    })
  }

  const bestHold = findBestHoldTime(workouts)
  if (bestHold) {
    cards.push({
      id: 'best-hold',
      title: 'Leghosszabb tartás',
      value: `${bestHold.seconds} mp`,
      detail: bestHold.exerciseName,
    })
  }

  const bestWeeklyLoad = findHighestWeeklyTrainingLoadAllTime(workouts)
  if (bestWeeklyLoad) {
    cards.push({
      id: 'best-weekly-load',
      title: 'Legnagyobb heti edzésterhelés',
      value: `${Math.round(bestWeeklyLoad.totalTrainingLoad)} pont`,
      detail: `${bestWeeklyLoad.workoutCount} edzés azon a héten`,
    })
  }

  const bestWorkoutLoad = findHighestWorkoutTrainingLoad(workouts)
  if (bestWorkoutLoad) {
    cards.push({
      id: 'best-workout-load',
      title: 'Legnagyobb edzés terhelés',
      value: `${bestWorkoutLoad.trainingLoadScore} pont`,
      detail: bestWorkoutLoad.workoutName,
    })
  }

  const bestWeight = findBestAdditionalWeight(workouts)
  if (bestWeight) {
    cards.push({
      id: 'best-extra-weight',
      title: 'Legnagyobb plusz súly',
      value: `+${bestWeight.kg} kg`,
      detail: `${bestWeight.exerciseName} · ${bestWeight.setNumber}. szett`,
    })
  }

  return cards
}

export function countNewRecordsInPeriod(workouts, periodWorkouts) {
  const chronological = sortWorkoutsChronologically(periodWorkouts)
  let count = 0

  for (let i = 0; i < chronological.length; i += 1) {
    const current = chronological[i]
    const prior = workouts.filter((w) => {
      const currentMs = new Date(
        current.finishedAt ?? current.startedAt,
      ).getTime()
      const wMs = new Date(w.finishedAt ?? w.startedAt).getTime()
      return wMs < currentMs
    })
    const records = findWorkoutRecords(current, prior)
    count += records.length
  }

  return count
}
