/**
 * Freestyle Workout Tracker – dátum formázás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

/**
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
export function formatWorkoutDate(isoString) {
  if (!isoString) return 'Ismeretlen dátum'

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Ismeretlen dátum'

  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Rövidebb dátum a listához.
 */
export function formatWorkoutDateShort(isoString) {
  if (!isoString) return '—'

  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('hu-HU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
