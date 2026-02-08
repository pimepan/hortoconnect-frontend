<template>
    <div
        class="modal fade"
        :id="modalId"
        ref="modalRef"
        tabindex="-1"
        aria-labelledby="portfolioModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="portfolioModalLabel">
                        {{ isEditing ? 'Edit Project' : 'Add New Project' }}
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                    ></button>
                </div>
                <div class="modal-body">
                    <div v-if="error" class="alert alert-danger" role="alert">
                        {{ error }}
                    </div>

                    <form @submit.prevent="handleSubmit">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label fw-semibold">Project Title <span class="text-danger">*</span></label>
                                <input
                                    v-model="form.title"
                                    type="text"
                                    class="form-control"
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
                                                <img :src="imageUrl(img)" alt="Preview" />
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
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cancel
                    </button>
                    <WButton
                        class="btn-primary"
                        :loading="saving"
                        :disabled="saving || !form.title"
                        @click="handleSubmit"
                    >
                        {{ isEditing ? 'Update Project' : 'Add Project' }}
                    </WButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'
import { X } from 'lucide-vue-next'
import WButton from './utils/WButton.vue'
import FileDropzone from './utils/FileDropzone.vue'
import { useAuthStore } from '../stores/auth'
import config from '../config.js'

export default {
    name: 'PortfolioProjectModal',
    components: {
        X,
        WButton,
        FileDropzone
    },
    props: {
        project: {
            type: Object,
            default: null
        },
        show: {
            type: Boolean,
            default: false
        }
    },
    emits: ['save', 'close'],
    setup(props, { emit }) {
        const authStore = useAuthStore()
        const modal = ref(null)
        const modalRef = ref(null)
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

        const modalId = computed(() => `portfolio-modal-${Date.now()}`)
        const isEditing = computed(() => !!props.project)

        const resetForm = () => {
            form.value = {
                title: '',
                description: '',
                location: '',
                completedDate: '',
                tags: [],
                images: []
            }
            tagsInput.value = ''
            imageFiles.value = []
            error.value = ''
        }

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
                form.value.images = [...form.value.images, ...newImages]
                
                // Clear the file dropzone after successful upload
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

        const imageUrl = (img) => {
            if (typeof img === 'string') return img
            return img?.url || ''
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
                const imagesForSave = form.value.images.map((img) => {
                    if (typeof img === 'object' && img?.path) return { path: img.path }
                    if (typeof img === 'object' && img?.url) return { url: img.url }
                    return { url: typeof img === 'string' ? img : (img?.url ?? '') }
                })
                const projectData = {
                    ...form.value,
                    images: imagesForSave,
                    id: props.project?.id
                }
                emit('save', projectData)
            } catch (err) {
                error.value = err.message || 'Failed to save project'
            } finally {
                saving.value = false
            }
        }

        watch(() => props.show, (newVal) => {
            if (!modal.value) return
            if (newVal) {
                modal.value.show()
            } else {
                modal.value.hide()
            }
        })

        watch(() => props.project, (newProject) => {
            if (newProject) {
                form.value = {
                    title: newProject.title || '',
                    description: newProject.description || '',
                    location: newProject.location || '',
                    completedDate: newProject.completedDate || '',
                    tags: Array.isArray(newProject.tags) ? [...newProject.tags] : [],
                    images: Array.isArray(newProject.images) ? [...newProject.images] : []
                }
                tagsInput.value = form.value.tags.join(', ')
            } else {
                resetForm()
            }
        }, { immediate: true })

        onMounted(() => {
            if (modalRef.value) {
                modal.value = new Modal(modalRef.value, {
                    backdrop: true,
                    focus: true,
                    keyboard: true
                })

                modalRef.value.addEventListener('hidden.bs.modal', () => {
                    emit('close')
                    resetForm()
                })

                if (props.show) {
                    modal.value.show()
                }
            }
        })

        return {
            modalRef,
            form,
            tagsInput,
            imageFiles,
            uploadingImages,
            saving,
            error,
            modalId,
            isEditing,
            resetForm,
            removeTag,
            updateTags,
            handleImageFilesChange,
            removeImage,
            imageUrl,
            handleSubmit
        }
    }
}
</script>

<style scoped>
.modal-content {
    border-radius: 20px;
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
}

.modal-header {
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
    padding: 1.5rem;
}

.modal-title {
    font-weight: 700;
    color: var(--dark);
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    border-top: 1px solid rgba(var(--primary-rgb), 0.1);
    padding: 1.5rem;
}

.form-label {
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.image-preview {
    position: relative;
    width: 100%;
    padding-top: 75%;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(var(--primary-rgb), 0.18);
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
