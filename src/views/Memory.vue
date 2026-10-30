<script setup>
import { onBeforeUnmount, ref } from 'vue'
import BackBar from '../components/BackBar.vue'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { makeChoices, makeQuestion, RANGE_PRESETS } from '../utils/math'
import { addWrongItem, bumpStats } from '../utils/storage'

const mode = ref('mask') // mask | reverse
const maxN = ref(12)
const q = ref(null)
const masked = ref(false)
const choices = ref([])
const feedback = ref('')
const revealReady = ref(false)
let hideTimer = null

function clearHide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function startRound() {
  clearHide()
  feedback.value = ''
  revealReady.value = false
  q.value = makeQuestion(1, maxN.value)
  if (mode.value === 'mask') {
    masked.value = false
    playSound('flip')
    hideTimer = setTimeout(() => {
      masked.value = true
      revealReady.value = true
      choices.value = makeChoices(q.value.answer, 4)
      playSound('tap')
    }, 1800)
  } else {
    masked.value = true
    revealReady.value = true
    // reverse: show product, guess factors — we ask for a (or either factor pair via product match)
    choices.value = makeFactorChoices(q.value)
    playSound('flip')
  }
}

function makeFactorChoices(question) {
  const correct = `${question.a} × ${question.b}`
  const set = new Set([correct])
  let guard = 0
  while (set.size < 4 && guard < 60) {
    guard += 1
    const x = makeQuestion(1, maxN.value)
    set.add(`${x.a} × ${x.b}`)
  }
  return [...set].sort(() => Math.random() - 0.5)
}

function setMode(m) {
  playSound('tap')
  mode.value = m
  startRound()
}

function setRange(n) {
  playSound('tap')
  maxN.value = n
  startRound()
}

function choose(c) {
  if (!revealReady.value || feedback.value) return
  let ok = false
  if (mode.value === 'mask') {
    ok = c === q.value.answer
  } else {
    ok = c === `${q.value.a} × ${q.value.b}`
  }
  bumpStats(ok)
  if (ok) {
    feedback.value = 'ok'
    playSound('correct')
  } else {
    feedback.value = 'bad'
    playSound('wrong')
    addWrongItem(q.value.a, q.value.b)
  }
  setTimeout(startRound, ok ? 800 : 1200)
}

startRound()
onBeforeUnmount(clearHide)
</script>

<template>
  <div class="page memory">
    <MuteButton />
    <BackBar title="听声/遮罩记忆" />
    <p class="page-sub">先看完整算式再遮住答案，或由积反推因数</p>

    <div class="chip-row">
      <button type="button" class="chip" :class="{ active: mode === 'mask' }" @click="setMode('mask')">遮罩答案</button>
      <button type="button" class="chip" :class="{ active: mode === 'reverse' }" @click="setMode('reverse')">反推因数</button>
    </div>
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
    </div>

    <div
      class="mem-card card-3d flip-card"
      :class="{ 'is-flipped': mode === 'mask' && masked, ok: feedback === 'ok', bad: feedback === 'bad', 'feedback-pop': !!feedback }"
    >
      <template v-if="mode === 'mask' && q">
        <div class="face">
          <div class="hint">{{ masked ? '答案被挡住啦，还记得吗？' : '记住这个算式…' }}</div>
          <div class="big">
            {{ q.a }} × {{ q.b }} =
            <span class="ans" :class="{ cover: masked }">{{ masked ? '?' : q.answer }}</span>
          </div>
        </div>
      </template>
      <template v-else-if="q">
        <div class="face">
          <div class="hint">积是多少？请选出正确的算式</div>
          <div class="big product">{{ q.answer }}</div>
          <div class="hint">=? × ?</div>
        </div>
      </template>
      <div v-if="feedback === 'ok'" class="fb ok-txt">记住了！✓</div>
      <div v-else-if="feedback === 'bad'" class="fb bad-txt">
        正确答案：{{ q.a }} × {{ q.b }} = {{ q.answer }}
      </div>
    </div>

    <div v-if="revealReady" class="choices">
      <button
        v-for="c in choices"
        :key="c"
        type="button"
        class="btn-3d choice lilac"
        :disabled="!!feedback"
        @click="choose(c)"
      >
        {{ c }}
      </button>
    </div>
    <p v-else class="wait">正在展示，请记住…</p>
  </div>
</template>

<style scoped>
.mem-card {
  padding: 28px 16px;
  text-align: center;
  margin: 8px 0 16px;
  min-height: 170px;
}
.mem-card.ok {
  background: linear-gradient(160deg, #d1fae5, #ecfdf5);
}
.mem-card.bad {
  background: linear-gradient(160deg, #ffe4e6, #fff1f2);
}
.hint {
  color: var(--c-muted);
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 10px;
}
.big {
  font-size: 2rem;
  font-weight: 900;
}
.product {
  font-size: 2.8rem;
  color: var(--c-lilac);
}
.ans.cover {
  display: inline-block;
  min-width: 2.2em;
  background: linear-gradient(160deg, #2d3142, #4b5568);
  color: transparent;
  border-radius: 10px;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.25);
  vertical-align: baseline;
}
.fb {
  margin-top: 12px;
  font-weight: 800;
}
.ok-txt { color: #059669; }
.bad-txt { color: #e11d48; font-size: 0.95rem; }
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.choice {
  min-height: 54px;
  font-size: 1.05rem;
}
.wait {
  text-align: center;
  color: var(--c-muted);
  font-weight: 700;
}
</style>
