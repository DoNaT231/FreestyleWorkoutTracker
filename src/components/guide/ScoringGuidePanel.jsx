/**
 * Freestyle Workout Tracker – pontszámítás útmutató panel
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import {
  SCORING_GUIDE_FOOTER,
  SCORING_GUIDE_INTRO,
  SCORING_GUIDE_SECTIONS,
} from '../../content/scoringGuide'
import ScoringGuideSection from './ScoringGuideSection'

/**
 * @param {object} [props]
 * @param {boolean} [props.compactIntro]
 */
export default function ScoringGuidePanel({ compactIntro = false }) {
  return (
    <div className="flex flex-col gap-4">
      <section
        className={`rounded-2xl border border-slate-800 bg-slate-900 ${compactIntro ? 'p-4' : 'p-5'}`}
      >
        <h2
          className={
            compactIntro
              ? 'text-base font-semibold text-white'
              : 'text-xl font-semibold text-white'
          }
        >
          {SCORING_GUIDE_INTRO.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {SCORING_GUIDE_INTRO.summary}
        </p>
      </section>

      {SCORING_GUIDE_SECTIONS.map((section) => (
        <ScoringGuideSection key={section.id} section={section} />
      ))}

      <p className="px-1 text-center text-xs leading-relaxed text-slate-500">
        {SCORING_GUIDE_FOOTER}
      </p>
    </div>
  )
}
