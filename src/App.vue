<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { playSound } from './utils/audio'

const route = useRoute()
const showTabbar = computed(() => route.meta.tabbar !== false)

function onTabChange() {
  playSound('tap')
}
</script>

<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <transition name="page-flip" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <van-tabbar
      v-if="showTabbar"
      route
      safe-area-inset-bottom
      active-color="#FF6B5A"
      inactive-color="#9AA3B2"
      class="app-tabbar"
      @change="onTabChange"
    >
      <van-tabbar-item replace to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item replace to="/browse" icon="apps-o">九九表</van-tabbar-item>
      <van-tabbar-item replace to="/flash" icon="bulb-o">闪卡</van-tabbar-item>
      <van-tabbar-item replace to="/challenge" icon="flag-o">闯关</van-tabbar-item>
      <van-tabbar-item replace to="/more" icon="more-o">更多</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
