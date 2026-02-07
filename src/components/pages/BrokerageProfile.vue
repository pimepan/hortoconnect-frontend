<template>
    <div class="brokerage-profile">
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
                            <h1 class="profile-name">{{ profile.firmName || 'Brokerage' }}</h1>
                            <p class="profile-email">
                                <Mail class="me-2" :size="18" /> {{ profile.contact?.email || '' }}
                            </p>
                            <p class="profile-meta">
                                <Calendar class="me-2" :size="16" />
                                Member since {{ formatDate(profile.createdAt) }}
                            </p>
                            <div class="profile-badge">
                                <Shield class="me-1" :size="18" />Broker / Agency
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
                                <h4 class="mb-0">Profile Information</h4>
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
                                        <label class="form-label fw-semibold">Firm Name <span class="text-danger">*</span></label>
                                        <input v-model="form.firmName" type="text" class="form-control" required />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Contact Name</label>
                                        <input v-model="form.contact.name" type="text" class="form-control" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Contact Email</label>
                                        <input v-model="form.contact.email" type="email" class="form-control" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Contact Phone</label>
                                        <input v-model="form.contact.phone" type="tel" class="form-control" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Regions Served (States)</label>
                                        <input v-model="regionsText" type="text" class="form-control" placeholder="e.g. CA, NV, AZ" />
                                        <div class="form-text">Comma-separated state codes.</div>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold mb-2">Coverage Types Offered</label>
                                        <div class="d-flex flex-wrap gap-3">
                                            <div v-for="opt in coverageOptions" :key="opt" class="form-check">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    :id="`cov-${opt}`"
                                                    :value="opt"
                                                    v-model="form.coverageTypesOffered"
                                                />
                                                <label class="form-check-label" :for="`cov-${opt}`">
                                                    {{ formatCoverageType(opt) }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Inbound Requests Tab -->
                    <div v-if="activeTab === 'requests'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Inbound Requests</h4>
                                <button class="btn btn-sm btn-outline-primary" :disabled="loadingRequests" @click="fetchInbox">
                                    Refresh
                                </button>
                            </div>
                            <div class="card-body">
                                <div v-if="requestsError" class="alert alert-danger" role="alert">
                                    {{ requestsError }}
                                </div>
                                <div v-if="loadingRequests" class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <div v-else-if="requests.length === 0" class="text-center py-4 text-muted">
                                    No inbound requests yet.
                                </div>
                                <div v-else>
                                    <div class="mb-3">
                                        <input
                                            v-model="requestFilter"
                                            type="text"
                                            class="form-control"
                                            placeholder="Filter by type, region, or coverage type..."
                                        />
                                    </div>
                                    <div v-for="r in filteredRequests" :key="r.id" class="request-item">
                                        <div class="request-content">
                                            <div class="request-header">
                                                <h5 class="request-type">{{ r.type }}</h5>
                                                <span class="badge" :class="getRequestStatusBadge(normalizeRequestStatus(r.status))">
                                                    {{ formatRequestStatus(normalizeRequestStatus(r.status)) }}
                                                </span>
                                            </div>
                                            <div class="request-meta">
                                                <span class="meta-item">
                                                    <User :size="14" />
                                                    Contractor: {{ r.contractorUid }}
                                                </span>
                                                <span v-if="r.region" class="meta-item">
                                                    <MapPin :size="14" />
                                                    {{ r.region }}
                                                </span>
                                                <span v-if="r.coverageType" class="meta-item">
                                                    <Shield :size="14" />
                                                    {{ formatCoverageType(r.coverageType) }}
                                                </span>
                                            </div>
                                            <div v-if="r.message" class="request-message">
                                                {{ r.message }}
                                            </div>
                                            <div class="request-time">
                                                <Calendar :size="14" />
                                                {{ formatDate(r.createdAt) }}
                                            </div>
                                        </div>
                                        <div class="request-actions">
                                            <button
                                                class="btn btn-sm btn-success"
                                                :disabled="isUpdatingRequest(r.id) || normalizeRequestStatus(r.status) !== 'pending'"
                                                @click="handleRequest(r, 'approved')"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                class="btn btn-sm btn-danger"
                                                :disabled="isUpdatingRequest(r.id) || normalizeRequestStatus(r.status) !== 'pending'"
                                                @click="handleRequest(r, 'rejected')"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ProfileTabs>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, Calendar, Shield, Briefcase, Clock, User, MapPin } from 'lucide-vue-next'
import ProfileTabs from '../ProfileTabs.vue'
import ProfileStats from '../ProfileStats.vue'
import WButton from '../utils/WButton.vue'
import config from '../../config.js'
import { formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'BrokerageProfile',
    components: {
        Mail,
        Calendar,
        Shield,
        Briefcase,
        Clock,
        User,
        MapPin,
        ProfileTabs,
        ProfileStats,
        WButton
    },
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        const profile = ref({})
        const form = ref({
            firmName: '',
            contact: { name: '', email: '', phone: '' },
            regionsServed: [],
            coverageTypesOffered: []
        })
        const regionsText = ref('')
        const coverageOptions = ['general_liability', 'workers_comp', 'commercial_auto', 'umbrella', 'bonds']

        const loading = ref(true)
        const error = ref('')
        const activeTab = ref('overview')

        const saving = ref(false)
        const saveError = ref('')
        const saveSuccess = ref('')

        const uploadingPhoto = ref(false)
        const photoError = ref('')

        const requests = ref([])
        const loadingRequests = ref(true)
        const requestsError = ref('')
        const requestFilter = ref('')
        const updatingRequestIds = ref({})

        // Track per-tab data fetching (first-open safety).
        const fetched = ref({
            profile: false,
            inbox: false
        })

        const photoUrl = computed(() => profile.value?.photoUrl || authStore.userProfile?.photoUrl || null)
        const initials = computed(() => {
            const name = (profile.value?.firmName || '').toString().trim()
            if (name) {
                const parts = name.split(/\s+/).slice(0, 2)
                return parts.map(p => (p[0] || '').toUpperCase()).join('')
            }
            const email = (profile.value?.contact?.email || '').toString().trim()
            return email ? email[0].toUpperCase() : 'B'
        })

        const statsData = computed(() => [
            {
                id: 'requests',
                label: 'Inbound Requests',
                value: requests.value.length,
                icon: Briefcase,
                color: 'var(--primary)'
            },
            {
                id: 'regions',
                label: 'Regions Served',
                value: form.value.regionsServed.length,
                icon: MapPin,
                color: 'var(--success)'
            },
            {
                id: 'coverage',
                label: 'Coverage Types',
                value: form.value.coverageTypesOffered.length,
                icon: Shield,
                color: 'var(--info)'
            }
        ])

        const recentActivity = computed(() => {
            const activities = []
            if (requests.value.length > 0) {
                requests.value.slice(0, 5).forEach(req => {
                    activities.push({
                        id: `req-${req.id}`,
                        title: `Received ${req.type} request from contractor`,
                        time: formatDate(req.createdAt),
                        icon: Briefcase
                    })
                })
            }
            return activities
        })

        const filteredRequests = computed(() => {
            if (!requestFilter.value) return requests.value
            const filter = requestFilter.value.toLowerCase()
            return requests.value.filter(r => {
                return (
                    (r.type || '').toLowerCase().includes(filter) ||
                    (r.region || '').toLowerCase().includes(filter) ||
                    (r.coverageType || '').toLowerCase().includes(filter) ||
                    (r.message || '').toLowerCase().includes(filter)
                )
            })
        })

        const tabs = computed(() => [
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'profile', label: 'Profile', icon: Shield },
            { id: 'requests', label: 'Inbound Requests', icon: Briefcase, badge: requests.value.length }
        ])

        const onTabChange = (id) => {
            activeTab.value = id
            if (id === 'profile' && !fetched.value.profile) fetchProfile()
            if (id === 'requests' && !fetched.value.inbox) fetchInbox()
        }

        watch(regionsText, (val) => {
            const parsed = (val || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            form.value.regionsServed = parsed
        })

        const getAuthToken = async () => {
            return await authStore.getAuthToken()
        }

        const fetchProfile = async () => {
            fetched.value.profile = true
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profiles/brokerage/me`, {
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
                form.value = {
                    firmName: profile.value.firmName || '',
                    contact: {
                        name: profile.value.contact?.name || '',
                        email: profile.value.contact?.email || '',
                        phone: profile.value.contact?.phone || ''
                    },
                    regionsServed: profile.value.regionsServed || [],
                    coverageTypesOffered: profile.value.coverageTypesOffered || []
                }
                regionsText.value = (form.value.regionsServed || []).join(', ')
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
                const response = await fetch(`${config.backend.api}/api/profiles/brokerage/me`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firmName: form.value.firmName,
                        contact: form.value.contact,
                        regionsServed: form.value.regionsServed,
                        coverageTypesOffered: form.value.coverageTypesOffered
                    })
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
                const formData = new FormData()
                formData.append('file', file)

                const resp = await fetch(`${config.backend.api}/api/uploads/me/profile-photo`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
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

        const fetchInbox = async () => {
            fetched.value.inbox = true
            requestsError.value = ''
            loadingRequests.value = true
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/broker_requests/inbox`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error loading inbox')
                requests.value = data.requests || []
            } catch (err) {
                requestsError.value = err.message || 'Error loading inbox'
                requests.value = []
            } finally {
                loadingRequests.value = false
            }
        }

        const handleRequest = async (request, action) => {
            const requestId = request?.id
            if (!requestId) return

            // Only allow decisions on pending requests.
            const currentStatus = normalizeRequestStatus(request?.status)
            if (currentStatus !== 'pending') return

            requestsError.value = ''
            updatingRequestIds.value = { ...(updatingRequestIds.value || {}), [requestId]: true }
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/broker_requests/${requestId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ decision: action })
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Failed to update request')

                const updated = data.request || { status: action }
                requests.value = (requests.value || []).map(r => {
                    if (r.id !== requestId) return r
                    return { ...r, ...updated }
                })
            } catch (err) {
                requestsError.value = err.message || 'Failed to update request'
            } finally {
                updatingRequestIds.value = { ...(updatingRequestIds.value || {}), [requestId]: false }
            }
        }

        const isUpdatingRequest = (requestId) => {
            return !!(updatingRequestIds.value && updatingRequestIds.value[requestId])
        }

        const normalizeRequestStatus = (status) => {
            const s = (status || '').toString()
            if (s === 'new' || s === 'in_progress') return 'pending'
            return s || 'pending'
        }

        const formatRequestStatus = (status) => {
            const map = {
                pending: 'Pending',
                approved: 'Approved',
                rejected: 'Rejected'
            }
            return map[status] || status
        }

        const formatCoverageType = (type) => {
            const map = {
                general_liability: 'General Liability',
                workers_comp: 'Workers Compensation',
                commercial_auto: 'Commercial Auto',
                umbrella: 'Umbrella',
                bonds: 'Bonds'
            }
            return map[type] || type
        }

        const getRequestStatusBadge = (status) => {
            const normalized = normalizeRequestStatus(status)
            const map = {
                pending: 'badge bg-warning',
                approved: 'badge bg-success',
                rejected: 'badge bg-danger'
            }
            return map[normalized] || 'badge bg-secondary'
        }

        const formatDate = (dateString) => {
            return formatDateLong(dateString)
        }

        onMounted(async () => {
            await Promise.all([fetchProfile(), fetchInbox()])
        })

        return {
            profile,
            form,
            regionsText,
            coverageOptions,
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
            requests,
            loadingRequests,
            requestsError,
            requestFilter,
            filteredRequests,
            recentActivity,
            saveProfile,
            onProfilePhotoSelected,
            fetchInbox,
            handleRequest,
            isUpdatingRequest,
            normalizeRequestStatus,
            formatRequestStatus,
            formatCoverageType,
            getRequestStatusBadge,
            formatDate
        }
    }
}
</script>

<style scoped>
.brokerage-profile {
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
    background: var(--secondary);
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

.request-item {
    display: flex;
    align-items: start;
    justify-content: space-between;
    padding: 1.25rem;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
    gap: 1rem;
}

.request-item:last-child {
    border-bottom: none;
}

.request-content {
    flex: 1;
}

.request-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
}

.request-type {
    font-weight: 700;
    color: var(--dark);
    margin: 0;
}

.request-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.75rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--secondary);
}

.request-message {
    background: rgba(var(--primary-rgb), 0.05);
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 0.75rem;
    color: var(--dark);
    font-size: 0.9rem;
}

.request-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--secondary);
}

.request-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.btn-primary {
    border-radius: 12px;
    font-weight: 600;
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

    .request-item {
        flex-direction: column;
    }

    .request-actions {
        flex-direction: row;
        width: 100%;
    }
}
</style>
