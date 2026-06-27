/**
 * Freestyle Workout Tracker – edzésenkénti kategória bontás (Recharts)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Húzó, toló, láb, core stb. edzésterhelés edzésenként – halmozott oszlop.
 */

import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { WORKOUT_CATEGORY_KEYS } from '../../utils/progress/workoutScoreSeries'
import { formatScorePoints } from '../../utils/scoring/format'
import { getProgressCategoryLabel } from '../../utils/progress/labels'
import {
  CATEGORY_CHART_COLORS,
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
} from './chartTheme'

function chartMinWidth(pointCount) {
  return Math.max(pointCount * 56, 300)
}

function CategoryTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const title = payload[0]?.payload?.title
  const rows = payload
    .filter((entry) => (entry.value ?? 0) > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  if (!rows.length) return null

  return (
    <div style={CHART_TOOLTIP_STYLE} className="px-3 py-2">
      <p style={CHART_TOOLTIP_LABEL_STYLE} className="mb-1.5 font-medium">
        {title ?? label}
      </p>
      <ul className="space-y-0.5">
        {rows.map((entry) => (
          <li
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {getProgressCategoryLabel(entry.dataKey)}
            </span>
            <span className="tabular-nums text-slate-100">
              {formatScorePoints(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * @param {object} props
 * @param {object[]} props.series – buildWorkoutCategorySeries() kimenete
 */
export default function WorkoutCategoryChart({ series }) {
  const activeCategories = useMemo(() => {
    const used = new Set()
    for (const row of series ?? []) {
      for (const key of WORKOUT_CATEGORY_KEYS) {
        if ((row[key] ?? 0) > 0) used.add(key)
      }
    }
    return WORKOUT_CATEGORY_KEYS.filter((key) => used.has(key))
  }, [series])

  const hasData = activeCategories.length > 0

  if (!series?.length) {
    return (
      <p className="text-sm text-slate-500">
        Ebben az időszakban nincs megjeleníthető edzés.
      </p>
    )
  }

  if (!hasData) {
    return (
      <p className="text-sm text-slate-500">
        Ebben az időszakban nincs kategória szerinti edzésterhelés (hiányzó
        testsúly vagy üres szettek).
      </p>
    )
  }

  const chartWidth = chartMinWidth(series.length)
  const xAxisAngle = series.length > 6 ? -35 : 0
  const xAxisHeight = series.length > 6 ? 52 : 32

  return (
    <div>
      <p className="text-xs text-slate-500">
        Edzésenkénti terhelés mozgásminta szerint (húzó, toló, láb, core, …).
        Egy gyakorlat több kategóriába is beleszámíthat.
      </p>

      <div className="mt-3 overflow-x-auto pb-1">
        <div style={{ width: chartWidth, height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={series}
              margin={{ top: 8, right: 8, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_GRID_STROKE}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={CHART_AXIS_TICK}
                interval={0}
                angle={xAxisAngle}
                textAnchor={xAxisAngle ? 'end' : 'middle'}
                height={xAxisHeight}
              />
              <YAxis tick={CHART_AXIS_TICK} width={42} />
              <Tooltip content={<CategoryTooltip />} />
              <Legend
                formatter={(value) => getProgressCategoryLabel(value)}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              {activeCategories.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="load"
                  fill={CATEGORY_CHART_COLORS[key]}
                  maxBarSize={44}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
