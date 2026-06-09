/**
 * Freestyle Workout Tracker – useActiveWorkout hook
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useContext } from 'react'
import { ActiveWorkoutContext } from '../context/activeWorkoutContext'

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext)

  if (!context) {
    throw new Error(
      'useActiveWorkout csak ActiveWorkoutProvider-en belül használható.',
    )
  }

  return context
}
