/**
 * Freestyle Workout Tracker – kiemelő insight kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

const TYPE_STYLES = {
  record: 'border-emerald-500/40 bg-emerald-500/10',
  improvement: 'border-blue-500/40 bg-blue-500/10',
  weekly: 'border-purple-500/40 bg-purple-500/10',
  stable: 'border-slate-600 bg-slate-800/50',
  first: 'border-amber-500/40 bg-amber-500/10',
}

const TITLE_COLORS = {
  record: 'text-emerald-400',
  improvement: 'text-blue-400',
  weekly: 'text-purple-400',
  stable: 'text-slate-400',
  first: 'text-amber-400',
}

export default function HighlightCard({ card }) {
  const style = TYPE_STYLES[card.type] ?? TYPE_STYLES.stable
  const titleColor = TITLE_COLORS[card.type] ?? TITLE_COLORS.stable

  return (
    <article className={`rounded-2xl border p-4 ${style}`}>
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${titleColor}`}
      >
        {card.title}
      </p>
      <p className="mt-1 font-medium text-white">{card.subtitle}</p>
      <p className="mt-2 text-lg font-bold text-white">{card.value}</p>
      {card.detail && (
        <p className="mt-1 text-sm text-slate-400">{card.detail}</p>
      )}
    </article>
  )
}
