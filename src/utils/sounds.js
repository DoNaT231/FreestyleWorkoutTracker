/**
 * Freestyle Workout Tracker – hangjelzések
 *
 * Copyright (c) 2026 Komoróczy Donát
 * Email: donatkomoroczy@gmail.com
 *
 * Web Audio API – nincs külön hangfájl, offline is működik.
 */

let audioContext = null

function getAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null

  if (!audioContext) {
    audioContext = new AudioCtx()
  }

  return audioContext
}

function playTone(ctx, frequency, startTime, duration, volume = 0.65) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = frequency
  oscillator.connect(gain)
  gain.connect(ctx.destination)

  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

/**
 * Pihenőidő lejárt – két rövid sípolás.
 */
export async function playRestTimerEndSound() {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }

    const now = ctx.currentTime
    playTone(ctx, 1600, now, 0.2)
    playTone(ctx, 2200, now + 0.25, 0.2)
  } catch {
    // Hang nem játszható le (pl. böngésző tiltás)
  }
}
