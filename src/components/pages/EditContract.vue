<template>
    <div class="container py-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="mb-0">Edit contract</h2>
            <button class="btn btn-outline-secondary" @click="router.push(contractId ? `/contracts/${contractId}` : '/contracts')">Back</button>
        </div>

        <div v-if="loadError" class="alert alert-danger" role="alert">
            {{ loadError }}
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-if="loadingContract" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading…</span></div>
        </div>

        <div v-else-if="contractId && !loadError" class="card">
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
                        {{ loading ? 'Saving…' : 'Save changes' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import config from '../../config.js'
import SearchableSelect from '../utils/SearchableSelect.vue'
import { US_STATES } from '../../constants/usStates'
import { US_CITIES } from '../../constants/usCities'
import { getCountyOptionsForState } from '../../constants/usCounties'

export default {
    name: 'EditContract',
    components: { SearchableSelect },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const authStore = useAuthStore()

        const contractId = ref(route.params.id || null)
        const loadingContract = ref(true)
        const loadError = ref('')
        const loading = ref(false)
        const error = ref('')

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

        const loadContract = async () => {
            const id = route.params.id
            if (!id) {
                loadError.value = 'No contract specified'
                loadingContract.value = false
                return
            }
            contractId.value = id
            loadingContract.value = true
            loadError.value = ''
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to load contract')
                const c = data.contract
                if (c.status !== 'draft') {
                    loadError.value = 'Only draft contracts can be edited.'
                    setTimeout(() => router.push(`/contracts/${id}`), 2000)
                    return
                }
                const reqs = (c.requirements && c.requirements.requiredDocuments) || []
                form.value = {
                    title: c.title || '',
                    description: c.description || '',
                    contractType: c.contractType || '',
                    deadline: c.deadline || '',
                    locationState: c.locationState || '',
                    locationCounty: c.locationCounty || '',
                    locationCity: c.locationCity || '',
                    budget: c.budget != null ? c.budget : null,
                    requiredDocuments: reqs.map(r => ({
                        documentType: r.documentType || 'insurance',
                        coverageType: r.documentType === 'insurance' ? (r.coverageType || null) : null,
                        minLimit: r.minLimit != null ? r.minLimit : null
                    }))
                }
            } catch (err) {
                loadError.value = err.message || 'Failed to load contract'
            } finally {
                loadingContract.value = false
            }
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
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to update contract')
                router.push(`/contracts/${contractId.value}`)
            } catch (err) {
                error.value = err.message || 'Failed to update contract'
            } finally {
                loading.value = false
            }
        }

        onMounted(loadContract)

        return {
            router,
            contractId,
            form,
            stateOptions,
            cityOptions,
            countyOptions,
            loadingContract,
            loadError,
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
