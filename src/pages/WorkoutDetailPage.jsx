/**
 * Freestyle Workout Tracker – edzés részletei (napló)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Egy korábbi edzés gyakorlatai és szettjei. Törlés csak itt, megerősítéssel.
 */

import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import CategoryBadge from '../components/exercises/CategoryBadge'
import AppLayout from '../components/layout/AppLayout'
import LogoutButton from '../components/layout/LogoutButton'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { SET_STATUS } from '../constants/workout'
import { getExerciseCategories } from '../constants/exerciseMeta'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { fetchWorkoutById } from '../services/workoutService'
import { isGuestUser } from '../utils/guestUser'
import { getGuestWorkoutById } from '../utils/guestWorkouts'
import { formatWorkoutDate } from '../utils/formatDate'
import { formatSetValue, getWorkoutStats } from '../utils/workoutDisplay'

export default function WorkoutDetailPage() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { removeWorkout } = useWorkoutHistory()

  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || !workoutId) return

    let cancelled = false

    if (isGuestUser(user)) {
      Promise.resolve().then(() => {
        if (cancelled) return
        const data = getGuestWorkoutById(workoutId)
        if (!data) setError('Az edzés nem található.')
        else setWorkout(data)
        setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }

    fetchWorkoutById(user.uid, workoutId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setError('Az edzés nem található.')
          return
        }
        setWorkout(data)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) setError('Nem sikerült betölteni az edzést.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, workoutId])

  const handleDelete = async () => {
    if (!workout) return

    const confirmed = window.confirm(
      `Biztosan törlöd ezt az edzést?\n\n„${workout.name}”\n\nEz nem vonható vissza.`,
    )
    if (!confirmed) return

    setDeleting(true)
    setError('')

    try {
      await removeWorkout(workout.firestoreId)
      navigate('/history', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Nem sikerült törölni az edzést.')
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingScreen message="Edzés betöltése..." />
  }

  if (!workout && error) {
    return (
      <AppLayout title="Edzés" headerActions={<LogoutButton />}>
        <p className="text-sm text-red-300">{error}</p>
        <Link to="/history">
          <Button variant="secondary">← Vissza a naplóhoz</Button>
        </Link>
      </AppLayout>
    )
  }

  if (!workout) {
    return <Navigate to="/history" replace />
  }

  const { exerciseCount, setCount, missingReps } = getWorkoutStats(workout)
  const dateSource = workout.finishedAt ?? workout.startedAt

  return (
    <AppLayout
      title={workout.name}
      subtitle={formatWorkoutDate(dateSource)}
      headerActions={<LogoutButton />}
      footer={
        <div className="flex flex-col gap-2">
          <Link to="/history">
            <Button variant="secondary">← Vissza a naplóhoz</Button>
          </Link>
          <Button variant="danger" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Törlés...' : 'Edzés törlése'}
          </Button>
        </div>
      }
      mainClassName="overflow-hidden"
    >
      <section className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Összesítés</p>
        <p className="mt-1 text-white">
          {exerciseCount} gyakorlat · {setCount} szett
          {missingReps > 0 && (
            <span className="text-amber-400">
              {' '}
              · {missingReps} hiányzó érték
            </span>
          )}
        </p>
      </section>

      {error && (
        <p
          className="shrink-0 rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-2">
          {(workout.exercises ?? []).length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Nincs rögzített gyakorlat.
            </p>
          ) : (
            workout.exercises.map((exercise) => (
              <article
                key={exercise.localId}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
              >
                <h3 className="font-semibold text-white">{exercise.name}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {getExerciseCategories(exercise).map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))}
                </div>

                <ul className="mt-4 flex flex-col gap-2">
                  {(exercise.sets ?? []).length === 0 ? (
                    <li className="text-sm text-slate-500">Nincs szett.</li>
                  ) : (
                    exercise.sets.map((set) => (
                      <li
                        key={set.localId}
                        className={`flex justify-between rounded-lg px-3 py-2 text-sm ${
                          set.status === SET_STATUS.MISSING_REPS
                            ? 'bg-amber-950/30 text-amber-200'
                            : 'bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <span>{set.setNumber}. szett</span>
                        <span>{formatSetValue(set, exercise.type)}</span>
                      </li>
                    ))
                  )}
                </ul>
              </article>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
