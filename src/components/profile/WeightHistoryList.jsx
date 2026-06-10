/**
 * Freestyle Workout Tracker – testsúly előzmények lista
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { formatDateOnly } from '../../utils/formatDate'

/**
 * @param {object} props
 * @param {{ id: string, weightKg: number, recordedAt: string }[]} props.entries – desc
 * @param {(entryId: string) => void} [props.onDelete]
 * @param {string} [props.deletingId]
 */
export default function WeightHistoryList({
  entries,
  onDelete,
  deletingId = '',
}) {
  if (!entries.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
        Még nincs rögzített mérés. Add hozzá az első testsúlyod!
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry, index) => {
        const older = entries[index + 1]
        const delta =
          older != null
            ? Math.round((entry.weightKg - older.weightKg) * 10) / 10
            : null

        let deltaLabel = null
        if (delta != null && delta !== 0) {
          deltaLabel = delta > 0 ? `+${delta} kg` : `${delta} kg`
        } else if (delta === 0) {
          deltaLabel = 'változatlan'
        }

        const isDeleting = deletingId === entry.id

        return (
          <li
            key={entry.id}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-400">
                {formatDateOnly(entry.recordedAt)}
              </p>
              {deltaLabel && (
                <p
                  className={`mt-0.5 truncate text-xs ${
                    delta > 0
                      ? 'text-amber-400'
                      : delta < 0
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                  }`}
                >
                  {deltaLabel}
                </p>
              )}
            </div>
            <span className="shrink-0 text-base font-semibold tabular-nums text-white">
              {entry.weightKg} kg
            </span>
            {onDelete && (
              <button
                type="button"
                aria-label="Mérés törlése"
                title="Törlés"
                disabled={Boolean(deletingId)}
                onClick={() => onDelete(entry.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-900/40 bg-red-950/40 text-red-300 transition-colors hover:bg-red-900/50 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="text-xs">…</span>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                )}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
