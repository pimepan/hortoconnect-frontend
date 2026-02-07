<template>
    <div class="container-fluid h-100 d-flex align-items-center justify-content-center role-selection-container">
        <div class="row w-100 justify-content-center">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7">
                <div class="card shadow-lg border-0">
                    <div class="card-body p-4 p-md-5">
                        <div class="text-center mb-4">
                            <h2 class="card-title mb-2 fw-bold">Select your primary role</h2>
                            <p class="text-muted mb-0">Choose how you want to use Hortoconnect. You can change this later.</p>
                        </div>
                        
                        <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                            <AlertTriangle class="me-2" :size="18" />
                            <span>{{ errorMessage }}</span>
                        </div>

                        <div class="row g-4 mb-4">
                            <div class="col-md-4">
                                <div 
                                    class="card h-100 role-card" 
                                    :class="{ 'selected': selectedRole === 'bid_poster' }"
                                    @click="selectedRole = 'bid_poster'"
                                    style="cursor: pointer;"
                                >
                                    <div class="card-body text-center p-4">
                                        <div class="mb-3">
                                            <FileText :size="48" style="color: #6c757d;" />
                                        </div>
                                        <h4 class="card-title">Buyer (City / HOA)</h4>
                                        <p class="card-text text-muted">
                                            Post contracts and review contractor applications.
                                        </p>
                                        <ul class="list-unstyled text-start">
                                            <li>✓ Post contracts</li>
                                            <li>✓ Review applications</li>
                                            <li>✓ See compliance status</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div 
                                    class="card h-100 role-card" 
                                    :class="{ 'selected': selectedRole === 'contractor' }"
                                    @click="selectedRole = 'contractor'"
                                    style="cursor: pointer;"
                                >
                                    <div class="card-body text-center p-4">
                                        <div class="mb-3">
                                            <Wrench :size="48" style="color: #6c757d;" />
                                        </div>
                                        <h4 class="card-title">Contractor</h4>
                                        <p class="card-text text-muted">
                                            Apply to contracts and manage your compliance documents.
                                        </p>
                                        <ul class="list-unstyled text-start">
                                            <li>✓ Upload documents</li>
                                            <li>✓ One-click apply</li>
                                            <li>✓ Track compliance</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div 
                                    class="card h-100 role-card" 
                                    :class="{ 'selected': selectedRole === 'brokerage' }"
                                    @click="selectedRole = 'brokerage'"
                                    style="cursor: pointer;"
                                >
                                    <div class="card-body text-center p-4">
                                        <div class="mb-3">
                                            <Shield :size="48" style="color: #6c757d;" />
                                        </div>
                                        <h4 class="card-title">Broker / Agency</h4>
                                        <p class="card-text text-muted">
                                            Receive qualified inbound requests from non-compliant contractors.
                                        </p>
                                        <ul class="list-unstyled text-start">
                                            <li>✓ Quote requests</li>
                                            <li>✓ Document review requests</li>
                                            <li>✓ Direct contact</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <WButton 
                            class="btn-primary w-100"
                            :loading="loading"
                            :disabled="loading || !selectedRole"
                            @click="handleRoleSelection"
                        >
                            {{ loading ? 'Saving…' : 'Continue' }}
                        </WButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { AlertTriangle, FileText, Wrench, Shield } from 'lucide-vue-next'
import WButton from '../../utils/WButton.vue'
import config from '../../../config.js'

export default {
    components: {
        WButton,
        AlertTriangle,
        FileText,
        Wrench,
        Shield
    },
    setup() {
        const selectedRole = ref(null)
        const errorMessage = ref('')
        const loading = ref(false)
        const router = useRouter()
        const route = useRoute()
        const authStore = useAuthStore()

        // Optional pre-select from marketing/signup CTA
        const preselected = route.query.role
        if (['bid_poster', 'contractor', 'brokerage'].includes(preselected)) {
            selectedRole.value = preselected
        }

        const handleRoleSelection = async () => {
            if (!selectedRole.value) {
                errorMessage.value = 'Please select a role.'
                return
            }

            errorMessage.value = ''
            loading.value = true

            try {
                const token = await authStore.getAuthToken()
                const response = await fetch(`${config.backend.api}/api/user/select-role`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        role: selectedRole.value
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    errorMessage.value = data.error || 'Failed to select role.'
                    return
                }

                // Refresh user profile in store
                await authStore.fetchUserProfile()

                // Redirect to the role dashboard
                if (selectedRole.value === 'contractor') {
                    router.push('/onboarding/contractor')
                } else if (selectedRole.value === 'bid_poster') {
                    router.push('/profile/buyer')
                } else {
                    router.push('/profile/brokerage')
                }
            } catch (error) {
                errorMessage.value = 'Connection error. Please try again.'
                console.error('Role selection error:', error)
            } finally {
                loading.value = false
            }
        }

        return {
            selectedRole,
            errorMessage,
            loading,
            handleRoleSelection
        }
    }
}
</script>

<style scoped>
.role-selection-container {
    min-height: 100vh;
    background: transparent;
    padding: 2rem 1rem;
}

.card {
    border-radius: 8px;
    border: 1px solid rgba(var(--primary-rgb), 0.14);
}

.card-body {
    background: transparent;
}

.role-card {
    transition: all 0.3s ease;
    border: 2px solid rgba(var(--primary-rgb), 0.14);
    border-radius: 8px;
}

.role-card:hover {
    border-color: var(--primary);
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.role-card.selected {
    border-color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.06);
}

.alert {
    border-radius: 8px;
}

@media (max-width: 768px) {
    .role-selection-container {
        padding: 1rem;
    }
    
    .card-body {
        padding: 2rem 1.5rem !important;
    }
}
</style>
