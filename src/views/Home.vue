<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { getStats, getChallengeProgress } from '../utils/storage'

const router = useRouter()
const stats = ref(getStats())
const progress = ref(getChallengeProgress())

const accuracy = computed(() => {
  if (!stats.value.answered) return '—'
  return `${Math.round((stats.value.correct / stats.value.answered) * 100)}%`
})

const modes = [
  { to: '/browse', emoji: '🗺️', title: '九九表浏览', desc: '1–19 完整网格，点格子看算式', color: 'coral' },
  { to: '/flash', emoji: '⚡', title: '闪卡练习', desc: '随机出题，即时对错与正确率', color: 'gold' },
  { to: '/challenge', emoji: '🏆', title: '闯关挑战', desc: '10 关逐步扩到 19，进度本地保存', color: 'teal' },
  { to: '/memory', emoji: '🙈', title: '听声/遮罩记忆', desc: '遮答案或由积反推因数', color: 'lilac' },
  { to: '/match', emoji: '🔗', title: '连连看匹配', desc: '算式与积配对消除', color: 'sky' },
  { to: '/wrong', emoji: '📘', title: '错题本复习', desc: '集中攻克错过的题目', color: 'ink' },
]

onMounted(() => {
  stats.value = getStats()
  progress.value = getChallengeProgress()
})

function go(to) {
  playSound('tap')
  router.push(to)
}
</script>

<template>
  <div class="page home">
    <MuteButton />
    <header class="hero card-3d">
      <div class="hero-badge">小学乘法乐园</div>
      <h1 class="hero-title">19×19<br />乘法表</h1>
      <p class="hero-desc">立体卡片 · 多种练法 · 随时开玩</p>
      <div class="hero-stats">
        <div class="stat">
          <strong>{{ stats.answered }}</strong>
          <span>已答题</span>
        </div>
        <div class="stat">
          <strong>{{ accuracy }}</strong>
          <span>正确率</span>
        </div>
        <div class="stat">
          <strong>{{ progress.unlocked }}/10</strong>
          <span>闯关进度</span>
        </div>
      </div>
    </header>

    <h2 class="section-label">选择学习方式</h2>
    <div class="mode-grid">
      <button
        v-for="m in modes"
        :key="m.to"
        type="button"
        class="mode-card card-3d pressable"
        :class="m.color"
        @click="go(m.to)"
      >
        <span class="mode-emoji" aria-hidden="true">{{ m.emoji }}</span>
        <span class="mode-title">{{ m.title }}</span>
        <span class="mode-desc">{{ m.desc }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  padding: 22px 20px 18px;
  margin-bottom: 18px;
  background:
    linear-gradient(145deg, rgba(255, 123, 107, 0.18), transparent 55%),
    linear-gradient(220deg, rgba(167, 139, 250, 0.16), #fff 60%);
  position: relative;
  overflow: hidden;
}
.hero::after {
  content: '×';
  position: absolute;
  right: -8px;
  bottom: -28px;
  font-size: 8rem;
  font-weight: 900;
  color: rgba(255, 123, 107, 0.12);
  transform: rotate(-12deg);
  pointer-events: none;
}
.hero-badge {
  display: inline-block;
  background: #fff;
  color: var(--c-coral-deep);
  font-size: 0.75rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 999px;
  box-shadow: 0 3px 8px rgba(255, 90, 72, 0.2);
  margin-bottom: 10px;
}
.hero-title {
  margin: 0;
  font-size: 2.1rem;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: 0.02em;
}
.hero-desc {
  margin: 8px 0 14px;
  color: var(--c-muted);
  font-size: 0.92rem;
}
.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.stat {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 10px 6px;
  text-align: center;
  box-shadow: inset 0 1px 0 #fff, 0 4px 10px rgba(45, 49, 66, 0.06);
}
.stat strong {
  display: block;
  font-size: 1.15rem;
  color: var(--c-coral-deep);
}
.stat span {
  font-size: 0.72rem;
  color: var(--c-muted);
}
.section-label {
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 800;
}
.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.mode-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 16px 14px;
  border: none;
  min-height: 128px;
  cursor: pointer;
  color: inherit;
}
.mode-card.coral { border-top: 4px solid var(--c-coral); }
.mode-card.gold { border-top: 4px solid var(--c-gold); }
.mode-card.teal { border-top: 4px solid var(--c-teal); }
.mode-card.lilac { border-top: 4px solid var(--c-lilac); }
.mode-card.sky { border-top: 4px solid var(--c-sky); }
.mode-card.ink { border-top: 4px solid #94a3b8; }
.mode-emoji {
  font-size: 1.7rem;
  margin-bottom: 6px;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.12));
}
.mode-title {
  font-weight: 800;
  font-size: 0.98rem;
  margin-bottom: 4px;
}
.mode-desc {
  font-size: 0.75rem;
  color: var(--c-muted);
  line-height: 1.35;
}
</style>
