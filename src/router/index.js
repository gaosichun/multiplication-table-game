import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue'), meta: { title: '首页' } },
  { path: '/browse', name: 'browse', component: () => import('../views/Browse.vue'), meta: { title: '九九表' } },
  { path: '/flash', name: 'flash', component: () => import('../views/Flashcard.vue'), meta: { title: '闪卡练习' } },
  { path: '/challenge', name: 'challenge', component: () => import('../views/Challenge.vue'), meta: { title: '闯关挑战' } },
  { path: '/memory', name: 'memory', component: () => import('../views/Memory.vue'), meta: { title: '遮罩记忆', tabbar: false } },
  { path: '/match', name: 'match', component: () => import('../views/Match.vue'), meta: { title: '连连看', tabbar: false } },
  { path: '/wrong', name: 'wrong', component: () => import('../views/WrongBook.vue'), meta: { title: '错题本', tabbar: false } },
  { path: '/more', name: 'more', component: () => import('../views/More.vue'), meta: { title: '更多' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 乘法表乐园` : '19×19 乘法表乐园'
})

export default router
