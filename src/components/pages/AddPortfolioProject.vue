<template>
    <div class="add-portfolio-project">
        <div class="container py-4">
            <div class="page-header mb-4">
                <router-link :to="profilePath" class="btn btn-link text-decoration-none d-inline-flex align-items-center mb-2">
                    <ArrowLeft :size="20" class="me-2" />
                    Back to profile
                </router-link>
                <h1 class="h3 mb-0">Add New Project to Portfolio</h1>
                <p class="text-muted mb-0">Showcase your work to attract more clients.</p>
            </div>

            <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <form @submit.prevent="handleSubmit" class="portfolio-form card border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="form-label fw-semibold">Project Title <span class="text-danger">*</span></label>
                            <input
                                v-model="form.title"
                                type="text"
                                class="form-control form-control-lg"
                                required
                                placeholder="e.g. Commercial Landscape Renovation"
                            />
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-semibold">Description</label>
                            <textarea
                                v-model="form.description"
                                class="form-control"
                                rows="4"
                                placeholder="Describe the project, your role, and key achievements..."
                            ></textarea>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Location</label>
                            <input
                                v-model="form.location"
                                type="text"
                                class="form-control"
                                placeholder="e.g. San Jose, CA"
                            />
                        </div>

                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Completion Date</label>
                            <input
                                v-model="form.completedDate"
                                type="date"
                                class="form-control"
                            />
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-semibold">Tags</label>
                            <input
                                v-model="tagsInput"
                                type="text"
                                class="form-control"
                                placeholder="e.g. landscaping, maintenance, design (comma-separated)"
                            />
                            <div class="form-text">Separate tags with commas</div>
                            <div v-if="form.tags.length > 0" class="mt-2 d-flex flex-wrap gap-2">
                                <span
                                    v-for="(tag, idx) in form.tags"
                                    :key="idx"
                                    class="badge bg-primary d-flex align-items-center gap-2"
                                >
                                    {{ tag }}
                                    <button
                                        type="button"
                                        class="btn-close btn-close-white"
                                        style="font-size: 0.7rem;"
                                        @click="removeTag(tag)"
                                    ></button>
                                </span>
                            </div>
                        </div>

                        <div class="col-12">
                            <label class="form-label fw-semibold">Project Images</label>

                            <!-- Existing uploaded images -->
                            <div v-if="form.images.length > 0" class="mb-3">
                                <div class="row g-2">
                                    <div
                                        v-for="(img, idx) in form.images"
                                        :key="idx"
                                        class="col-6 col-md-4"
                                    >
                                        <div class="image-preview">
                                            <img :src="img" alt="Preview" />
                                            <button
                                                type="button"
                                                class="btn-remove-image"
                                                @click="removeImage(idx)"
                                            >
                                                <X :size="16" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Upload new images -->
                            <FileDropzone
                                v-model="imageFiles"
                                accept="image/*"
                                :multiple="true"
                                :max-files="10"
                                :max-size="10"
                                hint="Drag & drop or click to upload (max 10 images, 10MB each)"
                                :disabled="uploadingImages"
                                @change="handleImageFilesChange"
                            />
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-top d-flex justify-content-end gap-2 p-4">
                    <router-link :to="profilePath" class="btn btn-secondary">Cancel</router-link>
                    <WButton
                        class="btn-primary"
                        :loading="saving"
                        :disabled="saving || !form.title.trim()"
                        @click="handleSubmit"
                    >
                        Add Project
                    </WButton>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, X } from 'lucide-vue-next'
import WButton from '../utils/WButton.vue'
import FileDropzone from '../utils/FileDropzone.vue'
import { useAuthStore } from '../../stores/auth'
import config from '../../config.js'

export default {
    name: 'AddPortfolioProject',
    components: {
        ArrowLeft,
        X,
        WButton,
        FileDropzone
    },
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        const form = ref({
            title: '',
            description: '',
            location: '',
            completedDate: '',
            tags: [],
            images: []
        })
        const tagsInput = ref('')
        const imageFiles = ref([])
        const uploadingImages = ref(false)
        const saving = ref(false)
        const error = ref('')

        const profilePath = computed(() => ({ path: '/profile/contractor', query: { tab: 'portfolio' } }))

        const removeTag = (tag) => {
            form.value.tags = form.value.tags.filter(t => t !== tag)
            tagsInput.value = form.value.tags.join(', ')
        }

        const updateTags = () => {
            const tags = tagsInput.value
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0)
            form.value.tags = [...new Set(tags)]
        }

        const handleImageFilesChange = async (files) => {
            if (files.length === 0) return

            uploadingImages.value = true
            error.value = ''

            try {
                const token = await authStore.getAuthToken()
                const formData = new FormData()
                for (const fileObj of files) {
                    formData.append('files', fileObj.file)
                }

                const response = await fetch(`${config.backend.api}/api/uploads/contractor/portfolio`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to upload images')
                }

                const newImages = data.images || []
                form.value.images = [...form.value.images, ...newImages.map(img => img.url || img)]
                imageFiles.value = []
            } catch (err) {
                error.value = err.message || 'Failed to upload images'
            } finally {
                uploadingImages.value = false
            }
        }

        const removeImage = (index) => {
            form.value.images.splice(index, 1)
        }

        const handleSubmit = async () => {
            updateTags()
            error.value = ''

            if (!form.value.title.trim()) {
                error.value = 'Project title is required'
                return
            }

            saving.value = true
            try {
                const token = await authStore.getAuthToken()
                const payload = {
                    title: form.value.title.trim(),
                    description: form.value.description || '',
                    location: form.value.location || '',
                    completedDate: form.value.completedDate || '',
                    tags: form.value.tags,
                    images: form.value.images
                }

                const response = await fetch(`${config.backend.api}/api/profiles/contractor/portfolio`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to save portfolio project')
                }

                router.push(profilePath.value)
            } catch (err) {
                console.error('Error saving portfolio project:', err)
                error.value = err.message || 'Failed to save portfolio project'
            } finally {
                saving.value = false
            }
        }

        return {
            form,
            tagsInput,
            imageFiles,
            uploadingImages,
            saving,
            error,
            profilePath,
            removeTag,
            handleImageFilesChange,
            removeImage,
            handleSubmit
        }
    }
}
</script>

<style scoped>
.add-portfolio-project {
    min-height: 60vh;
}

.page-header .btn-link {
    color: var(--bs-body-color);
}

.page-header .btn-link:hover {
    color: var(--bs-primary);
}

.portfolio-form {
    border-radius: 16px;
    border: 1px solid rgba(var(--bs-primary-rgb, 13, 110, 253), 0.15);
}

.form-label {
    color: var(--bs-body-color);
    margin-bottom: 0.5rem;
}

.image-preview {
    position: relative;
    width: 100%;
    padding-top: 75%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.image-preview img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.btn-remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-remove-image:hover {
    background: rgba(0, 0, 0, 0.9);
}

.badge {
    padding: 0.5rem 0.75rem;
    border-radius: 12px;
    font-weight: 600;
}
</style>
