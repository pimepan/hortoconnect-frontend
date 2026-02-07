<template>
    <div class="container py-5">
        <div class="row mb-4">
            <div class="col-12">
                <h1 class="mb-2">FileDropzone Component Demo</h1>
                <p class="text-secondary">Testing the drag & drop file upload component in various configurations</p>
            </div>
        </div>

        <div class="row g-4">
            <!-- Single Image Upload -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">Single Image Upload</h3>
                    <FileDropzone
                        accept="image/*"
                        label="Profile Picture"
                        hint="Upload your profile picture (max 5MB)"
                        :max-size="5"
                        @change="handleSingleImage"
                    />
                    <div v-if="singleImage.length > 0" class="mt-3">
                        <p class="text-success mb-0">✓ Image selected: {{ singleImage[0].name }}</p>
                    </div>
                </div>
            </div>

            <!-- Multiple Images Upload -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">Multiple Images (Gallery)</h3>
                    <FileDropzone
                        accept="image/*"
                        :multiple="true"
                        :max-files="10"
                        label="Project Photos"
                        hint="Upload up to 10 images for your portfolio"
                        @change="handleMultipleImages"
                    />
                    <div v-if="multipleImages.length > 0" class="mt-3">
                        <p class="text-success mb-0">✓ {{ multipleImages.length }} image(s) selected</p>
                    </div>
                </div>
            </div>

            <!-- Document Upload -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">Document Upload</h3>
                    <FileDropzone
                        accept=".pdf,.doc,.docx"
                        :multiple="true"
                        :max-files="5"
                        :max-size="20"
                        label="Documents"
                        hint="PDF or Word documents only (max 20MB each)"
                        :show-preview="false"
                        @change="handleDocuments"
                        @error="handleError"
                    />
                    <div v-if="documents.length > 0" class="mt-3">
                        <p class="text-success mb-0">✓ {{ documents.length }} document(s) selected</p>
                        <ul class="small mt-2">
                            <li v-for="doc in documents" :key="doc.id">{{ doc.name }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Compact Version -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">Compact Version</h3>
                    <FileDropzone
                        accept="image/*"
                        :compact="true"
                        label="Avatar"
                        hint="Compact version for inline use"
                        @change="handleCompact"
                    />
                    <div v-if="compactFile.length > 0" class="mt-3">
                        <p class="text-success mb-0">✓ File selected: {{ compactFile[0].name }}</p>
                    </div>
                </div>
            </div>

            <!-- v-model Example -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">With v-model</h3>
                    <FileDropzone
                        v-model="vModelFiles"
                        accept="image/*"
                        :multiple="true"
                        :max-files="3"
                        label="Sync with v-model"
                        hint="Files are automatically synced with v-model"
                    />
                    <div v-if="vModelFiles.length > 0" class="mt-3">
                        <p class="text-info mb-0">v-model value: {{ vModelFiles.length }} file(s)</p>
                    </div>
                </div>
            </div>

            <!-- Disabled State -->
            <div class="col-lg-6">
                <div class="card p-4">
                    <h3 class="mb-3">Disabled State</h3>
                    <FileDropzone
                        accept="image/*"
                        :disabled="true"
                        label="Disabled Upload"
                        hint="This dropzone is disabled"
                    />
                </div>
            </div>

            <!-- Error Handling Demo -->
            <div class="col-lg-12">
                <div class="card p-4">
                    <h3 class="mb-3">Error Handling</h3>
                    <FileDropzone
                        accept="image/jpeg,image/png"
                        :multiple="true"
                        :max-files="3"
                        :max-size="2"
                        label="Restricted Upload"
                        hint="Only JPEG/PNG images, max 2MB each, max 3 files total"
                        @change="handleRestricted"
                        @error="handleError"
                    />
                    <div v-if="lastError" class="alert alert-warning mt-3">
                        <strong>Last Error:</strong> {{ lastError }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Console Log Area -->
        <div class="row mt-5">
            <div class="col-12">
                <div class="card p-4 bg-dark text-light">
                    <h4 class="mb-3">Event Log</h4>
                    <div class="event-log">
                        <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
                            <span class="badge bg-primary me-2">{{ log.timestamp }}</span>
                            <span class="badge bg-secondary me-2">{{ log.type }}</span>
                            <span>{{ log.message }}</span>
                        </div>
                        <div v-if="eventLogs.length === 0" class="text-secondary">
                            No events yet. Try uploading some files!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import FileDropzone from '../utils/FileDropzone.vue'

export default {
    name: 'FileDropzoneDemo',
    components: {
        FileDropzone
    },
    setup() {
        const singleImage = ref([])
        const multipleImages = ref([])
        const documents = ref([])
        const compactFile = ref([])
        const vModelFiles = ref([])
        const lastError = ref('')
        const eventLogs = ref([])

        const addLog = (type, message) => {
            const timestamp = new Date().toLocaleTimeString()
            eventLogs.value.unshift({ timestamp, type, message })
            // Keep only last 20 logs
            if (eventLogs.value.length > 20) {
                eventLogs.value = eventLogs.value.slice(0, 20)
            }
        }

        const handleSingleImage = (files) => {
            singleImage.value = files
            addLog('change', `Single image: ${files.length} file(s)`)
        }

        const handleMultipleImages = (files) => {
            multipleImages.value = files
            addLog('change', `Multiple images: ${files.length} file(s)`)
        }

        const handleDocuments = (files) => {
            documents.value = files
            addLog('change', `Documents: ${files.length} file(s)`)
        }

        const handleCompact = (files) => {
            compactFile.value = files
            addLog('change', `Compact: ${files.length} file(s)`)
        }

        const handleRestricted = (files) => {
            addLog('change', `Restricted: ${files.length} file(s)`)
        }

        const handleError = (error) => {
            lastError.value = error
            addLog('error', error)
        }

        return {
            singleImage,
            multipleImages,
            documents,
            compactFile,
            vModelFiles,
            lastError,
            eventLogs,
            handleSingleImage,
            handleMultipleImages,
            handleDocuments,
            handleCompact,
            handleRestricted,
            handleError
        }
    }
}
</script>

<style scoped>
.event-log {
    max-height: 300px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
}

.log-entry {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.log-entry:last-child {
    border-bottom: none;
}
</style>
