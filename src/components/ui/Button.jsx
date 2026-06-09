/**
 * Freestyle Workout Tracker – újrafelhasználható gomb komponens
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobil-first nagy érintési felületű gombok az edzés közbeni használathoz.
 * variant: szín/stílus, size: magasság és betűméret.
 */

// Gomb „típusok” – Tailwind osztályok csoportja szín és hover alapján
const variants = {
  primary:
    'bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:bg-emerald-600',
  secondary:
    'bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
}

// Méret presetek – min-h biztosítja a nagy ujjbarát magasságot
const sizes = {
  sm: 'min-h-10 px-4 text-sm',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-6 text-lg font-semibold',
  xl: 'min-h-16 px-8 text-xl font-bold',
}

/**
 * @param {object} props
 * @param {React.ReactNode} props.children – gomb szövege / tartalma
 * @param {'primary'|'secondary'|'danger'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='lg']
 * @param {string} [props.className=''] – extra Tailwind osztályok
 * @param {string} [props.type='button']
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'lg',
  className = '',
  type = 'button',
  ...props // onClick, disabled, aria-* stb. továbbadása a natív <button>-nek
}) {
  return (
    <button
      type={type}
      className={`inline-flex w-full items-center justify-center rounded-2xl transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
