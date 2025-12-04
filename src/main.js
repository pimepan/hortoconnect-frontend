import App from './App.vue'
import router from './router'
import { createApp } from 'vue'
import VWave from "v-wave";

createApp(App)
.use(router)
.use(VWave)
.mount('#app')
