<template>
    <div class="card h-100">
        <div class="contract-image-container" v-if="hasImages">
            <img
                :src="coverImageUrl"
                class="card-img-top contract-cover"
                alt="Contract photo"
                @error="handleImageError"
            />
            <div v-if="imageCount > 1" class="image-count-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                </svg>
                {{ imageCount }}
            </div>
            <div v-if="additionalImages.length > 0" class="image-thumbnails">
                <img
                    v-for="(img, idx) in additionalImages.slice(0, 3)"
                    :key="idx"
                    :src="getImageUrl(img)"
                    class="thumbnail"
                    :alt="`Contract photo ${idx + 2}`"
                    @error="handleImageError"
                />
            </div>
        </div>
        <div v-else class="contract-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <span>No images</span>
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title mb-1">{{ contract.title || 'Untitled contract' }}</h5>
                    <p class="text-muted mb-2">
                        <small>
                            {{ contract.contractType || 'type' }}
                            <span v-if="locationText"> • {{ locationText }}</span>
                            <span> • {{ applicationsCount }} applied</span>
                        </small>
                    </p>
                </div>
                <span :class="statusBadgeClass">{{ contract.status || 'open' }}</span>
            </div>

            <p class="card-text text-muted mb-3" style="max-height: 3.6em; overflow: hidden;">
                {{ contract.description || '' }}
            </p>

            <div class="d-flex justify-content-between align-items-center">
                <div class="text-muted small">
                    Deadline: {{ contract.deadline || 'N/A' }}
                </div>
                <div class="d-flex gap-2">
                    <router-link class="btn btn-sm btn-outline-primary" :to="`/contracts/${contract.id}`">
                        View
                    </router-link>
                    <button
                        v-if="showApply"
                        class="btn btn-sm btn-primary"
                        :disabled="applying || applied"
                        @click="handleApply"
                    >
                        {{ applied ? 'Applied' : (applying ? 'Applying…' : 'Apply') }}
                    </button>
                </div>
            </div>

            <div v-if="applyError" class="alert alert-danger mt-3 mb-0 py-2 small" role="alert">
                {{ applyError }}
            </div>
        </div>
    </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import config from '../config.js'

export default {
    name: 'ContractCard',
    props: {
        contract: {
            type: Object,
            required: true
        }
    },
    setup(props) {
        const router = useRouter()
        const authStore = useAuthStore()

        const applying = ref(false)
        const applied = ref(false)
        const applyError = ref('')

        const locationText = computed(() => {
            const parts = [props.contract.locationCity, props.contract.locationCounty, props.contract.locationState].filter(Boolean)
            return parts.join(', ')
        })

        const applicationsCount = computed(() => {
            const raw = props.contract?.applicationsCount ?? props.contract?.applicantsCount
            if (typeof raw === 'number') return raw
            const n = Number(raw)
            return Number.isFinite(n) ? n : 0
        })

        const contractImages = computed(() => {
            const imgs = props.contract?.images
            if (!Array.isArray(imgs) || imgs.length === 0) return []
            return imgs
        })

        const hasImages = computed(() => contractImages.value.length > 0)

        const imageCount = computed(() => contractImages.value.length)

        const coverImageUrl = computed(() => {
            if (!hasImages.value) return null
            const first = contractImages.value[0]
            if (typeof first === 'string') return first
            return first?.url || null
        })

        const additionalImages = computed(() => {
            return contractImages.value.slice(1)
        })

        const getImageUrl = (img) => {
            if (typeof img === 'string') return img
            return img?.url || null
        }

        const handleImageError = (event) => {
            // Fallback to placeholder on error
            event.target.style.display = 'none'
        }

        const statusBadgeClass = computed(() => {
            const map = {
                open: 'badge bg-success',
                closed: 'badge bg-secondary',
                awarded: 'badge bg-info'
            }
            return map[props.contract.status] || 'badge bg-secondary'
        })

        const showApply = computed(() => {
            return (props.contract?.status || 'open') === 'open'
        })

        const handleApply = async () => {
            applyError.value = ''

            if (!authStore.isAuthenticated) {
                router.push({ path: '/login', query: { redirect: `/contracts/${props.contract.id}` } })
                return
            }
            if (!authStore.hasContractorRole) {
                applyError.value = 'Only contractor accounts can apply to contracts.'
                return
            }

            applying.value = true
            try {
                const token = await authStore.getAuthToken()
                const resp = await fetch(`${config.backend.api}/api/contracts/${props.contract.id}/apply`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                const data = await resp.json().catch(() => ({}))

                if (resp.status === 409) {
                    applied.value = true
                    return
                }
                if (!resp.ok) throw new Error(data.error || 'Error applying')

                applied.value = true
                router.push(`/contracts/${props.contract.id}`)
            } catch (err) {
                applyError.value = err?.message || 'Error applying'
            } finally {
                applying.value = false
            }
        }

        return {
            locationText,
            statusBadgeClass,
            applicationsCount,
            coverImageUrl,
            hasImages,
            imageCount,
            additionalImages,
            getImageUrl,
            handleImageError,
            showApply,
            applying,
            applied,
            applyError,
            handleApply
        }
    }
}
</script>

<style scoped>
.card {
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    background: var(--white);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.28);
}

.contract-image-container {
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--primary-rgb), 0.05) 100%);
}

.contract-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.card:hover .contract-cover {
    transform: scale(1.05);
}

.image-count-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.375rem 0.625rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    backdrop-filter: blur(4px);
    z-index: 2;
}

.image-count-badge svg {
    width: 14px;
    height: 14px;
}

.image-thumbnails {
    position: absolute;
    bottom: 8px;
    left: 8px;
    display: flex;
    gap: 4px;
    z-index: 2;
}

.image-thumbnails .thumbnail {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 6px;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
}

.image-thumbnails .thumbnail:hover {
    transform: scale(1.1);
    z-index: 3;
}

.contract-image-placeholder {
    width: 100%;
    height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0.03) 100%);
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    color: rgba(var(--secondary-rgb), 0.4);
    gap: 0.5rem;
}

.contract-image-placeholder svg {
    opacity: 0.5;
}

.contract-image-placeholder span {
    font-size: 0.875rem;
    font-weight: 500;
}

.card-body {
    padding: 1.5rem;
}

.card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 0.75rem;
    line-height: 1.3;
}

.card-text {
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--secondary);
}

.badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.375rem 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.alert {
    border-radius: 10px;
    font-size: 0.875rem;
}
</style>

