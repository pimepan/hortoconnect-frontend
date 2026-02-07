<template>
    <div class="contractor-profile">
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
                            <h1 class="profile-name">{{ profile.name || 'No name' }}</h1>
                            <p class="profile-email">
                                <Mail class="me-2" :size="18" /> {{ profile.email }}
                            </p>
                            <p class="profile-meta">
                                <Calendar class="me-2" :size="16" />
                                Member since {{ formatDate(profile.createdAt) }}
                            </p>
                            <div class="profile-badge">
                                <Wrench class="me-1" :size="18" />Contractor
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile completion progress -->
            <div class="container profile-content">
                <div class="profile-progress-card card mb-4" :class="{ 'profile-progress-complete': profileProgressCount >= 4 }">
                    <div class="card-body py-3">
                        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                            <span class="fw-semibold">Profile completion</span>
                            <span class="text-muted small">{{ profileProgressCount }} of 4 complete</span>
                        </div>
                        <div class="progress mb-3" style="height: 8px;">
                            <div
                                class="progress-bar bg-primary"
                                role="progressbar"
                                :style="{ width: profileProgressPercent + '%' }"
                                :aria-valuenow="profileProgressCount"
                                aria-valuemin="0"
                                aria-valuemax="4"
                            ></div>
                        </div>
                        <div class="d-flex flex-wrap gap-3">
                            <button
                                type="button"
                                class="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1 profile-progress-item"
                                :class="hasPhoto ? 'text-success' : 'text-muted'"
                                :disabled="hasPhoto"
                                @click="!hasPhoto && onTabChange('profile')"
                            >
                                <Check v-if="hasPhoto" :size="18" />
                                <Circle v-else :size="18" />
                                Profile photo
                            </button>
                            <button
                                type="button"
                                class="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1 profile-progress-item"
                                :class="hasDescription ? 'text-success' : 'text-muted'"
                                :disabled="hasDescription"
                                @click="!hasDescription && onTabChange('profile')"
                            >
                                <Check v-if="hasDescription" :size="18" />
                                <Circle v-else :size="18" />
                                Description
                            </button>
                            <button
                                type="button"
                                class="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1 profile-progress-item"
                                :class="hasOneProject ? 'text-success' : 'text-muted'"
                                :disabled="hasOneProject"
                                @click="!hasOneProject && onTabChange('portfolio')"
                            >
                                <Check v-if="hasOneProject" :size="18" />
                                <Circle v-else :size="18" />
                                One portfolio project
                            </button>
                            <button
                                type="button"
                                class="btn btn-link btn-sm p-0 text-decoration-none d-flex align-items-center gap-1 profile-progress-item"
                                :class="hasOneSkill ? 'text-success' : 'text-muted'"
                                :disabled="hasOneSkill"
                                @click="!hasOneSkill && onTabChange('profile')"
                            >
                                <Check v-if="hasOneSkill" :size="18" />
                                <Circle v-else :size="18" />
                                Add a skill
                            </button>
                        </div>
                    </div>
                </div>

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
                                        <label class="form-label fw-semibold">Name</label>
                                        <input v-model="profileForm.name" type="text" class="form-control" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Email</label>
                                        <input v-model="profileForm.email" type="email" class="form-control" disabled />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Business Name</label>
                                        <input v-model="profileForm.business" type="text" class="form-control" />
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-semibold">Service Types</label>
                                        <input v-model="profileForm.serviceTypes" type="text" class="form-control" placeholder="Comma-separated" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Coverage Area</label>
                                        <input v-model="profileForm.coverageArea" type="text" class="form-control" placeholder="e.g. CA, NV, AZ" />
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Description</label>
                                        <textarea v-model="profileForm.description" class="form-control" rows="4" placeholder="Tell us about your business..."></textarea>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-semibold">Skills</label>
                                        <div class="border rounded p-3 bg-light">
                                            <div v-if="(profileForm.skills || []).length === 0" class="text-muted text-center py-2">
                                                No skills selected yet
                                            </div>
                                            <div v-else class="mb-3">
                                                <div
                                                    v-for="(skill, index) in (profileForm.skills || [])"
                                                    :key="`${skill.skillId}-${index}`"
                                                    class="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border"
                                                >
                                                    <div>
                                                        <strong>{{ getSkillName(skill.skillId) }}</strong>
                                                        <span class="badge bg-secondary ms-2">{{ getSkillLevelName(skill.level) }}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        class="btn btn-sm btn-outline-danger"
                                                        @click="removeSkill(index)"
                                                        :disabled="saving"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>

                                            <div class="row g-2">
                                                <div class="col-md-6">
                                                    <select
                                                        class="form-select"
                                                        v-model="newSkill.skillId"
                                                        :disabled="saving"
                                                    >
                                                        <option value="">Select a skill</option>
                                                        <optgroup
                                                            v-for="category in skillCategories"
                                                            :key="category"
                                                            :label="category"
                                                        >
                                                            <option
                                                                v-for="s in getSkillsByCategory(category)"
                                                                :key="s.id"
                                                                :value="s.id"
                                                                :disabled="isSkillSelected(s.id)"
                                                            >
                                                                {{ s.name }}
                                                            </option>
                                                        </optgroup>
                                                    </select>
                                                </div>
                                                <div class="col-md-4">
                                                    <select
                                                        class="form-select"
                                                        v-model="newSkill.level"
                                                        :disabled="saving || !newSkill.skillId"
                                                    >
                                                        <option value="">Level</option>
                                                        <option
                                                            v-for="level in SKILL_LEVELS"
                                                            :key="level.id"
                                                            :value="level.id"
                                                        >
                                                            {{ level.name }} - {{ level.description }}
                                                        </option>
                                                    </select>
                                                </div>
                                                <div class="col-md-2">
                                                    <button
                                                        type="button"
                                                        class="btn btn-primary w-100"
                                                        @click="addSkill"
                                                        :disabled="saving || !newSkill.skillId || !newSkill.level"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Portfolio Tab -->
                    <div v-if="activeTab === 'portfolio'" class="tab-pane active show">
                        <PortfolioGrid
                            :projects="portfolioProjects"
                            :loading="loadingPortfolio"
                            :error="portfolioError"
                            @add-project="router.push('/profile/contractor/portfolio/new')"
                            @view-project="viewPortfolioProject"
                            @edit-project="editPortfolioProject"
                            @delete-project="deletePortfolioProject"
                        />
                    </div>

                    <!-- Applications Tab -->
                    <div v-if="activeTab === 'applications'" class="tab-pane active show">
                        <ApplicationsList
                            variant="embedded"
                            @loaded="onApplicationsLoaded"
                        />
                    </div>

                    <!-- Past Contracts Tab -->
                    <div v-if="activeTab === 'past-contracts'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">Completed Contracts</h4>
                                <button class="btn btn-sm btn-outline-primary" :disabled="loadingWorks" @click="fetchPastWorks">
                                    Refresh
                                </button>
                            </div>
                            <div class="card-body">
                                <div v-if="loadingWorks" class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <div v-else-if="pastWorks.length === 0" class="text-center py-4 text-muted">
                                    You haven't completed any contracts yet.
                                </div>
                                <div v-else>
                                    <div v-for="work in pastWorks" :key="work.id" class="work-item">
                                        <div class="work-content">
                                            <h5 class="work-title">{{ work.projectTitle || 'Untitled project' }}</h5>
                                            <div class="work-meta">
                                                <span class="text-muted">Amount: {{ formatCurrency(work.amount) }}</span>
                                                <span class="text-muted ms-3">Completed: {{ formatDate(work.completedAt || work.updatedAt) }}</span>
                                            </div>
                                            <div v-if="work.attachments && work.attachments.length > 0" class="work-attachments mt-2">
                                                <div class="row g-2">
                                                    <div v-for="(att, idx) in work.attachments.slice(0, 6)" :key="idx" class="col-6 col-md-4 col-lg-3">
                                                        <a :href="att.url" target="_blank" rel="noopener" class="attachment-thumb">
                                                            <img v-if="(att.contentType || '').startsWith('image/')" :src="att.url" alt="Attachment" />
                                                            <div v-else class="attachment-file">
                                                                <FileText :size="24" />
                                                                <small>{{ att.fileName || 'File' }}</small>
                                                            </div>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="work-actions">
                                            <label class="btn btn-sm btn-outline-primary">
                                                {{ workUploading[work.id] ? 'Uploading…' : 'Add Files' }}
                                                <input
                                                    type="file"
                                                    class="d-none"
                                                    multiple
                                                    :disabled="!!workUploading[work.id]"
                                                    @change="(e) => onWorkAttachmentsSelected(work.id, e)"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Documents Tab -->
                    <div v-if="activeTab === 'documents'" class="tab-pane active show">
                        <div class="card">
                            <div class="card-header">
                                <h4 class="mb-0">Documents</h4>
                            </div>
                            <div class="card-body">
                                <DocumentUploader
                                    :replaceDoc="replaceDoc"
                                    @uploaded="handleDocumentUploaded"
                                    @cancelReplace="cancelReplace"
                                />
                                <hr class="my-4" />
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="mb-0">My Documents</h5>
                                    <button class="btn btn-sm btn-outline-primary" :disabled="loadingDocuments" @click="fetchDocuments">
                                        Refresh
                                    </button>
                                </div>
                                <div v-if="loadingDocuments" class="text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                                <div v-else-if="documentsError" class="alert alert-danger">
                                    {{ documentsError }}
                                </div>
                                <div v-else-if="documents.length === 0" class="text-center py-4 text-muted">
                                    No documents uploaded yet.
                                </div>
                                <div v-else>
                                    <div v-for="doc in documents" :key="doc.id" class="document-item">
                                        <div class="document-info">
                                            <div class="fw-semibold">{{ formatDocLabel(doc) }}</div>
                                            <div class="text-muted small">Expires: {{ doc.expirationDate || 'N/A' }}</div>
                                        </div>
                                        <div class="document-status">
                                            <span :class="getDocStatusBadge(doc.status)">{{ doc.status }}</span>
                                        </div>
                                        <div class="document-actions">
                                            <button class="btn btn-sm btn-outline-secondary me-2" @click="startReplace(doc)">Replace</button>
                                            <button class="btn btn-sm btn-outline-primary" @click="downloadDoc(doc)">Download</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ProfileTabs>
            </div>
        </div>

        <!-- Portfolio Modal -->
        <PortfolioProjectModal
            v-if="showPortfolioModal"
            :project="editingProject"
            :show="showPortfolioModal"
            @save="handlePortfolioSave"
            @close="showPortfolioModal = false; editingProject = null"
        />
    </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Mail, Calendar, Wrench, FileText, Briefcase, CheckCircle, Clock, DollarSign, Check, Circle } from 'lucide-vue-next'
import ProfileTabs from '../ProfileTabs.vue'
import ProfileStats from '../ProfileStats.vue'
import PortfolioGrid from '../PortfolioGrid.vue'
import PortfolioProjectModal from '../PortfolioProjectModal.vue'
import ApplicationsList from '../ApplicationsList.vue'
import DocumentUploader from '../DocumentUploader.vue'
import WButton from '../utils/WButton.vue'
import WConfirmSurface from '../utils/WConfirmSurface.vue'
import { TRADE_SKILLS, SKILL_LEVELS } from '../../constants/skills.js'
import config from '../../config.js'
import { formatCurrencyUSD, formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'ContractorProfile',
    components: {
        Mail,
        Calendar,
        Wrench,
        FileText,
        Briefcase,
        CheckCircle,
        Clock,
        DollarSign,
        Check,
        Circle,
        ProfileTabs,
        ProfileStats,
        PortfolioGrid,
        PortfolioProjectModal,
        ApplicationsList,
        DocumentUploader,
        WButton,
        WConfirmSurface
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const authStore = useAuthStore()

        const profile = ref({})
        const loading = ref(true)
        const error = ref('')
        const activeTab = ref('overview')

        // Profile form
        const profileForm = ref({
            name: '',
            email: '',
            business: '',
            serviceTypes: '',
            coverageArea: '',
            description: '',
            skills: []
        })
        const saving = ref(false)
        const saveError = ref('')
        const saveSuccess = ref('')

        // Photo upload
        const uploadingPhoto = ref(false)
        const photoError = ref('')

        // Portfolio
        const portfolioProjects = ref([])
        const loadingPortfolio = ref(false)
        const portfolioError = ref('')
        const showPortfolioModal = ref(false)
        const editingProject = ref(null)

        // Applications
        const applications = ref([])
        const loadingApplications = ref(true)

        // Past works
        const pastWorks = ref([])
        const loadingWorks = ref(true)
        const workUploading = ref({})
        const workUploadErrors = ref({})

        // Documents
        const documents = ref([])
        const loadingDocuments = ref(true)
        const documentsError = ref('')
        const replaceDoc = ref(null)

        // Track per-tab data fetching (first-open safety).
        const fetched = ref({
            profile: false,
            applications: false,
            works: false,
            documents: false
        })

        const photoUrl = computed(() => profile.value?.photoUrl || authStore.userProfile?.photoUrl || null)
        const hasPhoto = computed(() => !!photoUrl.value)
        const hasDescription = computed(() => {
            const d = (profile.value?.description ?? profileForm.value?.description) ?? ''
            return typeof d === 'string' && d.trim().length > 0
        })
        const hasOneProject = computed(() => (portfolioProjects.value?.length ?? 0) >= 1)
        const hasOneSkill = computed(() => ((profileForm.value?.skills ?? profile.value?.skills)?.length ?? 0) >= 1)
        const profileProgressCount = computed(() => {
            let n = 0
            if (hasPhoto.value) n++
            if (hasDescription.value) n++
            if (hasOneProject.value) n++
            if (hasOneSkill.value) n++
            return n
        })
        const profileProgressPercent = computed(() => (profileProgressCount.value / 4) * 100)
        const initials = computed(() => {
            const name = (profile.value?.name || '').toString().trim()
            if (name) {
                const parts = name.split(/\s+/).slice(0, 2)
                return parts.map(p => (p[0] || '').toUpperCase()).join('')
            }
            const email = (profile.value?.email || '').toString().trim()
            return email ? email[0].toUpperCase() : 'U'
        })

        // Skills with levels (same shape as onboarding): [{ skillId, level }]
        const newSkill = ref({ skillId: '', level: '' })
        const skillLevelIds = new Set((SKILL_LEVELS || []).map(l => l.id))

        const normalizeSkillLevel = (levelId) => {
            const lvl = (levelId || '').toString()
            if (skillLevelIds.has(lvl)) return lvl
            return 'intermediate'
        }

        const normalizeSkills = (raw) => {
            if (!Array.isArray(raw)) return []
            const out = []
            for (const item of raw) {
                if (!item) continue
                if (typeof item === 'string') {
                    out.push({ skillId: item, level: 'intermediate' })
                    continue
                }
                if (typeof item === 'object') {
                    const skillId = item.skillId || item.id || item.skill || null
                    if (!skillId) continue
                    out.push({ skillId, level: normalizeSkillLevel(item.level) })
                }
            }
            // De-dupe by skillId, keep first occurrence
            const seen = new Set()
            return out.filter(s => {
                if (!s.skillId || seen.has(s.skillId)) return false
                seen.add(s.skillId)
                return true
            })
        }

        const skillCategories = computed(() => {
            const categories = [...new Set((TRADE_SKILLS || []).map(s => s.category).filter(Boolean))]
            return categories
        })

        const getSkillsByCategory = (category) => {
            return (TRADE_SKILLS || []).filter(s => s.category === category)
        }

        const getSkillName = (skillId) => {
            const skill = (TRADE_SKILLS || []).find(s => s.id === skillId)
            return skill ? skill.name : skillId
        }

        const getSkillLevelName = (levelId) => {
            const level = (SKILL_LEVELS || []).find(l => l.id === levelId)
            return level ? level.name : levelId
        }

        const isSkillSelected = (skillId) => {
            return (profileForm.value.skills || []).some(s => s?.skillId === skillId)
        }

        const addSkill = () => {
            const skillId = (newSkill.value.skillId || '').toString()
            const level = normalizeSkillLevel(newSkill.value.level)
            if (!skillId || !level) return
            if (isSkillSelected(skillId)) return
            profileForm.value.skills = [...(profileForm.value.skills || []), { skillId, level }]
            newSkill.value = { skillId: '', level: '' }
        }

        const removeSkill = (index) => {
            const current = [...(profileForm.value.skills || [])]
            current.splice(index, 1)
            profileForm.value.skills = current
        }

        const statsData = computed(() => [
            {
                id: 'applications',
                label: 'Active Applications',
                value: applications.value.length,
                icon: Briefcase,
                color: 'var(--primary)'
            },
            {
                id: 'completed',
                label: 'Completed Jobs',
                value: pastWorks.value.length,
                icon: CheckCircle,
                color: 'var(--success)'
            },
            {
                id: 'earnings',
                label: 'Total Earnings',
                value: totalEarnings.value,
                icon: DollarSign,
                color: 'var(--success)'
            }
        ])

        const totalEarnings = computed(() => {
            const total = pastWorks.value.reduce((sum, work) => {
                return sum + (parseFloat(work.amount) || 0)
            }, 0)
            return formatCurrencyUSD(total)
        })

        const normalizeImageUrl = (img) => (typeof img === 'string' ? img : img?.url)

        const portfolioProjectsComputed = computed(() => {
            const raw = profile.value?.portfolioProjects || profile.value?.portfolioImages || []
            if (Array.isArray(raw) && raw.length > 0) {
                // Check if it's the old format (just images) or new format (projects)
                if (typeof raw[0] === 'string' || (raw[0] && raw[0].url && !raw[0].id)) {
                    // Old format - convert to projects
                    return raw.map((img, idx) => ({
                        id: `legacy-${idx}`,
                        legacyIndex: idx,
                        isLegacy: true,
                        title: `Portfolio Image ${idx + 1}`,
                        images: [normalizeImageUrl(img)].filter(Boolean),
                        createdAt: new Date().toISOString()
                    }))
                }
                // New format: ensure each project's images are URL strings for display
                return raw.map((p) => ({
                    ...p,
                    images: (p.images || []).map(normalizeImageUrl).filter(Boolean)
                }))
            }
            return []
        })

        watch(portfolioProjectsComputed, (newVal) => {
            portfolioProjects.value = newVal
        }, { immediate: true })

        watch(() => profile.value?.portfolioProjects, (newVal) => {
            if (newVal) {
                portfolioProjects.value = newVal
            }
        }, { deep: true })

        const recentActivity = computed(() => {
            const activities = []
            if (applications.value.length > 0) {
                applications.value.slice(0, 3).forEach(app => {
                    activities.push({
                        id: `app-${app.id}`,
                        title: `Applied to "${app.contractTitle || 'Untitled contract'}"`,
                        time: formatDate(app.createdAt),
                        icon: Briefcase
                    })
                })
            }
            return activities.slice(0, 5)
        })

        const tabs = computed(() => [
            { id: 'overview', label: 'Overview', icon: Briefcase },
            { id: 'profile', label: 'Profile', icon: FileText },
            { id: 'portfolio', label: 'Portfolio', icon: Briefcase, badge: portfolioProjects.value.length },
            { id: 'applications', label: 'Applications', icon: Briefcase, badge: applications.value.length },
            { id: 'past-contracts', label: 'Past Contracts', icon: CheckCircle },
            { id: 'documents', label: 'Documents', icon: FileText }
        ])

        const onTabChange = (id) => {
            activeTab.value = id
            if (id === 'profile' && !fetched.value.profile) fetchProfile()
            if (id === 'applications' && !fetched.value.applications) fetchApplications()
            if (id === 'past-contracts' && !fetched.value.works) fetchPastWorks()
            if (id === 'documents' && !fetched.value.documents) fetchDocuments()
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
                const response = await fetch(`${config.backend.api}/api/profile/contractor`, {
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

                // Normalize nested profile fields so form inputs never receive objects.
                const rawBusiness = profile.value.business
                const businessName =
                    typeof rawBusiness === 'string'
                        ? rawBusiness
                        : (rawBusiness?.legalName || rawBusiness?.name || '')

                const rawCoverage = profile.value.coverageArea
                const coverageStatesText =
                    typeof rawCoverage === 'string'
                        ? rawCoverage
                        : (Array.isArray(rawCoverage?.states) ? rawCoverage.states.join(', ') : '')

                profileForm.value = {
                    name: profile.value.name || '',
                    email: profile.value.email || '',
                    business: businessName || '',
                    serviceTypes: Array.isArray(profile.value.serviceTypes) ? profile.value.serviceTypes.join(', ') : (profile.value.serviceTypes || ''),
                    coverageArea: coverageStatesText || '',
                    description: profile.value.description || '',
                    skills: normalizeSkills(profile.value.skills)
                }
            } catch (err) {
                if (err.message !== 'User not authenticated' && !err.message.includes('redirect')) {
                    error.value = err.message || 'Error loading profile'
                    console.error('Profile fetch error:', err)
                }
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
                const serviceTypesArray = (profileForm.value.serviceTypes || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)

                const states = (profileForm.value.coverageArea || '')
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean)

                const existingCoverage = profile.value?.coverageArea
                const coverageAreaPayload =
                    existingCoverage && typeof existingCoverage === 'object' && !Array.isArray(existingCoverage)
                        ? { ...existingCoverage, states }
                        : { states, counties: [], radiusMiles: null, notes: null }

                const businessName = (profileForm.value.business || '').toString().trim() || null
                const existingBusiness = profile.value?.business
                const businessPayload =
                    existingBusiness && typeof existingBusiness === 'object' && !Array.isArray(existingBusiness)
                        ? { ...existingBusiness, legalName: businessName }
                        : { legalName: businessName }

                const payload = {
                    business: businessPayload,
                    serviceTypes: serviceTypesArray,
                    coverageArea: coverageAreaPayload,
                    description: profileForm.value.description,
                    skills: normalizeSkills(profileForm.value.skills)
                }

                const response = await fetch(`${config.backend.api}/api/profiles/contractor/me`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
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

        const fetchPastWorks = async () => {
            fetched.value.works = true
            loadingWorks.value = true
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/profile/contractor/works/past`, {
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

        const onWorkAttachmentsSelected = async (workId, e) => {
            const files = Array.from(e?.target?.files || [])
            e.target.value = ''
            if (!workId || files.length === 0) return

            workUploadErrors.value = { ...workUploadErrors.value, [workId]: '' }
            workUploading.value = { ...workUploading.value, [workId]: true }
            try {
                const token = await getAuthToken()
                const form = new FormData()
                for (const f of files) form.append('files', f)

                const resp = await fetch(`${config.backend.api}/api/works/${workId}/attachments`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to upload files')

                const incoming = data.attachments || []
                pastWorks.value = (pastWorks.value || []).map((w) => {
                    if (w.id !== workId) return w
                    const current = Array.isArray(w.attachments) ? w.attachments : []
                    return { ...w, attachments: [...current, ...incoming] }
                })
            } catch (err) {
                workUploadErrors.value = {
                    ...workUploadErrors.value,
                    [workId]: err?.message || 'Failed to upload files'
                }
            } finally {
                workUploading.value = { ...workUploading.value, [workId]: false }
            }
        }

        const fetchDocuments = async () => {
            fetched.value.documents = true
            documentsError.value = ''
            loadingDocuments.value = true
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/documents/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error loading documents')
                }
                documents.value = data.documents || []
            } catch (err) {
                documentsError.value = err.message || 'Error loading documents'
                documents.value = []
            } finally {
                loadingDocuments.value = false
            }
        }

        const handleDocumentUploaded = async () => {
            replaceDoc.value = null
            loadingDocuments.value = true
            await fetchDocuments()
        }

        const startReplace = (doc) => {
            replaceDoc.value = doc
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }

        const cancelReplace = () => {
            replaceDoc.value = null
        }

        const downloadDoc = async (doc) => {
            try {
                const token = await getAuthToken()
                const response = await fetch(`${config.backend.api}/api/documents/${doc.id}/download`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error generating download')
                }
                if (data.url) {
                    window.open(data.url, '_blank')
                }
            } catch (err) {
                documentsError.value = err.message || 'Error generating download'
            }
        }

        const formatDocLabel = (doc) => {
            if (!doc) return 'Document'
            if (doc.documentType === 'insurance') {
                return `Insurance (${doc.coverageType || 'n/a'})`
            }
            return doc.documentType || 'Document'
        }

        const getDocStatusBadge = (status) => {
            const map = {
                valid: 'badge bg-success',
                expiring: 'badge bg-warning text-dark',
                expired: 'badge bg-danger'
            }
            return map[status] || 'badge bg-secondary'
        }

        const handlePortfolioSave = async (projectData) => {
            try {
                const token = await getAuthToken()
                const isLegacyEdit = editingProject.value?.isLegacy
                const payload = { ...projectData }
                if (isLegacyEdit) {
                    delete payload.id
                }
                const isUpdate = payload.id && editingProject.value && !isLegacyEdit

                const response = await fetch(
                    isUpdate
                        ? `${config.backend.api}/api/profiles/contractor/portfolio/${payload.id}`
                        : `${config.backend.api}/api/profiles/contractor/portfolio`,
                    {
                        method: isUpdate ? 'PUT' : 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }
                )

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to save portfolio project')
                }

                if (isLegacyEdit && editingProject.value?.legacyIndex !== undefined) {
                    await removeLegacyPortfolioImage(editingProject.value.legacyIndex, { skipRefresh: true })
                }

                // Refresh profile to get updated portfolio
                await fetchProfile()
                showPortfolioModal.value = false
                editingProject.value = null
            } catch (err) {
                console.error('Error saving portfolio project:', err)
                alert(err.message || 'Failed to save portfolio project')
            }
        }

        const viewPortfolioProject = (project) => {
            // Could open a detail modal or navigate
            console.log('View project:', project)
        }

        const editPortfolioProject = (project) => {
            editingProject.value = project
            showPortfolioModal.value = true
        }

        const deletePortfolioProject = async (project) => {
            if (!confirm(`Are you sure you want to delete "${project.title}"?`)) {
                return
            }

            try {
                if (project?.isLegacy) {
                    await removeLegacyPortfolioImage(project.legacyIndex)
                    return
                }
                const token = await getAuthToken()
                const response = await fetch(
                    `${config.backend.api}/api/profiles/contractor/portfolio/${project.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                )

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete portfolio project')
                }

                // Refresh profile to get updated portfolio
                await fetchProfile()
            } catch (err) {
                console.error('Error deleting portfolio project:', err)
                alert(err.message || 'Failed to delete portfolio project')
            }
        }

        const removeLegacyPortfolioImage = async (legacyIndex, options = {}) => {
            const current = Array.isArray(profile.value?.portfolioImages)
                ? [...profile.value.portfolioImages]
                : []
            if (legacyIndex === undefined || legacyIndex === null) return
            if (legacyIndex < 0 || legacyIndex >= current.length) return

            current.splice(legacyIndex, 1)

            const token = await getAuthToken()
            const response = await fetch(`${config.backend.api}/api/profiles/contractor/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ portfolioImages: current })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update portfolio images')
            }

            profile.value = { ...(profile.value || {}), portfolioImages: current }
            if (!options.skipRefresh) {
                await fetchProfile()
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

        onMounted(async () => {
            const tabFromQuery = route.query.tab
            if (tabFromQuery && ['overview', 'profile', 'portfolio', 'applications', 'past-contracts', 'documents'].includes(tabFromQuery)) {
                activeTab.value = tabFromQuery
            }
            await Promise.all([
                fetchProfile(),
                fetchApplications(),
                fetchPastWorks(),
                fetchDocuments()
            ])
        })

        return {
            router,
            profile,
            profileForm,
            loading,
            error,
            activeTab,
            saving,
            saveError,
            saveSuccess,
            photoUrl,
            hasPhoto,
            hasDescription,
            hasOneProject,
            hasOneSkill,
            profileProgressCount,
            profileProgressPercent,
            initials,
            uploadingPhoto,
            photoError,
            statsData,
            tabs,
            onTabChange,
            portfolioProjects,
            loadingPortfolio,
            portfolioError,
            showPortfolioModal,
            editingProject,
            applications,
            loadingApplications,
            pastWorks,
            loadingWorks,
            workUploading,
            workUploadErrors,
            documents,
            loadingDocuments,
            documentsError,
            replaceDoc,
            SKILL_LEVELS,
            skillCategories,
            getSkillsByCategory,
            getSkillName,
            getSkillLevelName,
            isSkillSelected,
            newSkill,
            addSkill,
            removeSkill,
            recentActivity,
            totalEarnings,
            saveProfile,
            onProfilePhotoSelected,
            fetchPastWorks,
            onWorkAttachmentsSelected,
            fetchDocuments,
            handleDocumentUploaded,
            startReplace,
            cancelReplace,
            downloadDoc,
            formatDocLabel,
            getDocStatusBadge,
            handlePortfolioSave,
            viewPortfolioProject,
            editPortfolioProject,
            deletePortfolioProject,
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
.contractor-profile {
    min-height: 100vh;
    background: var(--light);
}

.profile-progress-card .profile-progress-item:not(:disabled) {
    cursor: pointer;
}

.profile-progress-card.profile-progress-complete .progress-bar {
    background-color: var(--success, #198754);
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
    background: var(--success);
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

.application-item,
.work-item,
.document-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
    gap: 1rem;
}

.application-item:last-child,
.work-item:last-child,
.document-item:last-child {
    border-bottom: none;
}

.application-content,
.work-content,
.document-info {
    flex: 1;
}

.application-title,
.work-title {
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.application-meta,
.work-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.work-attachments {
    margin-top: 0.75rem;
}

.attachment-thumb {
    display: block;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(var(--primary-rgb), 0.18);
}

.attachment-thumb img {
    width: 100%;
    height: 100px;
    object-fit: cover;
}

.attachment-file {
    height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.05);
    color: var(--secondary);
}

.skills-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(var(--primary-rgb), 0.03);
    border-radius: 12px;
}

.form-check {
    margin-bottom: 0;
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
