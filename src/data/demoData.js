/**
 * Freestyle Workout Tracker – demó adatok vendég módhoz
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { GUEST_USER_ID } from '../constants/guest'
import { SET_STATUS, WORKOUT_STATUS } from '../constants/workout'

function daysAgo(days, hour = 10, minute = 0) {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function makeSet(setNumber, reps, extraKg = 0) {
  return {
    localId: `demo-set-${setNumber}`,
    setNumber,
    reps,
    additionalWeightKg: extraKg,
    status: SET_STATUS.COMPLETED,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
  }
}

function makeExercise({
  id,
  name,
  type,
  category,
  sets,
  bodyweightLoadFactor,
  difficultyMultiplier = 1,
  staticHoldFactor = 0,
}) {
  return {
    localId: `demo-ex-${id}`,
    exerciseId: id,
    source: 'default',
    name,
    categories: [category],
    category,
    primaryCategory: category,
    type,
    restSeconds: 90,
    prepSeconds: 10,
    supportsAdditionalWeight: type === 'reps' && id.includes('pullup'),
    bodyweightLoadFactor,
    difficultyMultiplier,
    staticHoldFactor: staticHoldFactor || null,
    status: 'completed',
    sets,
  }
}

function makeWorkout({
  id,
  name,
  daysBack,
  durationMinutes,
  exercises,
  bodyWeight = 78,
}) {
  const startedAt = daysAgo(daysBack, 18, 0)
  const finishedAt = new Date(
    new Date(startedAt).getTime() + durationMinutes * 60 * 1000,
  ).toISOString()

  return {
    firestoreId: id,
    userId: GUEST_USER_ID,
    name,
    customName: false,
    isDemo: true,
    status: WORKOUT_STATUS.COMPLETED,
    startedAt,
    finishedAt,
    durationSeconds: durationMinutes * 60,
    bodyWeightKgAtWorkout: bodyWeight,
    heightCmAtWorkout: 178,
    syncStatus: 'synced',
    exercises,
  }
}

export const DEMO_PROFILE = {
  bodyWeightKg: 78,
  heightCm: 178,
  updatedAt: daysAgo(2),
}

export const DEMO_WEIGHT_LOG = [
  { id: 'demo-w1', weightKg: 80, recordedAt: daysAgo(56) },
  { id: 'demo-w2', weightKg: 79.5, recordedAt: daysAgo(42) },
  { id: 'demo-w3', weightKg: 79, recordedAt: daysAgo(28) },
  { id: 'demo-w4', weightKg: 78.5, recordedAt: daysAgo(14) },
  { id: 'demo-w5', weightKg: 78, recordedAt: daysAgo(3) },
]

export const DEMO_USER_EXERCISES = [
  {
    id: 'demo_custom_muscleup',
    name: 'Muscle-up (demó)',
    category: 'skill',
    primaryCategory: 'skill',
    categories: ['skill', 'pull', 'push'],
    type: 'reps',
    defaultRestSeconds: 120,
    defaultPrepSeconds: 10,
    supportsAdditionalWeight: false,
    bodyweightLoadFactor: 1,
    difficultyMultiplier: 1.5,
    staticHoldFactor: null,
    isDefault: false,
  },
]

export function getDemoWorkouts() {
  return [
    makeWorkout({
      id: 'demo-workout-1',
      name: 'Edzés 6',
      daysBack: 2,
      durationMinutes: 52,
      exercises: [
        makeExercise({
          id: 'normal_pullup',
          name: 'Normál húzódzkodás',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [
            makeSet(1, 10),
            makeSet(2, 9),
            makeSet(3, 8),
            makeSet(4, 7),
          ],
        }),
        makeExercise({
          id: 'dip',
          name: 'Tolódzkodás',
          type: 'reps',
          category: 'push',
          bodyweightLoadFactor: 0.85,
          sets: [makeSet(1, 12), makeSet(2, 10), makeSet(3, 9)],
        }),
        makeExercise({
          id: 'plank',
          name: 'Plank',
          type: 'time',
          category: 'core',
          bodyweightLoadFactor: 0,
          staticHoldFactor: 0.03,
          sets: [makeSet(1, 75), makeSet(2, 60)],
        }),
      ],
    }),
    makeWorkout({
      id: 'demo-workout-2',
      name: 'Edzés 5',
      daysBack: 5,
      durationMinutes: 48,
      exercises: [
        makeExercise({
          id: 'normal_pullup',
          name: 'Normál húzódzkodás',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [
            makeSet(1, 9),
            makeSet(2, 8),
            makeSet(3, 8),
            makeSet(4, 6),
          ],
        }),
        makeExercise({
          id: 'pushup',
          name: 'Fekvőtámasz',
          type: 'reps',
          category: 'push',
          bodyweightLoadFactor: 0.65,
          sets: [makeSet(1, 25), makeSet(2, 22), makeSet(3, 20)],
        }),
      ],
    }),
    makeWorkout({
      id: 'demo-workout-3',
      name: 'Edzés 4',
      daysBack: 9,
      durationMinutes: 55,
      bodyWeight: 78.5,
      exercises: [
        makeExercise({
          id: 'normal_pullup',
          name: 'Normál húzódzkodás',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [
            makeSet(1, 8, 2.5),
            makeSet(2, 7, 2.5),
            makeSet(3, 6, 2.5),
          ],
        }),
        makeExercise({
          id: 'bodyweight_squat',
          name: 'Saját testsúlyos guggolás',
          type: 'reps',
          category: 'legs',
          bodyweightLoadFactor: 0.75,
          sets: [makeSet(1, 20), makeSet(2, 18), makeSet(3, 15)],
        }),
        makeExercise({
          id: 'handstand_hold',
          name: 'Handstand hold',
          type: 'time',
          category: 'skill',
          bodyweightLoadFactor: 0,
          staticHoldFactor: 0.035,
          difficultyMultiplier: 1.4,
          sets: [makeSet(1, 25), makeSet(2, 20)],
        }),
      ],
    }),
    makeWorkout({
      id: 'demo-workout-4',
      name: 'Edzés 3',
      daysBack: 14,
      durationMinutes: 45,
      bodyWeight: 79,
      exercises: [
        makeExercise({
          id: 'chinup',
          name: 'Chin-up',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [makeSet(1, 8), makeSet(2, 7), makeSet(3, 6)],
        }),
        makeExercise({
          id: 'dip',
          name: 'Tolódzkodás',
          type: 'reps',
          category: 'push',
          bodyweightLoadFactor: 0.85,
          sets: [makeSet(1, 10), makeSet(2, 9), makeSet(3, 8)],
        }),
      ],
    }),
    makeWorkout({
      id: 'demo-workout-5',
      name: 'Edzés 2',
      daysBack: 19,
      durationMinutes: 50,
      bodyWeight: 79.5,
      exercises: [
        makeExercise({
          id: 'normal_pullup',
          name: 'Normál húzódzkodás',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [makeSet(1, 7), makeSet(2, 7), makeSet(3, 6)],
        }),
        makeExercise({
          id: 'hanging_leg_raise',
          name: 'Függeszkedéses lábemelés',
          type: 'reps',
          category: 'core',
          bodyweightLoadFactor: 0.3,
          sets: [makeSet(1, 12), makeSet(2, 10)],
        }),
      ],
    }),
    makeWorkout({
      id: 'demo-workout-6',
      name: 'Edzés 1',
      daysBack: 25,
      durationMinutes: 42,
      bodyWeight: 80,
      exercises: [
        makeExercise({
          id: 'normal_pullup',
          name: 'Normál húzódzkodás',
          type: 'reps',
          category: 'pull',
          bodyweightLoadFactor: 1,
          sets: [makeSet(1, 6), makeSet(2, 6), makeSet(3, 5)],
        }),
        makeExercise({
          id: 'pushup',
          name: 'Fekvőtámasz',
          type: 'reps',
          category: 'push',
          bodyweightLoadFactor: 0.65,
          sets: [makeSet(1, 20), makeSet(2, 18)],
        }),
      ],
    }),
  ]
}

export function getAllGuestWorkouts() {
  return getDemoWorkouts()
}
