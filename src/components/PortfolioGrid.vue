<template>
    <div class="portfolio-grid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="mb-0">Portfolio Projects</h4>
            <button v-if="!readOnly" class="btn btn-primary d-flex align-items-center" @click="$emit('add-project')">
                <Plus class="me-2" :size="18" />
                Add Project
            </button>
        </div>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading…</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
        </div>

        <div v-else-if="projects.length === 0" class="empty-state">
            <div class="empty-state-content">
                <ImageIcon class="empty-state-icon" :size="64" />
                <h5>No portfolio projects yet</h5>
                <p class="text-muted">Start building your portfolio by adding your first project.</p>
                <button v-if="!readOnly" class="btn btn-primary" @click="$emit('add-project')">
                    <Plus class="me-2" :size="18" />
                    Add Your First Project
                </button>
            </div>
        </div>

        <div v-else class="row g-4">
            <div v-for="project in projects" :key="project.id" class="col-12 col-md-6 col-lg-4">
                <div class="portfolio-card">
                    <div class="portfolio-card-image" v-if="project.images && project.images.length > 0">
                        <img :src="portfolioImageSrc(project.images[0])" :alt="project.title" />
                        <div class="portfolio-card-overlay">
                            <div class="portfolio-card-actions">
                                <button class="btn btn-sm btn-light" @click="$emit('view-project', project)" title="View">
                                    <Eye :size="16" />
                                </button>
                                <template v-if="!readOnly">
                                    <button class="btn btn-sm btn-light" @click="$emit('edit-project', project)" title="Edit">
                                        <Edit :size="16" />
                                    </button>
                                    <button class="btn btn-sm btn-light" @click="$emit('delete-project', project)" title="Delete">
                                        <Trash2 :size="16" />
                                    </button>
                                </template>
                            </div>
                        </div>
                        <div v-if="project.images.length > 1" class="portfolio-image-count">
                            <ImageIcon :size="14" />
                            {{ project.images.length }}
                        </div>
                    </div>
                    <div v-else class="portfolio-card-placeholder">
                        <ImageIcon :size="48" />
                    </div>
                    <div class="portfolio-card-body">
                        <h5 class="portfolio-card-title">{{ project.title }}</h5>
                        <p v-if="project.description" class="portfolio-card-description">
                            {{ truncate(project.description, 100) }}
                        </p>
                        <div class="portfolio-card-meta">
                            <div v-if="project.location" class="meta-item">
                                <MapPin :size="14" />
                                {{ project.location }}
                            </div>
                            <div v-if="project.completedDate" class="meta-item">
                                <Calendar :size="14" />
                                {{ formatDate(project.completedDate) }}
                            </div>
                        </div>
                        <div v-if="project.tags && project.tags.length > 0" class="portfolio-card-tags">
                            <span v-for="tag in project.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                            <span v-if="project.tags.length > 3" class="tag-more">+{{ project.tags.length - 3 }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Plus, Eye, Edit, Trash2, ImageIcon, MapPin, Calendar } from 'lucide-vue-next'
import { formatDateLong } from '../utils/formatters.js'

export default {
    name: 'PortfolioGrid',
    components: {
        Plus,
        Eye,
        Edit,
        Trash2,
        ImageIcon,
        MapPin,
        Calendar
    },
    props: {
        projects: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: String,
            default: ''
        },
        readOnly: {
            type: Boolean,
            default: false
        }
    },
    emits: ['add-project', 'view-project', 'edit-project', 'delete-project'],
    methods: {
        portfolioImageSrc(img) {
            if (typeof img === 'string') return img
            return img?.url || ''
        },
        truncate(text, length) {
            if (!text) return ''
            if (text.length <= length) return text
            return text.substring(0, length) + '...'
        },
        formatDate(dateString) {
            if (!dateString) return ''
            try {
                return formatDateLong(dateString)
            } catch {
                return dateString
            }
        }
    }
}
</script>

<style scoped>
.portfolio-grid {
    margin-top: 1rem;
}

.portfolio-card {
    background: var(--white);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.portfolio-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.portfolio-card-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: rgba(var(--primary-rgb), 0.05);
}

.portfolio-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.portfolio-card:hover .portfolio-card-image img {
    transform: scale(1.05);
}

.portfolio-card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.portfolio-card:hover .portfolio-card-overlay {
    opacity: 1;
}

.portfolio-card-actions {
    display: flex;
    gap: 0.5rem;
}

.portfolio-card-actions .btn {
    border-radius: 8px;
    padding: 0.5rem;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.portfolio-image-count {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.portfolio-card-placeholder {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.05);
    color: var(--secondary);
}

.portfolio-card-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.portfolio-card-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 0.5rem;
    line-height: 1.3;
}

.portfolio-card-description {
    font-size: 0.9rem;
    color: var(--secondary);
    margin-bottom: 0.75rem;
    flex: 1;
    line-height: 1.5;
}

.portfolio-card-meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--secondary);
}

.portfolio-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: auto;
}

.tag {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.tag-more {
    color: var(--secondary);
    font-size: 0.75rem;
    font-weight: 600;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-state-content {
    max-width: 400px;
    margin: 0 auto;
}

.empty-state-icon {
    color: var(--secondary);
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h5 {
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.btn-primary {
    border-radius: 12px;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
}
</style>
