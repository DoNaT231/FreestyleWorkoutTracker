/**
 * Freestyle Workout Tracker – progress UI címkék (HU)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

export const PROGRESS_CATEGORY_LABELS = {
  pull: 'Húzó',
  push: 'Nyomó',
  core: 'Core',
  legs: 'Láb',
  skill: 'Skill',
  cardio: 'Kardió',
  full_body: 'Teljes test',
}

export function getProgressCategoryLabel(category) {
  return PROGRESS_CATEGORY_LABELS[category] ?? category ?? '—'
}

export function formatRelativeStrengthLabel(ratio) {
  if (ratio == null || !Number.isFinite(ratio)) return '—'
  return `${Math.round(ratio * 100) / 100}× testsúly`
}

export function formatChange(value, { suffix = '', decimals = 0 } = {}) {
  if (value == null || !Number.isFinite(value)) return '—'
  const rounded =
    decimals > 0
      ? Math.round(value * 10 ** decimals) / 10 ** decimals
      : Math.round(value)
  if (rounded > 0) return `+${rounded}${suffix}`
  if (rounded < 0) return `${rounded}${suffix}`
  return `0${suffix}`
}

export function formatPercentChange(current, previous) {
  if (
    current == null ||
    previous == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(previous) ||
    previous === 0
  ) {
    return null
  }
  const pct = ((current - previous) / previous) * 100
  return formatChange(pct, { suffix: '%', decimals: 0 })
}
