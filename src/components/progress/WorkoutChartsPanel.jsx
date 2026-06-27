/**
 * Freestyle Workout Tracker – edzésenkénti diagramok (összesítés + kategória)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useState } from 'react'
import ChartToggleGroup from './ChartToggleGroup'
import WorkoutCategoryChart from './WorkoutCategoryChart'
import WorkoutScoreChart from './WorkoutScoreChart'

const VIEWS = [
  { id: 'summary', label: 'Összesítés' },
  { id: 'category', label: 'Kategória bontás' },
]

/**
 * @param {object} props
 * @param {object[]} props.scoreSeries
 * @param {object[]} props.categorySeries
 */
export default function WorkoutChartsPanel({ scoreSeries, categorySeries }) {
  const [viewId, setViewId] = useState('summary')

  if (!scoreSeries?.length && !categorySeries?.length) {
    return null
  }

  return (
    <div>
      <ChartToggleGroup options={VIEWS} value={viewId} onChange={setViewId} />

      <div className="mt-4">
        {viewId === 'category' ? (
          <WorkoutCategoryChart series={categorySeries} />
        ) : (
          <WorkoutScoreChart series={scoreSeries} />
        )}
      </div>
    </div>
  )
}
