<template>
    <div class="file-dropzone-container">
        <!-- Label -->
        <label v-if="label" class="form-label fw-semibold">{{ label }}</label>

        <!-- Dropzone Area -->
        <div
            ref="dropzoneRef"
            class="dropzone"
            :class="{
                'dropzone-active': isDragging,
                'dropzone-disabled': disabled,
                'dropzone-compact': compact,
                'dropzone-error': errorMessage
            }"
            @click="openFilePicker"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
        >
            <!-- Hidden File Input -->
            <input
                ref="fileInputRef"
                type="file"
                :accept="accept"
                :multiple="multiple"
                :disabled="disabled"
                class="file-input-hidden"
                @change="onFileInputChange"
            />

            <!-- Empty State / Upload Instructions -->
            <div v-if="files.length === 0" class="dropzone-content">
                <Upload :size="compact ? 32 : 48" class="upload-icon" />
                <div class="upload-text">
                    <p class="mb-1 fw-semibold">
                        {{ isDragging ? 'Drop files here' : 'Drag & drop files here' }}
                    </p>
                    <p class="text-secondary mb-0 small">
                        or click to browse
                    </p>
                </div>
            </div>

            <!-- File List with Previews -->
            <div v-else class="file-list">
                <div class="file-grid" :class="{ 'file-grid-compact': compact }">
                    <div
                        v-for="fileObj in files"
                        :key="fileObj.id"
                        class="file-item"
                    >
                        <!-- Image Preview -->
                        <div v-if="fileObj.preview && showPreview" class="file-preview">
                            <img :src="fileObj.preview" :alt="fileObj.name" />
                            <button
                                type="button"
                                class="file-remove-btn"
                                @click.stop="removeFile(fileObj.id)"
                                :disabled="disabled"
                            >
                                <X :size="16" />
                            </button>
                        </div>

                        <!-- Non-Image File -->
                        <div v-else class="file-preview file-preview-generic">
                            <FileIcon :size="compact ? 24 : 32" />
                            <button
                                type="button"
                                class="file-remove-btn"
                                @click.stop="removeFile(fileObj.id)"
                                :disabled="disabled"
                            >
                                <X :size="16" />
                            </button>
                        </div>

                        <!-- File Info -->
                        <div class="file-info">
                            <p class="file-name" :title="fileObj.name">{{ fileObj.name }}</p>
                            <p class="file-size">{{ formatFileSize(fileObj.size) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Add More Button (only if not at max) -->
                <button
                    v-if="multiple && files.length < maxFiles"
                    type="button"
                    class="btn btn-outline-secondary btn-sm mt-3"
                    @click.stop="openFilePicker"
                    :disabled="disabled"
                >
                    <Upload :size="16" class="me-2" />
                    Add more files
                </button>

                <!-- Clear All Button -->
                <button
                    v-if="files.length > 0"
                    type="button"
                    class="btn btn-outline-danger btn-sm mt-3 ms-2"
                    @click.stop="clearAllFiles"
                    :disabled="disabled"
                >
                    <X :size="16" class="me-2" />
                    Clear all
                </button>
            </div>
        </div>

        <!-- Hint Text -->
        <div v-if="hint" class="form-text mt-2">{{ hint }}</div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="invalid-feedback d-block mt-2">
            {{ errorMessage }}
        </div>

        <!-- File Count Info -->
        <div v-if="multiple && files.length > 0" class="form-text mt-2">
            {{ files.length }} / {{ maxFiles }} files selected
        </div>
    </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { Upload, X, FileIcon } from 'lucide-vue-next'

export default {
    name: 'FileDropzone',
    components: {
        Upload,
        X,
        FileIcon
    },
    props: {
        // File restrictions
        accept: {
            type: String,
            default: '*'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        maxSize: {
            type: Number,
            default: 10 // MB
        },
        maxFiles: {
            type: Number,
            default: 5
        },
        
        // UI customization
        label: {
            type: String,
            default: ''
        },
        hint: {
            type: String,
            default: ''
        },
        showPreview: {
            type: Boolean,
            default: true
        },
        compact: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        
        // v-model support
        modelValue: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update:modelValue', 'change', 'error', 'remove'],
    setup(props, { emit }) {
        const dropzoneRef = ref(null)
        const fileInputRef = ref(null)
        const isDragging = ref(false)
        const files = ref([])
        const errorMessage = ref('')

        // Generate unique ID for files
        const generateId = () => {
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        // Format file size for display
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes'
            const k = 1024
            const sizes = ['Bytes', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
        }

        // Validate file type
        const isValidFileType = (file) => {
            if (props.accept === '*') return true
            
            const acceptedTypes = props.accept.split(',').map(t => t.trim())
            
            return acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    // Extension check
                    return file.name.toLowerCase().endsWith(type.toLowerCase())
                } else if (type.endsWith('/*')) {
                    // MIME type wildcard (e.g., image/*)
                    const mimePrefix = type.split('/')[0]
                    return file.type.startsWith(mimePrefix + '/')
                } else {
                    // Exact MIME type
                    return file.type === type
                }
            })
        }

        // Validate file size
        const isValidFileSize = (file) => {
            const maxSizeBytes = props.maxSize * 1024 * 1024
            return file.size <= maxSizeBytes
        }

        // Check if file is an image
        const isImage = (file) => {
            return file.type.startsWith('image/')
        }

        // Generate preview for image files
        const generatePreview = (file) => {
            return new Promise((resolve) => {
                if (!isImage(file)) {
                    resolve(null)
                    return
                }

                const reader = new FileReader()
                reader.onload = (e) => {
                    resolve(e.target.result)
                }
                reader.onerror = () => {
                    resolve(null)
                }
                reader.readAsDataURL(file)
            })
        }

        // Process and add files
        const processFiles = async (fileList) => {
            errorMessage.value = ''
            
            const filesToAdd = Array.from(fileList)
            
            // Check if adding these files would exceed maxFiles
            if (!props.multiple && filesToAdd.length > 1) {
                errorMessage.value = 'Only one file is allowed'
                emit('error', errorMessage.value)
                return
            }

            const totalFiles = files.value.length + filesToAdd.length
            if (totalFiles > props.maxFiles) {
                errorMessage.value = `Maximum ${props.maxFiles} files allowed`
                emit('error', errorMessage.value)
                return
            }

            // Validate each file
            const validFiles = []
            for (const file of filesToAdd) {
                if (!isValidFileType(file)) {
                    errorMessage.value = `"${file.name}" has invalid file type`
                    emit('error', errorMessage.value)
                    continue
                }

                if (!isValidFileSize(file)) {
                    errorMessage.value = `"${file.name}" exceeds ${props.maxSize}MB limit`
                    emit('error', errorMessage.value)
                    continue
                }

                validFiles.push(file)
            }

            // If no valid files, return
            if (validFiles.length === 0) return

            // Generate previews and create file objects
            const fileObjects = await Promise.all(
                validFiles.map(async (file) => {
                    const preview = await generatePreview(file)
                    return {
                        id: generateId(),
                        file,
                        preview,
                        name: file.name,
                        size: file.size,
                        type: file.type
                    }
                })
            )

            // Add files
            if (props.multiple) {
                files.value = [...files.value, ...fileObjects]
            } else {
                files.value = fileObjects
            }

            // Emit events
            const rawFiles = files.value.map(f => f.file)
            emit('update:modelValue', files.value)
            emit('change', files.value)

            // Clear file input
            if (fileInputRef.value) {
                fileInputRef.value.value = ''
            }
        }

        // Drag and drop handlers
        const onDragOver = (e) => {
            if (props.disabled) return
            isDragging.value = true
        }

        const onDragLeave = (e) => {
            if (props.disabled) return
            // Only set to false if we're leaving the dropzone entirely
            if (e.target === dropzoneRef.value) {
                isDragging.value = false
            }
        }

        const onDrop = async (e) => {
            if (props.disabled) return
            isDragging.value = false
            
            const droppedFiles = e.dataTransfer.files
            if (droppedFiles.length > 0) {
                await processFiles(droppedFiles)
            }
        }

        // File input change handler
        const onFileInputChange = async (e) => {
            const selectedFiles = e.target.files
            if (selectedFiles.length > 0) {
                await processFiles(selectedFiles)
            }
        }

        // Open file picker
        const openFilePicker = () => {
            if (props.disabled) return
            fileInputRef.value?.click()
        }

        // Remove single file
        const removeFile = (fileId) => {
            if (props.disabled) return
            
            const fileToRemove = files.value.find(f => f.id === fileId)
            files.value = files.value.filter(f => f.id !== fileId)
            
            emit('update:modelValue', files.value)
            emit('change', files.value)
            emit('remove', fileToRemove)
            
            errorMessage.value = ''
        }

        // Clear all files
        const clearAllFiles = () => {
            if (props.disabled) return
            
            files.value = []
            emit('update:modelValue', files.value)
            emit('change', files.value)
            
            errorMessage.value = ''
        }

        // Watch for external changes to modelValue
        watch(
            () => props.modelValue,
            (newValue) => {
                if (JSON.stringify(newValue) !== JSON.stringify(files.value)) {
                    files.value = newValue || []
                }
            },
            { immediate: true }
        )

        return {
            dropzoneRef,
            fileInputRef,
            isDragging,
            files,
            errorMessage,
            formatFileSize,
            onDragOver,
            onDragLeave,
            onDrop,
            onFileInputChange,
            openFilePicker,
            removeFile,
            clearAllFiles
        }
    }
}
</script>

<style scoped>
.file-dropzone-container {
    width: 100%;
}

.dropzone {
    position: relative;
    border: 2px dashed rgba(var(--secondary-rgb), 0.3);
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    background-color: var(--white);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dropzone:hover:not(.dropzone-disabled) {
    border-color: rgba(var(--primary-rgb), 0.4);
    background-color: rgba(var(--primary-rgb), 0.02);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
}

.dropzone-active {
    border-color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.05);
    border-style: solid;
    box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
}

.dropzone-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: var(--light);
}

.dropzone-compact {
    padding: 1.5rem 1rem;
    min-height: 120px;
}

.dropzone-error {
    border-color: var(--danger);
    background-color: rgba(var(--danger), 0.02);
}

.file-input-hidden {
    display: none;
}

.dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.upload-icon {
    color: var(--primary);
    opacity: 0.7;
    transition: all 0.3s ease;
}

.dropzone:hover:not(.dropzone-disabled) .upload-icon {
    opacity: 1;
    transform: translateY(-4px);
}

.dropzone-active .upload-icon {
    opacity: 1;
    transform: scale(1.1);
}

.upload-text p {
    margin: 0;
}

.file-list {
    width: 100%;
}

.file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    width: 100%;
}

.file-grid-compact {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
}

.file-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--light);
    border: 1px solid rgba(var(--secondary-rgb), 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.file-preview:hover {
    border-color: rgba(var(--primary-rgb), 0.3);
    box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.1);
}

.file-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.file-preview-generic {
    color: var(--secondary);
}

.file-remove-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: rgba(var(--danger), 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
    padding: 0;
}

.file-preview:hover .file-remove-btn {
    opacity: 1;
}

.file-remove-btn:hover:not(:disabled) {
    background-color: var(--danger);
    transform: scale(1.1);
}

.file-remove-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.file-info {
    text-align: left;
}

.file-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--dark);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 0.75rem;
    color: var(--secondary);
    margin: 0;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .dropzone {
        padding: 2rem 1rem;
        min-height: 160px;
    }

    .dropzone-compact {
        padding: 1rem 0.75rem;
        min-height: 100px;
    }

    .file-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
    }

    .file-grid-compact {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.5rem;
    }

    .upload-icon {
        width: 32px;
        height: 32px;
    }
}

/* Focus styles for accessibility */
.dropzone:focus-within {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}
</style>
