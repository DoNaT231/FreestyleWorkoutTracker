/**
 * Freestyle Workout Tracker – edzésenkénti volume / erőszint (Recharts)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  formatEstimated1RM,
  formatScorePoints,
} from '../../utils/scoring/format'
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_PRIMARY,
  CHART_PRIMARY_FILL,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
} from './chartTheme'
import ChartToggleGroup from './ChartToggleGroup'

const METRICS = [
  { id: 'volume', label: 'Edzésterhelés' },
  { id: 'strength', label: 'Erőszint' },
]

const CHART_TYPES = [
  { id: 'bar', label: 'Oszlop' },
  { id: 'line', label: 'Vonal' },
]

function getMetricValue(item, metricId) {
  if (metricId === 'strength') {
    return item.bestEstimated1RM ?? 0
  }
  return item.trainingLoad ?? 0
}

function formatMetricValue(metricId, value) {
  if (value == null || value <= 0) return '—'
  if (metricId === 'strength') return formatEstimated1RM(value)
  return formatScorePoints(value)
}

function chartMinWidth(pointCount) {
  return Math.max(pointCount * 56, 300)
}

/**
 * @param {object} props
 * @param {object[]} props.series – buildWorkoutScoreSeries() kimenete
 */
export default function WorkoutScoreChart({ series }) {
  const [metricId, setMetricId] = useState('volume')
  const [chartType, setChartType] = useState('bar')

  const chartData = useMemo(
    () =>
      (series ?? []).map((item) => ({
        label: item.label,
        value: getMetricValue(item, metricId),
        title: item.title,
      })),
    [series, metricId],
  )

  const hasStrengthData = series?.some((item) => item.bestEstimated1RM != null)
  const hasVolumeData = series?.some((item) => (item.trainingLoad ?? 0) > 0)
  const hasActiveData =
    metricId === 'strength' ? hasStrengthData : hasVolumeData

  if (!series?.length) {
    return (
      <p className="text-sm text-slate-500">
        Ebben az időszakban nincs megjeleníthető edzés.
      </p>
    )
  }

  const latest = chartData[chartData.length - 1]
  const best = chartData.reduce(
    (acc, item) => (item.value > (acc?.value ?? 0) ? item : acc),
    null,
  )

  const tooltipFormatter = (value) => formatMetricValue(metricId, value)
  const chartWidth = chartMinWidth(chartData.length)
  const xAxisAngle = chartData.length > 6 ? -35 : 0
  const xAxisHeight = chartData.length > 6 ? 52 : 32

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ChartToggleGroup
          options={METRICS}
          value={metricId}
          onChange={setMetricId}
        />
        <ChartToggleGroup
          options={CHART_TYPES}
          value={chartType}
          onChange={setChartType}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {metricId === 'volume'
          ? 'Edzésenkénti összes edzésterhelés (volume pont).'
          : 'Edzésenkénti legjobb becsült 1RM az adott alkalomról.'}
      </p>

      {!hasActiveData ? (
        <p className="mt-4 text-sm text-slate-500">
          {metricId === 'strength'
            ? 'Ebben az időszakban nincs ismétléses gyakorlatból számolt erőszint.'
            : 'Ebben az időszakban nincs számítható edzésterhelés (hiányzó testsúly?).'}
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto pb-1">
          <div style={{ width: chartWidth, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: -12, bottom: 4 }}
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
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                    formatter={tooltipFormatter}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.title ?? ''
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_PRIMARY_FILL}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: -12, bottom: 4 }}
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
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                    formatter={tooltipFormatter}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.title ?? ''
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_PRIMARY}
                    strokeWidth={2.5}
                    dot={{ fill: CHART_PRIMARY, stroke: '#064e3b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {hasActiveData && latest && (
        <div className="mt-4 space-y-1 border-t border-slate-800 pt-3 text-sm">
          <p className="flex justify-between gap-2 text-slate-400">
            <span>Legutóbbi edzés</span>
            <span className="font-medium tabular-nums text-white">
              {formatMetricValue(metricId, latest.value)}
            </span>
          </p>
          {best && best.label !== latest.label && best.value > 0 && (
            <p className="flex justify-between gap-2 text-slate-400">
              <span>Legjobb az időszakban</span>
              <span className="font-medium tabular-nums text-emerald-400">
                {formatMetricValue(metricId, best.value)}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
