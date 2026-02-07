<template>
    <div class="container py-4">
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-else>
            <!-- Profile Header -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h2 class="card-title mb-2">{{ profile.name || 'No name' }}</h2>
                            <p class="text-muted mb-1 d-flex align-items-center">
                                <Mail class="me-2" :size="16" /> {{ profile.email }}
                            </p>
                            <p class="text-muted mb-0">
                                <small>Member since: {{ formatDate(profile.createdAt) }}</small>
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <div class="badge bg-primary fs-6 p-2 d-flex align-items-center justify-content-end">
                                <FileText class="me-1" :size="16" />Buyer
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-4 mb-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary mb-0">{{ activeBids.length }}</h3>
                            <p class="text-muted mb-0">Active bids</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success mb-0">{{ pastBids.length }}</h3>
                            <p class="text-muted mb-0">Completed bids</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info mb-0">{{ totalSpent }}</h3>
                            <p class="text-muted mb-0">Total spend</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Active Bids Section -->
            <div class="card mb-4">
                <div class="card-header">
                    <h4 class="mb-0">My active bids</h4>
                </div>
                <div class="card-body">
                    <div v-if="loadingActiveBids" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading…</span>
                        </div>
                    </div>
                    <div v-else-if="activeBids.length === 0" class="text-center py-4 text-muted">
                        <p class="mb-0">You don’t have any active bids right now.</p>
                    </div>
                    <div v-else>
                        <div v-for="bid in activeBids" :key="bid.id" class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <h5 class="card-title mb-2">{{ bid.projectTitle || 'Untitled project' }}</h5>
                                        <p class="text-muted mb-1">
                                            <small>Budget: {{ formatCurrency(bid.budget) }}</small>
                                        </p>
                                        <p class="text-muted mb-0">
                                            <small>Posted: {{ formatDate(bid.createdAt) }}</small>
                                        </p>
                                    </div>
                                    <div class="col-md-4">
                                        <span :class="getStatusBadgeClass(bid.status)">
                                            {{ getStatusLabel(bid.status) }}
                                        </span>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <button class="btn btn-sm btn-outline-primary" @click="viewBidDetails(bid.id)">
                                            View details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Past Bids Section -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">Completed bids</h4>
                </div>
                <div class="card-body">
                    <div v-if="loadingPastBids" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading…</span>
                        </div>
                    </div>
                    <div v-else-if="pastBids.length === 0" class="text-center py-4 text-muted">
                        <p class="mb-0">You haven’t completed any bids yet.</p>
                    </div>
                    <div v-else>
                        <div v-for="bid in pastBids" :key="bid.id" class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <h5 class="card-title mb-2">{{ bid.projectTitle || 'Untitled project' }}</h5>
                                        <p class="text-muted mb-1">
                                            <small>Final amount: {{ formatCurrency(bid.finalAmount || bid.budget) }}</small>
                                        </p>
                                        <p class="text-muted mb-0">
                                            <small>Completed: {{ formatDate(bid.completedAt || bid.updatedAt) }}</small>
                                        </p>
                                    </div>
                                    <div class="col-md-4">
                                        <p class="mb-0">
                                            <span class="badge bg-success">Completed</span>
                                        </p>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <button class="btn btn-sm btn-outline-primary" @click="viewBidDetails(bid.id)">
                                            View details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, FileText } from 'lucide-vue-next'
import config from '../../config.js'
import { formatCurrencyUSD, formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'BidPosterProfile',
    components: {
        Mail,
        FileText
    },
    setup() {
        const router = useRouter()
        const profile = ref({})
        const activeBids = ref([])
        const pastBids = ref([])
        const loading = ref(true)
        const loadingActiveBids = ref(true)
        const loadingPastBids = ref(true)
        const error = ref('')

        const totalSpent = computed(() => {
            const active = activeBids.value.reduce((sum, bid) => sum + (parseFloat(bid.budget) || 0), 0)
            const past = pastBids.value.reduce((sum, bid) => sum + (parseFloat(bid.finalAmount || bid.budget) || 0), 0)
            return formatCurrencyUSD(active + past)
        })

        const authStore = useAuthStore()

        const getAuthToken = async () => {
            return await authStore.getAuthToken()
        }

        const fetchProfile = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/bid-poster`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()

                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/login')
                        return
                    }
                    if (response.status === 404) {
                        // Profile doesn't exist, redirect to role selection
                        router.push('/select-role')
                        return
                    }
                    throw new Error(data.error || 'Error loading profile')
                }

                profile.value = data.profile
            } catch (err) {
                if (err.message !== 'User not authenticated') {
                    // Only show error if it's not a redirect
                    if (!err.message.includes('redirect')) {
                        error.value = err.message || 'Error loading profile'
                        console.error('Profile fetch error:', err)
                    }
                }
            } finally {
                loading.value = false
            }
        }

        const fetchActiveBids = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/bid-poster/bids/active`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error loading bids')
                }

                activeBids.value = data.bids || []
            } catch (err) {
                console.error('Active bids fetch error:', err)
                activeBids.value = []
            } finally {
                loadingActiveBids.value = false
            }
        }

        const fetchPastBids = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/bid-poster/bids/past`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error loading bids')
                }

                pastBids.value = data.bids || []
            } catch (err) {
                console.error('Past bids fetch error:', err)
                pastBids.value = []
            } finally {
                loadingPastBids.value = false
            }
        }

        const formatDate = (dateString) => {
            return formatDateLong(dateString)
        }

        const formatCurrency = (amount) => {
            return formatCurrencyUSD(amount)
        }

        const getStatusLabel = (status) => {
            const statusMap = {
                open: 'Open',
                under_review: 'Under review',
                awarded: 'Awarded',
                completed: 'Completed',
                cancelled: 'Cancelled'
            }
            return statusMap[status] || status
        }

        const getStatusBadgeClass = (status) => {
            const classMap = {
                'open': 'badge bg-success',
                'under_review': 'badge bg-primary',
                'awarded': 'badge bg-info',
                'completed': 'badge bg-secondary',
                'cancelled': 'badge bg-danger'
            }
            return classMap[status] || 'badge bg-secondary'
        }

        const viewBidDetails = (bidId) => {
            console.log('View bid:', bidId)
        }

        onMounted(async () => {
            await Promise.all([
                fetchProfile(),
                fetchActiveBids(),
                fetchPastBids()
            ])
        })

        return {
            profile,
            activeBids,
            pastBids,
            loading,
            loadingActiveBids,
            loadingPastBids,
            error,
            totalSpent,
            formatDate,
            formatCurrency,
            getStatusLabel,
            getStatusBadgeClass,
            viewBidDetails
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.badge {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
}
</style>
