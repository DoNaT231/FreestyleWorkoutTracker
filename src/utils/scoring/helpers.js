/**
 * Freestyle Workout Tracker – scoring közös segédek
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { getPrimaryCategory } from '../../constants/exerciseMeta'
import {
  resolveBodyweightLoadFactor,
  resolveDifficultyMultiplier,
  resolveStaticHoldFactor,
} from './loadDefaults'

export function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function parsePositiveNumber(value) {
  const n = parseNumber(value)
  return n != null && n > 0 ? n : null
}

export function parseNonNegativeNumber(value) {
  const n = parseNumber(value)
  return n != null && n >= 0 ? n : null
}

export function getWorkoutBodyWeightKg(workout) {
  return parsePositiveNumber(workout?.bodyWeightKgAtWorkout)
}

export function getSetRepsOrSeconds(set) {
  return parsePositiveNumber(set?.reps)
}

export function getAdditionalWeightKg(set) {
  return parseNonNegativeNumber(set?.additionalWeightKg) ?? 0
}

export function getBodyweightLoadFactor(exercise) {
  return resolveBodyweightLoadFactor(exercise)
}

export function getDifficultyMultiplier(exercise) {
  return resolveDifficultyMultiplier(exercise)
}

export function getStaticHoldFactor(exercise) {
  return resolveStaticHoldFactor(exercise)
}

export function isTimeExercise(exercise) {
  return exercise?.type === 'time'
}

export function getExercisePrimaryCategory(exercise) {
  return getPrimaryCategory(exercise) ?? exercise?.primaryCategory ?? null
}

export function roundScore(value) {
  if (value == null || !Number.isFinite(value)) return null
  return Math.round(value)
}
