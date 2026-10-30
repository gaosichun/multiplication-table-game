<script setup>
import { useRouter } from 'vue-router'
import MuteButton from '../components/MuteButton.vue'
import { playSound, isMuted, toggleMute } from '../utils/audio'
import { ref } from 'vue'

const router = useRouter()
const muted = ref(isMuted())

const extras = [
  { to: '/memory', emoji: '🙈', title: '听声/遮罩记忆', desc: '遮答案或由积反推因数' },
  { to: '/match', emoji: '🔗', title: '连连看匹配', desc: '算式与积配对消除' },
  { to: '/wrong', emoji: '📘', title: '错题本复习', desc: '攻克错过的题目' },
]

function go(to) {
  playSound('tap')
  router.push(to)
}

function onMute() {
  muted.value = toggleMute()
  if (!muted.value) playSound('tap')
}
</script>

<template>
  <div class="page more">
    <MuteButton />
    <h1 class="page-title">更多玩法</h1>
    <p class="page-sub">记忆、配对与错题复习</p>

    <div class="list">
      <button
        v-for="m in extras"
        :key="m.to"
        type="button"
        class="row card-3d pressable"
        @click="go(m.to)"
      >
        <span class="emoji">{{ m.emoji }}</span>
        <span class="txt">
          <strong>{{ m.title }}</strong>
          <small>{{ m.desc }}</small>
        </span>
        <span class="arrow">›</span>
      </button>
    </div>

    <div class="settings card-3d">
      <div class="set-row">
        <span>音效</span>
        <van-switch :model-value="!muted" size="22px" active-color="#FF7B6B" @change="onMute" />
      </div>
      <p class="tip">音效使用本机 Web Audio 生成，无需联网。</p>
    </div>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: none;
  text-align: left;
  color: inherit;
  cursor: pointer;
  width: 100%;
}
.emoji {
  font-size: 1.6rem;
}
.txt {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.txt strong {
  font-size: 1rem;
}
.txt small {
  color: var(--c-muted);
  font-size: 0.78rem;
}
.arrow {
  font-size: 1.4rem;
  color: var(--c-muted);
}
.settings {
  padding: 16px;
}
.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 800;
}
.tip {
  margin: 10px 0 0;
  font-size: 0.78rem;
  color: var(--c-muted);
}
</style>
