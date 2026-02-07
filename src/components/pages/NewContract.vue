<template>
    <div class="container py-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="mb-0">Post a contract</h2>
            <button class="btn btn-outline-secondary" @click="router.push('/contracts')">Back</button>
        </div>

        <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div class="card">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Title</label>
                        <input v-model="form.title" class="form-control" type="text" />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-semibold">Contract type</label>
                        <input v-model="form.contractType" class="form-control" type="text" placeholder="maintenance, install, seasonal…" />
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Description</label>
                        <textarea v-model="form.description" class="form-control" rows="4"></textarea>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">State</label>
                        <SearchableSelect
                            v-model="form.locationState"
                            :options="stateOptions"
                            placeholder="Search state…"
                            :disabled="loading"
                            @update:model-value="form.locationCounty = ''"
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">County</label>
                        <SearchableSelect
                            v-model="form.locationCounty"
                            :options="countyOptions"
                            :placeholder="form.locationState ? 'Search county…' : 'Select state first'"
                            :disabled="loading || !form.locationState"
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">City</label>
                        <SearchableSelect
                            v-model="form.locationCity"
                            :options="cityOptions"
                            placeholder="Search city…"
                            :disabled="loading"
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">Deadline</label>
                        <input v-model="form.deadline" type="date" class="form-control" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">Budget (USD)</label>
                        <input v-model.number="form.budget" type="number" class="form-control" placeholder="e.g. 5000" min="0" step="0.01" />
                    </div>
                </div>

                <hr class="my-4" />

                <div class="mb-4">
                    <FileDropzone
                        v-model="contractDocumentFiles"
                        accept=".pdf,application/pdf"
                        :multiple="false"
                        :max-size="20"
                        label="Contract document (PDF)"
                        hint="Upload the contract document as PDF (max 20MB)"
                        :show-preview="false"
                        :disabled="loading"
                    />
                </div>

                <div class="mb-4">
                    <FileDropzone
                        v-model="contractImageFiles"
                        accept="image/*"
                        :multiple="true"
                        :max-files="10"
                        :max-size="10"
                        label="Contract photos"
                        hint="Upload photos of the project site (max 10 images, 10MB each)"
                        :disabled="loading"
                    />
                </div>

                <hr class="my-4" />

                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h5 class="mb-0">Requirements</h5>
                    <button class="btn btn-sm btn-outline-primary" @click="addRequirement">Add</button>
                </div>

                <div v-if="form.requiredDocuments.length === 0" class="text-muted">
                    No requirements yet.
                </div>

                <div v-else>
                    <div v-for="(req, idx) in form.requiredDocuments" :key="idx" class="border rounded p-3 mb-2 bg-light">
                        <div class="row g-2 align-items-end">
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Document type</label>
                                <select v-model="req.documentType" class="form-select">
                                    <option value="insurance">Insurance</option>
                                    <option value="bond">Bond</option>
                                    <option value="license">License</option>
                                    <option value="certification">Certification</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Coverage type</label>
                                <select v-model="req.coverageType" class="form-select" :disabled="req.documentType !== 'insurance'">
                                    <option :value="null">N/A</option>
                                    <option value="general_liability">General liability</option>
                                    <option value="workers_comp">Workers' comp</option>
                                    <option value="commercial_auto">Commercial auto</option>
                                    <option value="umbrella">Umbrella</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-semibold">Min limit (optional)</label>
                                <input v-model.number="req.minLimit" type="number" class="form-control" placeholder="e.g. 1000000" />
                            </div>
                            <div class="col-md-3 text-end">
                                <button class="btn btn-sm btn-outline-danger" @click="removeRequirement(idx)">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 d-flex justify-content-end">
                    <button class="btn btn-primary" :disabled="loading" @click="submit">
                        {{ loading ? 'Posting…' : 'Post contract' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import config from '../../config.js'
import FileDropzone from '../utils/FileDropzone.vue'
import SearchableSelect from '../utils/SearchableSelect.vue'
import { US_STATES } from '../../constants/usStates'
import { US_CITIES } from '../../constants/usCities'
import { getCountyOptionsForState } from '../../constants/usCounties'

export default {
    name: 'NewContract',
    components: { FileDropzone, SearchableSelect },
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        const loading = ref(false)
        const error = ref('')

        const contractDocumentFiles = ref([])
        const contractImageFiles = ref([])

        const stateOptions = US_STATES
        const cityOptions = US_CITIES
        const countyOptions = computed(() => getCountyOptionsForState(form.value.locationState))

        const form = ref({
            title: '',
            description: '',
            contractType: '',
            deadline: '',
            locationState: '',
            locationCounty: '',
            locationCity: '',
            budget: null,
            requiredDocuments: []
        })

        const addRequirement = () => {
            form.value.requiredDocuments.push({
                documentType: 'insurance',
                coverageType: 'general_liability',
                minLimit: null
            })
        }

        const removeRequirement = (idx) => {
            form.value.requiredDocuments.splice(idx, 1)
        }

        const submit = async () => {
            error.value = ''
            loading.value = true
            try {
                const token = await authStore.getAuthToken()
                const payload = {
                    title: form.value.title,
                    description: form.value.description,
                    contractType: form.value.contractType,
                    deadline: form.value.deadline || null,
                    locationState: form.value.locationState || null,
                    locationCounty: form.value.locationCounty || null,
                    locationCity: form.value.locationCity || null,
                    budget: form.value.budget != null && form.value.budget !== '' ? Number(form.value.budget) : null,
                    requirements: {
                        requiredDocuments: form.value.requiredDocuments.map(r => ({
                            documentType: r.documentType,
                            coverageType: r.documentType === 'insurance' ? (r.coverageType || null) : null,
                            minLimit: r.minLimit != null ? Number(r.minLimit) : null
                        }))
                    }
                }

                const response = await fetch(`${config.backend.api}/api/contracts`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error creating contract')
                const contractId = data.contract.id

                if (contractImageFiles.value.length > 0) {
                    const imgForm = new FormData()
                    for (const fileObj of contractImageFiles.value) {
                        imgForm.append('files', fileObj.file)
                    }
                    const imgResp = await fetch(`${config.backend.api}/api/contracts/${contractId}/images`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: imgForm
                    })
                    const imgData = await imgResp.json()
                    if (!imgResp.ok) throw new Error(imgData.error || 'Error uploading photos')
                }

                if (contractDocumentFiles.value.length > 0) {
                    const pdfFile = contractDocumentFiles.value[0]
                    const docForm = new FormData()
                    docForm.append('file', pdfFile.file)
                    const docResp = await fetch(`${config.backend.api}/api/contracts/${contractId}/document`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: docForm
                    })
                    const docData = await docResp.json()
                    if (!docResp.ok) throw new Error(docData.error || 'Error uploading contract document')
                }

                router.push(`/contracts/${contractId}`)
            } catch (err) {
                error.value = err.message || 'Error creating contract'
            } finally {
                loading.value = false
            }
        }

        return {
            router,
            authStore,
            form,
            stateOptions,
            cityOptions,
            countyOptions,
            contractDocumentFiles,
            contractImageFiles,
            loading,
            error,
            addRequirement,
            removeRequirement,
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
</style>

