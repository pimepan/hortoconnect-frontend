<template>
    <div class="container py-5 text-center">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading…</span>
        </div>
        <div class="text-muted mt-3">Redirecting to your dashboard…</div>
    </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

export default {
    name: 'Dashboard',
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        onMounted(() => {
            const userType = authStore.currentUserType
            if (userType === 'contractor') router.replace('/profile/contractor')
            else if (userType === 'bid_poster') router.replace('/profile/buyer')
            else if (userType === 'brokerage') router.replace('/profile/brokerage')
            else router.replace('/select-role')
        })

        return {}
    }
}
</script>

