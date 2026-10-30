<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { makeChoices, makeQuestion, RANGE_PRESETS } from '../utils/math'
import { addWrongItem, bumpStats, getSettings, saveSettings } from '../utils/storage'

const settings = ref(getSettings())
const maxN = ref(settings.value.rangeMax || 12)
const timed = ref(!!settings.value.timed)
const timeLimit = ref(settings.value.timeLimit || 10)
const inputMode = ref('choice') // choice | input

const q = ref(null)
const choices = ref([])
const inputVal = ref('')
const feedback = ref('') // ok | bad | ''
const correct = ref(0)
const total = ref(0)
const left = ref(0)
let timer = null

const accuracy = computed(() => {
  if (!total.value) return '—'
  return `${Math.round((correct.value / total.value) * 100)}%`
})

function persist() {
  saveSettings({ rangeMax: maxN.value, timed: timed.value, timeLimit: timeLimit.value })
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function nextQuestion() {
  clearTimer()
  feedback.value = ''
  inputVal.value = ''
  q.value = makeQuestion(1, maxN.value)
  choices.value = makeChoices(q.value.answer, 4)
  if (timed.value) {
    left.value = timeLimit.value
    timer = setInterval(() => {
      left.value -= 1
      if (left.value <= 0) {
        clearTimer()
        settle(false, true)
      }
    }, 1000)
  }
}

function settle(ok, timeout = false) {
  if (feedback.value) return
  clearTimer()
  total.value += 1
  if (ok) {
    correct.value += 1
    feedback.value = 'ok'
    playSound('correct')
  } else {
    feedback.value = timeout ? 'timeout' : 'bad'
    playSound('wrong')
    addWrongItem(q.value.a, q.value.b)
  }
  bumpStats(ok)
  setTimeout(nextQuestion, ok ? 700 : 1100)
}

function choose(n) {
  if (feedback.value || !q.value) return
  settle(n === q.value.answer)
}

function submitInput() {
  if (feedback.value || !q.value) return
  const n = Number(inputVal.value)
  if (Number.isNaN(n)) return
  settle(n === q.value.answer)
}

function setRange(n) {
  playSound('tap')
  maxN.value = n
  persist()
  nextQuestion()
}

function toggleTimed() {
  playSound('tap')
  timed.value = !timed.value
  persist()
  nextQuestion()
}

function setMode(m) {
  playSound('tap')
  inputMode.value = m
  nextQuestion()
}

onMounted(nextQuestion)
onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="page flash">
    <MuteButton />
    <h1 class="page-title">闪卡练习</h1>
    <p class="page-sub">随机出题 · 即时反馈 · 统计正确率</p>

    <div class="chip-row">
      <button
        v-for="p in RANGE_PRESETS"
        :key="p.max"
        type="button"
        class="chip"
        :class="{ active: maxN === p.max }"
        @click="setRange(p.max)"
      >
        {{ p.label }}
      </button>
      <button type="button" class="chip" :class="{ active: timed }" @click="toggleTimed">
        {{ timed ? `⏱ ${timeLimit}s` : '不计时' }}
      </button>
    </div>

    <div class="chip-row">
      <button type="button" class="chip" :class="{ active: inputMode === 'choice' }" @click="setMode('choice')">点选答案</button>
      <button type="button" class="chip" :class="{ active: inputMode === 'input' }" @click="setMode('input')">输入答案</button>
    </div>

    <div class="score-bar card-3d">
      <span>正确 {{ correct }} / {{ total }}</span>
      <span>正确率 {{ accuracy }}</span>
      <span v-if="timed">剩余 {{ left }}s</span>
    </div>

    <div
      class="q-card card-3d"
      :class="{
        ok: feedback === 'ok',
        bad: feedback === 'bad' || feedback === 'timeout',
        'feedback-pop': !!feedback,
      }"
    >
      <div class="q-label">算一算</div>
      <div class="q-text" v-if="q">{{ q.a }} × {{ q.b }} = ?</div>
      <div v-if="feedback === 'ok'" class="fb ok-txt">太棒了！✓</div>
      <div v-else-if="feedback === 'bad'" class="fb bad-txt">再想想，答案是 {{ q.answer }}</div>
      <div v-else-if="feedback === 'timeout'" class="fb bad-txt">时间到！答案是 {{ q.answer }}</div>
    </div>

    <div v-if="inputMode === 'choice'" class="choices">
      <button
        v-for="c in choices"
        :key="c"
        type="button"
        class="btn-3d choice"
        :class="{
          teal: feedback === 'ok' && c === q.answer,
          gold: feedback && c !== q.answer,
        }"
        :disabled="!!feedback"
        @click="choose(c)"
      >
        {{ c }}
      </button>
    </div>

    <div v-else class="input-area">
      <van-field
        v-model="inputVal"
        type="digit"
        center
        clearable
        placeholder="输入积"
        class="ans-field"
        @keyup.enter="submitInput"
      />
      <button type="button" class="btn-3d teal full" :disabled="!!feedback" @click="submitInput">提交</button>
    </div>
  </div>
</template>

<style scoped>
.score-bar {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--c-muted);
  flex-wrap: wrap;
}
.q-card {
  padding: 28px 16px;
  text-align: center;
  margin-bottom: 16px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform-style: preserve-3d;
}
.q-card.ok {
  background: linear-gradient(160deg, #d1fae5, #ecfdf5);
  box-shadow: 0 10px 24px rgba(52, 211, 153, 0.28);
}
.q-card.bad {
  background: linear-gradient(160deg, #ffe4e6, #fff1f2);
  box-shadow: 0 10px 24px rgba(251, 113, 133, 0.25);
}
.q-label {
  font-size: 0.8rem;
  color: var(--c-muted);
  font-weight: 700;
  margin-bottom: 8px;
}
.q-text {
  font-size: 2.4rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}
.fb {
  margin-top: 12px;
  font-weight: 800;
}
.ok-txt { color: #059669; }
.bad-txt { color: #e11d48; }
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.choice {
  font-size: 1.35rem;
  min-height: 56px;
}
.input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ans-field {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-float);
}
.full {
  width: 100%;
}
</style>
