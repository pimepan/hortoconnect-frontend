<template>
    <footer class="site-footer">
        <div class="container">
            <div class="row g-4 py-5">
                <!-- Company Info -->
                <div class="col-lg-4 col-md-6">
                    <div class="footer-brand mb-3">
                        <img :src="brandMarkUrl" class="footer-logo" alt="HortoConnect" />
                        <h5 class="mt-2 mb-2">HortoConnect</h5>
                        <p class="text-muted small mb-0">
                            A clean, role-based operating system for landscaping contracts and insurance compliance.
                        </p>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="col-lg-2 col-md-6">
                    <h6 class="footer-heading mb-3">Platform</h6>
                    <ul class="footer-links list-unstyled">
                        <li><router-link to="/how-it-works" class="footer-link">How it Works</router-link></li>
                        <li><router-link to="/for-contractors" class="footer-link">For Contractors</router-link></li>
                        <li><router-link to="/for-buyers" class="footer-link">For Buyers</router-link></li>
                        <li><router-link to="/for-brokerages" class="footer-link">For Brokerages</router-link></li>
                        <li><router-link to="/contracts" class="footer-link">Browse Contracts</router-link></li>
                    </ul>
                </div>

                <!-- Account Links -->
                <div class="col-lg-2 col-md-6">
                    <h6 class="footer-heading mb-3">Account</h6>
                    <ul class="footer-links list-unstyled">
                        <li v-if="!authStore.isAuthenticated">
                            <router-link to="/signup" class="footer-link">Sign Up</router-link>
                        </li>
                        <li v-if="!authStore.isAuthenticated">
                            <router-link to="/login" class="footer-link">Log In</router-link>
                        </li>
                        <li v-if="authStore.isAuthenticated">
                            <router-link to="/dashboard" class="footer-link">Dashboard</router-link>
                        </li>
                        <li v-if="authStore.isAuthenticated">
                            <router-link to="/applications" class="footer-link">Applications</router-link>
                        </li>
                    </ul>
                </div>

                <!-- Contact & Support -->
                <div class="col-lg-4 col-md-6">
                    <h6 class="footer-heading mb-3">Contact</h6>
                    <ul class="footer-links list-unstyled">
                        <li class="d-flex align-items-center mb-2">
                            <Mail class="me-2" :size="16" />
                            <a href="mailto:support@hortoconnect.com" class="footer-link">support@hortoconnect.com</a>
                        </li>
                        <li class="d-flex align-items-center">
                            <HelpCircle class="me-2" :size="16" />
                            <span class="text-muted small">Need help? Contact our support team</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="footer-bottom border-top pt-4 pb-3">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <p class="text-muted small mb-0">
                            &copy; {{ currentYear }} HortoConnect. All rights reserved.
                        </p>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <div class="footer-legal">
                            <a href="#" class="footer-link small me-3">Privacy Policy</a>
                            <a href="#" class="footer-link small">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { Mail, HelpCircle } from 'lucide-vue-next'
import brandMarkUrl from '../assets/res/Copy of HORTO/logo-abridge.png'

export default {
    name: 'Footer',
    components: {
        Mail,
        HelpCircle
    },
    setup() {
        const authStore = useAuthStore()
        const currentYear = computed(() => new Date().getFullYear())

        return {
            authStore,
            brandMarkUrl,
            currentYear
        }
    }
}
</script>

<style scoped>
.site-footer {
    background: linear-gradient(180deg, rgba(var(--white-rgb), 1) 0%, rgba(var(--light-rgb), 0.95) 100%);
    border-top: 1px solid rgba(var(--primary-rgb), 0.12);
    margin-top: 5rem;
    padding-top: 3rem;
}

.footer-logo {
    width: 48px;
    height: 48px;
    object-fit: contain;
    border-radius: 12px;
    transition: transform 0.3s ease;
}

.footer-brand:hover .footer-logo {
    transform: scale(1.1);
}

.footer-heading {
    color: var(--dark);
    font-weight: 700;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
}

.footer-links {
    margin: 0;
    padding: 0;
}

.footer-links li {
    margin-bottom: 0.75rem;
}

.footer-link {
    color: var(--secondary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-block;
}

.footer-link:hover {
    color: var(--primary);
    transform: translateX(4px);
}

.footer-bottom {
    border-top-color: rgba(var(--primary-rgb), 0.08) !important;
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.footer-legal a {
    color: var(--secondary);
    font-weight: 500;
    transition: color 0.2s ease;
}

.footer-legal a:hover {
    color: var(--primary);
}

@media (max-width: 768px) {
    .site-footer {
        margin-top: 3rem;
    }
    
    .footer-bottom {
        text-align: center !important;
    }
    
    .footer-legal {
        margin-top: 1rem;
    }
}
</style>
