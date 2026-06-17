/**
 * Freestyle Workout Tracker – timer számítások
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A hátralévő időt startedAt + durationSeconds alapján számoljuk –
 * így oldalfrissítés után is helyes marad (nem mentünk másodpercenként).
 */

import { TIMER_PHASE } from '../constants/workout'

/**
 * @param {{ phase: string, startedAt?: number, durationSeconds?: number } | null | undefined} timer
 * @returns {number} Hátralévő másodpercek (minimum 0)
 */
export function getTimerElapsedSeconds(timer) {
  if (!timer?.startedAt) return 0
  return Math.floor((Date.now() - timer.startedAt) / 1000)
}

export function getTimerRemainingSeconds(timer) {
  if (!timer || timer.phase === TIMER_PHASE.IDLE || !timer.startedAt) {
    return 0
  }

  const elapsed = getTimerElapsedSeconds(timer)
  return Math.max((timer.durationSeconds ?? 0) - elapsed, 0)
}

/** Aktív szett indul – startedAt alapján felfelé számolható (tartás gyakorlatok). */
export function startActiveSetTimer() {
  return createTimer(TIMER_PHASE.ACTIVE_SET, 0)
}

/**
 * @param {number} totalSeconds
 * @returns {string} pl. "1:05"
 */
export function formatTimerDisplay(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Új timer objektum adott fázissal és időtartammal.
 */
export function createTimer(phase, durationSeconds) {
  return {
    phase,
    startedAt: Date.now(),
    durationSeconds,
  }
}

/**
 * Üres / várakozó timer.
 */
export function idleTimer(phase = TIMER_PHASE.IDLE) {
  return {
    phase,
    startedAt: null,
    durationSeconds: 0,
  }
}
