/**
 * Freestyle Workout Tracker – heti edzésterhelés idősor
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { calculateWeeklySummary } from '../scoring/weeklySummary'
import { formatWeekLabel, getWeekStartMonday } from './periods'

export function buildWeeklyLoadSeries(workouts, weekCount = 8) {
  const weeks = []
  const now = new Date()

  for (let i = weekCount - 1; i >= 0; i -= 1) {
    const ref = new Date(now)
    ref.setDate(ref.getDate() - i * 7)
    const weekStart = getWeekStartMonday(ref)
    const summary = calculateWeeklySummary(workouts, weekStart)

    weeks.push({
      weekStart: weekStart.toISOString(),
      weekLabel: formatWeekLabel(weekStart),
      totalTrainingLoad: summary.totalTrainingLoad ?? 0,
      workoutCount: summary.workoutCount,
      totalSets: summary.totalSets,
      totalReps: summary.totalReps,
    })
  }

  return weeks
}

export function getThisWeekLoad(weeklySeries) {
  if (!weeklySeries?.length) return null
  return weeklySeries[weeklySeries.length - 1]
}

export function getWeekOverWeekChange(weeklySeries) {
  if (!weeklySeries || weeklySeries.length < 2) return null
  const current = weeklySeries[weeklySeries.length - 1].totalTrainingLoad
  const previous = weeklySeries[weeklySeries.length - 2].totalTrainingLoad
  return current - previous
}
