/**
 * Freestyle Workout Tracker – görgethető számválasztó
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Mobil stílusú picker – momentum görgetés, szám mindig középre igazítva.
 */

import { useCallback, useEffect, useRef } from 'react'

const VISIBLE_HEIGHT = 264
const ITEM_HEIGHT = 48
const PADDING_Y = (VISIBLE_HEIGHT - ITEM_HEIGHT) / 2
const FRICTION = 0.94
const MIN_VELOCITY = 0.4
const MOMENTUM_SCALE = 18
const WHEEL_MULTIPLIER = 2.2

/**
 * @param {object} props
 * @param {number} props.value
 * @param {(n: number) => void} props.onChange
 * @param {number} [props.min=0]
 * @param {number} [props.max=50]
 * @param {string} [props.unitLabel] – pl. „ismétlés” vagy „mp”
 */
export default function ScrollNumberPicker({
  value,
  onChange,
  min = 0,
  max = 50,
  unitLabel = 'ismétlés',
}) {
  const listRef = useRef(null)
  const isUserScrollingRef = useRef(false)
  const momentumFrameRef = useRef(null)
  const snapTimeoutRef = useRef(null)
  const lastPointerYRef = useRef(0)
  const lastPointerTimeRef = useRef(0)
  const velocityRef = useRef(0)
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  const minRef = useRef(min)
  const maxIndexRef = useRef(0)

  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const maxIndex = numbers.length - 1
  maxIndexRef.current = maxIndex

  useEffect(() => {
    valueRef.current = value
    onChangeRef.current = onChange
    minRef.current = min
  }, [value, onChange, min])

  const clampIndex = useCallback(
    (index) => Math.min(Math.max(index, 0), maxIndex),
    [maxIndex],
  )

  const indexFromScrollTop = useCallback(
    (scrollTop) => clampIndex(Math.round(scrollTop / ITEM_HEIGHT)),
    [clampIndex],
  )

  const scrollTopForIndex = useCallback(
    (index) => clampIndex(index) * ITEM_HEIGHT,
    [clampIndex],
  )

  const scrollToIndex = useCallback(
    (index) => {
      if (!listRef.current) return
      listRef.current.scrollTop = scrollTopForIndex(index)
    },
    [scrollTopForIndex],
  )

  const emitValue = useCallback(
    (index) => {
      const next = numbers[clampIndex(index)]
      if (next !== valueRef.current) onChange(next)
    },
    [numbers, clampIndex, onChange],
  )

  const stopMomentum = useCallback(() => {
    if (momentumFrameRef.current != null) {
      cancelAnimationFrame(momentumFrameRef.current)
      momentumFrameRef.current = null
    }
  }, [])

  const snapToNearest = useCallback(() => {
    if (!listRef.current) return
    const index = indexFromScrollTop(listRef.current.scrollTop)
    scrollToIndex(index)
    emitValue(index)
    isUserScrollingRef.current = false
  }, [indexFromScrollTop, scrollToIndex, emitValue])

  const scheduleSnap = useCallback(() => {
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    snapTimeoutRef.current = setTimeout(() => {
      if (momentumFrameRef.current == null) snapToNearest()
    }, 100)
  }, [snapToNearest])

  const startMomentum = useCallback(
    (initialVelocity) => {
      stopMomentum()
      if (!listRef.current || Math.abs(initialVelocity) < MIN_VELOCITY) {
        snapToNearest()
        return
      }

      isUserScrollingRef.current = true
      let velocity = initialVelocity

      const step = () => {
        if (!listRef.current) return

        listRef.current.scrollTop += velocity
        velocity *= FRICTION
        emitValue(indexFromScrollTop(listRef.current.scrollTop))

        if (Math.abs(velocity) < MIN_VELOCITY) {
          momentumFrameRef.current = null
          snapToNearest()
          return
        }

        momentumFrameRef.current = requestAnimationFrame(step)
      }

      momentumFrameRef.current = requestAnimationFrame(step)
    },
    [stopMomentum, snapToNearest, emitValue, indexFromScrollTop],
  )

  useEffect(() => {
    if (isUserScrollingRef.current) return
    scrollToIndex(value - min)
  }, [value, min, scrollToIndex])

  useEffect(
    () => () => {
      stopMomentum()
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    },
    [stopMomentum],
  )

  const handleScroll = () => {
    if (!listRef.current) return
    isUserScrollingRef.current = true
    stopMomentum()
    emitValue(indexFromScrollTop(listRef.current.scrollTop))
    scheduleSnap()
  }

  const handlePointerDown = (event) => {
    stopMomentum()
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    isUserScrollingRef.current = true
    lastPointerYRef.current = event.clientY
    lastPointerTimeRef.current = performance.now()
    velocityRef.current = 0
  }

  const handlePointerMove = (event) => {
    if (event.buttons === 0 && event.pointerType !== 'touch') return
    const now = performance.now()
    const dt = Math.max(now - lastPointerTimeRef.current, 8)
    const dy = lastPointerYRef.current - event.clientY
    velocityRef.current = (dy / dt) * 16
    lastPointerYRef.current = event.clientY
    lastPointerTimeRef.current = now
  }

  const handlePointerUp = () => {
    startMomentum(velocityRef.current * MOMENTUM_SCALE)
  }

  const snapToNearestRef = useRef(snapToNearest)
  const scheduleSnapRef = useRef(scheduleSnap)
  const startMomentumRef = useRef(startMomentum)

  useEffect(() => {
    snapToNearestRef.current = snapToNearest
    scheduleSnapRef.current = scheduleSnap
    startMomentumRef.current = startMomentum
  }, [snapToNearest, scheduleSnap, startMomentum])

  // wheel: passive: false kell, különben preventDefault hibát dob a böngésző
  useEffect(() => {
    const list = listRef.current
    if (!list) return undefined

    const onWheel = (event) => {
      event.preventDefault()
      stopMomentum()
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
      isUserScrollingRef.current = true

      const delta = event.deltaY * WHEEL_MULTIPLIER
      list.scrollTop += delta

      const index = Math.min(
        Math.max(Math.round(list.scrollTop / ITEM_HEIGHT), 0),
        maxIndexRef.current,
      )
      const next = minRef.current + index
      if (next !== valueRef.current) onChangeRef.current(next)

      if (Math.abs(delta) > 8) {
        startMomentumRef.current(delta * 0.35)
      } else {
        scheduleSnapRef.current()
      }
    }

    list.addEventListener('wheel', onWheel, { passive: false })
    return () => list.removeEventListener('wheel', onWheel)
  }, [stopMomentum])

  return (
    <div className="flex flex-col items-center">
      <p className="mb-2 text-sm text-slate-400">Mennyi sikerült?</p>
      <div
        className="relative w-full max-w-xs"
        style={{ height: VISIBLE_HEIGHT }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-emerald-500/50 bg-emerald-500/10"
          style={{ height: ITEM_HEIGHT }}
        />
        <ul
          ref={listRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-full touch-pan-y overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            paddingTop: PADDING_Y,
            paddingBottom: PADDING_Y,
            scrollPaddingTop: PADDING_Y,
            scrollPaddingBottom: PADDING_Y,
          }}
        >
          {numbers.map((num) => (
            <li
              key={num}
              className={`flex items-center justify-center text-2xl font-semibold leading-none tabular-nums ${
                num === value ? 'text-emerald-400' : 'text-slate-500'
              }`}
              style={{ height: ITEM_HEIGHT, minHeight: ITEM_HEIGHT }}
            >
              {num}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-xs text-slate-500">{unitLabel}</p>
    </div>
  )
}
