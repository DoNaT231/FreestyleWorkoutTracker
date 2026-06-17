/**
 * Freestyle Workout Tracker – bejelentkezés oldal
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Email + jelszó bejelentkezés Firebase Auth-tal.
 * Sikeres login után átirányítás a Dashboardra.
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { getAuthErrorMessage } from '../utils/authErrors'

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Ha védett oldalról jött, oda visszairányítunk; különben dashboard
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGuestLogin = async () => {
    setError('')
    setSubmitting(true)
    try {
      await loginAsGuest()
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout
      title="Bejelentkezés"
      subtitle="Jelentkezz be az edzésnaplódhoz"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="login-email"
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
          id="login-password"
          label="Jelszó"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? 'Bejelentkezés...' : 'Bejelentkezés'}
        </Button>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <p className="relative mx-auto w-fit bg-slate-950 px-3 text-xs text-slate-500">
          vagy
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="lg"
        disabled={submitting}
        onClick={handleGuestLogin}
      >
        Demó kipróbálása (vendég)
      </Button>
      <p className="text-center text-xs text-slate-500">
        Az edzések a böngésződben maradnak, a gyakorlatok a beépített
        katalógusból jönnek.
      </p>

      <p className="text-center text-sm text-slate-400">
        Nincs még fiókod?{' '}
        <Link
          to="/register"
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          Regisztráció
        </Link>
      </p>
    </AppLayout>
  )
}
