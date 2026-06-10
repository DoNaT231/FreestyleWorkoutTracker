/**
 * Freestyle Workout Tracker – progress / statisztikák
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Váz oldal – a részletes statisztikák később kerülnek ide.
 */

import AppLayout from '../components/layout/AppLayout'
import AppNav from '../components/layout/AppNav'
import LogoutButton from '../components/layout/LogoutButton'

const PLACEHOLDER_SECTIONS = [
  {
    title: 'Edzés statisztikák',
    description: 'Összesített szettek, ismétlések, edzésszám és időtartam.',
  },
  {
    title: 'Edzésterhelés',
    description: 'Heti és havi terhelés trend, mozgásminták szerinti bontás.',
  },
  {
    title: 'Testsúly alakulás',
    description: 'Testsúly változás időben, célok és trend.',
  },
  {
    title: 'Rekordok',
    description: 'Személyes csúcsok gyakorlatonként és összesítve.',
  },
]

export default function ProgressPage() {
  return (
    <AppLayout
      title="Progress"
      subtitle="Statisztikák és fejlődés – hamarosan bővül"
      headerActions={<LogoutButton />}
      footer={<AppNav />}
      mainClassName="overflow-hidden"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 pb-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">
              Itt fogod látni az edzéseid, testsúlyod és rekordjaid
              összefoglalóját egy helyen.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Az alábbi szekciók hamarosan aktívak lesznek.
            </p>
          </section>

          {PLACEHOLDER_SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-4"
            >
              <h2 className="font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-slate-400">{section.description}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-600">
                Hamarosan
              </p>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
