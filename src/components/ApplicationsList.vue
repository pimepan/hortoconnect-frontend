<template>
    <div :class="variant === 'page' ? 'container py-4' : ''">
        <!-- Page header (only for /applications route) -->
        <div v-if="variant === 'page'" class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="mb-1 fw-bold">{{ title }}</h2>
                <p class="text-muted mb-0 small">{{ subtitle }}</p>
            </div>
            <button class="btn btn-outline-primary d-flex align-items-center" :disabled="loading" @click="fetchApplications">
                <RefreshCw v-if="!loading" class="me-2" :size="18" />
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ loading ? 'Refreshing…' : 'Refresh' }}
            </button>
        </div>

        <!-- Embedded card (for profile tabs) -->
        <div v-if="variant !== 'page'" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h4 class="mb-0">{{ title }}</h4>
                <button class="btn btn-sm btn-outline-primary d-flex align-items-center" :disabled="loading" @click="fetchApplications">
                    <RefreshCw v-if="!loading" class="me-2" :size="16" />
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    {{ loading ? 'Refreshing…' : 'Refresh' }}
                </button>
            </div>
            <div class="card-body p-0">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading…</span>
                    </div>
                </div>
                <div v-else-if="error" class="alert alert-danger m-3" role="alert">
                    {{ error }}
                </div>
                <div v-else-if="applications.length === 0" class="text-center py-5 text-muted">
                    {{ emptyText }}
                </div>
                <div v-else class="table-responsive">
                    <table class="table mb-0">
                        <thead>
                            <tr>
                                <th>Contract</th>
                                <th>Budget</th>
                                <th v-if="showContractorColumn">Contractor</th>
                                <th>Status</th>
                                <th>Compliance</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in applications" :key="a.id">
                                <td>
                                    <router-link :to="`/contracts/${a.contractId}`" class="text-decoration-none">
                                        {{ a.contractTitle || 'Untitled contract' }}
                                    </router-link>
                                </td>
                                <td>
                                    <span v-if="getApplicationBudget(a)" class="budget-cell">{{ getApplicationBudget(a) }}</span>
                                    <span v-else class="text-muted">—</span>
                                </td>
                                <td v-if="showContractorColumn">
                                    <router-link v-if="a.contractorUid" :to="'/contractors/' + a.contractorUid" class="text-decoration-none">{{ a.contractorName || 'Contractor' }}</router-link>
                                    <span v-else class="text-muted">—</span>
                                </td>
                                <td><span :class="getApplicationStatusClass(a.status)">{{ formatApplicationStatus(a.status) }}</span></td>
                                <td>
                                    <ComplianceStatus :compliance="a.compliance" variant="badge" />
                                </td>
                                <td class="text-muted small">{{ formatDate(a.createdAt) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Page content (for /applications route) -->
        <template v-else>
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading…</span>
                </div>
            </div>
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>
            <div v-else-if="applications.length === 0" class="text-center py-5 text-muted">
                {{ emptyText }}
            </div>
            <div v-else class="card">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead>
                                <tr>
                                    <th>Contract</th>
                                    <th>Budget</th>
                                    <th v-if="showContractorColumn">Contractor</th>
                                    <th>Status</th>
                                    <th>Compliance</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="a in applications" :key="a.id">
                                    <td>
                                        <router-link :to="`/contracts/${a.contractId}`" class="text-decoration-none">
                                            {{ a.contractTitle || 'Untitled contract' }}
                                        </router-link>
                                    </td>
                                    <td>
                                        <span v-if="getApplicationBudget(a)" class="budget-cell">{{ getApplicationBudget(a) }}</span>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td v-if="showContractorColumn">
                                        <router-link v-if="a.contractorUid" :to="'/contractors/' + a.contractorUid" class="text-decoration-none">{{ a.contractorName || 'Contractor' }}</router-link>
                                        <span v-else class="text-muted">—</span>
                                    </td>
                                    <td><span :class="getApplicationStatusClass(a.status)">{{ formatApplicationStatus(a.status) }}</span></td>
                                    <td>
                                        <ComplianceStatus :compliance="a.compliance" variant="badge" />
                                    </td>
                                    <td class="text-muted small">{{ formatDate(a.createdAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import ComplianceStatus from './ComplianceStatus.vue'
import config from '../config.js'
import { formatDateLong, formatCurrencyUSD } from '../utils/formatters.js'
import { RefreshCw } from 'lucide-vue-next'

export default {
    name: 'ApplicationsList',
    components: { ComplianceStatus, RefreshCw },
    props: {
        variant: {
            type: String,
            default: 'embedded' // 'page' | 'embedded'
        },
        role: {
            type: String,
            default: null
        },
        title: {
            type: String,
            default: 'Applications'
        },
        subtitle: {
            type: String,
            default: 'Track your contract applications and compliance status'
        },
        emptyText: {
            type: String,
            default: 'No applications yet.'
        }
    },
    emits: ['loaded'],
    setup(props, { emit }) {
        const authStore = useAuthStore()
        const applications = ref([])
        const loading = ref(true)
        const error = ref('')

        const fetchApplications = async () => {
            loading.value = true
            error.value = ''
            try {
                const token = await authStore.getAuthToken()
                const roleToUse = (props.role || authStore.currentUserType || '').toString().trim()
                const params = new URLSearchParams()
                if (roleToUse) params.set('role', roleToUse)

                const response = await fetch(`${config.backend.api}/api/applications/me?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error loading applications')
                applications.value = data.applications || []
                emit('loaded', applications.value)
            } catch (err) {
                error.value = err.message || 'Error loading applications'
                applications.value = []
                emit('loaded', [])
            } finally {
                loading.value = false
            }
        }

        const showContractorColumn = computed(() => {
            return props.role === 'bid_poster'
        })

        const formatDate = (dateString) => formatDateLong(dateString)

        const getApplicationStatusClass = (status) => {
            const map = {
                submitted: 'badge bg-secondary',
                accepted: 'badge bg-success',
                rejected: 'badge bg-danger'
            }
            return map[status] || 'badge bg-secondary'
        }

        const formatApplicationStatus = (status) => {
            const map = { submitted: 'Pending', accepted: 'Accepted', rejected: 'Rejected' }
            return map[status] || status
        }

        const getApplicationBudget = (app) => {
            const budget = app?.contractBudget ?? app?.contract?.budget
            if (budget == null || budget === '') return null
            return formatCurrencyUSD(budget)
        }

        onMounted(fetchApplications)

        return {
            applications,
            loading,
            error,
            showContractorColumn,
            fetchApplications,
            formatDate,
            getApplicationStatusClass,
            formatApplicationStatus,
            getApplicationBudget
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    overflow: hidden;
}

.table {
    margin-bottom: 0;
}

.table thead th {
    background: rgba(var(--primary-rgb), 0.08);
    border-bottom: 2px solid rgba(var(--primary-rgb), 0.15);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
    padding: 1rem 1.5rem;
    color: var(--dark);
}

.table tbody td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.08);
}

.table tbody tr:hover {
    background: rgba(var(--primary-rgb), 0.03);
}

.table tbody tr:last-child td {
    border-bottom: none;
}

.badge {
    font-weight: 600;
    padding: 0.5rem 0.875rem;
}

.budget-cell {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -0.3px;
    white-space: nowrap;
}
</style>

