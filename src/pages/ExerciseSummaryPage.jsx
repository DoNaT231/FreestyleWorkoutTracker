/**
 * Freestyle Workout Tracker – gyakorlat összegző képernyő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Szettek átnézése, hiányzó ismétlések kitöltése, mentés.
 * Törlés itt nincs – az edzésnaplóból lehet később törölni.
 */

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { SET_STATUS } from '../constants/workout'
import AppLayout from '../components/layout/AppLayout'
import LogoutButton from '../components/layout/LogoutButton'
import ScrollNumberPicker from '../components/workout/ScrollNumberPicker'
import Button from '../components/ui/Button'
import { useActiveWorkout } from '../hooks/useActiveWorkout'
import { loadLastCompletedWorkout } from '../services/lastWorkoutSummaryStorage'

export default function ExerciseSummaryPage() {
  const navigate = useNavigate()
  const {
    workout,
    getCurrentExercise,
    updateSetReps,
    clearCurrentExerciseSelection,
    completeWorkout,
  } = useActiveWorkout()

  const current = getCurrentExercise()
  const [editingSetId, setEditingSetId] = useState(null)
  const [pickerValue, setPickerValue] = useState(8)
  const [busy, setBusy] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [error, setError] = useState('')

  if (!workout && !finishing) {
    const last = loadLastCompletedWorkout()
    if (last) {
      return (
        <Navigate to="/workout/done" replace state={{ workout: last }} />
      )
    }
    return <Navigate to="/" replace />
  }

  if (!workout) {
    return null
  }

  const exercise =
    current ??
    [...workout.exercises].reverse().find((ex) => ex.status === 'completed')

  if (!exercise) {
    return <Navigate to="/workout/active" replace />
  }

  const missingCount = exercise.sets.filter(
    (set) => set.status === SET_STATUS.MISSING_REPS,
  ).length

  const handleSaveSet = async () => {
    if (!editingSetId) return
    setBusy(true)
    await updateSetReps(editingSetId, pickerValue)
    setEditingSetId(null)
    setBusy(false)
  }

  const handleNewExercise = async () => {
    setBusy(true)
    setError('')
    await clearCurrentExerciseSelection()
    navigate('/workout/active')
  }

  const handleFinishWorkout = async () => {
    setBusy(true)
    setFinishing(true)
    setError('')

    try {
      const cleared = await clearCurrentExerciseSelection()
      const completed = await completeWorkout(cleared)
      if (!completed) {
        setFinishing(false)
        setError('Nem sikerült befejezni az edzést.')
        setBusy(false)
        return
      }
      navigate('/workout/done', { replace: true, state: { workout: completed } })
    } catch (err) {
      console.error(err)
      setFinishing(false)
      setError('Nem sikerült befejezni az edzést. Ellenőrizd a kapcsolatot.')
      setBusy(false)
    }
  }

  return (
    <AppLayout
      title={`${exercise.name} összegzés`}
      subtitle="Ellenőrizd a szetteket mentés előtt"
      headerActions={<LogoutButton />}
    >
      {missingCount > 0 && (
        <p className="rounded-xl border border-amber-900/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          Van {missingCount} szett, ahol még nincs megadva az érték. Elmented
          így is, vagy töltsd ki most.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {exercise.sets.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-700 px-4 py-4 text-center text-sm text-slate-500">
            Nincs rögzített szett ehhez a gyakorlathoz.
          </li>
        ) : (
          exercise.sets.map((set) => (
            <li
              key={set.localId}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <div>
                <span className="font-medium text-white">
                  {set.setNumber}. szett
                </span>
                <span className="ml-2 text-sm text-slate-400">
                  {set.reps != null
                    ? exercise.type === 'time'
                      ? `${set.reps} mp`
                      : `${set.reps} ismétlés`
                    : 'nincs megadva'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="!w-auto px-3"
                onClick={() => {
                  setEditingSetId(set.localId)
                  setPickerValue(set.reps ?? 8)
                }}
              >
                Módosítás
              </Button>
            </li>
          ))
        )}
      </ul>

      {editingSetId && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <ScrollNumberPicker
            value={pickerValue}
            onChange={setPickerValue}
            min={0}
            max={exercise.type === 'time' ? 300 : 50}
            unitLabel={exercise.type === 'time' ? 'másodperc' : 'ismétlés'}
          />
          <Button className="mt-4" disabled={busy} onClick={handleSaveSet}>
            Érték mentése
          </Button>
        </div>
      )}

      {error && (
        <p
          className="rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="text-center text-sm text-slate-400">Elmented így?</p>

      <Button size="lg" disabled={busy} onClick={handleNewExercise}>
        Mentés – új gyakorlat
      </Button>
      <Button variant="secondary" disabled={busy} onClick={handleFinishWorkout}>
        {busy ? 'Mentés...' : 'Mentés – edzés befejezése'}
      </Button>
    </AppLayout>
  )
}
