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
 * @param {() => void} [onPrepComplete] – prep lejártakor (egyszer)
 */
export function useWorkoutTimer(timer, onPrepComplete) {
  const [, setTick] = useState(0)
  const timerRef = useRef(timer)
  const onPrepCompleteRef = useRef(onPrepComplete)
  const prepTriggeredRef = useRef(false)

  useEffect(() => {
    timerRef.current = timer
    prepTriggeredRef.current = false
  }, [timer])

  useEffect(() => {
    onPrepCompleteRef.current = onPrepComplete
  }, [onPrepComplete])

  useEffect(() => {
    if (!timer || timer.phase === TIMER_PHASE.IDLE) return undefined

    const interval = setInterval(() => {
      setTick((t) => t + 1)

      const current = timerRef.current
      if (
        current?.phase === TIMER_PHASE.PREP &&
        getTimerRemainingSeconds(current) === 0 &&
        !prepTriggeredRef.current
      ) {
        prepTriggeredRef.current = true
        onPrepCompleteRef.current?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  return getTimerRemainingSeconds(timer)
}
