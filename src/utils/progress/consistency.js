/**
 * Freestyle Workout Tracker – rendszeresség statisztikák
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { getWorkoutDateMs, getWeekStartMonday } from './periods'

function countWorkoutsSince(workouts, daysAgo, referenceDate = new Date()) {
  const cutoff = new Date(referenceDate)
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - daysAgo)
  const cutoffMs = cutoff.getTime()

  return workouts.filter((w) => {
    const ms = getWorkoutDateMs(w)
    return Number.isFinite(ms) && ms >= cutoffMs
  }).length
}

function getWorkoutWeekKeys(workouts) {
  const keys = new Set()
  for (const w of workouts) {
    const ms = getWorkoutDateMs(w)
    if (!Number.isFinite(ms)) continue
    const weekStart = getWeekStartMonday(new Date(ms))
    keys.add(weekStart.toISOString().slice(0, 10))
  }
  return [...keys].sort()
}

function calculateWeekStreak(weekKeys, referenceDate = new Date()) {
  if (!weekKeys.length) return 0

  const currentWeekKey = getWeekStartMonday(referenceDate)
    .toISOString()
    .slice(0, 10)
  const keySet = new Set(weekKeys)

  let streak = 0
  let cursor = new Date(currentWeekKey)

  while (keySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 7)
  }

  return streak
}

function calculateBestWeekStreak(weekKeys) {
  if (!weekKeys.length) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < weekKeys.length; i += 1) {
    const prev = new Date(weekKeys[i - 1])
    const curr = new Date(weekKeys[i])
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24)

    if (diffDays === 7) {
      current += 1
      best = Math.max(best, current)
    } else {
      current = 1
    }
  }

  return best
}

/**
 * @param {object[]} workouts – completed, sorted any order
 */
export function calculateConsistency(workouts, referenceDate = new Date()) {
  const weekKeys = getWorkoutWeekKeys(workouts)

  const dotGridDays = []
  for (let i = 29; i >= 0; i -= 1) {
    const day = new Date(referenceDate)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - i)

    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    const hasWorkout = workouts.some((w) => {
      const ms = getWorkoutDateMs(w)
      return Number.isFinite(ms) && ms >= day.getTime() && ms <= dayEnd.getTime()
    })

    dotGridDays.push({
      date: day.toISOString(),
      label: day.getDate(),
      hasWorkout,
    })
  }

  return {
    workoutsLast7Days: countWorkoutsSince(workouts, 7, referenceDate),
    workoutsLast30Days: countWorkoutsSince(workouts, 30, referenceDate),
    currentWeekStreak: calculateWeekStreak(weekKeys, referenceDate),
    bestWeekStreak: calculateBestWeekStreak(weekKeys),
    dotGridDays,
  }
}
