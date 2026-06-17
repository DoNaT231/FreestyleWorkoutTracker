/**
 * Freestyle Workout Tracker – rekordok és csúcsok
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { WORKOUT_STATUS } from '../../constants/workout'
import { findBestHoldSetForExercise } from './holdScore'
import { calculateWorkoutTrainingLoad } from './loadScore'
import {
  calculateEstimated1RM,
  calculateRelativeStrength,
  findBestStrengthSetForExercise,
} from './strengthScore'
import { getSetRepsOrSeconds, isTimeExercise } from './helpers'
import { calculateWeeklySummary } from './weeklySummary'
import { calculateWorkoutSummary } from './workoutSummary'

function completedWorkouts(workouts) {
  return workouts.filter((w) => w.status === WORKOUT_STATUS.COMPLETED)
}

export function findBestSetReps(workouts, exerciseId) {
  let best = null

  for (const workout of completedWorkouts(workouts)) {
    const exercise = (workout.exercises ?? []).find(
      (ex) => ex.exerciseId === exerciseId,
    )
    if (!exercise || isTimeExercise(exercise)) continue

    for (const set of exercise.sets ?? []) {
      const reps = getSetRepsOrSeconds(set)
      if (reps == null) continue
      if (!best || reps > best.reps) {
        best = {
          reps,
          exerciseId,
          exerciseName: exercise.name,
          workoutId: workout.firestoreId,
          setNumber: set.setNumber,
        }
      }
    }
  }

  return best
}

export function findBestEstimated1RM(workouts, exerciseId = null) {
  let best = null

  for (const workout of completedWorkouts(workouts)) {
    for (const exercise of workout.exercises ?? []) {
      if (exerciseId && exercise.exerciseId !== exerciseId) continue
      if (isTimeExercise(exercise)) continue

      const strength = findBestStrengthSetForExercise(exercise, workout)
      if (!strength) continue

      if (!best || strength.estimated1RM > best.estimated1RM) {
        best = {
          estimated1RM: strength.estimated1RM,
          reps: strength.reps,
          reliability: strength.reliability,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          workoutId: workout.firestoreId,
        }
      }
    }
  }

  return best
}

export function findBestRelativeStrength(workouts, exerciseId = null) {
  let best = null

  for (const workout of completedWorkouts(workouts)) {
    for (const exercise of workout.exercises ?? []) {
      if (exerciseId && exercise.exerciseId !== exerciseId) continue
      if (isTimeExercise(exercise)) continue

      const strength = findBestStrengthSetForExercise(exercise, workout)
      if (!strength?.relativeStrength) continue

      if (
        !best ||
        strength.relativeStrength > best.relativeStrength
      ) {
        best = {
          relativeStrength: strength.relativeStrength,
          estimated1RM: strength.estimated1RM,
          reps: strength.reps,
          reliability: strength.reliability,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          workoutId: workout.firestoreId,
        }
      }
    }
  }

  return best
}

export function findBestHoldTime(workouts, exerciseId = null) {
  let best = null

  for (const workout of completedWorkouts(workouts)) {
    for (const exercise of workout.exercises ?? []) {
      if (exerciseId && exercise.exerciseId !== exerciseId) continue
      if (!isTimeExercise(exercise)) continue

      const hold = findBestHoldSetForExercise(exercise, workout)
      if (!hold) continue

      if (!best || hold.seconds > best.seconds) {
        best = {
          seconds: hold.seconds,
          holdScore: hold.holdScore,
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.name,
          workoutId: workout.firestoreId,
        }
      }
    }
  }

  return best
}

export function findHighestWorkoutTrainingLoad(workouts) {
  let best = null

  for (const workout of completedWorkouts(workouts)) {
    const load = calculateWorkoutTrainingLoad(workout)
    if (load == null) continue

    if (!best || load > best.trainingLoadScore) {
      best = {
        trainingLoadScore: load,
        workoutId: workout.firestoreId,
        workoutName: workout.name,
        finishedAt: workout.finishedAt ?? workout.startedAt,
      }
    }
  }

  return best
}

export function findHighestWeeklyTrainingLoad(workouts, referenceDate = new Date()) {
  const weekly = calculateWeeklySummary(workouts, referenceDate)
  return weekly.totalTrainingLoad > 0
    ? { totalTrainingLoad: weekly.totalTrainingLoad, ...weekly }
    : null
}

/**
 * Poszt-edzés kiemelő kártyák – új rekordok az aktuális edzésben.
 */
export function findWorkoutRecords(currentWorkout, pastWorkouts) {
  const records = []
  const currentId = currentWorkout.firestoreId
  const past = pastWorkouts.filter(
    (w) =>
      w.status === WORKOUT_STATUS.COMPLETED && w.firestoreId !== currentId,
  )

  const exerciseBests = {}

  for (const w of past) {
    for (const ex of w.exercises ?? []) {
      const key = ex.exerciseId
      if (!key) continue

      if (!exerciseBests[key]) {
        exerciseBests[key] = {
          bestSetReps: 0,
          bestTotalReps: 0,
          bestTotalTime: 0,
          bestEstimated1RM: 0,
          bestHoldSeconds: 0,
          name: ex.name,
          type: ex.type,
        }
      }

      const summary = calculateWorkoutSummary(w)
      const exSummary = summary.exerciseSummaries.find(
        (s) => s.exerciseId === key,
      )
      if (!exSummary) continue

      const b = exerciseBests[key]
      if ((exSummary.bestSetReps ?? 0) > b.bestSetReps) {
        b.bestSetReps = exSummary.bestSetReps
      }
      if ((exSummary.totalReps ?? 0) > b.bestTotalReps) {
        b.bestTotalReps = exSummary.totalReps
      }
      if ((exSummary.totalTimeSeconds ?? 0) > b.bestTotalTime) {
        b.bestTotalTime = exSummary.totalTimeSeconds
      }
      if ((exSummary.bestEstimated1RM ?? 0) > b.bestEstimated1RM) {
        b.bestEstimated1RM = exSummary.bestEstimated1RM
      }
      if ((exSummary.bestHoldSeconds ?? 0) > b.bestHoldSeconds) {
        b.bestHoldSeconds = exSummary.bestHoldSeconds
      }
    }
  }

  const currentSummary = calculateWorkoutSummary(currentWorkout)

  for (const ex of currentSummary.exerciseSummaries) {
    const key = ex.exerciseId
    if (!key) continue

    const prev = exerciseBests[key]
    if (!prev) continue

    const timeBased = ex.type === 'time'

    if (!timeBased && (ex.bestEstimated1RM ?? 0) > prev.bestEstimated1RM) {
      records.push({
        type: 'record',
        title: 'Új erőszint rekord',
        subtitle: ex.name,
        value: `Becsült 1RM: ${ex.bestEstimated1RM} kg`,
        detail: prev.bestEstimated1RM
          ? `Előző rekord: ${prev.bestEstimated1RM} kg`
          : undefined,
      })
    }

    if (
      timeBased &&
      ex.bestHoldSeconds &&
      ex.bestHoldSeconds > prev.bestHoldSeconds
    ) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: ex.name,
        value: `${ex.bestHoldSeconds} mp legjobb tartás`,
        detail: `Előző rekord: ${prev.bestHoldSeconds} mp`,
      })
    }

    if (
      !timeBased &&
      ex.bestSetReps &&
      ex.bestSetReps > prev.bestSetReps
    ) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: ex.name,
        value: `${ex.bestSetReps} ismétlés egy szettben`,
        detail: `Előző rekord: ${prev.bestSetReps}`,
      })
    }

    if (!timeBased && (ex.totalReps ?? 0) > prev.bestTotalReps) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: `${ex.name} összesen`,
        value: `${ex.totalReps} ismétlés`,
        detail: `Előző rekord: ${prev.bestTotalReps}`,
      })
    }

    if (timeBased && (ex.totalTimeSeconds ?? 0) > prev.bestTotalTime) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: `${ex.name} összesen`,
        value: `${ex.totalTimeSeconds} mp`,
        detail: `Előző rekord: ${prev.bestTotalTime} mp`,
      })
    }
  }

  const pastBestLoad = findHighestWorkoutTrainingLoad(past)?.trainingLoadScore ?? 0
  if (
    (currentSummary.trainingLoadScore ?? 0) > pastBestLoad &&
    pastBestLoad > 0
  ) {
    records.push({
      type: 'record',
      title: 'Új edzésterhelés rekord',
      subtitle: currentWorkout.name,
      value: `${currentSummary.trainingLoadScore} pont`,
      detail: `Előző rekord: ${pastBestLoad} pont`,
    })
  }

  return records
}
