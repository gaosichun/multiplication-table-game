/** Web Audio 短音效，无外链依赖 */

let ctx = null
let muted = localStorage.getItem('mtg-muted') === '1'

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  return ctx
}

export function isMuted() {
  return muted
}

export function setMuted(v) {
  muted = !!v
  localStorage.setItem('mtg-muted', muted ? '1' : '0')
}

export function toggleMute() {
  setMuted(!muted)
  return muted
}

function tone(freq, duration = 0.12, type = 'sine', gain = 0.18, delay = 0) {
  if (muted) return
  const ac = getCtx()
  if (!ac) return
  if (ac.state === 'suspended') ac.resume().catch(() => {})

  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function playSound(kind) {
  switch (kind) {
    case 'tap':
      tone(520, 0.06, 'triangle', 0.1)
      break
    case 'correct':
      tone(523, 0.1, 'sine', 0.16)
      tone(659, 0.12, 'sine', 0.14, 0.08)
      tone(784, 0.16, 'sine', 0.12, 0.16)
      break
    case 'wrong':
      tone(220, 0.18, 'sawtooth', 0.08)
      tone(180, 0.22, 'sawtooth', 0.06, 0.1)
      break
    case 'flip':
      tone(440, 0.08, 'triangle', 0.1)
      tone(660, 0.1, 'triangle', 0.08, 0.06)
      break
    case 'win':
      tone(523, 0.1, 'sine', 0.14)
      tone(659, 0.1, 'sine', 0.14, 0.1)
      tone(784, 0.1, 'sine', 0.14, 0.2)
      tone(1046, 0.25, 'sine', 0.16, 0.3)
      break
    case 'level':
      tone(392, 0.08, 'square', 0.08)
      tone(523, 0.12, 'square', 0.1, 0.08)
      break
    default:
      tone(400, 0.06, 'sine', 0.08)
  }
}
