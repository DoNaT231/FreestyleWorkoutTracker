/**
 * Freestyle Workout Tracker – egyszerű CSS oszlopdiagram
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

/**
 * @param {object} props
 * @param {{ label: string, value: number, title?: string }[]} props.data
 * @param {string} [props.valueSuffix]
 */
export default function SimpleBarChart({ data, valueSuffix = '' }) {
  if (!data?.length) return null

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values)

  return (
    <div className="mt-3">
      <div className="flex h-32 items-end gap-1.5">
        {data.map((item) => {
          const heightPct = item.value > 0 ? (item.value / max) * 85 + 10 : 4

          return (
            <div
              key={item.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={item.title ?? `${item.label}: ${item.value}${valueSuffix}`}
            >
              <span className="text-[10px] tabular-nums text-slate-500">
                {item.value > 0 ? Math.round(item.value) : ''}
              </span>
              <div
                className="w-full min-h-[3px] rounded-t-md bg-emerald-500/80 transition-all"
                style={{ height: `${heightPct}%` }}
              />
              <span className="max-w-full truncate text-[9px] text-slate-600">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
      {values.some((v) => v > 0) && (
        <div className="mt-2 flex justify-between text-[10px] text-slate-600">
          <span>min: {Math.round(min)}</span>
          <span>max: {Math.round(max)}</span>
        </div>
      )}
    </div>
  )
}
