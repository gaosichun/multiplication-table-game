<script setup>
import { useRouter } from 'vue-router'
import { playSound } from '../utils/audio'

defineProps({
  title: { type: String, default: '' },
})

const router = useRouter()

function goBack() {
  playSound('tap')
  if (window.history.length > 1) router.back()
  else router.replace('/')
}
</script>

<template>
  <div class="back-bar">
    <button class="back-btn pressable" type="button" @click="goBack">← 返回</button>
    <h2 v-if="title" class="back-title">{{ title }}</h2>
  </div>
</template>

<style scoped>
.back-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.back-btn {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(45, 49, 66, 0.1);
  min-height: 40px;
  color: var(--c-ink);
}
.back-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
}
</style>
