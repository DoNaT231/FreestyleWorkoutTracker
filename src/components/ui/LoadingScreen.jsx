/**
 * Freestyle Workout Tracker – betöltő képernyő
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Auth állapot ellenőrzése közben jelenik meg (onAuthStateChanged).
 */

export default function LoadingScreen({ message = 'Betöltés...' }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center bg-slate-950 px-4">
      {/* Egyszerű spinner – nincs külső ikon library */}
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-500"
        role="status"
        aria-label={message}
      />
      <p className="mt-4 text-sm text-slate-400">{message}</p>
    </div>
  )
}
