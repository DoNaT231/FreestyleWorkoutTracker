/**
 * Freestyle Workout Tracker – új edzés indítása
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Opcionális edzésnév → automatikus „Edzés N” ha üres.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import LogoutButton from '../components/layout/LogoutButton'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useActiveWorkout } from '../hooks/useActiveWorkout'

export default function NewWorkoutPage() {
  const navigate = useNavigate()
  const { startNewWorkout, hasActiveWorkout } = useActiveWorkout()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (hasActiveWorkout) {
        setError('Már van aktív edzésed. Folytasd vagy zárd le előbb.')
        setSubmitting(false)
        return
      }

      await startNewWorkout(name)
      navigate('/workout/active', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Nem sikerült elindítani az edzést.')
      setSubmitting(false)
    }
  }

  return (
    <AppLayout
      title="Új edzés"
      subtitle="A név opcionális – üresen „Edzés N” lesz"
      headerActions={<LogoutButton />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="workout-name"
          label="Edzés neve (opcionális)"
          placeholder="pl. Kondipark húzó nap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />

        {error && (
          <p
            className="rounded-xl border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="xl" disabled={submitting}>
          {submitting ? 'Indítás...' : 'Edzés indítása'}
        </Button>
      </form>

      <Link to="/" className="block">
        <Button variant="ghost" size="md" disabled={submitting}>
          ← Vissza a főmenübe
        </Button>
      </Link>
    </AppLayout>
  )
}
