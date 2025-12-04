import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/pages/auth/Login.vue'
import Signup from './components/pages/auth/Signup.vue'
const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/signup',
    component: Signup
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
