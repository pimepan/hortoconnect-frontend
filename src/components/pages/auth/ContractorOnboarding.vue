<template>
    <div class="container-fluid h-100 d-flex align-items-center justify-content-center onboarding-container">
        <div class="row w-100 justify-content-center">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7">
                <div class="card shadow-lg border-0">
                    <div class="card-body p-4 p-md-5">
                        <div class="text-center mb-4">
                            <h2 class="card-title mb-2 fw-bold">Complete your profile</h2>
                            <p class="text-muted mb-0">Tell us about you and your skills</p>
                        </div>

                        <form @submit.prevent="handleSubmit" class="d-flex flex-column gap-4">
                            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                                <AlertTriangle class="me-2" :size="18" />
                                <span>{{ errorMessage }}</span>
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <FileText class="me-2" :size="18" />About you
                                </label>
                                <textarea 
                                    class="form-control" 
                                    v-model="description"
                                    placeholder="Describe your experience, specialties, and what makes you stand out as a contractor…"
                                    rows="4"
                                    maxlength="300"
                                    :disabled="loading"
                                ></textarea>
                                <div class="form-text text-end">
                                    {{ description.length }}/300 characters
                                </div>
                            </div>

                            <!-- Portfolio Projects -->
                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Images class="me-2" :size="18" />Portfolio projects
                                </label>
                                <p class="text-muted small mb-2">Add projects and upload images per project</p>

                                <PortfolioGrid
                                    :projects="portfolioProjects"
                                    :loading="false"
                                    :error="''"
                                    @add-project="startAddProject"
                                    @view-project="editPortfolioProject"
                                    @edit-project="editPortfolioProject"
                                    @delete-project="removePortfolioProject"
                                />
                                <div class="form-text d-flex align-items-center">
                                    <Info class="me-1" :size="16" />
                                    Projects are saved when you finish onboarding.
                                </div>
                            </div>

                            <!-- Skills Selection -->
                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Wrench class="me-2" :size="18" />Skills & specialties
                                </label>
                                <p class="text-muted small mb-2">Select your skills and experience level</p>
                                
                                <div class="border rounded p-3 bg-light">
                                    <div v-if="selectedSkills.length === 0" class="text-muted text-center py-2">
                                        No skills selected yet
                                    </div>
                                    <div v-else class="mb-3">
                                        <div 
                                            v-for="(skill, index) in selectedSkills" 
                                            :key="index"
                                            class="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border"
                                        >
                                            <div>
                                                <strong>{{ getSkillName(skill.skillId) }}</strong>
                                                <span class="badge bg-secondary ms-2">{{ getSkillLevelName(skill.level) }}</span>
                                            </div>
                                            <button
                                                type="button"
                                                class="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                                                @click="removeSkill(index)"
                                                :disabled="loading"
                                            >
                                                <Trash2 :size="16" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <select 
                                                class="form-select"
                                                v-model="newSkill.skillId"
                                                :disabled="loading"
                                            >
                                                <option value="">Select a skill</option>
                                                <optgroup 
                                                    v-for="category in skillCategories" 
                                                    :key="category"
                                                    :label="category"
                                                >
                                                    <option 
                                                        v-for="skill in getSkillsByCategory(category)" 
                                                        :key="skill.id"
                                                        :value="skill.id"
                                                        :disabled="isSkillSelected(skill.id)"
                                                    >
                                                        {{ skill.name }}
                                                    </option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <select 
                                                class="form-select"
                                                v-model="newSkill.level"
                                                :disabled="loading || !newSkill.skillId"
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
                                                class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                                                @click="addSkill"
                                                :disabled="loading || !newSkill.skillId || !newSkill.level"
                                            >
                                                <Plus :size="16" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="d-flex gap-2 mt-3">
                                <WButton 
                                    type="button"
                                    class="btn-outline-secondary"
                                    @click="handleSkip"
                                    :disabled="loading"
                                >
                                    Skip for now
                                </WButton>
                                <WButton 
                                    type="submit" 
                                    class="btn-primary flex-grow-1"
                                    :loading="loading"
                                    :disabled="loading"
                                >
                                    {{ loading ? 'Saving…' : 'Continue' }}
                                </WButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { AlertTriangle, FileText, Images, Plus, Info, Wrench, Trash2 } from 'lucide-vue-next'
import WButton from '../../utils/WButton.vue'
import PortfolioGrid from '../../PortfolioGrid.vue'
import PortfolioProjectModal from '../../PortfolioProjectModal.vue'
import { TRADE_SKILLS, SKILL_LEVELS } from '../../../constants/skills.js'
import config from '../../../config.js'

export default {
    components: {
        WButton,
        AlertTriangle,
        FileText,
        Images,
        Plus,
        Info,
        Wrench,
        Trash2,
        PortfolioGrid,
        PortfolioProjectModal
    },
    props: {
        role: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const router = useRouter()
        const authStore = useAuthStore()
        const description = ref('')
        const portfolioProjects = ref([])
        const showPortfolioModal = ref(false)
        const editingProject = ref(null)
        const selectedSkills = ref([])
        const newSkill = ref({ skillId: '', level: '' })
        const errorMessage = ref('')
        const loading = ref(false)

        const skillCategories = computed(() => {
            const categories = [...new Set(TRADE_SKILLS.map(skill => skill.category))]
            return categories
        })

        const getSkillsByCategory = (category) => {
            return TRADE_SKILLS.filter(skill => skill.category === category)
        }

        const getSkillName = (skillId) => {
            const skill = TRADE_SKILLS.find(s => s.id === skillId)
            return skill ? skill.name : skillId
        }

        const getSkillLevelName = (levelId) => {
            const level = SKILL_LEVELS.find(l => l.id === levelId)
            return level ? level.name : levelId
        }

        const isSkillSelected = (skillId) => {
            return selectedSkills.value.some(s => s.skillId === skillId)
        }

        const normalizeProject = (project) => {
            const now = new Date().toISOString()
            const id = project?.id || `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            return {
                id,
                title: (project?.title || '').trim(),
                description: project?.description || '',
                location: project?.location || '',
                completedDate: project?.completedDate || null,
                tags: Array.isArray(project?.tags) ? project.tags : [],
                images: Array.isArray(project?.images) ? project.images : [],
                createdAt: project?.createdAt || now,
                updatedAt: now
            }
        }

        const startAddProject = () => {
            editingProject.value = null
            showPortfolioModal.value = true
        }

        const editPortfolioProject = (project) => {
            editingProject.value = project
            showPortfolioModal.value = true
        }

        const handlePortfolioSave = (projectData) => {
            const normalized = normalizeProject(projectData)
            if (editingProject.value?.id) {
                portfolioProjects.value = portfolioProjects.value.map((p) =>
                    p.id === editingProject.value.id ? { ...normalized, createdAt: p.createdAt || normalized.createdAt } : p
                )
            } else {
                portfolioProjects.value = [...portfolioProjects.value, normalized]
            }
            showPortfolioModal.value = false
            editingProject.value = null
        }

        const removePortfolioProject = (project) => {
            if (!project?.id) return
            portfolioProjects.value = portfolioProjects.value.filter(p => p.id !== project.id)
        }

        const addSkill = () => {
            if (newSkill.value.skillId && newSkill.value.level && !isSkillSelected(newSkill.value.skillId)) {
                selectedSkills.value.push({
                    skillId: newSkill.value.skillId,
                    level: newSkill.value.level
                })
                newSkill.value = { skillId: '', level: '' }
            }
        }

        const removeSkill = (index) => {
            selectedSkills.value.splice(index, 1)
        }

        const handleSkip = async () => {
            await saveOnboardingData(true)
        }

        const saveOnboardingData = async (skip = false) => {
            loading.value = true
            errorMessage.value = ''

            try {
                const token = await authStore.getAuthToken()

                const onboardingData = {
                    role: props.role,
                    description: skip ? null : (description.value || null),
                    skills: skip ? [] : selectedSkills.value,
                    portfolioProjects: skip ? [] : portfolioProjects.value
                }

                const response = await fetch(`${config.backend.api}/api/user/onboarding`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(onboardingData)
                })

                const data = await response.json()

                if (!response.ok) {
                    errorMessage.value = data.error || 'Failed to save onboarding data'
                    return
                }

                // Refresh user profile
                await authStore.fetchUserProfile()

                // Redirect to appropriate profile
                if (props.role === 'contractor') {
                    router.push('/profile/contractor')
                } else {
                    router.push('/profile/buyer')
                }
            } catch (error) {
                errorMessage.value = 'Connection error. Please try again.'
                console.error('Onboarding error:', error)
            } finally {
                loading.value = false
            }
        }

        const handleSubmit = async () => {
            await saveOnboardingData(false)
        }

        return {
            description,
            portfolioProjects,
            showPortfolioModal,
            editingProject,
            selectedSkills,
            newSkill,
            errorMessage,
            loading,
            skillCategories,
            TRADE_SKILLS,
            SKILL_LEVELS,
            getSkillsByCategory,
            getSkillName,
            getSkillLevelName,
            isSkillSelected,
            startAddProject,
            editPortfolioProject,
            handlePortfolioSave,
            removePortfolioProject,
            addSkill,
            removeSkill,
            handleSkip,
            handleSubmit
        }
    }
}
</script>

<style scoped>
.onboarding-container {
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

.form-control:focus,
.form-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--primary-rgb), 0.22);
}

.btn-primary {
    background-color: var(--primary);
    border-color: var(--primary);
}

.btn-primary:hover {
    background-color: var(--dark-2);
    border-color: var(--dark-2);
}

.alert {
    border-radius: 8px;
}

@media (max-width: 768px) {
    .onboarding-container {
        padding: 1rem;
    }
    
    .card-body {
        padding: 2rem 1.5rem !important;
    }
}
</style>
