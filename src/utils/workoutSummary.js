/**
 * Freestyle Workout Tracker – poszt-edzés összegzés orchestráció
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Scoring formulák: src/utils/scoring/
 */

import { WORKOUT_STATUS } from '../constants/workout'
import { formatWorkoutDate } from './formatDate'
import { findWorkoutRecords } from './scoring/records'
import { calculateWeeklySummary } from './scoring/weeklySummary'
import { calculateWorkoutSummary } from './scoring/workoutSummary'

export { calculateWorkoutSummary } from './scoring/workoutSummary'
export { calculateWeeklySummary } from './scoring/weeklySummary'
export { formatWorkoutDuration } from './workoutDuration'

export function findPreviousExerciseWorkout(
  exerciseId,
  currentWorkoutId,
  pastWorkouts,
) {
  const completed = pastWorkouts
    .filter((w) => w.status === WORKOUT_STATUS.COMPLETED)
    .filter((w) => w.firestoreId !== currentWorkoutId)
    .sort(
      (a, b) =>
        new Date(b.finishedAt ?? b.startedAt).getTime() -
        new Date(a.finishedAt ?? a.startedAt).getTime(),
    )

  for (const w of completed) {
    const match = (w.exercises ?? []).find((ex) => ex.exerciseId === exerciseId)
    if (match) return { workout: w, exercise: match }
  }
  return null
}

export function compareWithPreviousExercisePerformance(
  currentSummary,
  previousExercise,
  exerciseName,
) {
  if (!previousExercise) {
    return {
      type: 'first_time',
      message: 'Ez az első rögzített alkalom ebből a gyakorlatból',
    }
  }

  const prevWorkout = { exercises: [previousExercise] }
  const prev = calculateWorkoutSummary(prevWorkout).exerciseSummaries[0]
  const timeBased = currentSummary.type === 'time'

  if (timeBased) {
    const diff =
      (currentSummary.totalTimeSeconds ?? 0) - (prev?.totalTimeSeconds ?? 0)
    if (diff > 0) {
      return {
        type: 'improved',
        message: `+${diff} mp az előző ${exerciseName} edzéshez képest`,
        diff,
      }
    }
    if (diff < 0) {
      return {
        type: 'declined',
        message: `Most ${Math.abs(diff)} mp-rel kevesebb, mint legutóbb`,
        diff,
      }
    }
    return { type: 'same', message: 'Ugyanannyi idő, mint legutóbb', diff: 0 }
  }

  const diff = (currentSummary.totalReps ?? 0) - (prev?.totalReps ?? 0)
  if (diff > 0) {
    return {
      type: 'improved',
      message: `+${diff} ismétlés az előző ${exerciseName} edzéshez képest`,
      diff,
    }
  }
  if (diff < 0) {
    return {
      type: 'declined',
      message: `Most ${Math.abs(diff)} ismétléssel kevesebb lett, mint legutóbb`,
      diff,
    }
  }
  return {
    type: 'same',
    message: 'Ugyanannyi ismétlés, mint legutóbb',
    diff: 0,
  }
}

export function buildHighlightCards(comparisons, records, weeklySummary) {
  const cards = []

  for (const rec of records.slice(0, 2)) {
    cards.push(rec)
  }

  for (const comp of comparisons) {
    if (cards.length >= 3) break
    if (comp.comparison.type === 'improved') {
      cards.push({
        type: 'improvement',
        title: 'Fejlődés',
        subtitle: comp.exerciseName,
        value: comp.comparison.message,
        detail: comp.timeBased
          ? `${comp.currentTotal} mp összesen`
          : `${comp.currentTotal} ismétlés összesen`,
      })
    }
  }

  if (cards.length < 3 && weeklySummary.workoutCount > 0) {
    cards.push({
      type: 'weekly',
      title: 'Heti lendület',
      subtitle: `Ez volt a hét ${weeklySummary.workoutCount}. edzése`,
      value: `${weeklySummary.workoutCount} edzés`,
      detail: 'Szép munka, tartod a ritmust',
    })
  }

  if (cards.length < 3) {
    const stable = comparisons.find((c) => c.comparison.type === 'same')
    if (stable) {
      cards.push({
        type: 'stable',
        title: 'Stabil teljesítmény',
        subtitle: stable.exerciseName,
        value: 'Ugyanolyan szinten teljesítettél',
        detail: stable.comparison.message,
      })
    }
  }

  if (cards.length < 3) {
    const first = comparisons.find((c) => c.comparison.type === 'first_time')
    if (first) {
      cards.push({
        type: 'first',
        title: 'Új gyakorlat',
        subtitle: first.exerciseName,
        value: 'Első rögzített alkalom',
        detail: first.comparison.message,
      })
    }
  }

  return cards.slice(0, 3)
}

export function buildPostWorkoutSummary(currentWorkout, pastWorkouts) {
  const summary = calculateWorkoutSummary(currentWorkout)
  const records = findWorkoutRecords(currentWorkout, pastWorkouts)
  const weekly = calculateWeeklySummary([
    ...pastWorkouts.filter((w) => w.firestoreId !== currentWorkout.firestoreId),
    currentWorkout,
  ])

  const comparisons = summary.exerciseSummaries.map((exSummary) => {
    const prev = findPreviousExerciseWorkout(
      exSummary.exerciseId,
      currentWorkout.firestoreId,
      pastWorkouts,
    )
    const comparison = compareWithPreviousExercisePerformance(
      exSummary,
      prev?.exercise ?? null,
      exSummary.name,
    )
    return {
      exerciseName: exSummary.name,
      exerciseId: exSummary.exerciseId,
      timeBased: exSummary.type === 'time',
      currentTotal: exSummary.totalTimeSeconds ?? exSummary.totalReps ?? 0,
      comparison,
    }
  })

  const highlights = buildHighlightCards(comparisons, records, weekly)

  return { summary, comparisons, highlights, weekly }
}
