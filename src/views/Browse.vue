<script setup>
import { computed, ref } from 'vue'
import { showToast } from 'vant'
import MuteButton from '../components/MuteButton.vue'
import { playSound } from '../utils/audio'
import { RANGE_PRESETS } from '../utils/math'

const maxN = ref(12)
const selected = ref(null)

const nums = computed(() => Array.from({ length: maxN.value }, (_, i) => i + 1))

function setRange(n) {
  playSound('tap')
  maxN.value = n
  selected.value = null
}

function pick(a, b) {
  playSound('flip')
  selected.value = { a, b, product: a * b }
  showToast({ message: `${a} × ${b} = ${a * b}`, position: 'bottom' })
}
</script>

<template>
  <div class="page browse">
    <MuteButton />
    <h1 class="page-title">九九表浏览</h1>
    <p class="page-sub">点格子查看算式；可筛选练习范围</p>

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

    <div v-if="selected" class="formula card-3d feedback-pop">
      <span class="eq">{{ selected.a }} × {{ selected.b }}</span>
      <span class="eq-eq">=</span>
      <span class="eq-ans">{{ selected.product }}</span>
    </div>

    <div class="table-wrap card-3d">
      <div class="table-scroll">
        <table class="mt-table">
          <thead>
            <tr>
              <th class="corner">×</th>
              <th v-for="c in nums" :key="'h' + c">{{ c }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in nums" :key="'r' + r">
              <th>{{ r }}</th>
              <td
                v-for="c in nums"
                :key="r + '-' + c"
                :class="{
                  active: selected && selected.a === r && selected.b === c,
                  square: r === c,
                }"
                @click="pick(r, c)"
              >
                {{ r * c }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.formula {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  margin-bottom: 12px;
  font-weight: 900;
}
.eq {
  font-size: 1.4rem;
  color: var(--c-ink);
}
.eq-eq {
  color: var(--c-muted);
  font-size: 1.2rem;
}
.eq-ans {
  font-size: 1.7rem;
  color: var(--c-coral-deep);
}
.table-wrap {
  padding: 8px;
  overflow: hidden;
}
.table-scroll {
  overflow: auto;
  max-height: calc(100dvh - 280px);
  -webkit-overflow-scrolling: touch;
}
.mt-table {
  border-collapse: separate;
  border-spacing: 4px;
  min-width: 100%;
}
.mt-table th,
.mt-table td {
  min-width: 36px;
  height: 36px;
  text-align: center;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  user-select: none;
}
.mt-table thead th,
.mt-table tbody th {
  background: linear-gradient(160deg, #ffe0d8, #ffc9be);
  color: #8a2e24;
  position: sticky;
  z-index: 1;
}
.mt-table thead th {
  top: 0;
}
.mt-table tbody th {
  left: 0;
}
.mt-table .corner {
  left: 0;
  z-index: 2;
  background: linear-gradient(160deg, var(--c-coral), var(--c-coral-deep));
  color: #fff;
}
.mt-table td {
  background: #fff;
  box-shadow: 0 3px 0 rgba(45, 49, 66, 0.06);
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease;
}
.mt-table td:active {
  transform: scale(0.92) translateY(2px);
}
.mt-table td.square {
  background: linear-gradient(160deg, #fff3c4, #ffe08a);
}
.mt-table td.active {
  background: linear-gradient(160deg, var(--c-teal), var(--c-teal-deep));
  color: #fff;
  box-shadow: 0 4px 0 #1f9a91, 0 6px 12px rgba(43, 184, 174, 0.35);
  transform: translateY(-2px) scale(1.05);
}
</style>
