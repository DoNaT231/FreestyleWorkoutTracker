/**
 * Freestyle Workout Tracker – félbehagyott edzés visszaállítás
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Folytatás vagy mentés és lezárás. Teljes törlés nincs itt –
 * az edzésnaplóból lehet később törölni (véletlen nyomás ellen).
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import { useActiveWorkout } from '../../hooks/useActiveWorkout'

export default function RestoreWorkoutModal() {
  const navigate = useNavigate()
  const { workout, completeWorkout } = useActiveWorkout()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!workout) return null

  const handleContinue = () => {
    navigate('/workout/active')
  }

  const handleSaveAndFinish = async () => {
    setError('')
    setSaving(true)

    try {
      const result = await completeWorkout()
      if (result?.syncStatus === 'pendingSync') {
        setError(
          'Az edzés elmentve offline – szinkronizálás később, de bezárhatod.',
        )
        setTimeout(() => navigate('/', { replace: true }), 2000)
        return
      }
      navigate('/', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Nem sikerült menteni az edzést. Próbáld újra vagy folytasd.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl"
        role="dialog"
        aria-labelledby="restore-title"
      >
        <h2 id="restore-title" className="text-lg font-semibold text-white">
          Van egy félbehagyott edzésed
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          <span className="font-medium text-white">{workout.name}</span>
          {workout.exercises.length > 0 && (
            <> · {workout.exercises.length} gyakorlat</>
          )}
        </p>

        {error && (
          <p
            className="mt-3 rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" onClick={handleContinue} disabled={saving}>
            Folytatás
          </Button>
          <Button
            variant="secondary"
            onClick={handleSaveAndFinish}
            disabled={saving}
          >
            {saving ? 'Mentés...' : 'Mentés és lezárás'}
          </Button>
        </div>
      </div>
    </div>
  )
}
