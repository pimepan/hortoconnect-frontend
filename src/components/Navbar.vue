<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div class="container">
            <router-link to="/" class="navbar-brand fw-bold">Hortoconnect</router-link>
            
            <button 
                class="navbar-toggler" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav"
            >
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <!-- Account Type Switch Button (shown when user has both roles) -->
                    <li v-if="user && hasContractorRole && hasBidPosterRole" class="nav-item me-3">
                        <button 
                            v-if="currentProfile === 'contractor' || !currentProfile"
                            class="btn btn-outline-primary d-flex align-items-center"
                            @click="router.push('/profile/buyer')"
                        >
                            <FileText class="me-2" :size="18" />Buyer mode
                        </button>
                        <button 
                            v-else-if="currentProfile === 'bid_poster'"
                            class="btn btn-outline-primary d-flex align-items-center"
                            @click="router.push('/profile/contractor')"
                        >
                            <Wrench class="me-2" :size="18" />Contractor mode
                        </button>
                    </li>

                    <li class="nav-item">
                        <router-link to="/contracts" class="nav-link">Contracts</router-link>
                    </li>
                    <li v-if="user" class="nav-item">
                        <router-link to="/applications" class="nav-link">Applications</router-link>
                    </li>

                    <li v-if="!user" class="nav-item">
                        <router-link to="/how-it-works" class="nav-link">How it works</router-link>
                    </li>
                    <li v-if="!user" class="nav-item">
                        <router-link to="/for-contractors" class="nav-link">Contractors</router-link>
                    </li>
                    <li v-if="!user" class="nav-item">
                        <router-link to="/for-buyers" class="nav-link">Buyers</router-link>
                    </li>
                    <li v-if="!user" class="nav-item">
                        <router-link to="/for-brokerages" class="nav-link">Brokerages</router-link>
                    </li>
                    
                    <li v-if="user" class="nav-item dropdown d-flex align-items-center">
                        <router-link 
                            :to="myProfilePath" 
                            class="nav-link d-flex align-items-center text-decoration-none"
                        >
                            <span class="me-2">{{ user.displayName || user.email }}</span>
                            <UserCircle :size="20" />
                        </router-link>
                        <a 
                            class="nav-link dropdown-toggle dropdown-toggle-split d-flex align-items-center" 
                            href="#" 
                            id="profileDropdown" 
                            role="button" 
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            aria-label="Open profile menu"
                        >
                            <ChevronDown :size="18" />
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                            <li v-if="hasContractorRole">
                                <a 
                                    href="#"
                                    class="dropdown-item d-flex align-items-center"
                                    @click.prevent="navigateToProfile('/profile/contractor')"
                                >
                                    <Wrench class="me-2" :size="18" />Contractor Profile
                                </a>
                            </li>
                            <li v-if="hasBidPosterRole">
                                <a 
                                    href="#"
                                    class="dropdown-item d-flex align-items-center"
                                    @click.prevent="navigateToProfile('/profile/buyer')"
                                >
                                    <FileText class="me-2" :size="18" />Buyer Profile
                                </a>
                            </li>
                            <li v-if="hasBrokerageRole">
                                <a 
                                    href="#"
                                    class="dropdown-item d-flex align-items-center"
                                    @click.prevent="navigateToProfile('/profile/brokerage')"
                                >
                                    <Shield class="me-2" :size="18" />Brokerage Profile
                                </a>
                            </li>
                            <li v-if="hasContractorRole || hasBidPosterRole || hasBrokerageRole"><hr class="dropdown-divider"></li>
                            <li v-if="!userProfile || !userProfile.userType">
                                <a 
                                    href="#"
                                    class="dropdown-item d-flex align-items-center"
                                    @click.prevent="navigateToProfile('/select-role')"
                                >
                                    <Settings class="me-2" :size="18" />Select Role
                                </a>
                            </li>
                            <li v-if="!userProfile || !userProfile.userType"><hr class="dropdown-divider"></li>
                            <li>
                                <a 
                                    class="dropdown-item text-danger d-flex align-items-center fw-semibold" 
                                    href="#" 
                                    @click.prevent="handleLogout"
                                >
                                    <LogOut class="me-2" :size="18" />Sign Out
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li v-if="user" class="nav-item ms-2">
                        <button 
                            class="btn btn-outline-danger btn-sm d-flex align-items-center" 
                            @click="handleLogout"
                            title="Sign out"
                        >
                            <LogOut class="me-1" :size="16" />
                            <span class="d-none d-md-inline">Sign Out</span>
                        </button>
                    </li>
                    <li v-else class="nav-item">
                        <router-link to="/login" class="nav-link">Log in</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { FileText, Wrench, UserCircle, Settings, LogOut, Shield, ChevronDown } from 'lucide-vue-next'
import WButton from './utils/WButton.vue'

export default {
    name: 'Navbar',
    components: {
        WButton,
        FileText,
        Wrench,
        Shield,
        UserCircle,
        Settings,
        LogOut,
        ChevronDown
    },
    setup() {
        const router = useRouter()
        const route = useRoute()
        const authStore = useAuthStore()

        const currentProfile = computed(() => {
            if (route.path === '/profile/contractor') return 'contractor'
            if (route.path === '/profile/buyer' || route.path === '/profile/bid-poster') return 'bid_poster'
            if (route.path === '/profile/brokerage') return 'brokerage'
            return null
        })

        const myProfilePath = computed(() => {
            if (authStore.hasContractorRole) return '/profile/contractor'
            if (authStore.hasBidPosterRole) return '/profile/buyer'
            if (authStore.hasBrokerageRole) return '/profile/brokerage'
            return '/select-role'
        })

        const navigateToProfile = (path) => {
            // Close Bootstrap dropdown by removing show classes
            const dropdownMenu = document.querySelector('.dropdown-menu.show')
            const dropdownToggle = document.getElementById('profileDropdown')
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show')
            }
            if (dropdownToggle) {
                dropdownToggle.setAttribute('aria-expanded', 'false')
            }
            // Navigate
            router.push(path)
        }

        const handleLogout = async () => {
            await authStore.logout()
            router.push('/login')
        }

        return {
            user: computed(() => authStore.user),
            userProfile: computed(() => authStore.userProfile),
            currentProfile,
            myProfilePath,
            hasContractorRole: computed(() => authStore.hasContractorRole),
            hasBidPosterRole: computed(() => authStore.hasBidPosterRole),
            hasBrokerageRole: computed(() => authStore.hasBrokerageRole),
            router,
            navigateToProfile,
            handleLogout
        }
    }
}
</script>

<style scoped>
.navbar {
    box-shadow: 0 2px 12px rgba(var(--dark-rgb), 0.08);
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
}

.navbar-brand {
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    transition: color 0.2s ease;
}

.navbar-brand:hover {
    color: var(--primary) !important;
}

.nav-link {
    font-weight: 600;
    transition: all 0.2s ease;
    position: relative;
    padding: 0.5rem 1rem !important;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 80%;
    height: 2px;
    background: var(--primary);
    transition: transform 0.3s ease;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
    transform: translateX(-50%) scaleX(1);
}

/* Split dropdown: name = router-link, caret = toggle */
.nav-item.dropdown.d-flex {
    gap: 0;
}
.nav-item.dropdown .dropdown-toggle-split {
    padding-left: 0.35rem;
    padding-right: 0.5rem;
}
.nav-item.dropdown .dropdown-toggle-split::after {
    display: none;
}

.dropdown-menu {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(var(--dark-rgb), 0.12);
    border: 1px solid rgba(var(--primary-rgb), 0.1);
    padding: 0.5rem;
    margin-top: 0.5rem;
}

.dropdown-item {
    border-radius: 10px;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;
    font-weight: 500;
}

.dropdown-item:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
    transform: translateX(4px);
}

.dropdown-item.active {
    background-color: rgba(var(--primary-rgb), 0.15);
    color: var(--primary);
    font-weight: 600;
}

.btn-outline-primary {
    border-width: 2px;
    font-weight: 600;
    transition: all 0.2s ease;
    background-color: transparent;
}

.btn-outline-primary:hover {
    background-color: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.25);
}

.btn-outline-danger {
    border-color: var(--danger);
    color: var(--danger);
    background-color: transparent;
}

.btn-outline-danger:hover {
    background-color: var(--danger);
    border-color: var(--danger);
    color: white;
}
</style>
