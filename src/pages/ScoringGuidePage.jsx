/**
 * Freestyle Workout Tracker – pontszámítás útmutató oldal
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useNavigate } from 'react-router-dom'
import ScoringGuidePanel from '../components/guide/ScoringGuidePanel'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/ui/Button'

export default function ScoringGuidePage() {
  const navigate = useNavigate()

  return (
    <AppLayout
      title="Pontszámok magyarázata"
      subtitle="Barátságos útmutató – mit jelentenek a számok?"
      mainClassName="overflow-hidden"
      footer={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Vissza
        </Button>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <ScoringGuidePanel />
      </div>
    </AppLayout>
  )
}
