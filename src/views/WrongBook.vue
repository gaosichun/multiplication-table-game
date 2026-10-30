<script setup>
import { computed, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import BackBar from '../components/BackBar.vue'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { makeChoices } from '../utils/math'
import {
  clearWrongBook,
  getWrongBook,
  removeWrongItem,
  bumpStats,
} from '../utils/storage'

const list = ref(getWrongBook())
const practicing = ref(false)
const current = ref(null)
const choices = ref([])
const feedback = ref('')
const idx = ref(0)

const empty = computed(() => list.value.length === 0)

function refresh() {
  list.value = getWrongBook()
}

function startPractice() {
  if (!list.value.length) {
    showToast('错题本是空的')
    return
  }
  playSound('tap')
  practicing.value = true
  idx.value = 0
  loadQ()
}

function loadQ() {
  feedback.value = ''
  const item = list.value[idx.value % list.value.length]
  current.value = item
  choices.value = makeChoices(item.product, 4)
}

function choose(n) {
  if (feedback.value || !current.value) return
  const ok = n === current.value.product
  bumpStats(ok)
  if (ok) {
    feedback.value = 'ok'
    playSound('correct')
    removeWrongItem(current.value.a, current.value.b)
    refresh()
    setTimeout(() => {
      if (!list.value.length) {
        practicing.value = false
        showToast('错题都清完啦！')
        return
      }
      if (idx.value >= list.value.length) idx.value = 0
      loadQ()
    }, 700)
  } else {
    feedback.value = 'bad'
    playSound('wrong')
    setTimeout(loadQ, 900)
  }
}

async function onClear() {
  try {
    await showConfirmDialog({ title: '清空错题本？', message: '此操作不可恢复' })
    clearWrongBook()
    refresh()
    practicing.value = false
    playSound('tap')
  } catch {
    /* cancel */
  }
}

function removeOne(item) {
  playSound('tap')
  removeWrongItem(item.a, item.b)
  refresh()
}
</script>

<template>
  <div class="page wrong">
    <MuteButton />
    <BackBar title="错题本复习" />
    <p class="page-sub">集中复习做过的错题，做对自动移出</p>

    <template v-if="!practicing">
      <div class="actions">
        <button type="button" class="btn-3d teal" :disabled="empty" @click="startPractice">开始复习</button>
        <button type="button" class="btn-3d gold" :disabled="empty" @click="onClear">清空</button>
      </div>
      <div v-if="empty" class="empty card-3d">还没有错题，继续加油练吧！</div>
      <div v-else class="list">
        <div v-for="item in list" :key="item.key" class="item card-3d">
          <div class="expr">{{ item.a }} × {{ item.b }} = {{ item.product }}</div>
          <div class="meta">错过 {{ item.count }} 次</div>
          <button type="button" class="chip" @click="removeOne(item)">移除</button>
        </div>
      </div>
    </template>

    <template v-else>
      <button type="button" class="chip" @click="practicing = false">结束复习</button>
      <div
        class="q-card card-3d"
        :class="{ ok: feedback === 'ok', bad: feedback === 'bad', 'feedback-pop': !!feedback }"
      >
        <div class="q-text" v-if="current">{{ current.a }} × {{ current.b }} = ?</div>
        <div v-if="feedback === 'ok'" class="fb ok-txt">做对了，移出错题本</div>
        <div v-else-if="feedback === 'bad'" class="fb bad-txt">答案是 {{ current.product }}</div>
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
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.empty {
  padding: 28px 16px;
  text-align: center;
  color: var(--c-muted);
  font-weight: 700;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 10px;
  align-items: center;
}
.expr {
  font-weight: 900;
  font-size: 1.05rem;
}
.meta {
  grid-column: 1;
  font-size: 0.78rem;
  color: var(--c-muted);
}
.item .chip {
  grid-row: 1 / span 2;
  grid-column: 2;
}
.q-card {
  margin: 12px 0 16px;
  padding: 28px 16px;
  text-align: center;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.q-card.ok { background: linear-gradient(160deg, #d1fae5, #ecfdf5); }
.q-card.bad { background: linear-gradient(160deg, #ffe4e6, #fff1f2); }
.q-text { font-size: 2.2rem; font-weight: 900; }
.fb { margin-top: 10px; font-weight: 800; }
.ok-txt { color: #059669; }
.bad-txt { color: #e11d48; }
.choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.choice {
  font-size: 1.3rem;
  min-height: 56px;
}
</style>
