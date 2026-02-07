import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import VWave from "v-wave";
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(VWave)

// Initialize auth state before mounting
const authStore = useAuthStore()
authStore.initializeAuth().then(() => {
    app.mount('#app')
})
