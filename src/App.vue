<template>
  <div class="app-wrapper">
    <Navbar v-if="showNavbar" />
    <main class="main-content">
      <router-view />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  components: {
    Navbar,
    Footer
  },
  setup() {
    const route = useRoute()
    
    const showNavbar = computed(() => {
      // Don't show navbar on auth screens
      const hideNavbarRoutes = ['/login', '/signup', '/select-role']
      return !hideNavbarRoutes.includes(route.path)
    })

    const showFooter = computed(() => {
      // Don't show footer on auth screens
      const hideFooterRoutes = ['/login', '/signup', '/select-role']
      return !hideFooterRoutes.includes(route.path)
    })

    return {
      showNavbar,
      showFooter
    }
  }
}
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>

<style>

</style>