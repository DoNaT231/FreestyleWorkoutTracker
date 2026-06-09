/**
 * Freestyle Workout Tracker – edzésnapló kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Egy korábbi edzés rövid összefoglalója a listában.
 */

import { Link } from 'react-router-dom'
import { WORKOUT_STATUS } from '../../constants/workout'
import { formatWorkoutDateShort } from '../../utils/formatDate'
import { getWorkoutStats } from '../../utils/workoutDisplay'

/**
 * @param {object} props
 * @param {object} props.workout
 */
export default function WorkoutHistoryCard({ workout }) {
  const { exerciseCount, setCount } = getWorkoutStats(workout)
  const dateSource = workout.finishedAt ?? workout.startedAt
  const isCompleted = workout.status === WORKOUT_STATUS.COMPLETED

  return (
    <Link
      to={`/history/${workout.firestoreId}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-600"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">{workout.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {formatWorkoutDateShort(dateSource)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {exerciseCount} gyakorlat · {setCount} szett
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-amber-500/15 text-amber-400'
          }`}
        >
          {isCompleted ? 'Kész' : 'Félbehagyva'}
        </span>
      </div>
    </Link>
  )
}
