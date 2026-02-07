<template>
    <div class="profile-tabs">
        <ul class="nav nav-tabs" role="tablist">
            <li v-for="tab in tabs" :key="tab.id" class="nav-item" role="presentation">
                <button
                    :class="['nav-link', { active: activeTab === tab.id }]"
                    :id="`tab-${tab.id}`"
                    type="button"
                    role="tab"
                    @click.prevent.stop="$emit('tab-change', tab.id)"
                >
                    <component v-if="tab.icon" :is="tab.icon" class="me-2" :size="18" />
                    {{ tab.label }}
                    <span v-if="tab.badge" class="badge bg-primary ms-2">{{ tab.badge }}</span>
                </button>
            </li>
        </ul>
        <div class="tab-content mt-4">
            <slot :active-tab="activeTab"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProfileTabs',
    props: {
        tabs: {
            type: Array,
            required: true,
            validator: (tabs) => {
                return tabs.every(tab => tab.id && tab.label)
            }
        },
        activeTab: {
            type: String,
            required: true
        }
    },
    emits: ['tab-change']
}
</script>

<style scoped>
.profile-tabs {
    margin-top: 2rem;
}

.nav-tabs {
    border-bottom: 2px solid rgba(var(--primary-rgb), 0.1);
    gap: 0.5rem;
}

.nav-item {
    margin-bottom: -2px;
}

.nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--secondary);
    font-weight: 600;
    padding: 1rem 1.5rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    border-radius: 12px 12px 0 0;
    cursor: pointer;
    position: relative;
    z-index: 1;
}

.nav-link:hover {
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.05);
    border-bottom-color: rgba(var(--primary-rgb), 0.3);
}

.nav-link.active {
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.08);
    border-bottom-color: var(--primary);
}

.badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
}

.tab-content {
    min-height: 400px;
}
</style>
