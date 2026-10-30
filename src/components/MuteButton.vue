<script setup>
import { ref } from 'vue'
import { isMuted, toggleMute, playSound } from '../utils/audio'

const muted = ref(isMuted())

function onToggle() {
  muted.value = toggleMute()
  if (!muted.value) playSound('tap')
}
</script>

<template>
  <button class="mute-fab" type="button" :aria-label="muted ? '开启音效' : '静音'" @click="onToggle">
    {{ muted ? '🔇' : '🔊' }}
  </button>
</template>
