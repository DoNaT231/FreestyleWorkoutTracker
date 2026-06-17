/**
 * Freestyle Workout Tracker – oldal keret (layout)
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobil-first layout: max ~512px széles, fejléc + görgethető tartalom + opcionális lábléc.
 * Minden belső oldal ezt a keretet használja az egységes megjelenésért.
 */

/**
 * @param {object} props
 * @param {string} [props.title] – oldal főcíme (pl. „Dashboard”, „Aktív edzés”)
 * @param {string} [props.subtitle] – alcím / rövid leírás
 * @param {React.ReactNode} props.children – oldal tartalma
 * @param {React.ReactNode} [props.footer] – alsó sáv (pl. navigáció, fix gombok)
 * @param {React.ReactNode} [props.headerActions] – fejléc jobb oldali gombok (pl. kijelentkezés)
 * @param {string} [props.mainClassName] – extra osztályok a main elemhez (pl. scroll layout)
 */
import GuestModeBanner from './GuestModeBanner'

export default function AppLayout({
  title,
  subtitle,
  children,
  footer,
  headerActions,
  mainClassName = '',
}) {
  return (
    // max-w-lg ≈ 512px – telefonon teljes szélesség, nagy képernyőn középre igazítva
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col bg-slate-950">
      <GuestModeBanner />
      <header className="border-b border-slate-800 px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* App márkanév – minden oldalon látszik */}
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-400">
              Freestyle Workout Tracker
            </p>
            {title && (
              <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {headerActions}
        </div>
      </header>

      {/* min-h-0: a belső scroll területek mobilon is működjenek flex alatt */}
      <main
        className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 ${mainClassName}`}
      >
        {children}
      </main>

      {footer && (
        <footer className="shrink-0 border-t border-slate-800 bg-slate-950 px-4 py-4">
          {footer}
        </footer>
      )}
    </div>
  )
}
