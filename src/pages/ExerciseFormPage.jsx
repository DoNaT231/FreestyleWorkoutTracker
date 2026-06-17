/**
 * Freestyle Workout Tracker – gyakorlat létrehozás / szerkesztés oldal
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Route-ok:
 *   /exercises/new        → új saját gyakorlat
 *   /exercises/:id/edit   → meglévő szerkesztése
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ExerciseForm from '../components/exercises/ExerciseForm'
import AppLayout from '../components/layout/AppLayout'
import LogoutButton from '../components/layout/LogoutButton'
import LoadingScreen from '../components/ui/LoadingScreen'
import { useAuth } from '../hooks/useAuth'
import { isGuestUser } from '../utils/guestUser'
import {
  createUserExercise,
  fetchUserExercise,
  updateUserExercise,
} from '../services/exerciseService'
import {
  EMPTY_EXERCISE_FORM,
  exerciseToFormValues,
  formValuesToExercisePayload,
  validateExerciseForm,
} from '../utils/exerciseForm'

export default function ExerciseFormPage() {
  const { exerciseId } = useParams()
  const isEdit = Boolean(exerciseId)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [values, setValues] = useState(EMPTY_EXERCISE_FORM)
  const [loadingExercise, setLoadingExercise] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Szerkesztésnél betöltjük a meglévő gyakorlatot
  useEffect(() => {
    if (!isEdit || !user) return

    let cancelled = false

    async function load() {
      setLoadingExercise(true)
      setError('')

      try {
        const exercise = await fetchUserExercise(user.uid, exerciseId)
        if (cancelled) return

        if (!exercise) {
          setError('A gyakorlat nem található.')
          return
        }

        setValues(exerciseToFormValues(exercise))
      } catch (err) {
        console.error(err)
        if (!cancelled) setError('Nem sikerült betölteni a gyakorlatot.')
      } finally {
        if (!cancelled) setLoadingExercise(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isEdit, user, exerciseId])

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (isGuestUser(user)) {
      setError(
        'Demó módban nem menthetsz gyakorlatot. Regisztrálj a saját naplódhoz.',
      )
      return
    }

    const validationError = validateExerciseForm(values)
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    const payload = formValuesToExercisePayload(values)

    try {
      if (isEdit) {
        await updateUserExercise(user.uid, exerciseId, payload)
      } else {
        await createUserExercise(user.uid, payload)
      }
      navigate('/exercises', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Nem sikerült menteni a gyakorlatot.')
      setSubmitting(false)
    }
  }

  if (loadingExercise) {
    return <LoadingScreen message="Gyakorlat betöltése..." />
  }

  return (
    <AppLayout
      title={isEdit ? 'Gyakorlat szerkesztése' : 'Új gyakorlat'}
      subtitle="Saját gyakorlat – csak a te fiókodban látszik"
      headerActions={<LogoutButton />}
    >
      <ExerciseForm
        values={values}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={isEdit ? 'Módosítások mentése' : 'Gyakorlat létrehozása'}
        error={error}
      />

      <Link
        to="/exercises"
        className="block text-center text-sm text-slate-400 hover:text-white"
      >
        ← Vissza a gyakorlatokhoz
      </Link>
    </AppLayout>
  )
}
