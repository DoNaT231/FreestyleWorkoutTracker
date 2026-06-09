/**
 * Freestyle Workout Tracker – edzés összegzés számítások (MVP)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Csak mennyiségek: szettek, ismétlések, idő, összehasonlítás, rekordok.
 * Terhelés-pont és testsúly számítás később kerül ide.
 */

import { getCategoryLabel, getExerciseCategories } from '../constants/exerciseMeta'
import { SET_STATUS, WORKOUT_STATUS } from '../constants/workout'
import { formatWorkoutDate } from './formatDate'

function getSetValue(set) {
  if (set?.reps == null) return null
  const n = Number(set.reps)
  return Number.isFinite(n) ? n : null
}

function isTimeExercise(exercise) {
  return exercise?.type === 'time'
}

function parseDateMs(value) {
  if (!value) return Number.NaN
  if (typeof value === 'string') return new Date(value).getTime()
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return value.toDate().getTime()
  }
  return new Date(value).getTime()
}

function formatSecondsLabel(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds} mp`
  if (seconds === 0) return `${minutes} perc`
  return `${minutes} perc ${seconds} mp`
}

/**
 * Edzés időtartama emberi olvasható formában.
 */
export function formatWorkoutDuration(workout) {
  const stored = Number(workout?.durationSeconds)
  if (Number.isFinite(stored) && stored > 0) {
    return formatSecondsLabel(stored)
  }

  const start = parseDateMs(workout?.startedAt ?? workout?.createdAt)
  const end = parseDateMs(workout?.finishedAt)
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null

  return formatSecondsLabel(Math.round((end - start) / 1000))
}

/**
 * Egy gyakorlat összegzése.
 */
export function calculateExerciseSummary(exercise) {
  const sets = exercise.sets ?? []
  const timeBased = isTimeExercise(exercise)
  const missingSets = sets.filter((s) => s.status === SET_STATUS.MISSING_REPS)

  let totalReps = 0
  let totalTimeSeconds = 0
  let bestSet = null
  let maxAdditionalWeight = 0

  for (const set of sets) {
    const value = getSetValue(set)
    if (value == null) continue

    const extra = Number(set.additionalWeightKg)
    if (Number.isFinite(extra) && extra > maxAdditionalWeight) {
      maxAdditionalWeight = extra
    }

    if (timeBased) {
      totalTimeSeconds += value
      if (!bestSet || value > bestSet.value) {
        bestSet = { value, setNumber: set.setNumber }
      }
    } else {
      totalReps += value
      if (!bestSet || value > bestSet.value) {
        bestSet = { value, setNumber: set.setNumber }
      }
    }
  }

  const hasAdditionalWeight = sets.some(
    (s) => Number(s.additionalWeightKg) > 0,
  )

  return {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    type: exercise.type,
    setCount: sets.length,
    missingSetCount: missingSets.length,
    totalReps: timeBased ? null : totalReps,
    totalTimeSeconds: timeBased ? totalTimeSeconds : null,
    bestSet,
    hasAdditionalWeight,
    maxAdditionalWeightKg: hasAdditionalWeight ? maxAdditionalWeight : 0,
    categories: getExerciseCategories(exercise),
  }
}

/**
 * Teljes edzés összegzés.
 */
export function calculateWorkoutSummary(workout) {
  const exercises = (workout.exercises ?? []).map(calculateExerciseSummary)

  const totals = exercises.reduce(
    (acc, ex) => ({
      totalSets: acc.totalSets + ex.setCount,
      totalReps: acc.totalReps + (ex.totalReps ?? 0),
      totalTimeSeconds: acc.totalTimeSeconds + (ex.totalTimeSeconds ?? 0),
    }),
    { totalSets: 0, totalReps: 0, totalTimeSeconds: 0 },
  )

  return {
    workoutName: workout.name ?? 'Edzés',
    workoutDate: formatWorkoutDate(workout.finishedAt ?? workout.startedAt),
    durationLabel: formatWorkoutDuration(workout),
    totalExercises: exercises.length,
    totalSets: totals.totalSets,
    totalReps: totals.totalReps,
    totalTimeSeconds: totals.totalTimeSeconds,
    exercises,
  }
}

/**
 * Előző edzés ugyanabból a gyakorlatból.
 */
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

/**
 * Összehasonlítás előző azonos gyakorlattal.
 */
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

  const prev = calculateExerciseSummary(previousExercise)
  const timeBased = currentSummary.type === 'time'

  if (timeBased) {
    const diff =
      (currentSummary.totalTimeSeconds ?? 0) - (prev.totalTimeSeconds ?? 0)
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

  const diff = (currentSummary.totalReps ?? 0) - (prev.totalReps ?? 0)
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

/**
 * Rekordok – ismétlés és idő alapján (terhelés-pont nélkül).
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
      const summary = calculateExerciseSummary(ex)
      if (!exerciseBests[key]) {
        exerciseBests[key] = {
          bestSet: 0,
          bestTotalReps: 0,
          bestTotalTime: 0,
          name: ex.name,
          type: ex.type,
        }
      }
      const b = exerciseBests[key]
      if ((summary.bestSet?.value ?? 0) > b.bestSet) {
        b.bestSet = summary.bestSet?.value ?? 0
      }
      if ((summary.totalReps ?? 0) > b.bestTotalReps) {
        b.bestTotalReps = summary.totalReps
      }
      if ((summary.totalTimeSeconds ?? 0) > b.bestTotalTime) {
        b.bestTotalTime = summary.totalTimeSeconds
      }
    }
  }

  for (const ex of currentWorkout.exercises ?? []) {
    const key = ex.exerciseId
    if (!key) continue
    const cur = calculateExerciseSummary(ex)
    const prev = exerciseBests[key]
    const timeBased = isTimeExercise(ex)

    if (!prev) continue

    if (cur.bestSet && cur.bestSet.value > prev.bestSet) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: ex.name,
        value: timeBased
          ? `${cur.bestSet.value} mp legjobb tartás`
          : `${cur.bestSet.value} ismétlés egy szettben`,
        detail: `Előző rekord: ${prev.bestSet}${timeBased ? ' mp' : ''}`,
      })
    }

    if (!timeBased && (cur.totalReps ?? 0) > prev.bestTotalReps) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: `${ex.name} összesen`,
        value: `${cur.totalReps} ismétlés`,
        detail: `Előző rekord: ${prev.bestTotalReps}`,
      })
    }

    if (timeBased && (cur.totalTimeSeconds ?? 0) > prev.bestTotalTime) {
      records.push({
        type: 'record',
        title: 'Új rekord',
        subtitle: `${ex.name} összesen`,
        value: `${cur.totalTimeSeconds} mp`,
        detail: `Előző rekord: ${prev.bestTotalTime} mp`,
      })
    }
  }

  return records
}

/**
 * Heti összegzés (hétfő–vasárnap).
 */
export function calculateWeeklySummary(allWorkouts, referenceDate = new Date()) {
  const ref = new Date(referenceDate)
  const day = ref.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(ref)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(ref.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const inWeek = allWorkouts.filter((w) => {
    if (w.status !== WORKOUT_STATUS.COMPLETED) return false
    const d = new Date(w.finishedAt ?? w.startedAt)
    return d >= weekStart && d < weekEnd
  })

  const categorySets = {}
  let totalSets = 0
  let totalReps = 0
  let totalTimeSeconds = 0

  for (const w of inWeek) {
    for (const ex of w.exercises ?? []) {
      const summary = calculateExerciseSummary(ex)
      totalSets += summary.setCount
      totalReps += summary.totalReps ?? 0
      totalTimeSeconds += summary.totalTimeSeconds ?? 0
      for (const cat of summary.categories) {
        categorySets[cat] = (categorySets[cat] ?? 0) + summary.setCount
      }
    }
  }

  const categoryBreakdown = Object.entries(categorySets)
    .map(([cat, count]) => ({
      category: cat,
      label: getCategoryLabel(cat),
      setCount: count,
    }))
    .sort((a, b) => b.setCount - a.setCount)

  return {
    workoutCount: inWeek.length,
    totalSets,
    totalReps,
    totalTimeSeconds,
    categoryBreakdown,
  }
}

/**
 * Legfeljebb 3 kiemelő kártya.
 */
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

/**
 * Teljes poszt-edzés összegzés.
 */
export function buildPostWorkoutSummary(currentWorkout, pastWorkouts) {
  const summary = calculateWorkoutSummary(currentWorkout)
  const records = findWorkoutRecords(currentWorkout, pastWorkouts)
  const weekly = calculateWeeklySummary([
    ...pastWorkouts.filter((w) => w.firestoreId !== currentWorkout.firestoreId),
    currentWorkout,
  ])

  const comparisons = summary.exercises.map((exSummary) => {
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
