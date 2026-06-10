/**
 * Freestyle Workout Tracker – profil beállítás emlékeztető
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function ProfileSetupCard() {
  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <h2 className="font-semibold text-white">Add meg a testsúlyod</h2>
      <p className="mt-2 text-sm text-slate-300">
        A pontosabb edzésterhelés számításhoz rögzítsd az aktuális testsúlyod –
        később követheted a változását is.
      </p>
      <Link to="/profile" className="mt-4 block">
        <Button size="md">Profil beállítása</Button>
      </Link>
    </section>
  )
}
