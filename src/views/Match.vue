<script setup>
import { computed, ref } from 'vue'
import { showToast } from 'vant'
import BackBar from '../components/BackBar.vue'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { makeQuestion, RANGE_PRESETS, shuffle } from '../utils/math'
import { bumpStats } from '../utils/storage'

const maxN = ref(9)
const cards = ref([])
const selected = ref([])
const matched = ref(0)
const moves = ref(0)
const locked = ref(false)

const done = computed(() => cards.value.length > 0 && matched.value === cards.value.length / 2)

function deal() {
  playSound('tap')
  matched.value = 0
  moves.value = 0
  selected.value = []
  locked.value = false
  const pairs = []
  const used = new Set()
  while (pairs.length < 6) {
    const q = makeQuestion(1, maxN.value)
    const key = `${q.a}x${q.b}`
    if (used.has(key) || used.has(`${q.b}x${q.a}`)) continue
    used.add(key)
    const id = pairs.length
    pairs.push(
      { id: `e-${id}`, pairId: id, kind: 'expr', text: `${q.a} × ${q.b}`, faceUp: false, gone: false },
      { id: `p-${id}`, pairId: id, kind: 'prod', text: String(q.answer), faceUp: false, gone: false },
    )
  }
  cards.value = shuffle(pairs)
}

function setRange(n) {
  maxN.value = n
  deal()
}

function flip(card) {
  if (locked.value || card.gone || card.faceUp) return
  if (selected.value.length >= 2) return
  playSound('flip')
  card.faceUp = true
  selected.value.push(card)
  if (selected.value.length === 2) {
    moves.value += 1
    locked.value = true
    const [a, b] = selected.value
    if (a.pairId === b.pairId) {
      playSound('correct')
      bumpStats(true)
      setTimeout(() => {
        a.gone = true
        b.gone = true
        matched.value += 1
        selected.value = []
        locked.value = false
        if (matched.value === cards.value.length / 2) {
          playSound('win')
          showToast({ message: `全部配对！共用 ${moves.value} 步`, position: 'bottom' })
        }
      }, 350)
    } else {
      playSound('wrong')
      bumpStats(false)
      setTimeout(() => {
        a.faceUp = false
        b.faceUp = false
        selected.value = []
        locked.value = false
      }, 700)
    }
  }
}

deal()
</script>

<template>
  <div class="page match">
    <MuteButton />
    <BackBar title="连连看匹配" />
    <p class="page-sub">点开卡片，把算式与积配对消除</p>

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
      <button type="button" class="chip" @click="deal">重开</button>
    </div>

    <div class="score-bar card-3d">
      <span>已配 {{ matched }}/6</span>
      <span>步数 {{ moves }}</span>
      <span v-if="done">🎉 完成</span>
    </div>

    <div class="board">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="tile"
        :class="{ up: card.faceUp, gone: card.gone, prod: card.kind === 'prod' }"
        :disabled="card.gone"
        @click="flip(card)"
      >
        <span class="tile-inner" :class="{ flipped: card.faceUp || card.gone }">
          <span class="tile-back">?</span>
          <span class="tile-front">{{ card.text }}</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.score-bar {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--c-muted);
}
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.tile {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  height: 88px;
  perspective: 800px;
  cursor: pointer;
}
.tile.gone {
  opacity: 0.25;
  pointer-events: none;
}
.tile-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.45s cubic-bezier(0.4, 0.2, 0.2, 1);
}
.tile-inner.flipped {
  transform: rotateY(180deg);
}
.tile-back,
.tile-front {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border-radius: 14px;
  backface-visibility: hidden;
  font-weight: 900;
  box-shadow: 0 6px 0 rgba(45, 49, 66, 0.1), 0 8px 16px rgba(45, 49, 66, 0.1);
}
.tile-back {
  background: linear-gradient(160deg, var(--c-coral), var(--c-coral-deep));
  color: #fff;
  font-size: 1.6rem;
}
.tile-front {
  background: linear-gradient(160deg, #fff, #fff8f0);
  color: var(--c-ink);
  transform: rotateY(180deg);
  font-size: 1.05rem;
  padding: 6px;
}
.tile.prod .tile-front {
  color: var(--c-teal-deep);
  font-size: 1.35rem;
}
.tile:active:not(:disabled) .tile-inner:not(.flipped) {
  transform: scale(0.96);
}
</style>
