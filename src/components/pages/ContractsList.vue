<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="mb-1 fw-bold">Contracts</h2>
                <p class="text-muted mb-0 small">Browse and apply to landscaping contracts</p>
            </div>
            <button
                v-if="authStore.hasBidPosterRole"
                class="btn btn-primary d-flex align-items-center"
                @click="router.push('/contracts/new')"
            >
                <FileText class="me-2" :size="18" />
                Post a contract
            </button>
        </div>

        <div class="card mb-4 border-0 shadow-sm">
            <div class="card-header bg-transparent border-bottom pb-3">
                <h5 class="mb-0 fw-bold d-flex align-items-center">
                    <Filter class="me-2" :size="20" />
                    Filters
                </h5>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">Contract type</label>
                        <input v-model="filters.contractType" class="form-control" placeholder="e.g. maintenance" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">State</label>
                        <SearchableSelect
                            v-model="filters.state"
                            :options="stateOptions"
                            placeholder="Search state…"
                            @update:model-value="filters.county = ''"
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">County</label>
                        <SearchableSelect
                            v-model="filters.county"
                            :options="countyOptions"
                            :placeholder="filters.state ? 'Search county…' : 'Select state first'"
                            :disabled="!filters.state"
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-semibold">City</label>
                        <SearchableSelect
                            v-model="filters.city"
                            :options="cityOptions"
                            placeholder="Search city…"
                        />
                    </div>
                    <div class="col-12">
                        <label class="form-label fw-semibold">Search</label>
                        <input
                            v-model="filters.q"
                            class="form-control"
                            placeholder="Search by title, description, type, city, state…"
                        />
                    </div>
                </div>
                <div class="mt-4 d-flex justify-content-end">
                    <button class="btn btn-primary d-flex align-items-center" :disabled="loading" @click="fetchContracts">
                        <Search v-if="!loading" class="me-2" :size="18" />
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                        {{ loading ? 'Loading…' : 'Apply filters' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
        </div>
        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>
        <div v-else-if="filteredContracts.length === 0" class="text-center py-5 text-muted">
            No contracts found.
        </div>
        <div v-else class="d-flex justify-content-between align-items-center mb-2 text-muted small">
            <div>Showing {{ filteredContracts.length }} contract<span v-if="filteredContracts.length !== 1">s</span></div>
            <div class="d-none d-md-block">Browse publicly — log in as contractor to apply</div>
        </div>
        <div v-if="!loading && !error && filteredContracts.length" class="row g-3">
            <div v-for="c in filteredContracts" :key="c.id" class="col-12 col-md-6 col-lg-4">
                <ContractCard :contract="c" />
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import ContractCard from '../ContractCard.vue'
import SearchableSelect from '../utils/SearchableSelect.vue'
import config from '../../config.js'
import { US_STATES } from '../../constants/usStates'
import { US_CITIES } from '../../constants/usCities'
import { getCountyOptionsForState } from '../../constants/usCounties'
import { FileText, Filter, Search } from 'lucide-vue-next'

export default {
    name: 'ContractsList',
    components: { ContractCard, SearchableSelect },
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        const allContracts = ref([])
        const loading = ref(true)
        const error = ref('')

        const stateOptions = US_STATES
        const cityOptions = US_CITIES
        const countyOptions = computed(() => getCountyOptionsForState(filters.value.state))

        const filters = ref({
            contractType: '',
            state: '',
            county: '',
            city: '',
            q: ''
        })

        const filteredContracts = computed(() => {
            const q = (filters.value.q || '').toString().trim().toLowerCase()
            if (!q) return allContracts.value

            const fields = ['title', 'description', 'contractType', 'locationCity', 'locationState', 'locationCounty']
            return allContracts.value.filter((c) =>
                fields.some((key) => ((c?.[key] || '').toString().toLowerCase()).includes(q))
            )
        })

        const fetchContracts = async () => {
            loading.value = true
            error.value = ''
            try {
                const params = new URLSearchParams()
                if (filters.value.contractType) params.set('contractType', filters.value.contractType)
                if (filters.value.state) params.set('state', filters.value.state)
                if (filters.value.county) params.set('county', filters.value.county)
                if (filters.value.city) params.set('city', filters.value.city)

                const response = await fetch(`${config.backend.api}/api/public/contracts?${params.toString()}`, {
                    method: 'GET'
                })
                const data = await response.json()
                if (!response.ok) throw new Error(data.error || 'Error loading contracts')
                allContracts.value = data.contracts || []
            } catch (err) {
                error.value = err.message || 'Error loading contracts'
                allContracts.value = []
            } finally {
                loading.value = false
            }
        }

        onMounted(fetchContracts)

        return {
            router,
            authStore,
            allContracts,
            loading,
            error,
            filters,
            stateOptions,
            cityOptions,
            countyOptions,
            filteredContracts,
            fetchContracts
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
}

.card:hover {
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.card-header {
    background: rgba(var(--primary-rgb), 0.05);
    border-bottom: 1px solid rgba(var(--primary-rgb), 0.1);
}
</style>

