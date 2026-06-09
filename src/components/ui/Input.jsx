/**
 * Freestyle Workout Tracker – űrlap mező komponens
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobilbarát input labellel – login/register űrlapokhoz.
 */

/**
 * @param {object} props
 * @param {string} props.id – input id és label htmlFor
 * @param {string} props.label – megjelenő címke
 * @param {string} props.type – input type (email, password, text)
 */
export default function Input({
  id,
  label,
  type = 'text',
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 text-base text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        {...props}
      />
    </div>
  )
}
