<template>
    <div class="contractor-public-profile">
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading…</span></div>
        </div>
        <div v-else-if="error" class="alert alert-danger container" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div class="profile-hero">
                <div class="container">
                    <div class="profile-hero-content">
                        <div class="profile-avatar-section">
                            <div class="profile-avatar">
                                <img v-if="profile.photoUrl" :src="profile.photoUrl" alt="Profile" />
                                <div v-else class="avatar-placeholder">{{ initials }}</div>
                            </div>
                        </div>
                        <div class="profile-hero-info">
                            <h1 class="profile-name">{{ profile.name || businessDisplay || 'Contractor' }}</h1>
                            <p v-if="businessDisplay && profile.name" class="profile-business text-muted mb-1">{{ businessDisplay }}</p>
                            <p v-if="coverageAreaDisplay" class="profile-meta">
                                <MapPin class="me-2" :size="16" /> {{ coverageAreaDisplay }}
                            </p>
                            <div class="profile-badge">
                                <Wrench class="me-1" :size="18" />Contractor
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container profile-content py-4">
                <!-- Profile completion (visible to visitors) -->
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
                            <span class="d-flex align-items-center gap-1 profile-progress-item" :class="hasPhoto ? 'text-success' : 'text-muted'">
                                <Check v-if="hasPhoto" :size="18" />
                                <Circle v-else :size="18" />
                                Profile photo
                            </span>
                            <span class="d-flex align-items-center gap-1 profile-progress-item" :class="hasDescription ? 'text-success' : 'text-muted'">
                                <Check v-if="hasDescription" :size="18" />
                                <Circle v-else :size="18" />
                                Description
                            </span>
                            <span class="d-flex align-items-center gap-1 profile-progress-item" :class="hasOneProject ? 'text-success' : 'text-muted'">
                                <Check v-if="hasOneProject" :size="18" />
                                <Circle v-else :size="18" />
                                One portfolio project
                            </span>
                            <span class="d-flex align-items-center gap-1 profile-progress-item" :class="hasOneSkill ? 'text-success' : 'text-muted'">
                                <Check v-if="hasOneSkill" :size="18" />
                                <Circle v-else :size="18" />
                                Add a skill
                            </span>
                        </div>
                    </div>
                </div>

                <div v-if="profile.description" class="card mb-4">
                    <div class="card-header"><h4 class="mb-0">About</h4></div>
                    <div class="card-body">
                        <p class="mb-0">{{ profile.description }}</p>
                    </div>
                </div>

                <div v-if="serviceTypesDisplay.length > 0" class="card mb-4">
                    <div class="card-header"><h4 class="mb-0">Service types</h4></div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-2">
                            <span
                                v-for="(st, i) in serviceTypesDisplay"
                                :key="i"
                                class="badge bg-secondary"
                            >{{ st }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="skillsList.length > 0" class="card mb-4">
                    <div class="card-header"><h4 class="mb-0">Skills</h4></div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-2">
                            <span
                                v-for="s in skillsList"
                                :key="s.skillId"
                                class="badge bg-primary"
                            >{{ getSkillName(s.skillId) }} <span v-if="s.level" class="opacity-75">({{ getSkillLevelName(s.level) }})</span></span>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">
                        <PortfolioGrid
                            :projects="portfolioProjects"
                            :loading="false"
                            :error="''"
                            :read-only="true"
                            @view-project="viewingProject = $event"
                        />
                    </div>
                </div>
            </div>

            <!-- View project modal -->
            <div v-if="viewingProject" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ viewingProject.title || 'Project' }}</h5>
                            <button type="button" class="btn-close" aria-label="Close" @click="viewingProject = null"></button>
                        </div>
                        <div class="modal-body">
                            <p v-if="viewingProject.description">{{ viewingProject.description }}</p>
                            <div v-if="viewingProject.images && viewingProject.images.length" class="row g-2 mt-2">
                                <div v-for="(img, i) in viewingProject.images" :key="i" class="col-6 col-md-4">
                                    <img :src="typeof img === 'string' ? img : (img?.url || '')" alt="" class="img-fluid rounded" />
                                </div>
                            </div>
                            <div v-if="viewingProject.location" class="text-muted small mt-2">
                                <MapPin :size="14" class="me-1" /> {{ viewingProject.location }}
                            </div>
                            <div v-if="viewingProject.completedDate" class="text-muted small">
                                Completed: {{ formatDate(viewingProject.completedDate) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Wrench, MapPin, Check, Circle } from 'lucide-vue-next'
import PortfolioGrid from '../PortfolioGrid.vue'
import config from '../../config.js'
import { TRADE_SKILLS, SKILL_LEVELS } from '../../constants/skills.js'
import { formatDateLong } from '../../utils/formatters.js'

export default {
    name: 'ContractorPublicProfile',
    components: { Wrench, MapPin, Check, Circle, PortfolioGrid },
    setup() {
        const route = useRoute()
        const profile = ref({})
        const loading = ref(true)
        const error = ref('')
        const viewingProject = ref(null)

        const contractorId = computed(() => route.params.id || '')

        const businessDisplay = computed(() => {
            const raw = profile.value?.business
            if (raw == null) return ''
            if (typeof raw === 'string') return raw.trim()
            if (typeof raw === 'object' && raw !== null && raw.legalName != null && String(raw.legalName).trim() !== '') return String(raw.legalName).trim()
            return ''
        })

        const initials = computed(() => {
            const name = (profile.value?.name || businessDisplay.value || '').toString().trim()
            if (name) {
                const parts = name.split(/\s+/).slice(0, 2)
                return parts.map((p) => (p[0] || '').toUpperCase()).join('')
            }
            return 'C'
        })

        const portfolioProjects = computed(() => {
            const p = profile.value?.portfolioProjects
            return Array.isArray(p) ? p : []
        })

        const serviceTypesDisplay = computed(() => {
            const raw = profile.value?.serviceTypes
            if (Array.isArray(raw)) return raw.filter((s) => s != null && String(s).trim() !== '').map((s) => String(s).trim())
            if (typeof raw === 'string' && raw.trim()) return [raw.trim()]
            return []
        })

        const coverageAreaDisplay = computed(() => {
            const raw = profile.value?.coverageArea
            if (raw == null) return ''
            if (typeof raw === 'string') return raw.trim()
            if (typeof raw !== 'object') return String(raw)
            const parts = []
            if (Array.isArray(raw.states) && raw.states.length) parts.push(raw.states.join(', '))
            if (Array.isArray(raw.counties) && raw.counties.length) parts.push(raw.counties.join(', '))
            if (raw.radiusMiles != null && raw.radiusMiles !== '') parts.push(`${raw.radiusMiles} mi radius`)
            if (raw.notes && String(raw.notes).trim()) parts.push(String(raw.notes).trim())
            return parts.length ? parts.join(' · ') : ''
        })

        const skillsList = computed(() => {
            const raw = profile.value?.skills
            if (!Array.isArray(raw)) return []
            return raw.map((item) => {
                if (typeof item === 'string') return { skillId: item, level: null }
                return {
                    skillId: item.skillId || item.id || item.skill || '',
                    level: item.level || null
                }
            }).filter((s) => s.skillId)
        })

        const hasPhoto = computed(() => !!(profile.value?.photoUrl))
        const hasDescription = computed(() => {
            const d = profile.value?.description ?? ''
            return typeof d === 'string' && d.trim().length > 0
        })
        const hasOneProject = computed(() => (portfolioProjects.value?.length ?? 0) >= 1)
        const hasOneSkill = computed(() => (skillsList.value?.length ?? 0) >= 1)
        const profileProgressCount = computed(() => {
            let n = 0
            if (hasPhoto.value) n++
            if (hasDescription.value) n++
            if (hasOneProject.value) n++
            if (hasOneSkill.value) n++
            return n
        })
        const profileProgressPercent = computed(() => (profileProgressCount.value / 4) * 100)

        const getSkillName = (skillId) => {
            const found = (TRADE_SKILLS || []).find((s) => s.id === skillId)
            return found ? found.name : skillId
        }

        const getSkillLevelName = (levelId) => {
            const found = (SKILL_LEVELS || []).find((l) => l.id === levelId)
            return found ? found.name : levelId
        }

        const formatDate = (dateString) => {
            if (!dateString) return ''
            try {
                return formatDateLong(dateString)
            } catch {
                return dateString
            }
        }

        const fetchProfile = async () => {
            const id = contractorId.value
            if (!id) {
                error.value = 'Contractor not specified'
                loading.value = false
                return
            }
            loading.value = true
            error.value = ''
            try {
                const resp = await fetch(`${config.backend.api}/api/public/contractors/${id}`)
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to load profile')
                profile.value = data.profile || {}
            } catch (err) {
                error.value = err.message || 'Failed to load profile'
            } finally {
                loading.value = false
            }
        }

        onMounted(fetchProfile)

        return {
            profile,
            loading,
            error,
            initials,
            businessDisplay,
            coverageAreaDisplay,
            serviceTypesDisplay,
            portfolioProjects,
            skillsList,
            hasPhoto,
            hasDescription,
            hasOneProject,
            hasOneSkill,
            profileProgressCount,
            profileProgressPercent,
            viewingProject,
            getSkillName,
            getSkillLevelName,
            formatDate
        }
    }
}
</script>

<style scoped>
.contractor-public-profile .profile-hero {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0.02) 100%);
    padding: 2.5rem 0;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.12);
}

.profile-hero-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.profile-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
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
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary);
}

.profile-hero-info {
    flex: 1;
    min-width: 200px;
}

.profile-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 0.25rem;
}

.profile-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    background: rgba(var(--primary-rgb), 0.12);
    color: var(--primary);
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-top: 0.5rem;
}

.profile-progress-card.profile-progress-complete .progress-bar {
    background-color: var(--success, #198754);
}
</style>
