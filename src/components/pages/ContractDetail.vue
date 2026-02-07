<template>
    <div class="container py-4">
        <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="mb-0">{{ contract?.title || 'Contract' }}</h2>
            <button class="btn btn-outline-secondary" @click="router.push('/contracts')">Back</button>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else>
            <div v-if="isAwardedContractor" class="alert alert-success mb-4" role="alert">
                <strong>You were selected for this contract.</strong> You have full access to the contract details and document. Deadline: {{ contract.deadline || 'N/A' }}
            </div>
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <p class="text-muted mb-1">
                                <small>
                                    {{ contract.contractType }} • {{ locationText || 'N/A' }}
                                </small>
                            </p>
                            <p class="mb-0 text-muted">
                                <small>
                                    Deadline: {{ contract.deadline || 'N/A' }}
                                    <span class="mx-2">•</span>
                                    Applicants: {{ contract.applicationsCount ?? 0 }}
                                </small>
                            </p>
                        </div>
                        <span :class="statusBadgeClass">{{ formatStatus(contract.status) }}</span>
                    </div>

                    <hr class="my-3" />
                    <p class="mb-0">{{ contract.description }}</p>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Requirements</h5>
                </div>
                <div class="card-body">
                    <div v-if="requiredDocs.length === 0" class="text-muted">
                        No structured requirements.
                    </div>
                    <ul v-else class="mb-0">
                        <li v-for="(r, idx) in requiredDocs" :key="idx">
                            {{ formatRequirement(r) }}
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="contractDocument" class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Contract document</h5>
                </div>
                <div class="card-body">
                    <iframe
                        :src="contractDocument.url"
                        class="contract-pdf-preview"
                        title="Contract PDF"
                    />
                    <div class="d-flex gap-2 flex-wrap mt-3">
                        <a
                            :href="contractDocument.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            View PDF
                        </a>
                        <a
                            :href="contractDocument.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            :download="contractDocument.fileName || 'contract.pdf'"
                            class="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
                        >
                            Download PDF ({{ contractDocument.fileName || 'contract.pdf' }})
                        </a>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="mb-0">Photos</h5>
                </div>
                <div class="card-body">
                    <div v-if="imagesError" class="alert alert-danger" role="alert">
                        {{ imagesError }}
                    </div>
                    
                    <!-- Existing contract images -->
                    <div v-if="contractImages.length > 0" class="mb-3">
                        <div class="row g-2">
                            <div v-for="(img, idx) in contractImages" :key="idx" class="col-6 col-md-4 col-lg-3">
                                <img :src="img.url" class="img-thumbnail w-100" style="height: 160px; object-fit: cover;" />
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upload new photos (only for contract owner, not contractors) -->
                    <div v-if="isOwner">
                        <FileDropzone
                            v-model="contractImageFiles"
                            accept="image/*"
                            :multiple="true"
                            :max-files="10"
                            :max-size="10"
                            :compact="contractImages.length > 0"
                            :label="contractImages.length === 0 ? 'Contract Photos' : ''"
                            hint="Upload photos of the project site (max 10 images, 10MB each)"
                            :disabled="uploadingImages"
                            @change="handleContractImagesChange"
                            @error="handleImageError"
                        />
                    </div>
                    
                    <div v-else-if="contractImages.length === 0" class="text-muted">
                        No photos yet.
                    </div>
                </div>
            </div>

            <!-- Buyer: Draft – Submit budget and publish -->
            <div
                v-if="isOwner && contract.status === 'draft'"
                class="card mb-4"
            >
                <div class="card-header">
                    <h5 class="mb-0">Publish contract</h5>
                </div>
                <div class="card-body">
                    <p class="text-muted mb-3">
                        Your contract is saved as a draft. Complete the checklist below, then publish for contractors to apply.
                    </p>

                    <ul class="list-unstyled mb-3">
                        <li class="d-flex align-items-center gap-2 mb-2">
                            <span :class="hasImages ? 'text-success' : 'text-danger'" style="font-size: 1.1rem;">
                                {{ hasImages ? '&#10003;' : '&#10007;' }}
                            </span>
                            <span :class="{ 'text-muted': hasImages }">
                                Upload at least one project photo
                            </span>
                        </li>
                        <li class="d-flex align-items-center gap-2 mb-2">
                            <span :class="hasDocument ? 'text-success' : 'text-danger'" style="font-size: 1.1rem;">
                                {{ hasDocument ? '&#10003;' : '&#10007;' }}
                            </span>
                            <span :class="{ 'text-muted': hasDocument }">
                                Upload a contract PDF document
                            </span>
                        </li>
                        <li class="d-flex align-items-center gap-2 mb-2">
                            <span :class="hasBudget ? 'text-success' : 'text-danger'" style="font-size: 1.1rem;">
                                {{ hasBudget ? '&#10003;' : '&#10007;' }}
                            </span>
                            <span :class="{ 'text-muted': hasBudget }">
                                Set a budget
                            </span>
                        </li>
                    </ul>

                    <button
                        class="btn btn-primary"
                        :disabled="publishing || !canPublish"
                        @click="publishContract"
                    >
                        {{ publishing ? 'Publishing…' : 'Submit budget and publish' }}
                    </button>
                    <div v-if="!canPublish" class="text-danger small mt-2">
                        Please complete all items above before publishing.
                    </div>
                </div>
            </div>

            <!-- Buyer: Open – Screen applicants -->
            <div
                v-if="isOwner && contract.status === 'open'"
                class="card mb-4"
            >
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Applicants ({{ contractApplicants.length }})</h5>
                    <button class="btn btn-sm btn-outline-primary" :disabled="loadingApplicants" @click="fetchContractApplications">
                        {{ loadingApplicants ? 'Loading…' : 'Refresh' }}
                    </button>
                </div>
                <div class="card-body">
                    <div v-if="loadingApplicants" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                    </div>
                    <div v-else-if="contractApplicants.length === 0" class="text-muted text-center py-4">
                        No applications yet. Contractors will see your contract in the marketplace.
                    </div>
                    <div v-else>
                        <div v-for="app in contractApplicants" :key="app.id" class="border rounded p-3 mb-3">
                            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <div>
                                    <span class="fw-semibold">Contractor</span>
                                    <router-link :to="'/contractors/' + app.contractorUid" class="ms-2 text-decoration-none">{{ app.contractorName || app.contractorUid || '—' }}</router-link>
                                    <ComplianceStatus :compliance="app.compliance" variant="badge" class="ms-2" />
                                </div>
                                <button
                                    class="btn btn-sm btn-primary"
                                    :disabled="awarding"
                                    @click="awardApplication(app)"
                                >
                                    {{ awarding ? 'Selecting…' : 'Select' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buyer: Awarded – Complete contract -->
            <div
                v-if="isOwner && contract.status === 'awarded'"
                class="card mb-4"
            >
                <div class="card-header">
                    <h5 class="mb-0">Contract awarded</h5>
                </div>
                <div class="card-body">
                    <p class="mb-2">
                        Selected contractor: <span class="fw-semibold">{{ contract.awardedContractorUid || '—' }}</span>
                    </p>
                    <p class="text-muted small mb-3">
                        On the contract deadline, release the payment to complete the contract.
                    </p>
                    <button
                        class="btn btn-primary"
                        :disabled="completing"
                        @click="completeContract"
                    >
                        {{ completing ? 'Completing…' : 'Complete contract & release payment' }}
                    </button>
                </div>
            </div>

            <!-- Contractor: Apply (only when contract is open) -->
            <div v-if="authStore.isAuthenticated && authStore.hasContractorRole && contract.status === 'open' && !isOwner" class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Apply</h5>
                    <button class="btn btn-primary" :disabled="applying || alreadyApplied" @click="apply">
                        {{ alreadyApplied ? 'Applied' : (applying ? 'Applying…' : 'Apply with one click') }}
                    </button>
                </div>
                <div class="card-body">
                    <div v-if="applyError" class="alert alert-danger" role="alert">
                        {{ applyError }}
                    </div>

                    <ComplianceStatus
                        v-if="application"
                        :compliance="application.compliance"
                        variant="alert"
                        :showDetails="true"
                    />

                    <div v-if="application" class="text-muted small">
                        Application saved. View it in <a href="#" @click.prevent="router.push('/applications')">Applications</a>.
                    </div>
                </div>
            </div>
            <div v-else-if="contract.status === 'open' && !authStore.isAuthenticated" class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Apply</h5>
                    <button class="btn btn-primary" @click="router.push({ path: '/login', query: { redirect: route.fullPath } })">
                        Log in to apply
                    </button>
                </div>
                <div class="card-body text-muted">
                    Contractors can apply in one click and get an instant compliance check.
                </div>
            </div>
            <div v-else-if="contract.status === 'open' && authStore.isAuthenticated && !authStore.hasContractorRole && !isOwner" class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Apply</h5>
                    <button class="btn btn-outline-primary" @click="router.push('/select-role?role=contractor')">
                        Add contractor role
                    </button>
                </div>
                <div class="card-body text-muted">
                    You’re logged in, but your account doesn’t have the contractor role. Only contractors can apply to contracts.
                </div>
            </div>

            <div
                v-if="authStore.hasContractorRole && application && shouldShowBrokerMatching"
                class="card mt-4"
            >
                <div class="card-header">
                    <h5 class="mb-0">Fix compliance with a brokerage</h5>
                </div>
                <div class="card-body">
                    <div class="text-muted small mb-3">
                        Matching is based on contract region ({{ contract?.locationState || 'N/A' }}) and the specific coverage gaps.
                    </div>

                    <div v-if="matchLoading" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                            <span class="visually-hidden">Loading…</span>
                        </div>
                    </div>
                    <div v-else-if="matchError" class="alert alert-danger" role="alert">
                        {{ matchError }}
                    </div>
                    <div v-else-if="neededCoverageTypes.length === 0" class="text-muted">
                        No brokerage-related gaps detected.
                    </div>
                    <div v-else>
                        <div v-for="cov in neededCoverageTypes" :key="cov" class="mb-4">
                            <h6 class="mb-2">Coverage needed: {{ cov }}</h6>
                            <div v-if="(brokerMatches[cov] || []).length === 0" class="text-muted">
                                No brokerages found for this coverage in {{ contract?.locationState || '' }}.
                            </div>
                            <div v-else class="row g-2">
                                <div v-for="b in brokerMatches[cov]" :key="b.id" class="col-12 col-md-6">
                                    <div class="border rounded p-3">
                                        <div class="fw-semibold">{{ b.firmName || 'Brokerage' }}</div>
                                        <div class="text-muted small">
                                            {{ b.contact?.email || '' }}
                                            <span v-if="b.contact?.phone"> • {{ b.contact.phone }}</span>
                                        </div>

                                        <div class="mt-2 d-flex flex-wrap gap-2">
                                            <button
                                                class="btn btn-sm btn-outline-primary"
                                                :disabled="sendingRequest"
                                                @click="sendBrokerRequest(b, 'quote', cov)"
                                            >
                                                Request quote
                                            </button>
                                            <button
                                                class="btn btn-sm btn-outline-secondary"
                                                :disabled="sendingRequest"
                                                @click="sendBrokerRequest(b, 'review', cov)"
                                            >
                                                Request review
                                            </button>
                                            <button
                                                class="btn btn-sm btn-outline-dark"
                                                :disabled="sendingRequest"
                                                @click="sendBrokerRequest(b, 'contact', cov)"
                                            >
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="requestSuccess" class="alert alert-success mt-3" role="alert">
                        {{ requestSuccess }}
                    </div>
                    <div v-if="requestError" class="alert alert-danger mt-3" role="alert">
                        {{ requestError }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import ComplianceStatus from '../ComplianceStatus.vue'
import FileDropzone from '../utils/FileDropzone.vue'
import config from '../../config.js'

export default {
    name: 'ContractDetail',
    components: { ComplianceStatus, FileDropzone },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const authStore = useAuthStore()

        const loading = ref(true)
        const error = ref('')
        const contract = ref(null)

        const contractImageFiles = ref([])
        const uploadingImages = ref(false)
        const imagesError = ref('')

        const applying = ref(false)
        const applyError = ref('')
        const application = ref(null)

        const brokerMatches = ref({})
        const matchLoading = ref(false)
        const matchError = ref('')
        const sendingRequest = ref(false)
        const requestSuccess = ref('')
        const requestError = ref('')

        const contractId = computed(() => route.params.id)
        const alreadyApplied = computed(() => !!application.value)
        const currentUid = computed(() => authStore.user?.uid)
        const isOwner = computed(() =>
            !!contract.value && !!currentUid.value && contract.value.createdByUid === currentUid.value
        )
        const isAwardedContractor = computed(() =>
            !!contract.value && !!currentUid.value && contract.value.awardedContractorUid === currentUid.value
        )

        const contractApplicants = ref([])
        const loadingApplicants = ref(false)
        const publishing = ref(false)
        const awarding = ref(false)
        const completing = ref(false)

        const documentFallbackUrl = ref(null)

        const statusBadgeClass = computed(() => {
            const map = {
                draft: 'badge bg-secondary',
                open: 'badge bg-success',
                closed: 'badge bg-secondary',
                awarded: 'badge bg-info',
                completed: 'badge bg-dark'
            }
            return map[contract.value?.status] || 'badge bg-secondary'
        })

        const formatStatus = (s) => {
            const map = { draft: 'Draft', open: 'Open', awarded: 'Awarded', completed: 'Completed', closed: 'Closed' }
            return map[s] || s
        }

        const locationText = computed(() => {
            if (!contract.value) return ''
            const parts = [contract.value.locationCity, contract.value.locationCounty, contract.value.locationState].filter(Boolean)
            return parts.join(', ')
        })

        const requiredDocs = computed(() => {
            const req = contract.value?.requirements
            const list = req?.requiredDocuments
            return Array.isArray(list) ? list : []
        })

        const contractDocument = computed(() => {
            const c = contract.value
            if (!c?.documentPath) return null
            const url = documentFallbackUrl.value
            if (!url || typeof url !== 'string') return null
            const fileName = c.documentPath ? c.documentPath.split('/').pop() || 'contract.pdf' : 'contract.pdf'
            return { url, fileName }
        })

        const contractImages = computed(() => {
            const raw = contract.value?.images
            const list = Array.isArray(raw) ? raw : []
            return list
                .map((it) => (typeof it === 'string' ? { url: it } : it))
                .filter((it) => it && typeof it === 'object' && it.url)
        })

        const hasImages = computed(() => contractImages.value.length > 0)
        const hasDocument = computed(() => !!contract.value?.documentPath)
        const hasBudget = computed(() => {
            const b = contract.value?.budget
            return b !== null && b !== undefined && b !== '' && b !== 0
        })
        const canPublish = computed(() => hasImages.value && hasDocument.value && hasBudget.value)

        const formatRequirement = (r) => {
            if (!r) return 'Requirement'
            const base = r.coverageType ? `${r.documentType}:${r.coverageType}` : `${r.documentType}`
            if (r.minLimit != null) return `${base} (min ${r.minLimit})`
            return base
        }


        const shouldShowBrokerMatching = computed(() => {
            const status = application.value?.compliance?.status
            return status === 'non_compliant' || status === 'action_needed'
        })

        const neededCoverageTypes = computed(() => {
            const out = new Set()
            const compliance = application.value?.compliance
            if (!compliance) return []

            const pullReq = (item) => item?.requirement || item
            const buckets = ['missing', 'expired', 'insufficient', 'expiring']
            for (const key of buckets) {
                const arr = compliance[key] || []
                for (const item of arr) {
                    const req = pullReq(item)
                    if (!req || typeof req !== 'object') continue
                    if (req.documentType === 'insurance' && req.coverageType) out.add(req.coverageType)
                    if (req.documentType === 'bond') out.add('bonds')
                }
            }
            return Array.from(out)
        })

        const fetchDocumentFromBackend = async () => {
            const c = contract.value
            if (!c?.documentPath || !authStore.isAuthenticated) return
            const previousUrl = documentFallbackUrl.value
            if (previousUrl && previousUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previousUrl)
            }
            documentFallbackUrl.value = null
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/document`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!resp.ok) return
                const blob = await resp.blob()
                documentFallbackUrl.value = URL.createObjectURL(blob)
            } catch {
                // ignore
            }
        }

        const fetchContract = async () => {
            loading.value = true
            error.value = ''
            const prevDocUrl = documentFallbackUrl.value
            if (prevDocUrl && prevDocUrl.startsWith('blob:')) URL.revokeObjectURL(prevDocUrl)
            documentFallbackUrl.value = null
            try {
                let response
                if (authStore.isAuthenticated) {
                    const token = await authStore.getAuthToken()
                    response = await fetch(`${config.backend.api}/api/contracts/${contractId.value}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                } else {
                    response = await fetch(`${config.backend.api}/api/public/contracts/${contractId.value}`, { method: 'GET' })
                }
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error loading contract')
                contract.value = data.contract
                if (authStore.user?.uid && contract.value?.createdByUid === authStore.user.uid && contract.value?.status === 'open') {
                    fetchContractApplications()
                }
                await fetchDocumentFromBackend()
            } catch (err) {
                error.value = err.message || 'Error loading contract'
            } finally {
                loading.value = false
            }
        }

        const fetchContractApplications = async () => {
            if (!authStore.isAuthenticated || !authStore.hasBidPosterRole) return
            loadingApplicants.value = true
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/applications`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await resp.json()
                if (resp.ok) contractApplicants.value = data.applications || []
            } catch {
                contractApplicants.value = []
            } finally {
                loadingApplicants.value = false
            }
        }

        const publishContract = async () => {
            if (!canPublish.value) {
                error.value = 'Cannot publish: please upload photos, a PDF document, and set a budget first.'
                return
            }
            publishing.value = true
            error.value = ''
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/publish`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to publish')
                contract.value = data.contract
            } catch (err) {
                error.value = err.message || 'Failed to publish'
            } finally {
                publishing.value = false
            }
        }

        const awardApplication = async (app) => {
            if (!confirm(`Select this contractor for the contract?`)) return
            awarding.value = true
            error.value = ''
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/award`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ applicationId: app.id })
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to award')
                contract.value = data.contract
                contractApplicants.value = []
            } catch (err) {
                error.value = err.message || 'Failed to award'
            } finally {
                awarding.value = false
            }
        }

        const completeContract = async () => {
            completing.value = true
            error.value = ''
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/complete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to complete')
                contract.value = data.contract
            } catch (err) {
                error.value = err.message || 'Failed to complete'
            } finally {
                completing.value = false
            }
        }

        const handleContractImagesChange = async (files) => {
            if (files.length === 0) return

            imagesError.value = ''
            uploadingImages.value = true
            try {
                if (!authStore.isAuthenticated) {
                    router.push({ path: '/login', query: { redirect: route.fullPath } })
                    return
                }
                if (!isOwner.value) {
                    throw new Error('Only the contract owner can upload project photos.')
                }

                const token = await authStore.getAuthToken()
                const form = new FormData()
                for (const fileObj of files) {
                    form.append('files', fileObj.file)
                }

                const resp = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/images`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: form
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to upload photos')

                const incoming = data.images || []
                const current = Array.isArray(contract.value?.images) ? contract.value.images : []
                contract.value = { ...(contract.value || {}), images: [...current, ...incoming] }
                
                // Clear the file dropzone after successful upload
                contractImageFiles.value = []
            } catch (err) {
                imagesError.value = err?.message || 'Failed to upload photos'
            } finally {
                uploadingImages.value = false
            }
        }

        const handleImageError = (error) => {
            imagesError.value = error
        }

        const fetchMyApplicationForContract = async () => {
            if (!authStore.isAuthenticated) return
            if (!authStore.hasContractorRole) return

            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/applications/me?role=contractor`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await resp.json()
                if (!resp.ok) return
                const apps = data.applications || []
                const match = apps.find(a => a.contractId === contractId.value)
                if (match) application.value = match
            } catch {
                // ignore
            }
        }

        const apply = async () => {
            applyError.value = ''
            applying.value = true
            try {
                const token = await authStore.getAuthToken()
                const response = await fetch(`${config.backend.api}/api/contracts/${contractId.value}/apply`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                const data = await response.json().catch(() => ({}))
                if (response.status === 409) {
                    await fetchMyApplicationForContract()
                    return
                }
                if (!response.ok) throw new Error(data.error || 'Error applying')
                application.value = data.application
            } catch (err) {
                applyError.value = err.message || 'Error applying'
            } finally {
                applying.value = false
            }
        }

        const fetchBrokerMatches = async () => {
            matchError.value = ''
            brokerMatches.value = {}

            const region = contract.value?.locationState
            if (!region || neededCoverageTypes.value.length === 0) return

            matchLoading.value = true
            try {
                const token = await authStore.getAuthToken()
                const pairs = await Promise.all(
                    neededCoverageTypes.value.map(async (cov) => {
                        const params = new URLSearchParams({ region, coverageType: cov })
                        const resp = await fetch(`${config.backend.api}/api/brokerages/match?${params.toString()}`, {
                            method: 'GET',
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        const data = await resp.json()
                        if (!resp.ok) throw new Error(data.error || 'Error matching brokerages')
                        return [cov, data.brokerages || []]
                    })
                )
                brokerMatches.value = Object.fromEntries(pairs)
            } catch (err) {
                matchError.value = err.message || 'Error matching brokerages'
            } finally {
                matchLoading.value = false
            }
        }

        const sendBrokerRequest = async (brokerage, type, coverageType) => {
            requestSuccess.value = ''
            requestError.value = ''
            sendingRequest.value = true
            try {
                const token = await authStore.getAuthToken()
                const region = contract.value?.locationState || null
                const message = `Hi — I applied to "${contract.value?.title || 'a contract'}" and need help with ${coverageType} in ${region || 'my region'}.`

                const resp = await fetch(`${config.backend.api}/api/broker_requests`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        brokerageUid: brokerage.id,
                        type,
                        message,
                        contractId: contractId.value,
                        applicationId: application.value?.id,
                        coverageType,
                        region
                    })
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Error sending request')
                requestSuccess.value = 'Request sent to brokerage.'
            } catch (err) {
                requestError.value = err.message || 'Error sending request'
            } finally {
                sendingRequest.value = false
            }
        }

        watch(
            () => [application.value, contract.value],
            async () => {
                if (shouldShowBrokerMatching.value) {
                    await fetchBrokerMatches()
                }
            }
        )

        onMounted(async () => {
            await fetchContract()
            await fetchMyApplicationForContract()
        })

        onUnmounted(() => {
            const url = documentFallbackUrl.value
            if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
        })

        return {
            route,
            router,
            authStore,
            loading,
            error,
            contract,
            locationText,
            requiredDocs,
            contractDocument,
            contractImages,
            hasImages,
            hasDocument,
            hasBudget,
            canPublish,
            formatRequirement,
            statusBadgeClass,
            formatStatus,
            contractImageFiles,
            uploadingImages,
            imagesError,
            handleContractImagesChange,
            handleImageError,
            applying,
            applyError,
            application,
            alreadyApplied,
            isOwner,
            isAwardedContractor,
            contractApplicants,
            loadingApplicants,
            publishing,
            awarding,
            completing,
            fetchContractApplications,
            publishContract,
            awardApplication,
            completeContract,
            shouldShowBrokerMatching,
            neededCoverageTypes,
            brokerMatches,
            matchLoading,
            matchError,
            sendingRequest,
            requestSuccess,
            requestError,
            apply,
            sendBrokerRequest
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s ease;
    overflow: hidden;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
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

.contract-pdf-preview {
    width: 100%;
    min-height: 500px;
    height: 500px;
    border-radius: 12px;
    border: 1px solid rgba(var(--primary-rgb), 0.15);
}

.img-thumbnail {
    border-radius: 12px;
    transition: transform 0.3s ease;
    cursor: pointer;
}

.img-thumbnail:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(var(--dark-rgb), 0.2);
}

.badge {
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 8px;
}

.alert {
    border-radius: 12px;
    border: none;
}

.border.rounded {
    border-radius: 12px !important;
    border: 1px solid rgba(var(--primary-rgb), 0.15) !important;
    transition: all 0.2s ease;
}

.border.rounded:hover {
    border-color: rgba(var(--primary-rgb), 0.3) !important;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1);
}
</style>

