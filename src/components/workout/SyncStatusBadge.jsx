/**
 * Freestyle Workout Tracker – szinkron állapot jelzés
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { SYNC_STATUS } from '../../constants/workout'

export default function SyncStatusBadge({ syncStatus }) {
  if (syncStatus === SYNC_STATUS.SYNCED) {
    return (
      <span className="text-xs font-medium text-emerald-400">Mentve</span>
    )
  }

  if (syncStatus === SYNC_STATUS.PENDING) {
    return (
      <span className="text-xs font-medium text-amber-400">
        Offline mentve · szinkron folyamatban
      </span>
    )
  }

  return null
}
