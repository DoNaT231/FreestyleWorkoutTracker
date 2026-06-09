/**
 * Freestyle Workout Tracker – edzésnapló (placeholder)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * A korábbi edzések listája – a 6. fázisban kap Firestore integrációt.
 */

import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'

export default function WorkoutHistoryPage() {
  return (
    <AppLayout
      title="Edzésnapló"
      subtitle="Korábbi edzéseid"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
    >
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">Hamarosan</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Az edzésnapló a következő fázisban érkezik: korábbi edzések
          listázása Firestore-ból, részletek megnyitása, törlés.
        </p>
      </section>
    </AppLayout>
  )
}
