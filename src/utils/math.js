/** 乘法表工具 */

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function makeQuestion(min = 1, max = 9) {
  const a = randInt(min, max)
  const b = randInt(min, max)
  return { a, b, answer: a * b }
}

/** 生成含正确答案的选项（含干扰项） */
export function makeChoices(answer, count = 4) {
  const set = new Set([answer])
  let guard = 0
  while (set.size < count && guard < 80) {
    guard += 1
    const delta = randInt(-12, 12) || 1
    const v = Math.max(0, answer + delta)
    set.add(v)
  }
  while (set.size < count) set.add(answer + set.size)
  return shuffle([...set])
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 闯关配置：逐步扩大范围 */
export const CHALLENGE_LEVELS = [
  { id: 1, name: '启蒙', min: 1, max: 5, questions: 8, timeLimit: 0, maxWrong: 3 },
  { id: 2, name: '起步', min: 1, max: 6, questions: 10, timeLimit: 0, maxWrong: 3 },
  { id: 3, name: '入门', min: 1, max: 7, questions: 10, timeLimit: 90, maxWrong: 3 },
  { id: 4, name: '小试', min: 1, max: 8, questions: 12, timeLimit: 90, maxWrong: 3 },
  { id: 5, name: '九九熟', min: 1, max: 9, questions: 12, timeLimit: 80, maxWrong: 2 },
  { id: 6, name: '进阶', min: 1, max: 10, questions: 12, timeLimit: 80, maxWrong: 2 },
  { id: 7, name: '扩展', min: 1, max: 12, questions: 14, timeLimit: 100, maxWrong: 2 },
  { id: 8, name: '高手', min: 1, max: 15, questions: 14, timeLimit: 110, maxWrong: 2 },
  { id: 9, name: '挑战', min: 1, max: 17, questions: 15, timeLimit: 120, maxWrong: 2 },
  { id: 10, name: '大师', min: 1, max: 19, questions: 16, timeLimit: 130, maxWrong: 2 },
]

export const RANGE_PRESETS = [
  { label: '1–9', max: 9 },
  { label: '1–12', max: 12 },
  { label: '1–19', max: 19 },
]
