/**
 * Freestyle Workout Tracker – egy pontszám-típus útmutató kártya
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 */

import { useState } from 'react'

const ACCENT_STYLES = {
  emerald: {
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300',
    button: 'text-emerald-400 hover:text-emerald-300',
  },
  blue: {
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/15 text-blue-300',
    button: 'text-blue-400 hover:text-blue-300',
  },
  violet: {
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/15 text-violet-300',
    button: 'text-violet-400 hover:text-violet-300',
  },
  amber: {
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300',
    button: 'text-amber-400 hover:text-amber-300',
  },
  cyan: {
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/15 text-cyan-300',
    button: 'text-cyan-400 hover:text-cyan-300',
  },
  slate: {
    border: 'border-slate-600',
    badge: 'bg-slate-700/80 text-slate-300',
    button: 'text-slate-300 hover:text-white',
  },
  rose: {
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/15 text-rose-300',
    button: 'text-rose-400 hover:text-rose-300',
  },
}

function DetailBlock({ block }) {
  if (block.type === 'paragraph') {
    return <p className="text-sm leading-relaxed text-slate-300">{block.text}</p>
  }

  if (block.type === 'formula') {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-3">
        {block.label && (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {block.label}
          </p>
        )}
        <ul className={`space-y-1 font-mono text-sm text-slate-200 ${block.label ? 'mt-2' : ''}`}>
          {block.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (block.type === 'example') {
    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {block.title}
        </p>
        <pre className="mt-2 whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
          {block.lines.join('\n')}
        </pre>
      </div>
    )
  }

  if (block.type === 'list') {
    return (
      <div>
        {block.title && (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {block.title}
          </p>
        )}
        <ul
          className={`list-disc space-y-1 pl-5 text-sm text-slate-300 ${block.title ? 'mt-2' : ''}`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  if (block.type === 'tip') {
    return (
      <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-100/90">
        💡 {block.text}
      </p>
    )
  }

  return null
}

/**
 * @param {object} props
 * @param {import('../../content/scoringGuide').SCORING_GUIDE_SECTIONS[number]} props.section
 * @param {boolean} [props.defaultOpen]
 */
export default function ScoringGuideSection({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const styles = ACCENT_STYLES[section.accent] ?? ACCENT_STYLES.slate

  return (
    <article
      className={`rounded-2xl border bg-slate-900 p-4 ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
          >
            {section.badge}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-white">{section.title}</h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{section.summary}</p>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`mt-4 text-sm font-medium underline-offset-2 hover:underline ${styles.button}`}
      >
        {open ? 'Bezárás' : 'Tovább olvasok →'}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4">
          {section.details.map((block, index) => (
            <DetailBlock key={`${section.id}-${index}`} block={block} />
          ))}
        </div>
      )}
    </article>
  )
}
