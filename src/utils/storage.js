const KEYS = {
  challenge: 'mtg-challenge-progress',
  wrong: 'mtg-wrong-book',
  settings: 'mtg-settings',
  stats: 'mtg-stats',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getChallengeProgress() {
  return read(KEYS.challenge, { unlocked: 1, best: {}, stars: {} })
}

export function saveChallengeProgress(data) {
  write(KEYS.challenge, data)
}

export function getWrongBook() {
  return read(KEYS.wrong, [])
}

export function addWrongItem(a, b) {
  const list = getWrongBook()
  const key = `${a}x${b}`
  const existing = list.find((i) => i.key === key)
  if (existing) {
    existing.count += 1
    existing.updatedAt = Date.now()
  } else {
    list.unshift({ key, a, b, product: a * b, count: 1, updatedAt: Date.now() })
  }
  write(KEYS.wrong, list.slice(0, 100))
}

export function removeWrongItem(a, b) {
  const list = getWrongBook().filter((i) => !(i.a === a && i.b === b))
  write(KEYS.wrong, list)
}

export function clearWrongBook() {
  write(KEYS.wrong, [])
}

export function getSettings() {
  return read(KEYS.settings, { rangeMax: 12, timed: false, timeLimit: 10 })
}

export function saveSettings(partial) {
  write(KEYS.settings, { ...getSettings(), ...partial })
}

export function getStats() {
  return read(KEYS.stats, { answered: 0, correct: 0 })
}

export function bumpStats(ok) {
  const s = getStats()
  s.answered += 1
  if (ok) s.correct += 1
  write(KEYS.stats, s)
  return s
}
