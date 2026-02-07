<template>
    <div class="buyer-profile">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger container" role="alert">
            {{ error }}
        </div>

        <!-- Profile Content -->
        <div v-else>
            <!-- Hero Section -->
            <div class="profile-hero">
                <div class="container">
                    <div class="profile-hero-content">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar">
                                <img v-if="photoUrl" :src="photoUrl" alt="Profile photo" />
                                <div v-else class="avatar-placeholder">{{ initials }}</div>
                            </div>
                            <label class="btn btn-sm btn-outline-primary mt-3 change-photo-btn">
                                {{ uploadingPhoto ? 'Uploading…' : 'Change Photo' }}
                                <input
                                    type="file"
                                    class="d-none"
                                    accept="image/*"
                                    :disabled="uploadingPhoto"
                                    @change="onProfilePhotoSelected"
                                />
                            </label>
                            <div v-if="photoError" class="text-danger small mt-2">{{ photoError }}</div>
                        </div>
                        <div class="profile-hero-info">
                            <h1 class="profile-name">{{ organization.name || profile.name || 'Buyer' }}</h1>
                            <p class="profile-email">
                                <Mail class="me-2" :size="18" /> {{ organization.contactEmail || profile.email }}
                            </p>
                            <p class="profile-meta">
                                <Calendar class="me-2" :size="16" />
                                Member since {{ formatDate(profile.createdAt) }}
                            </p>
                            <div class="profile-badge">
                                <FileText class="me-1" :size="18" />Buyer
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="container profile-content">
                <!-- Stats -->
                <ProfileStats :stats="statsData" :columns="3" />

                <!-- Tabs -->
                <ProfileTabs :tabs="tabs" :active-tab="activeTab" @tab-change="onTabChange">
                    <!-- Overview Tab -->
                    <div v-if="activeTab === 'overview'" class="tab-pane active show">
                        <div class="row g-4">
                            <div class="col-12">
                                <div class="card">
                                    <div class="card-header">
                                        <h4 class="mb-0">Recent Activity</h4>
                                    </div>
                                    <div class="card-body">
                                        <div v-if="recentActivity.length === 0" class="text-center text-muted py-4">
                                            No recent activity
                                        </div>
                                        <div v-else>
                                            <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
                                                <div class="activity-icon">
                                                    <component :is="activity.icon" :size="20" />
                                                </div>
                                                <div class="activity-content">
                                                    <div class="activity-title">{{ activity.title }}</div>
                                                    <div class="activity-time">{{ activity.time }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Tab -->
                    <div v-if="activeTab === 'profile'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Organization Information</h4>
                                <WButton
                                    class="btn-primary"
                                    :loading="saving"
                                    :disabled="saving"
                                    @click="saveProfile"
                                >
                                    {{ saving ? 'Saving…' : 'Save Changes' }}
                                </WButton>
                            </div>
                            <div class="card-body">
                                <div v-if="saveError" class="alert alert-danger" role="alert">
                                    {{ saveError }}
                                </div>
                                <div v-if="saveSuccess" class="alert alert-success" role="alert">
                                    {{ saveSuccess }}
                                </div>

                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Organization Name <span class="text-danger">*</span></label>
                                        <input v-model="organization.name" type="text" class="form-control" required />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Type <span class="text-danger">*</span></label>
                                        <select v-model="organization.type" class="form-select" required>
                                            <option :value="null">Select type…</option>
                                            <option value="city">City</option>
                                            <option value="hoa">HOA</option>
                                            <option value="private">Private buyer</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Contact Email</label>
                                        <input v-model="organization.contactEmail" type="email" class="form-control" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Phone</label>
                                        <input v-model="organization.phone" type="tel" class="form-control" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Address</label>
                                        <input v-model="organization.address" type="text" class="form-control" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Open Contracts Tab -->
                    <div v-if="activeTab === 'open-contracts'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">My Open Contracts</h4>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary me-2" :disabled="loadingContracts" @click="fetchContracts">
                                        Refresh
                                    </button>
                                    <router-link to="/contracts/new" class="btn btn-primary">
                                        <Plus class="me-2" :size="18" />
                                        Post New Contract
                                    </router-link>
                                </div>
                            </div>
                            <div class="card-body">
                                <div v-if="loadingContracts" class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <div v-else-if="openContracts.length === 0" class="text-center py-4 text-muted">
                                    <p>You don't have any open contracts yet.</p>
                                    <router-link to="/contracts/new" class="btn btn-primary mt-2">
                                        Post Your First Contract
                                    </router-link>
                                </div>
                                <div v-else>
                                    <div class="row g-3">
                                        <div v-for="contract in openContracts" :key="contract.id" class="col-12 col-md-6">
                                            <div class="contract-card">
                                                <div class="contract-header">
                                                    <h5 class="contract-title">{{ contract.title || 'Untitled' }}</h5>
                                                    <span :class="getStatusBadgeClass(contract.status)">
                                                        {{ getStatusLabel(contract.status) }}
                                                    </span>
                                                </div>
                                                <div v-if="contract.budget" class="contract-budget">
                                                    <span class="contract-budget-amount">{{ formatCurrency(contract.budget) }}</span>
                                                    <span class="contract-budget-label">Budget</span>
                                                </div>
                                                <p class="contract-description">{{ truncate(contract.description, 100) }}</p>
                                                <div class="contract-meta">
                                                    <span class="meta-item">
                                                        <MapPin :size="14" />
                                                        {{ contract.locationCity || '' }}{{ contract.locationCity && contract.locationState ? ', ' : '' }}{{ contract.locationState || '' }}
                                                    </span>
                                                    <span class="meta-item">
                                                        <Users :size="14" />
                                                        {{ contract.applicationsCount || 0 }} applications
                                                    </span>
                                                </div>
                                                <div class="contract-actions">
                                                    <router-link :to="`/contracts/${contract.id}`" class="btn btn-sm btn-outline-primary">
                                                        View Details
                                                    </router-link>
                                                    <button class="btn btn-sm btn-outline-secondary" @click="editContract(contract)">
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Past Contracts Tab -->
                    <div v-if="activeTab === 'past-contracts'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Completed Contracts</h4>
                                <button class="btn btn-sm btn-outline-primary" :disabled="loadingContracts" @click="fetchContracts">
                                    Refresh
                                </button>
                            </div>
                            <div class="card-body">
                                <div v-if="loadingContracts" class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <div v-else-if="pastContracts.length === 0" class="text-center py-4 text-muted">
                                    You haven't completed any contracts yet.
                                </div>
                                <div v-else>
                                    <div v-for="contract in pastContracts" :key="contract.id" class="contract-item">
                                        <div class="contract-content">
                                            <h5 class="contract-title">{{ contract.title || 'Untitled' }}</h5>
                                            <div class="contract-meta">
                                                <span class="text-muted">Final amount: {{ formatCurrency(contract.finalAmount || contract.budget) }}</span>
                                                <span class="text-muted ms-3">Completed: {{ formatDate(contract.completedAt || contract.updatedAt) }}</span>
                                            </div>
                                        </div>
                                        <div class="contract-actions">
                                            <router-link :to="`/contracts/${contract.id}`" class="btn btn-sm btn-outline-primary">
                                                View Details
                                            </router-link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Applications Received Tab -->
                    <div v-if="activeTab === 'applications'" class="tab-pane active show">
                        <ApplicationsList
                            variant="embedded"
                            title="Applications Received"
                            role="bid_poster"
                            @loaded="onApplicationsLoaded"
                        />
                    </div>
                </ProfileTabs>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, Calendar, FileText, Plus, MapPin, Users, Briefcase, CheckCircle, Clock } from 'lucide-vue-next'
import ProfileTabs from '../ProfileTabs.vue'
import ProfileStats from '../ProfileStats.vue'
import ApplicationsList from '../ApplicationsList.vue'
import WButton from '../utils/WButton.vue'
import config from '../../config.js'
import { formatCurrencyUSD, formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'BuyerProfile',
    components: {
        Mail,
        Calendar,
        FileText,
        Plus,
        MapPin,
        Users,
        Briefcase,
        CheckCircle,
        Clock,
        ProfileTabs,
        ProfileStats,
        ApplicationsList,
        WButton
    },
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        const profile = ref({})
        const organization = ref({
            name: '',
            type: null,
            contactEmail: '',
            phone: '',
            address: ''
        })
        const loading = ref(true)
        const error = ref('')
        const activeTab = ref('overview')

        const saving = ref(false)
        const saveError = ref('')
        const saveSuccess = ref('')

        const uploadingPhoto = ref(false)
        const photoError = ref('')

        const openContracts = ref([])
        const pastContracts = ref([])
        const loadingContracts = ref(true)

        const applications = ref([])
        const loadingApplications = ref(true)

        // Track per-tab data fetching (first-open safety).
        const fetched = ref({
            profile: false,
            contracts: false,
            applications: false
        })

        const photoUrl = computed(() => profile.value?.photoUrl || authStore.userProfile?.photoUrl || null)
        const initials = computed(() => {
            const name = (organization.value.name || profile.value.name || '').toString().trim()
            if (name) {
                const parts = name.split(/\s+/).slice(0, 2)
                return parts.map(p => (p[0] || '').toUpperCase()).join('')
            }
            const email = (organization.value.contactEmail || profile.value.email || '').toString().trim()
            return email ? email[0].toUpperCase() : 'B'
        })

        const statsData = computed(() => [
            {
                id: 'open',
                label: 'Open Contracts',
                value: openContracts.value.length,
                icon: Briefcase,
                color: 'var(--primary)'
            },
            {
                id: 'completed',
                label: 'Completed Contracts',
                value: pastContracts.value.length,
                icon: CheckCircle,
                color: 'var(--success)'
            },
            {
                id: 'spend',
                label: 'Total Spend',
                value: totalSpent.value,
                icon: Briefcase,
                color: 'var(--info)'
            }
        ])

        const totalSpent = computed(() => {
            const open = openContracts.value.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0)
            const past = pastContracts.value.reduce((sum, c) => sum + (parseFloat(c.finalAmount || c.budget) || 0), 0)
            return formatCurrencyUSD(open + past)
        })

        const recentActivity = computed(() => {
            const activities = []
            if (openContracts.value.length > 0) {
                openContracts.value.slice(0, 3).forEach(contract => {
                    activities.push({
                        id: `contract-${contract.id}`,
                        title: `Posted "${contract.title || contract.id}"`,
                        time: formatDate(contract.createdAt),
                        icon: Briefcase
                    })
                })
            }
            if (applications.value.length > 0) {
                applications.value.slice(0, 2).forEach(app => {
                    activities.push({
                        id: `app-${app.id}`,
                        title: `Received application for "${app.contractTitle || app.contractId}"`,
                        time: formatDate(app.createdAt),
                        icon: Users
                    })
                })
            }
            return activities.slice(0, 5)
        })

        const tabs = computed(() => [
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'profile', label: 'Profile', icon: FileText },
            { id: 'open-contracts', label: 'Open Contracts', icon: Briefcase, badge: openContracts.value.length },
            { id: 'past-contracts', label: 'Past Contracts', icon: CheckCircle },
            { id: 'applications', label: 'Applications Received', icon: Users, badge: applications.value.length }
        ])

        const onTabChange = (id) => {
            activeTab.value = id
            if (id === 'profile' && !fetched.value.profile) fetchProfile()
            if ((id === 'open-contracts' || id === 'past-contracts') && !fetched.value.contracts) fetchContracts()
            if (id === 'applications' && !fetched.value.applications) fetchApplications()
        }

        const getAuthToken = async () => {
            return await authStore.getAuthToken()
        }

        const onApplicationsLoaded = (apps) => {
            applications.value = Array.isArray(apps) ? apps : []
        }

        const fetchProfile = async () => {
            fetched.value.profile = true
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profiles/buyer/me`, {
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
                        router.push('/select-role')
                        return
                    }
                    throw new Error(data.error || 'Error loading profile')
                }

                profile.value = data.profile || {}
                const org = profile.value.organization || {}
                organization.value = {
                    name: org.name || '',
                    type: org.type || null,
                    contactEmail: org.contactEmail || profile.value.email || '',
                    phone: org.phone || '',
                    address: org.address || ''
                }
            } catch (err) {
                error.value = err.message || 'Error loading profile'
            } finally {
                loading.value = false
            }
        }

        const saveProfile = async () => {
            saveError.value = ''
            saveSuccess.value = ''
            saving.value = true

            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profiles/buyer/me`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ organization: organization.value })
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error saving profile')
                }

                saveSuccess.value = 'Profile updated successfully'
                await fetchProfile()
                setTimeout(() => {
                    saveSuccess.value = ''
                }, 3000)
            } catch (err) {
                saveError.value = err.message || 'Error saving profile'
            } finally {
                saving.value = false
            }
        }

        const onProfilePhotoSelected = async (e) => {
            const file = e?.target?.files?.[0] || null
            e.target.value = ''
            if (!file) return

            photoError.value = ''
            uploadingPhoto.value = true
            try {
                const token = await getAuthToken()
                const form = new FormData()
                form.append('file', file)

                const resp = await fetch(`${config.backend.api}/api/uploads/me/profile-photo`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to upload profile photo')

                profile.value = { ...(profile.value || {}), photoUrl: data.photoUrl }
                await authStore.fetchUserProfile()
            } catch (err) {
                photoError.value = err?.message || 'Failed to upload profile photo'
            } finally {
                uploadingPhoto.value = false
            }
        }

        const fetchContracts = async () => {
            fetched.value.contracts = true
            loadingContracts.value = true
            try {
                const token = await getAuthToken()

                // Fetch open and past contracts separately
                const [openResponse, pastResponse] = await Promise.all([
                    fetch(`${config.backend.api}/api/contracts/me/open`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch(`${config.backend.api}/api/contracts/me/past`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ])

                const openData = await openResponse.json()
                const pastData = await pastResponse.json()

                if (!openResponse.ok) {
                    throw new Error(openData.error || 'Error loading open contracts')
                }
                if (!pastResponse.ok) {
                    throw new Error(pastData.error || 'Error loading past contracts')
                }

                openContracts.value = openData.contracts || []
                pastContracts.value = pastData.contracts || []
            } catch (err) {
                console.error('Contracts fetch error:', err)
                openContracts.value = []
                pastContracts.value = []
            } finally {
                loadingContracts.value = false
            }
        }

        const fetchApplications = async () => {
            fetched.value.applications = true
            loadingApplications.value = true
            try {
                const token = await getAuthToken()
                const params = new URLSearchParams()
                if (authStore.currentUserType) params.set('role', authStore.currentUserType)
                const response = await fetch(`${config.backend.api}/api/applications/me?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error loading applications')
                }

                applications.value = data.applications || []
            } catch (err) {
                console.error('Applications fetch error:', err)
                applications.value = []
            } finally {
                loadingApplications.value = false
            }
        }

        const editContract = (contract) => {
            router.push(`/contracts/${contract.id}/edit`)
        }

        const truncate = (text, length) => {
            if (!text) return ''
            if (text.length <= length) return text
            return text.substring(0, length) + '...'
        }

        const formatDate = (dateString) => {
            return formatDateLong(dateString)
        }

        const formatCurrency = (amount) => {
            return formatCurrencyUSD(amount)
        }

        const getStatusLabel = (status) => {
            const statusMap = {
                draft: 'Draft',
                open: 'Open',
                under_review: 'Under review',
                awarded: 'Awarded',
                completed: 'Completed',
                cancelled: 'Cancelled',
                closed: 'Closed'
            }
            return statusMap[status] || status
        }

        const getStatusBadgeClass = (status) => {
            const classMap = {
                'draft': 'badge bg-secondary',
                'open': 'badge bg-success',
                'under_review': 'badge bg-primary',
                'awarded': 'badge bg-info',
                'completed': 'badge bg-secondary',
                'cancelled': 'badge bg-danger',
                'closed': 'badge bg-secondary'
            }
            return classMap[status] || 'badge bg-secondary'
        }

        onMounted(async () => {
            await Promise.all([
                fetchProfile(),
                fetchContracts(),
                fetchApplications()
            ])
        })

        return {
            profile,
            organization,
            loading,
            error,
            activeTab,
            saving,
            saveError,
            saveSuccess,
            photoUrl,
            initials,
            uploadingPhoto,
            photoError,
            statsData,
            tabs,
            onTabChange,
            openContracts,
            pastContracts,
            loadingContracts,
            applications,
            loadingApplications,
            totalSpent,
            recentActivity,
            saveProfile,
            onProfilePhotoSelected,
            fetchContracts,
            fetchApplications,
            editContract,
            truncate,
            formatDate,
            formatCurrency,
            getStatusLabel,
            getStatusBadgeClass,
            onApplicationsLoaded
        }
    }
}
</script>

<style scoped>
.buyer-profile {
    min-height: 100vh;
    background: var(--light);
}

.profile-hero {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.05) 100%);
    padding: 3rem 0;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
}

.profile-hero-content {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.profile-avatar-section {
    text-align: center;
}

.profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 24px;
    overflow: hidden;
    border: 3px solid var(--white);
    box-shadow: 0 4px 12px rgba(var(--dark-rgb), 0.1);
    background: rgba(var(--primary-rgb), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-placeholder {
    font-weight: 800;
    color: var(--primary);
    font-size: 2.5rem;
}

.profile-hero-info {
    flex: 1;
}

.profile-name {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.profile-email {
    font-size: 1.1rem;
    color: var(--secondary);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
}

.profile-meta {
    font-size: 0.95rem;
    color: var(--secondary);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
}

.profile-badge {
    display: inline-flex;
    align-items: center;
    background: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.95rem;
}

.profile-content {
    padding: 2rem 0;
    max-width: 1200px;
}

.card {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    margin-bottom: 1.5rem;
}

.card-header {
    background: rgba(var(--primary-rgb), 0.08);
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.12);
    padding: 1.25rem 1.5rem;
    font-weight: 700;
}

.card-body {
    padding: 1.5rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
}

.activity-item:last-child {
    border-bottom: none;
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(var(--primary-rgb), 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
}

.activity-content {
    flex: 1;
}

.activity-title {
    font-weight: 600;
    color: var(--dark);
    margin-bottom: 0.25rem;
}

.activity-time {
    font-size: 0.85rem;
    color: var(--secondary);
}

.contract-card {
    background: var(--white);
    border-radius: 16px;
    padding: 1.25rem;
    border: 1px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s ease;
    height: 100%;
}

.contract-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
}

.contract-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
}

.contract-title {
    font-weight: 700;
    color: var(--dark);
    margin: 0;
    flex: 1;
}

.contract-description {
    color: var(--secondary);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.contract-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--secondary);
}

.contract-actions {
    display: flex;
    gap: 0.5rem;
}

.contract-item,
.application-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
    gap: 1rem;
}

.contract-item:last-child,
.application-item:last-child {
    border-bottom: none;
}

.contract-content,
.application-content {
    flex: 1;
}

.application-title {
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.application-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.change-photo-btn {
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.2s ease;
    cursor: pointer;
    border-width: 2px;
}

.change-photo-btn:hover {
    background-color: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
}

.change-photo-btn:active {
    transform: translateY(0);
}

@media (max-width: 768px) {
    .profile-hero-content {
        flex-direction: column;
        text-align: center;
    }

    .profile-name {
        font-size: 2rem;
    }
}
</style>
