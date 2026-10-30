<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { showDialog, showToast } from 'vant'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { CHALLENGE_LEVELS, makeChoices, makeQuestion } from '../utils/math'
import {
  addWrongItem,
  bumpStats,
  getChallengeProgress,
  saveChallengeProgress,
} from '../utils/storage'

const progress = ref(getChallengeProgress())
const playing = ref(false)
const level = ref(null)
const q = ref(null)
const choices = ref([])
const idx = ref(0)
const wrong = ref(0)
const feedback = ref('')
const remain = ref(0)
let timer = null

const unlocked = computed(() => progress.value.unlocked || 1)

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startLevel(lv) {
  if (lv.id > unlocked.value) {
    showToast('先通关前面的关卡哦')
    return
  }
  playSound('level')
  level.value = lv
  playing.value = true
  idx.value = 0
  wrong.value = 0
  feedback.value = ''
  nextQ()
  if (lv.timeLimit > 0) {
    remain.value = lv.timeLimit
    timer = setInterval(() => {
      remain.value -= 1
      if (remain.value <= 0) {
        clearTimer()
        failLevel('时间到了！')
      }
    }, 1000)
  } else {
    remain.value = 0
  }
}

function nextQ() {
  feedback.value = ''
  q.value = makeQuestion(level.value.min, level.value.max)
  choices.value = makeChoices(q.value.answer, 4)
}

function choose(n) {
  if (!playing.value || feedback.value || !q.value) return
  const ok = n === q.value.answer
  bumpStats(ok)
  if (ok) {
    feedback.value = 'ok'
    playSound('correct')
    setTimeout(() => {
      idx.value += 1
      if (idx.value >= level.value.questions) {
        winLevel()
      } else {
        nextQ()
      }
    }, 500)
  } else {
    feedback.value = 'bad'
    wrong.value += 1
    playSound('wrong')
    addWrongItem(q.value.a, q.value.b)
    setTimeout(() => {
      if (wrong.value >= level.value.maxWrong) {
        failLevel('错误次数太多啦')
      } else {
        nextQ()
      }
    }, 900)
  }
}

function winLevel() {
  clearTimer()
  playing.value = false
  playSound('win')
  const p = { ...progress.value }
  const stars = Math.max(1, 3 - wrong.value)
  const prev = p.stars[level.value.id] || 0
  p.stars[level.value.id] = Math.max(prev, stars)
  p.best[level.value.id] = Math.max(p.best[level.value.id] || 0, level.value.questions - wrong.value)
  if (level.value.id >= p.unlocked && level.value.id < CHALLENGE_LEVELS.length) {
    p.unlocked = level.value.id + 1
  } else if (level.value.id === CHALLENGE_LEVELS.length) {
    p.unlocked = CHALLENGE_LEVELS.length
  }
  progress.value = p
  saveChallengeProgress(p)
  showDialog({
    title: '通关成功！',
    message: `「${level.value.name}」拿到 ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`,
    confirmButtonText: '太棒了',
  })
}

function failLevel(reason) {
  clearTimer()
  playing.value = false
  playSound('wrong')
  showDialog({
    title: '再试一次',
    message: reason,
    confirmButtonText: '好的',
  })
}

function quit() {
  clearTimer()
  playing.value = false
}

function starsOf(id) {
  return progress.value.stars[id] || 0
}

onBeforeUnmount(clearTimer)
</script>

<template>
  <div class="page challenge">
    <MuteButton />
    <template v-if="!playing">
      <h1 class="page-title">闯关挑战</h1>
      <p class="page-sub">逐步扩大到 19；限时或限错；进度保存在本机</p>
      <div class="levels">
        <button
          v-for="lv in CHALLENGE_LEVELS"
          :key="lv.id"
          type="button"
          class="level-card card-3d pressable"
          :class="{ locked: lv.id > unlocked }"
          @click="startLevel(lv)"
        >
          <div class="lv-top">
            <span class="lv-id">第 {{ lv.id }} 关</span>
            <span class="lv-stars">{{ '★'.repeat(starsOf(lv.id)) }}{{ '☆'.repeat(3 - starsOf(lv.id)) }}</span>
          </div>
          <div class="lv-name">{{ lv.name }}</div>
          <div class="lv-meta">范围 {{ lv.min }}–{{ lv.max }} · {{ lv.questions }} 题 · 可错 {{ lv.maxWrong }}</div>
          <div class="lv-meta">{{ lv.timeLimit ? `限时 ${lv.timeLimit}s` : '不限时' }}</div>
          <div v-if="lv.id > unlocked" class="lock">🔒</div>
        </button>
      </div>
    </template>

    <template v-else>
      <div class="play-head">
        <button type="button" class="chip" @click="quit">退出</button>
        <span class="chip active">第 {{ level.id }} 关 · {{ level.name }}</span>
      </div>
      <div class="score-bar card-3d">
        <span>进度 {{ idx + 1 }}/{{ level.questions }}</span>
        <span>错 {{ wrong }}/{{ level.maxWrong }}</span>
        <span v-if="level.timeLimit">⏱ {{ remain }}s</span>
      </div>
      <div
        class="q-card card-3d"
        :class="{ ok: feedback === 'ok', bad: feedback === 'bad', 'feedback-pop': !!feedback }"
      >
        <div class="q-text" v-if="q">{{ q.a }} × {{ q.b }} = ?</div>
        <div v-if="feedback === 'ok'" class="fb ok-txt">正确！</div>
        <div v-else-if="feedback === 'bad'" class="fb bad-txt">错了，是 {{ q.answer }}</div>
      </div>
      <div class="choices">
        <button
          v-for="c in choices"
          :key="c"
          type="button"
          class="btn-3d choice"
          :disabled="!!feedback"
          @click="choose(c)"
        >
          {{ c }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.level-card {
  position: relative;
  border: none;
  text-align: left;
  padding: 14px 16px;
  color: inherit;
  cursor: pointer;
}
.level-card.locked {
  opacity: 0.55;
}
.lv-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.lv-id {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--c-coral-deep);
}
.lv-stars {
  color: #eab308;
  letter-spacing: 1px;
}
.lv-name {
  font-size: 1.15rem;
  font-weight: 900;
  margin-bottom: 4px;
}
.lv-meta {
  font-size: 0.78rem;
  color: var(--c-muted);
}
.lock {
  position: absolute;
  right: 16px;
  bottom: 14px;
  font-size: 1.2rem;
}
.play-head {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
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
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.q-card.ok {
  background: linear-gradient(160deg, #d1fae5, #ecfdf5);
}
.q-card.bad {
  background: linear-gradient(160deg, #ffe4e6, #fff1f2);
}
.q-text {
  font-size: 2.3rem;
  font-weight: 900;
}
.fb {
  margin-top: 10px;
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
</style>
