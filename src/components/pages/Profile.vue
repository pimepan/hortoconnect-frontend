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
                            <div class="badge bg-primary fs-6 p-2">
                                Contractor
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
                            <h3 class="text-primary mb-0">{{ currentBids.length }}</h3>
                            <p class="text-muted mb-0">Active bids</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success mb-0">{{ pastWorks.length }}</h3>
                            <p class="text-muted mb-0">Completed jobs</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info mb-0">{{ totalEarnings }}</h3>
                            <p class="text-muted mb-0">Total earnings</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Current Bids Section -->
            <div class="card mb-4">
                <div class="card-header">
                    <h4 class="mb-0">Current bids</h4>
                </div>
                <div class="card-body">
                    <div v-if="loadingBids" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading…</span>
                        </div>
                    </div>
                    <div v-else-if="currentBids.length === 0" class="text-center py-4 text-muted">
                        <p class="mb-0">You don’t have any active bids right now.</p>
                    </div>
                    <div v-else>
                        <div v-for="bid in currentBids" :key="bid.id" class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <h5 class="card-title mb-2">{{ bid.projectTitle || 'Untitled project' }}</h5>
                                        <p class="text-muted mb-1">
                                            <small>Bid: {{ formatCurrency(bid.amount) }}</small>
                                        </p>
                                        <p class="text-muted mb-0">
                                            <small>Date: {{ formatDate(bid.createdAt) }}</small>
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

            <!-- Past Works Section -->
            <div class="card">
                <div class="card-header">
                    <h4 class="mb-0">Past jobs</h4>
                </div>
                <div class="card-body">
                    <div v-if="loadingWorks" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading…</span>
                        </div>
                    </div>
                    <div v-else-if="pastWorks.length === 0" class="text-center py-4 text-muted">
                        <p class="mb-0">You haven’t completed any jobs yet.</p>
                    </div>
                    <div v-else>
                        <div v-for="work in pastWorks" :key="work.id" class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-6">
                                        <h5 class="card-title mb-2">{{ work.projectTitle || 'Untitled project' }}</h5>
                                        <p class="text-muted mb-1">
                                            <small>Amount: {{ formatCurrency(work.amount) }}</small>
                                        </p>
                                        <p class="text-muted mb-0">
                                            <small>Completed: {{ formatDate(work.completedAt || work.updatedAt) }}</small>
                                        </p>
                                    </div>
                                    <div class="col-md-4">
                                        <p class="mb-0">
                                            <span class="badge bg-success">Completed</span>
                                        </p>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <button class="btn btn-sm btn-outline-primary" @click="viewWorkDetails(work.id)">
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
import { Mail } from 'lucide-vue-next'
import { auth } from '../../firebase.js'
import config from '../../config.js'
import { formatCurrencyUSD, formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'Profile',
    components: {
        Mail
    },
    setup() {
        const router = useRouter()
        const profile = ref({})
        const currentBids = ref([])
        const pastWorks = ref([])
        const loading = ref(true)
        const loadingBids = ref(true)
        const loadingWorks = ref(true)
        const error = ref('')

        const totalEarnings = computed(() => {
            const total = pastWorks.value.reduce((sum, work) => {
                return sum + (parseFloat(work.amount) || 0)
            }, 0)
            return formatCurrencyUSD(total)
        })

        const getAuthToken = async () => {
            const user = auth.currentUser
            if (!user) {
                // Redirect to login if not authenticated
                router.push('/login')
                throw new Error('User not authenticated')
            }
            return await user.getIdToken()
        }

        const fetchProfile = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()

                if (!response.ok) {
                    if (response.status === 401) {
                        // Unauthorized - redirect to login
                        router.push('/login')
                        return
                    }
                    throw new Error(data.error || 'Error loading profile')
                }

                profile.value = data.profile
            } catch (err) {
                // Only show error if it's not an authentication error (which redirects)
                if (err.message !== 'User not authenticated') {
                    error.value = err.message || 'Error loading profile'
                    console.error('Profile fetch error:', err)
                }
            } finally {
                loading.value = false
            }
        }

        const fetchCurrentBids = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/bids/current`, {
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

                currentBids.value = data.bids || []
            } catch (err) {
                console.error('Bids fetch error:', err)
                currentBids.value = []
            } finally {
                loadingBids.value = false
            }
        }

        const fetchPastWorks = async () => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/works/past`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Error loading jobs')
                }

                pastWorks.value = data.works || []
            } catch (err) {
                console.error('Works fetch error:', err)
                pastWorks.value = []
            } finally {
                loadingWorks.value = false
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
                pending: 'Pending',
                submitted: 'Submitted',
                under_review: 'Under review',
                accepted: 'Accepted',
                rejected: 'Rejected'
            }
            return statusMap[status] || status
        }

        const getStatusBadgeClass = (status) => {
            const classMap = {
                'pending': 'badge bg-warning',
                'submitted': 'badge bg-info',
                'under_review': 'badge bg-primary',
                'accepted': 'badge bg-success',
                'rejected': 'badge bg-danger'
            }
            return classMap[status] || 'badge bg-secondary'
        }

        const viewBidDetails = (bidId) => {
            // TODO: Navigate to bid details page
            console.log('View bid:', bidId)
        }

        const viewWorkDetails = (workId) => {
            // TODO: Navigate to work details page
            console.log('View work:', workId)
        }

        onMounted(async () => {
            await Promise.all([
                fetchProfile(),
                fetchCurrentBids(),
                fetchPastWorks()
            ])
        })

        return {
            profile,
            currentBids,
            pastWorks,
            loading,
            loadingBids,
            loadingWorks,
            error,
            totalEarnings,
            formatDate,
            formatCurrency,
            getStatusLabel,
            getStatusBadgeClass,
            viewBidDetails,
            viewWorkDetails
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s ease;
    overflow: hidden;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
    transform: translateY(-2px);
}

.card-header {
    background: rgba(var(--primary-rgb), 0.08);
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.12);
    padding: 1.25rem 1.5rem;
    font-weight: 700;
}

.card-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.text-center .card {
    transition: all 0.3s ease;
}

.text-center .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.text-center .card h3 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
}

.badge {
    font-size: 1rem;
    font-weight: 700;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
}

.btn-sm {
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-sm:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
}

.alert {
    border-radius: 12px;
}
</style>
