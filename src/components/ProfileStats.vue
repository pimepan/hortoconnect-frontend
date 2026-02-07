<template>
    <div class="profile-stats">
        <div class="row g-3">
            <div v-for="stat in stats" :key="stat.id" :class="statClass">
                <div class="stat-card">
                    <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
                        <component v-if="stat.icon" :is="stat.icon" :size="24" />
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">{{ stat.value }}</div>
                        <div class="stat-label">{{ stat.label }}</div>
                        <div v-if="stat.subtitle" class="stat-subtitle">{{ stat.subtitle }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ProfileStats',
    props: {
        stats: {
            type: Array,
            required: true,
            validator: (stats) => {
                return stats.every(stat => stat.id && stat.label && stat.value !== undefined)
            }
        },
        columns: {
            type: Number,
            default: 3,
            validator: (val) => [2, 3, 4].includes(val)
        }
    },
    computed: {
        statClass() {
            const colMap = {
                2: 'col-md-6',
                3: 'col-md-4',
                4: 'col-md-3'
            }
            return colMap[this.columns] || 'col-md-4'
        }
    }
}
</script>

<style scoped>
.profile-stats {
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--white);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    height: 100%;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--dark);
    line-height: 1.2;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--secondary);
    margin-bottom: 0.125rem;
}

.stat-subtitle {
    font-size: 0.8rem;
    color: var(--secondary);
    opacity: 0.7;
}
</style>
