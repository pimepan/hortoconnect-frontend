<template>
    <div class="home-page">
        <!-- Hero Section -->
        <section class="hero-section">
            <div class="container">
                <div class="row align-items-center g-4 py-5">
                    <div class="col-lg-6">
                        <div class="hero-content">
                            <div class="hero-badge mb-3">
                                <span class="badge-text">Landscaping Contracts Marketplace</span>
                            </div>
                            <h1 class="hero-title mb-4">
                                Connect Contractors, Buyers & Brokerages
                                <span class="text-primary">Seamlessly</span>
                            </h1>
                            <p class="hero-description lead mb-4">
                                A clean, role-based operating system for landscaping contracts and insurance compliance.
                                Contractors apply faster, buyers review with confidence, and brokerages receive qualified inbound requests.
                            </p>

                            <div v-if="authStore.isAuthenticated" class="hero-cta d-flex gap-3 flex-wrap">
                                <router-link to="/dashboard" class="btn btn-primary btn-lg">
                                    <LayoutDashboard class="me-2" :size="20" />
                                    Go to Dashboard
                                </router-link>
                                <router-link to="/contracts" class="btn btn-outline-primary btn-lg">
                                    <FileText class="me-2" :size="20" />
                                    Browse Contracts
                                </router-link>
                            </div>

                            <div v-else class="hero-cta d-flex gap-3 flex-wrap">
                                <router-link to="/signup?role=contractor" class="btn btn-primary btn-lg">
                                    <Wrench class="me-2" :size="20" />
                                    I'm a Contractor
                                </router-link>
                                <router-link to="/signup?role=bid_poster" class="btn btn-outline-primary btn-lg">
                                    <Building class="me-2" :size="20" />
                                    I'm a Buyer
                                </router-link>
                                <router-link to="/signup?role=brokerage" class="btn btn-outline-secondary btn-lg">
                                    <Shield class="me-2" :size="20" />
                                    I'm a Brokerage
                                </router-link>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="hero-visual">
                            <img :src="heroIllustrationUrl" class="img-fluid" alt="Landscaping marketplace illustration" />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features-section py-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="section-title mb-3">Everything You Need to Succeed</h2>
                    <p class="section-subtitle text-muted">Streamline your workflow with powerful features designed for the landscaping industry</p>
                </div>
                <div class="row g-4">
                    <div class="col-lg-3 col-md-6" v-for="feature in features" :key="feature.id">
                        <div class="feature-card">
                            <div class="feature-icon">
                                <component :is="feature.icon" :size="32" />
                            </div>
                            <h5 class="feature-title">{{ feature.title }}</h5>
                            <p class="feature-description text-muted">{{ feature.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Stats Section -->
        <section class="stats-section py-5">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-3 col-md-6" v-for="stat in stats" :key="stat.id">
                        <div class="stat-card text-center">
                            <div class="stat-number">{{ stat.value }}</div>
                            <div class="stat-label text-muted">{{ stat.label }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- How It Works Section -->
        <section class="how-it-works-section py-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="section-title mb-3">How It Works</h2>
                    <p class="section-subtitle text-muted">Get started in three simple steps</p>
                </div>
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6" v-for="(step, index) in howItWorksSteps" :key="index">
                        <div class="step-card">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-icon">
                                <component :is="step.icon" :size="40" />
                            </div>
                            <h5 class="step-title">{{ step.title }}</h5>
                            <p class="step-description text-muted">{{ step.description }}</p>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <router-link to="/how-it-works" class="btn btn-outline-primary">
                        Learn More About Our Process
                        <ArrowRight class="ms-2" :size="18" />
                    </router-link>
                </div>
            </div>
        </section>

        <!-- Featured Contracts Section -->
        <section class="featured-contracts-section py-5">
            <div class="container">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="section-title mb-2">Featured Contracts</h2>
                        <p class="text-muted mb-0">Browse open landscaping contracts</p>
                    </div>
                    <router-link to="/contracts" class="btn btn-outline-primary d-inline-flex align-items-center">
                        View All Contracts
                        <ArrowRight class="ms-2" :size="18" />
                    </router-link>
                </div>

                <div v-if="featuredLoading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading contracts...</span>
                    </div>
                </div>
                <div v-else-if="featuredError" class="alert alert-warning">
                    {{ featuredError }}
                </div>
                <div v-else-if="featuredContracts.length === 0" class="text-center py-5">
                    <FileText class="mb-3 text-muted" :size="48" />
                    <p class="text-muted">No open contracts available at the moment.</p>
                </div>
                <div v-else class="row g-4">
                    <div class="col-lg-4 col-md-6" v-for="contract in featuredContracts" :key="contract.id">
                        <router-link :to="`/contracts/${contract.id}`" class="contract-card-link">
                            <div class="contract-card">
                                <div class="contract-header">
                                    <h5 class="contract-title">{{ contract.title || 'Untitled Contract' }}</h5>
                                    <span class="contract-type-badge">{{ contract.contractType || 'Contract' }}</span>
                                </div>
                                <div class="contract-body">
                                    <div class="contract-info-item">
                                        <MapPin class="me-2" :size="16" />
                                        <span v-if="contract.locationCity || contract.locationState">
                                            {{ [contract.locationCity, contract.locationState].filter(Boolean).join(', ') }}
                                        </span>
                                        <span v-else class="text-muted">Location not specified</span>
                                    </div>
                                    <div class="contract-info-item">
                                        <Users class="me-2" :size="16" />
                                        <span>{{ contract.applicationsCount ?? 0 }} applications</span>
                                    </div>
                                </div>
                                <div class="contract-footer">
                                    <span class="view-link">View Details <ArrowRight class="ms-1" :size="14" /></span>
                                </div>
                            </div>
                        </router-link>
                    </div>
                </div>
            </div>
        </section>

        <!-- Role-Specific Benefits Section -->
        <section class="role-benefits-section py-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="section-title mb-3">Built for Every Role</h2>
                    <p class="section-subtitle text-muted">Tailored experiences for contractors, buyers, and brokerages</p>
                </div>
                <div class="row g-4">
                    <div class="col-lg-4" v-for="role in roleBenefits" :key="role.id">
                        <div class="role-card">
                            <div class="role-image-wrapper">
                                <img :src="role.image" :alt="role.title" class="role-image" />
                                <div class="role-image-overlay"></div>
                            </div>
                            <div class="role-icon">
                                <component :is="role.icon" :size="48" />
                            </div>
                            <h4 class="role-title">{{ role.title }}</h4>
                            <p class="role-description text-muted mb-4">{{ role.description }}</p>
                            <ul class="role-benefits-list">
                                <li v-for="benefit in role.benefits" :key="benefit">
                                    <CheckCircle class="me-2" :size="18" />
                                    {{ benefit }}
                                </li>
                            </ul>
                            <router-link :to="role.link" class="btn btn-primary mt-4 d-inline-flex align-items-center">
                                Learn More
                                <ArrowRight class="ms-2" :size="18" />
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import config from '../../../config.js'

// Hero image - using a landscape/landscaping related image
const heroIllustrationUrl = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=800&fit=crop&q=80&auto=format'
import {
    LayoutDashboard, FileText, Wrench, Building, Shield,
    CheckCircle, FileCheck, ShieldCheck, Users as UsersIcon,
    MapPin, Users, ArrowRight, Upload, Zap, Target, TrendingUp
} from 'lucide-vue-next'

export default {
    name: 'MarketingHome',
    components: {
        LayoutDashboard, FileText, Wrench, Building, Shield,
        CheckCircle, FileCheck, ShieldCheck, UsersIcon,
        MapPin, Users, ArrowRight, Upload, Zap, Target, TrendingUp
    },
    setup() {
        const authStore = useAuthStore()

        const featuredLoading = ref(true)
        const featuredError = ref('')
        const featuredContracts = ref([])

        const features = [
            {
                id: 1,
                icon: FileCheck,
                title: 'Document Management',
                description: 'Upload and version compliance documents with expiration tracking and automatic alerts.'
            },
            {
                id: 2,
                icon: Zap,
                title: 'One-Click Applications',
                description: 'Apply to contracts instantly with auto-attached compliance documents and summaries.'
            },
            {
                id: 3,
                icon: Target,
                title: 'Structured Requirements',
                description: 'Post contracts with explicit document and coverage requirements for clear compliance checks.'
            },
            {
                id: 4,
                icon: TrendingUp,
                title: 'Brokerage Matching',
                description: 'Match brokerages by region and coverage gaps for qualified inbound requests.'
            }
        ]

        const stats = [
            { id: 1, value: '100+', label: 'Active Contracts' },
            { id: 2, value: '500+', label: 'Registered Contractors' },
            { id: 3, value: '50+', label: 'Cities & HOAs' },
            { id: 4, value: '24/7', label: 'Support Available' }
        ]

        const howItWorksSteps = [
            {
                icon: UsersIcon,
                title: 'Build Your Profile',
                description: 'Create a role-based profile tailored to your needs as a contractor, buyer, or brokerage.'
            },
            {
                icon: FileText,
                title: 'Post or Apply',
                description: 'Buyers post contracts with structured requirements. Contractors apply with one click.'
            },
            {
                icon: ShieldCheck,
                title: 'Compliance Checks',
                description: 'Get instant, deterministic compliance results with clear action items when needed.'
            }
        ]

        const roleBenefits = [
            {
                id: 1,
                icon: Wrench,
                title: 'For Contractors',
                description: 'Streamline your application process and stay compliant effortlessly.',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&q=80',
                benefits: [
                    'Keep documents current with version tracking',
                    'Apply with one click + auto-attached docs',
                    'See exactly what\'s missing and why',
                    'Track application status in real-time'
                ],
                link: '/for-contractors'
            },
            {
                id: 2,
                icon: Building,
                title: 'For Buyers',
                description: 'Post contracts and review submissions with confidence.',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&q=80',
                benefits: [
                    'Post contracts with clear requirements',
                    'Review compliance summaries instantly',
                    'Filter applications by compliance status',
                    'Everything is auditable and transparent'
                ],
                link: '/for-buyers'
            },
            {
                id: 3,
                icon: Shield,
                title: 'For Brokerages',
                description: 'Receive qualified inbound requests tied to real contract needs.',
                image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop&q=80',
                benefits: [
                    'Match to real coverage gaps by region',
                    'Get qualified inbound requests',
                    'See contract requirements upfront',
                    'Build relationships with active contractors'
                ],
                link: '/for-brokerages'
            }
        ]

        const fetchFeatured = async () => {
            featuredLoading.value = true
            featuredError.value = ''
            try {
                const params = new URLSearchParams({ status: 'open' })
                const resp = await fetch(`${config.backend.api}/api/public/contracts?${params.toString()}`, { method: 'GET' })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data.error || 'Failed to load contracts')
                const list = Array.isArray(data.contracts) ? data.contracts : []
                featuredContracts.value = list.slice(0, 3)
            } catch (e) {
                featuredContracts.value = []
                featuredError.value = e?.message || 'Failed to load contracts'
            } finally {
                featuredLoading.value = false
            }
        }

        onMounted(fetchFeatured)

        return {
            authStore,
            config,
            heroIllustrationUrl,
            featuredLoading,
            featuredError,
            featuredContracts,
            features,
            stats,
            howItWorksSteps,
            roleBenefits
        }
    }
}
</script>

<style scoped>
.home-page {
    min-height: 100vh;
}

/* Hero Section */
.hero-section {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.03) 0%, rgba(var(--accent-rgb), 0.02) 100%);
    padding: 4rem 0;
    position: relative;
    overflow: hidden;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 20% 30%, rgba(var(--primary-rgb), 0.06) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(var(--accent-rgb), 0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.04) 0%, transparent 60%),
        radial-gradient(circle at 10% 80%, rgba(var(--accent-rgb), 0.03) 0%, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(var(--primary-rgb), 0.04) 0%, transparent 55%);
    z-index: 0;
    pointer-events: none;
}

.hero-section::after {
    content: '';
    position: absolute;
    top: -30%;
    right: -15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(var(--primary-rgb), 0.05) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
}

.hero-section .container {
    position: relative;
    z-index: 1;
}

.hero-badge {
    display: inline-block;
}

.badge-text {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 600;
    border: 1px solid rgba(var(--primary-rgb), 0.2);
}

.hero-title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
    color: var(--dark);
}

.hero-description {
    font-size: 1.25rem;
    color: var(--secondary);
    max-width: 600px;
}

.hero-cta .btn {
    min-width: 180px;
    font-weight: 600;
    padding: 0.875rem 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    text-decoration: none;
    line-height: 1.5;
}

.hero-cta .btn-primary {
    background-color: var(--primary) !important;
    color: white !important;
    border-color: var(--primary) !important;
}

.hero-cta .btn-primary:hover {
    background-color: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
}

.hero-cta .btn-outline-primary {
    background-color: transparent !important;
    color: var(--primary) !important;
    border-color: var(--primary) !important;
}

.hero-cta .btn-outline-primary:hover {
    background-color: var(--primary) !important;
    color: white !important;
    border-color: var(--primary) !important;
}

.hero-cta .btn-outline-secondary {
    background-color: transparent !important;
    color: var(--secondary) !important;
    border-color: var(--secondary) !important;
}

.hero-cta .btn-outline-secondary:hover {
    background-color: var(--secondary) !important;
    color: white !important;
    border-color: var(--secondary) !important;
}

.hero-visual {
    position: relative;
    border-radius: 24px;
    border: 1.5px solid rgba(var(--primary-rgb), 0.18);
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.04) 0%, rgba(var(--accent-rgb), 0.03) 100%);
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(var(--dark-rgb), 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-visual:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.hero-visual img {
    border-radius: 16px;
}

/* Features Section */
.features-section {
    background: var(--white);
    position: relative;
}

.features-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(var(--primary-rgb), 0.015) 20px,
            rgba(var(--primary-rgb), 0.015) 21px
        );
    pointer-events: none;
    z-index: 0;
}

.features-section .container {
    position: relative;
    z-index: 1;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--dark);
}

.section-subtitle {
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto;
}

.feature-card {
    text-align: center;
    padding: 2rem;
    border-radius: 16px;
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    transition: all 0.3s ease;
    height: 100%;
}

.feature-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 16px;
    color: var(--primary);
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(var(--primary-rgb), 0.15);
    border-color: rgba(var(--primary-rgb), 0.2);
}

.feature-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 16px;
    color: var(--primary);
}

.feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--dark);
}

.feature-description {
    font-size: 0.95rem;
    line-height: 1.6;
}

/* Stats Section */
.stats-section {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    position: relative;
    overflow: hidden;
}

.stats-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 20% 30%, rgba(var(--white-rgb), 0.06) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(var(--white-rgb), 0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(var(--white-rgb), 0.03) 0%, transparent 70%),
        radial-gradient(circle at 10% 80%, rgba(var(--white-rgb), 0.04) 0%, transparent 45%),
        radial-gradient(circle at 90% 20%, rgba(var(--white-rgb), 0.04) 0%, transparent 55%);
    z-index: 0;
    pointer-events: none;
}

.stats-section .container {
    position: relative;
    z-index: 1;
}

.stat-card {
    padding: 2rem;
}

.stat-number {
    font-size: 3rem;
    font-weight: 800;
    color: var(--white);
    line-height: 1;
    margin-bottom: 0.5rem;
    text-shadow: 0 2px 4px rgba(var(--dark-rgb), 0.2);
}

.stat-label {
    font-size: 1rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(var(--white-rgb), 0.9);
}

/* How It Works Section */
.how-it-works-section {
    background: var(--white);
    position: relative;
}

.how-it-works-section .container {
    position: relative;
    z-index: 1;
}

.step-card {
    text-align: center;
    padding: 2.5rem 2rem;
    border-radius: 20px;
    background: var(--white);
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    position: relative;
    transition: all 0.3s ease;
    height: 100%;
    box-shadow: 0 4px 6px rgba(var(--dark-rgb), 0.05);
}

.step-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 45px rgba(var(--primary-rgb), 0.12);
}

.step-number {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 48px;
    height: 48px;
    background: var(--primary);
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.step-icon {
    width: 80px;
    height: 80px;
    margin: 1rem auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 20px;
    color: var(--primary);
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--dark);
}

.step-description {
    font-size: 1rem;
    line-height: 1.6;
}

/* Featured Contracts Section */
.featured-contracts-section {
    background: var(--light);
    position: relative;
}

.featured-contracts-section .container {
    position: relative;
    z-index: 1;
}

.contract-card-link {
    text-decoration: none;
    display: block;
    height: 100%;
}

.contract-card {
    background: var(--white);
    border-radius: 16px;
    border: 1.5px solid rgba(var(--primary-rgb), 0.2);
    padding: 1.5rem;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(var(--dark-rgb), 0.04);
}

.contract-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.3);
}

.contract-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
}

.contract-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--dark);
    margin: 0;
    flex: 1;
}

.contract-type-badge {
    background: rgba(var(--primary-rgb), 0.15);
    color: var(--primary);
    padding: 0.375rem 0.875rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid rgba(var(--primary-rgb), 0.2);
}

.contract-body {
    flex: 1;
    margin-bottom: 1rem;
}

.contract-info-item {
    display: flex;
    align-items: center;
    color: var(--secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.contract-footer {
    border-top: 1px solid rgba(var(--primary-rgb), 0.1);
    padding-top: 1rem;
    margin-top: auto;
}

.view-link {
    color: var(--primary);
    font-weight: 700;
    font-size: 1rem;
    display: inline-flex;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Role Benefits Section */
.role-benefits-section {
    background: var(--white);
    position: relative;
}

.role-benefits-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.02) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
    z-index: 0;
}

.role-benefits-section .container {
    position: relative;
    z-index: 1;
}

.role-card {
    background: var(--white);
    border-radius: 20px;
    padding: 0;
    border: 1px solid rgba(var(--primary-rgb), 0.12);
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.role-image-wrapper {
    width: 100%;
    height: 220px;
    overflow: hidden;
    position: relative;
}

.role-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.role-image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent 0%, rgba(var(--primary-rgb), 0.3) 100%);
    z-index: 1;
}

.role-card:hover .role-image {
    transform: scale(1.05);
}

.role-card .role-icon,
.role-card .role-title,
.role-card .role-description,
.role-card .role-benefits-list,
.role-card .btn {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
}

.role-card .role-icon {
    margin-top: -40px;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 2;
}

.role-card .role-description {
    padding-top: 0;
    padding-bottom: 1rem;
}

.role-card .btn {
    margin-bottom: 2.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    white-space: nowrap;
    line-height: 1.5;
}

.role-card .btn-primary {
    background-color: var(--primary) !important;
    color: white !important;
    border-color: var(--primary) !important;
}

.role-card .btn-primary:hover {
    background-color: var(--accent) !important;
    color: white !important;
    border-color: var(--accent) !important;
}

.role-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 50px rgba(var(--primary-rgb), 0.15);
    border-color: rgba(var(--primary-rgb), 0.25);
}

.role-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(var(--primary-rgb), 0.1);
    border-radius: 16px;
    color: var(--primary);
}

.role-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--dark);
}

.role-description {
    font-size: 1.05rem;
    line-height: 1.6;
}

.role-benefits-list {
    list-style: none;
    padding: 0;
    margin: 0 0 auto 0;
}

.role-benefits-list li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    color: var(--dark);
    font-size: 0.95rem;
}

.role-benefits-list li svg {
    color: var(--success);
    flex-shrink: 0;
    margin-top: 2px;
}

/* Responsive Design */
@media (max-width: 992px) {
    .hero-title {
        font-size: 2.25rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .hero-cta .btn {
        min-width: auto;
        width: 100%;
    }
}

@media (max-width: 768px) {
    .hero-section {
        padding: 2rem 0;
    }
    
    .hero-title {
        font-size: 1.875rem;
    }
    
    .hero-description {
        font-size: 1.125rem;
    }
    
    .section-title {
        font-size: 1.75rem;
    }
    
    .stat-number {
        font-size: 2.25rem;
    }
    
    .role-card,
    .step-card {
        padding: 2rem 1.5rem;
    }
}
</style>
