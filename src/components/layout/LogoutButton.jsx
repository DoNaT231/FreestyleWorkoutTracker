/**
 * Freestyle Workout Tracker – kijelentkezés gomb
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Újrafelhasználható fejléc gomb a védett oldalakhoz.
 */

import { useState } from 'react'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { getAuthErrorMessage } from '../../utils/authErrors'

export default function LogoutButton() {
  const { logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    setError('')
    setLoggingOut(true)

    try {
      await logout()
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="!w-auto shrink-0 px-3"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? '...' : 'Kijelentkezés'}
      </Button>
      {error && (
        <span className="max-w-[140px] text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  )
}
