/**
 * Freestyle Workout Tracker – edzés timer UI hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Másodpercenként újraszámolja a hátralévő időt – nem ment storage-ba.
 */

import { useEffect, useRef, useState } from 'react'
import { TIMER_PHASE } from '../constants/workout'
import { getTimerRemainingSeconds } from '../utils/timer'

/**
 * @param {object|null} timer – workout.timer
 * @param {{ onPrepComplete?: () => void, onRestComplete?: () => void }} [callbacks]
 */
export function useWorkoutTimer(timer, callbacks = {}) {
  const [, setTick] = useState(0)
  const timerRef = useRef(timer)
  const callbacksRef = useRef(callbacks)
  const prepTriggeredRef = useRef(false)
  const restTriggeredRef = useRef(false)

  useEffect(() => {
    timerRef.current = timer
    prepTriggeredRef.current = false
    restTriggeredRef.current = false
  }, [timer])

  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    if (!timer || timer.phase === TIMER_PHASE.IDLE) return undefined

    const interval = setInterval(() => {
      setTick((t) => t + 1)

      const current = timerRef.current
      const remaining = getTimerRemainingSeconds(current)

      if (
        current?.phase === TIMER_PHASE.PREP &&
        remaining === 0 &&
        !prepTriggeredRef.current
      ) {
        prepTriggeredRef.current = true
        callbacksRef.current.onPrepComplete?.()
      }

      if (
        current?.phase === TIMER_PHASE.REST &&
        remaining === 0 &&
        !restTriggeredRef.current
      ) {
        restTriggeredRef.current = true
        callbacksRef.current.onRestComplete?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  return getTimerRemainingSeconds(timer)
}
