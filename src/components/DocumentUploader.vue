<template>
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
                {{ replaceDoc ? 'Replace document' : 'Upload document' }}
            </h5>
            <button
                v-if="replaceDoc"
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click="$emit('cancelReplace')"
                :disabled="loading"
            >
                Cancel
            </button>
        </div>
        <div class="card-body">
            <div v-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>
            <div v-if="success" class="alert alert-success" role="alert">
                {{ success }}
            </div>

            <div class="row g-3">
                <div class="col-md-4">
                    <label class="form-label fw-semibold">Document type</label>
                    <select v-model="documentType" class="form-select" :disabled="loading">
                        <option disabled value="">Select…</option>
                        <option v-for="opt in documentTypeOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label class="form-label fw-semibold">Coverage type</label>
                    <select v-model="coverageType" class="form-select" :disabled="loading || documentType !== 'insurance'">
                        <option :value="null">N/A</option>
                        <option v-for="opt in coverageTypeOptions" :key="opt.value" :value="opt.value">
                            {{ opt.label }}
                        </option>
                    </select>
                    <div class="form-text">Required for insurance.</div>
                </div>

                <div class="col-md-4">
                    <label class="form-label fw-semibold">Limit amount (optional)</label>
                    <input v-model="limitAmount" type="number" class="form-control" :disabled="loading" placeholder="e.g. 1000000" />
                </div>

                <div class="col-md-4">
                    <label class="form-label fw-semibold">Issue date</label>
                    <input v-model="issueDate" type="date" class="form-control" :disabled="loading" />
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-semibold">Expiration date</label>
                    <input v-model="expirationDate" type="date" class="form-control" :disabled="loading" />
                </div>
                <div class="col-md-4">
                    <label class="form-label fw-semibold">File</label>
                    <input ref="fileInput" type="file" class="form-control" :disabled="loading" @change="onFileChange" />
                </div>
            </div>

            <div class="mt-4 d-flex justify-content-end">
                <WButton class="btn-primary" :loading="loading" :disabled="loading" @click="submit">
                    {{ loading ? 'Uploading…' : (replaceDoc ? 'Replace' : 'Upload') }}
                </WButton>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import WButton from './utils/WButton.vue'
import config from '../config.js'

export default {
    name: 'DocumentUploader',
    components: { WButton },
    props: {
        replaceDoc: {
            type: Object,
            default: null
        }
    },
    emits: ['uploaded', 'cancelReplace'],
    setup(props, { emit }) {
        const authStore = useAuthStore()

        const documentTypeOptions = [
            { value: 'insurance', label: 'Insurance certificate' },
            { value: 'bond', label: 'Bond' },
            { value: 'license', label: 'License' },
            { value: 'certification', label: 'Certification' }
        ]
        const coverageTypeOptions = [
            { value: 'general_liability', label: 'General liability' },
            { value: 'workers_comp', label: "Workers' comp" },
            { value: 'commercial_auto', label: 'Commercial auto' },
            { value: 'umbrella', label: 'Umbrella' }
        ]

        const documentType = ref('')
        const coverageType = ref(null)
        const issueDate = ref('')
        const expirationDate = ref('')
        const limitAmount = ref('')
        const file = ref(null)
        const fileInput = ref(null)

        const loading = ref(false)
        const error = ref('')
        const success = ref('')

        const reset = () => {
            error.value = ''
            success.value = ''
            if (!props.replaceDoc) {
                documentType.value = ''
                coverageType.value = null
                issueDate.value = ''
                expirationDate.value = ''
                limitAmount.value = ''
            }
            file.value = null
            if (fileInput.value) fileInput.value.value = ''
        }

        const applyReplaceDefaults = (replaceDoc) => {
            if (!replaceDoc) return
            documentType.value = replaceDoc.documentType || ''
            coverageType.value = replaceDoc.coverageType || null
            issueDate.value = replaceDoc.issueDate || ''
            expirationDate.value = replaceDoc.expirationDate || ''
            limitAmount.value = replaceDoc.coverageLimit != null ? String(replaceDoc.coverageLimit) : ''
            file.value = null
            if (fileInput.value) fileInput.value.value = ''
        }

        watch(
            () => props.replaceDoc,
            (val) => {
                error.value = ''
                success.value = ''
                if (val) applyReplaceDefaults(val)
            },
            { immediate: true }
        )

        watch(documentType, (val) => {
            if (val !== 'insurance') coverageType.value = null
        })

        const onFileChange = (e) => {
            const f = e.target.files && e.target.files[0]
            file.value = f || null
        }

        const submit = async () => {
            error.value = ''
            success.value = ''

            if (!file.value) {
                error.value = 'Please select a file.'
                return
            }
            if (!documentType.value) {
                error.value = 'Please select a document type.'
                return
            }
            if (documentType.value === 'insurance' && !coverageType.value) {
                error.value = 'Coverage type is required for insurance.'
                return
            }

            loading.value = true
            try {
                const token = await authStore.getAuthToken()
                const form = new FormData()
                form.append('file', file.value)
                form.append('documentType', documentType.value)
                if (coverageType.value) form.append('coverageType', coverageType.value)
                if (issueDate.value) form.append('issueDate', issueDate.value)
                if (expirationDate.value) form.append('expirationDate', expirationDate.value)
                if (limitAmount.value !== '') form.append('limitAmount', limitAmount.value)

                const endpoint = props.replaceDoc
                    ? `/api/documents/${props.replaceDoc.id}/replace`
                    : '/api/documents/upload'

                const response = await fetch(`${config.backend.api}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: form
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Upload failed')
                }

                success.value = props.replaceDoc ? 'Document replaced.' : 'Document uploaded.'
                emit('uploaded', data.document)
                reset()
            } catch (err) {
                error.value = err.message || 'Upload failed'
            } finally {
                loading.value = false
            }
        }

        return {
            documentTypeOptions,
            coverageTypeOptions,
            documentType,
            coverageType,
            issueDate,
            expirationDate,
            limitAmount,
            fileInput,
            loading,
            error,
            success,
            onFileChange,
            submit
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}
</style>

