/**
 * Freestyle Workout Tracker – aktív edzés képernyő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Gyakorlat választás → pihenő beállítás → prep → aktív szett → pihenő → ismétlés.
 */

import { useCallback, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ExercisePicker from '../components/workout/ExercisePicker'
import LogoutButton from '../components/layout/LogoutButton'
import RestTimeAdjuster from '../components/workout/RestTimeAdjuster'
import ScrollNumberPicker from '../components/workout/ScrollNumberPicker'
import SyncStatusBadge from '../components/workout/SyncStatusBadge'
import Button from '../components/ui/Button'
import LoadingScreen from '../components/ui/LoadingScreen'
import { TIMER_PHASE } from '../constants/workout'
import { useActiveWorkout } from '../hooks/useActiveWorkout'
import { useExercises } from '../hooks/useExercises'
import { useWorkoutTimer } from '../hooks/useWorkoutTimer'
import { playRestTimerEndSound } from '../utils/sounds'
import { formatTimerDisplay } from '../utils/timer'

export default function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const {
    workout,
    hydrated,
    addExercise,
    adjustRestSeconds,
    startExercise,
    skipPrep,
    completePrep,
    finishActiveSet,
    updateLastSetReps,
    extendRest,
    startNextSet,
    finishCurrentExercise,
    getCurrentExercise,
  } = useActiveWorkout()

  const { defaultExercises, userExercises, loading } = useExercises()
  const [pickerReps, setPickerReps] = useState(8)
  const [busy, setBusy] = useState(false)

  const handleRestComplete = useCallback(() => {
    playRestTimerEndSound()
    startNextSet()
  }, [startNextSet])

  const remaining = useWorkoutTimer(workout?.timer, {
    onPrepComplete: completePrep,
    onRestComplete: handleRestComplete,
  })

  const current = getCurrentExercise()
  const phase = workout?.timer?.phase ?? TIMER_PHASE.IDLE

  const run = useCallback(async (action) => {
    setBusy(true)
    try {
      await action()
    } finally {
      setBusy(false)
    }
  }, [])

  if (!hydrated || loading) {
    return <LoadingScreen message="Edzés betöltése..." />
  }

  if (!workout) {
    return <Navigate to="/" replace />
  }

  const handleSelectExercise = (template, source) =>
    run(() => addExercise(template, source))

  const handleFinishExercise = () =>
    run(async () => {
      await finishCurrentExercise()
      navigate('/workout/summary')
    })

  const allExercises = [
    ...userExercises.map((ex) => ({ ...ex, source: 'custom' })),
    ...defaultExercises.map((ex) => ({ ...ex, source: 'default' })),
  ]

  // --- Gyakorlat választás ---
  if (!current) {
    return (
      <AppLayout
        title={workout.name}
        subtitle="Válassz gyakorlatot"
        headerActions={<LogoutButton />}
        mainClassName="overflow-hidden"
        footer={
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={busy}
          >
            Vissza a főmenübe
          </Button>
        }
      >
        <SyncStatusBadge syncStatus={workout.syncStatus} />
        <ExercisePicker
          exercises={allExercises}
          onSelect={handleSelectExercise}
          disabled={busy}
        />
      </AppLayout>
    )
  }

  // --- Pihenő beállítás + indítás (timer idle) ---
  if (phase === TIMER_PHASE.IDLE) {
    return (
      <AppLayout
        title={current.name}
        subtitle="Állítsd be a pihenőt, majd indítsd a gyakorlatot"
        headerActions={<LogoutButton />}
      >
        <SyncStatusBadge syncStatus={workout.syncStatus} />
        <RestTimeAdjuster
          restSeconds={current.restSeconds}
          onAdjust={(delta) => run(() => adjustRestSeconds(delta))}
          disabled={busy}
        />
        <Button size="xl" disabled={busy} onClick={() => run(() => startExercise())}>
          Gyakorlat indítása
        </Button>
        <Button
          variant="ghost"
          size="md"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await finishCurrentExercise()
              navigate('/workout/summary')
            })
          }
        >
          Gyakorlat kihagyása
        </Button>
      </AppLayout>
    )
  }

  // --- Felkészülési idő ---
  if (phase === TIMER_PHASE.PREP) {
    return (
      <AppLayout
        title={current.name}
        subtitle="Készülj fel"
        headerActions={<LogoutButton />}
      >
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <p className="text-7xl font-bold tabular-nums text-emerald-400">
            {remaining}
          </p>
          <p className="mt-2 text-slate-400">másodperc</p>
        </div>
        <Button variant="secondary" disabled={busy} onClick={() => run(() => skipPrep())}>
          Kihagyás
        </Button>
      </AppLayout>
    )
  }

  // --- Aktív szett ---
  if (phase === TIMER_PHASE.ACTIVE_SET) {
    const setNumber = current.sets.length + 1
    return (
      <AppLayout
        title={current.name}
        subtitle={`${setNumber}. szett folyamatban`}
        headerActions={<LogoutButton />}
      >
        <div className="flex flex-1 flex-col items-center justify-center py-16">
          <p className="text-2xl text-slate-400">{setNumber}. szett</p>
          <p className="mt-2 text-lg text-white">Csak csináld – majd nyomj Vége-t</p>
        </div>
        <Button size="xl" disabled={busy} onClick={() => run(() => finishActiveSet())}>
          Vége
        </Button>
      </AppLayout>
    )
  }

  // --- Pihenő + ismétlés megadása ---
  if (phase === TIMER_PHASE.REST) {
    const lastSet = current.sets[current.sets.length - 1]
    const isTimeType = current.type === 'time'
    const pickerValue =
      lastSet?.reps ?? pickerReps

    return (
      <AppLayout
        title={current.name}
        subtitle="Pihenő"
        headerActions={<LogoutButton />}
      >
        <div className="flex flex-col items-center py-6">
          <p className="text-6xl font-bold tabular-nums text-emerald-400">
            {formatTimerDisplay(remaining)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            A pihenő lejárhat – az ismétlés később is pótolható
          </p>
        </div>

        <ScrollNumberPicker
          value={pickerValue}
          onChange={(val) => {
            setPickerReps(val)
            updateLastSetReps(val)
          }}
          min={0}
          max={isTimeType ? 300 : 50}
          unitLabel={isTimeType ? 'másodperc' : 'ismétlés'}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => run(() => extendRest(10))}
          >
            +10 mp pihenő
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => run(() => extendRest(30))}
          >
            +30 mp pihenő
          </Button>
        </div>

        <Button size="xl" disabled={busy} onClick={() => run(() => startNextSet())}>
          Következő szett
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={handleFinishExercise}
        >
          Gyakorlat befejezése
        </Button>
      </AppLayout>
    )
  }

  return <Navigate to="/workout/active" replace />
}
