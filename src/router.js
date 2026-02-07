import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

import Home from './components/pages/marketing/Home.vue'
import HowItWorks from './components/pages/marketing/HowItWorks.vue'
import ForContractors from './components/pages/marketing/ForContractors.vue'
import ForBrokerages from './components/pages/marketing/ForBrokerages.vue'
import ForBuyers from './components/pages/marketing/ForBuyers.vue'

import Login from './components/pages/auth/Login.vue'
import Signup from './components/pages/auth/Signup.vue'
import RoleSelection from './components/pages/auth/RoleSelection.vue'
import ContractorOnboarding from './components/pages/auth/ContractorOnboarding.vue'

import Dashboard from './components/pages/Dashboard.vue'
import ContractorProfile from './components/pages/ContractorProfile.vue'
import ContractorPublicProfile from './components/pages/ContractorPublicProfile.vue'
import BuyerProfile from './components/pages/BuyerProfile.vue'
import BrokerageProfile from './components/pages/BrokerageProfile.vue'
import ContractsList from './components/pages/ContractsList.vue'
import NewContract from './components/pages/NewContract.vue'
import EditContract from './components/pages/EditContract.vue'
import ContractDetail from './components/pages/ContractDetail.vue'
import Applications from './components/pages/Applications.vue'
import FileDropzoneDemo from './components/pages/FileDropzoneDemo.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/how-it-works',
    component: HowItWorks
  },
  {
    path: '/for-contractors',
    component: ForContractors
  },
  {
    path: '/for-brokerages',
    component: ForBrokerages
  },
  {
    path: '/for-buyers',
    component: ForBuyers
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/signup',
    component: Signup
  },
  {
    path: '/select-role',
    component: RoleSelection
  },
  {
    path: '/onboarding/contractor',
    component: ContractorOnboarding,
    props: { role: 'contractor' },
    meta: { requiresAuth: true, requiredRoles: ['contractor'] }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/contractor',
    component: ContractorProfile,
    meta: { requiresAuth: true, requiredRoles: ['contractor'] }
  },
  {
    path: '/profile/buyer',
    component: BuyerProfile,
    meta: { requiresAuth: true, requiredRoles: ['bid_poster'] }
  },
  {
    path: '/profile/brokerage',
    component: BrokerageProfile,
    meta: { requiresAuth: true, requiredRoles: ['brokerage'] }
  },
  {
    path: '/profile/bid-poster',
    redirect: '/profile/buyer'
  },
  {
    path: '/contractors/:id',
    component: ContractorPublicProfile
  },
  {
    path: '/contracts',
    component: ContractsList,
    // Public marketplace: browsing doesn't require auth
  },
  {
    path: '/contracts/new',
    component: NewContract,
    meta: { requiresAuth: true, requiredRoles: ['bid_poster'] }
  },
  {
    path: '/contracts/:id/edit',
    component: EditContract,
    meta: { requiresAuth: true, requiredRoles: ['bid_poster'] }
  },
  {
    path: '/contracts/:id',
    component: ContractDetail,
    // Public marketplace: viewing details doesn't require auth
  },
  {
    path: '/applications',
    component: Applications,
    meta: { requiresAuth: true }
  },
  {
    path: '/demo/file-dropzone',
    component: FileDropzoneDemo
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  if (!requiresAuth) return next()

  // Use token wait to avoid false negatives during Firebase init.
  try {
    await authStore.getAuthToken()
  } catch {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Ensure we have a profile before enforcing roles.
  if (!authStore.userProfile) {
    await authStore.fetchUserProfile()
  }

  const requiredRoles = to.meta?.requiredRoles
  if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    const roles = authStore.userProfile?.roles || []
    const hasRole = requiredRoles.some(r => roles.includes(r))
    if (!hasRole) {
      if (!authStore.userProfile || !authStore.userProfile.userType) return next('/select-role')
      return next('/dashboard')
    }
  }

  return next()
})

export default router
