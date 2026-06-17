/**
 * Freestyle Workout Tracker – progress időszak szűrés
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { WORKOUT_STATUS } from '../../constants/workout'

export const PROGRESS_PERIODS = [
  { id: '4weeks', label: '4 hét', days: 28 },
  { id: '3months', label: '3 hónap', days: 91 },
  { id: '6months', label: '6 hónap', days: 182 },
  { id: 'all', label: 'Összes', days: null },
]

export const DEFAULT_PROGRESS_PERIOD = '4weeks'

export function getWorkoutDate(workout) {
  return workout?.finishedAt ?? workout?.startedAt ?? workout?.createdAt ?? null
}

export function getWorkoutDateMs(workout) {
  const d = getWorkoutDate(workout)
  if (!d) return Number.NaN
  return new Date(d).getTime()
}

export function getCompletedWorkouts(workouts) {
  return (workouts ?? []).filter((w) => w.status === WORKOUT_STATUS.COMPLETED)
}

export function sortWorkoutsChronologically(workouts) {
  return [...workouts].sort(
    (a, b) => getWorkoutDateMs(a) - getWorkoutDateMs(b),
  )
}

export function sortWorkoutsNewestFirst(workouts) {
  return [...workouts].sort(
    (a, b) => getWorkoutDateMs(b) - getWorkoutDateMs(a),
  )
}

export function getPeriodStartDate(periodId, referenceDate = new Date()) {
  const period = PROGRESS_PERIODS.find((p) => p.id === periodId)
  if (!period?.days) return null

  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - period.days)
  return start
}

export function filterWorkoutsByPeriod(workouts, periodId, referenceDate = new Date()) {
  const completed = getCompletedWorkouts(workouts)
  const start = getPeriodStartDate(periodId, referenceDate)
  if (!start) return completed

  const startMs = start.getTime()
  return completed.filter((w) => {
    const ms = getWorkoutDateMs(w)
    return Number.isFinite(ms) && ms >= startMs
  })
}

export function getWeekStartMonday(date) {
  const ref = new Date(date)
  const day = ref.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(ref)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(ref.getDate() + mondayOffset)
  return weekStart
}

export function formatWeekLabel(weekStart) {
  return new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
  }).format(weekStart)
}
