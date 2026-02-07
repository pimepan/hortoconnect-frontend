<template>
    <span v-if="variant === 'badge'" :class="badgeClass">
        <component :is="icon" v-if="icon" class="me-1" :size="16" />
        {{ label }}
    </span>

    <div v-else class="alert mb-0" :class="alertClass" role="alert">
        <div class="d-flex align-items-center">
            <component :is="icon" v-if="icon" class="me-2" :size="18" />
            <div class="fw-semibold">{{ label }}</div>
        </div>
        <ul v-if="showDetails && reasons.length" class="mt-2 mb-0">
            <li v-for="(r, idx) in reasons" :key="idx">
                {{ r.message || r.code || 'Issue' }}
            </li>
        </ul>
    </div>
</template>

<script>
import { computed } from 'vue'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next'

export default {
    name: 'ComplianceStatus',
    props: {
        compliance: {
            type: Object,
            default: null
        },
        variant: {
            type: String,
            default: 'badge' // 'badge' | 'alert'
        },
        showDetails: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const status = computed(() => props.compliance?.status || null)
        const reasons = computed(() => props.compliance?.reasons || [])

        const label = computed(() => {
            if (status.value === 'compliant') return 'Compliant'
            if (status.value === 'action_needed') return 'Action needed'
            if (status.value === 'non_compliant') return 'Non-compliant'
            return 'Unknown'
        })

        const icon = computed(() => {
            if (status.value === 'compliant') return CheckCircle
            if (status.value === 'action_needed') return AlertTriangle
            if (status.value === 'non_compliant') return XCircle
            return null
        })

        const badgeClass = computed(() => {
            const map = {
                compliant: 'badge bg-success d-inline-flex align-items-center',
                action_needed: 'badge bg-warning text-dark d-inline-flex align-items-center',
                non_compliant: 'badge bg-danger d-inline-flex align-items-center'
            }
            return map[status.value] || 'badge bg-secondary d-inline-flex align-items-center'
        })

        const alertClass = computed(() => {
            const map = {
                compliant: 'alert-success',
                action_needed: 'alert-warning',
                non_compliant: 'alert-danger'
            }
            return map[status.value] || 'alert-secondary'
        })

        return {
            reasons,
            label,
            icon,
            badgeClass,
            alertClass
        }
    }
}
</script>

