/**
 * Freestyle Workout Tracker – regisztráció oldal
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Új fiók létrehozása email + jelszóval (Firebase createUserWithEmailAndPassword).
 * Sikeres regisztráció után automatikus bejelentkezés → Dashboard.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function RegisterPage() {
  const { register, loginAsGuest } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('A két jelszó nem egyezik.')
      return
    }

    if (password.length < 6) {
      setError('A jelszó legalább 6 karakter legyen.')
      return
    }

    setSubmitting(true)

    try {
      await register(email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout title="Regisztráció" subtitle="Hozz létre új fiókot">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="pelda@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={submitting}
        />

        <Input
          id="register-password"
          label="Jelszó"
          type="password"
          autoComplete="new-password"
          placeholder="Legalább 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={submitting}
        />

        <Input
          id="register-confirm-password"
          label="Jelszó megerősítése"
          type="password"
          autoComplete="new-password"
          placeholder="Ismételd meg a jelszót"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
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
          {submitting ? 'Regisztráció...' : 'Fiók létrehozása'}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        size="md"
        disabled={submitting}
        onClick={async () => {
          setSubmitting(true)
          await loginAsGuest()
          navigate('/', { replace: true })
        }}
      >
        Előbb demó kipróbálása
      </Button>

      <p className="text-center text-sm text-slate-400">
        Van már fiókod?{' '}
        <Link
          to="/login"
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          Bejelentkezés
        </Link>
      </p>
    </AppLayout>
  )
}
