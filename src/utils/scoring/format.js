/**
 * Freestyle Workout Tracker – scoring megjelenítés (HU)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export const STRENGTH_RELIABILITY_LABELS = {
  high: 'Magas',
  medium: 'Közepes',
  low: 'Alacsony',
}

export function formatScorePoints(score) {
  if (score == null || !Number.isFinite(score)) return '—'
  return `${Math.round(score)} pont`
}

export function formatEstimated1RM(kg) {
  if (kg == null || !Number.isFinite(kg)) return '—'
  return `${Math.round(kg * 10) / 10} kg`
}

export function formatRelativeStrength(ratio) {
  if (ratio == null || !Number.isFinite(ratio)) return '—'
  return `${Math.round(ratio * 1000) / 1000}×`
}

export function formatReliability(reliability) {
  if (!reliability) return null
  return STRENGTH_RELIABILITY_LABELS[reliability] ?? reliability
}
