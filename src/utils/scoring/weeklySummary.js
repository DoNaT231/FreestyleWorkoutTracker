/**
 * Freestyle Workout Tracker – heti / havi scoring összegzés
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { getCategoryLabel } from '../../constants/exerciseMeta'
import { WORKOUT_STATUS } from '../../constants/workout'
import { calculateWorkoutSummary } from './workoutSummary'

function getWeekRange(referenceDate = new Date()) {
  const ref = new Date(referenceDate)
  const day = ref.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(ref)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(ref.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return { weekStart, weekEnd }
}

function getMonthRange(referenceDate = new Date()) {
  const ref = new Date(referenceDate)
  const monthStart = new Date(ref.getFullYear(), ref.getMonth(), 1)
  const monthEnd = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
  return { monthStart, monthEnd }
}

function filterCompletedInRange(workouts, start, end) {
  return workouts.filter((w) => {
    if (w.status !== WORKOUT_STATUS.COMPLETED) return false
    const d = new Date(w.finishedAt ?? w.startedAt)
    return d >= start && d < end
  })
}

function aggregateWorkouts(workouts) {
  let totalSets = 0
  let totalReps = 0
  let totalTimeSeconds = 0
  let totalTrainingLoad = 0
  let totalHoldScore = 0
  const categoryMap = {}

  for (const w of workouts) {
    const summary = calculateWorkoutSummary(w)
    totalSets += summary.totalSets
    totalReps += summary.totalReps
    totalTimeSeconds += summary.totalTimeSeconds
    totalTrainingLoad += summary.trainingLoadScore ?? 0
    totalHoldScore += summary.holdScore ?? 0

    for (const row of summary.categoryBreakdown) {
      if (!categoryMap[row.category]) {
        categoryMap[row.category] = {
          category: row.category,
          label: row.label,
          sets: 0,
          reps: 0,
          timeSeconds: 0,
          trainingLoadScore: 0,
          holdScore: 0,
          setCount: 0,
        }
      }
      const bucket = categoryMap[row.category]
      bucket.sets += row.sets
      bucket.setCount += row.sets
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
    totalTimeSeconds,
    totalTrainingLoad,
    totalHoldScore,
    categoryBreakdown,
  }
}

export function calculateCategoryBreakdown(workouts) {
  const completed = workouts.filter(
    (w) => w.status === WORKOUT_STATUS.COMPLETED,
  )
  return aggregateWorkouts(completed).categoryBreakdown
}

export function calculateWeeklySummary(allWorkouts, referenceDate = new Date()) {
  const { weekStart, weekEnd } = getWeekRange(referenceDate)
  const inWeek = filterCompletedInRange(allWorkouts, weekStart, weekEnd)
  return aggregateWorkouts(inWeek)
}

export function calculateMonthlySummary(allWorkouts, referenceDate = new Date()) {
  const { monthStart, monthEnd } = getMonthRange(referenceDate)
  const inMonth = filterCompletedInRange(allWorkouts, monthStart, monthEnd)
  return aggregateWorkouts(inMonth)
}
