<template>
    <div class="container-fluid h-100 d-flex align-items-center justify-content-center login-container">
        <div class="row w-100 justify-content-center">
            <div class="col-12 col-md-6 col-lg-5 col-xl-4">
                <div class="card shadow-lg border-0">
                    <div class="card-body p-4 p-md-5">
                        <router-link
                            to="/"
                            class="home-link d-inline-flex align-items-center text-muted text-decoration-none mb-4"
                        >
                            <Home class="me-2" :size="18" />Back to home
                        </router-link>
                        <div class="text-center mb-4">
                            <h2 class="card-title mb-2 fw-bold">Welcome back</h2>
                            <p class="text-muted mb-0">Sign in to your account</p>
                        </div>

                        <form @submit.prevent="handleSignIn" class="d-flex flex-column gap-3">
                            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                                <AlertTriangle class="me-2" :size="18" />
                                <span>{{ errorMessage }}</span>
                            </div>

                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Mail class="me-2" :size="18" />Email
                                </label>
                                <input 
                                    type="email" 
                                    class="form-control form-control-lg" 
                                    v-model="email"
                                    placeholder="you@email.com"
                                    required
                                    :disabled="loading"
                                />  
                            </div>
                    
                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Lock class="me-2" :size="18" />Password
                                </label>
                                <input 
                                    type="password" 
                                    class="form-control form-control-lg" 
                                    v-model="password"
                                    placeholder="Enter your password"
                                    required
                                    :disabled="loading"
                                />
                            </div>

                            <div class="d-flex justify-content-end">
                                <a href="#" class="text-decoration-none text-muted small">
                                    Forgot your password?
                                </a>
                            </div>

                            <div class="mt-2">
                                <WButton 
                                    type="submit" 
                                    class="btn-primary w-100"
                                    :loading="loading"
                                    :disabled="loading"
                                >
                                    {{ loading ? 'Signing in…' : 'Sign in' }}
                                </WButton>
                            </div>
                        </form>

                        <div class="text-center mt-4 pt-3 border-top">
                            <p class="text-muted mb-2">
                                Don’t have an account?
                            </p>
                            <button 
                                class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                                @click="router.push('/signup')"
                            >
                                <UserPlus class="me-2" :size="18" />Create account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../firebase.js'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { AlertTriangle, Mail, Lock, UserPlus, Home } from 'lucide-vue-next'
import WButton from '../../utils/WButton.vue'
import config from '../../../config.js'

export default {
    components: {
        WButton,
        AlertTriangle,
        Mail,
        Lock,
        UserPlus,
        Home
    },
    setup() {
        const email = ref('')
        const password = ref('')
        const errorMessage = ref('')
        const loading = ref(false)
        const router = useRouter()
        const route = useRoute()
        const authStore = useAuthStore()

        const handleSignIn = async () => {
            errorMessage.value = ''
            loading.value = true

            try {
                await signInWithEmailAndPassword(auth, email.value, password.value)
                // Sign in successful, fetch user profile from store
                await authStore.fetchUserProfile()

                // If router guard provided a redirect target, honor it
                const redirect = route.query.redirect
                if (redirect) {
                    router.push(redirect)
                    return
                }
                
                // Check user role and redirect accordingly
                const userType = authStore.currentUserType
                if (userType === 'contractor') {
                    router.push('/profile/contractor')
                } else if (userType === 'bid_poster') {
                    router.push('/profile/buyer')
                } else if (userType === 'brokerage') {
                    router.push('/profile/brokerage')
                } else {
                    router.push('/select-role')
                }
            } catch (error) {
                // Handle errors
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage.value = 'That email address is not valid.'
                        break
                    case 'auth/user-disabled':
                        errorMessage.value = 'This account has been disabled.'
                        break
                    case 'auth/user-not-found':
                        errorMessage.value = 'No account exists with this email.'
                        break
                    case 'auth/wrong-password':
                        errorMessage.value = 'Incorrect password.'
                        break
                    case 'auth/invalid-credential':
                        errorMessage.value = 'Invalid credentials.'
                        break
                    default:
                        errorMessage.value = 'Sign-in failed. Please try again.'
                }
            } finally {
                loading.value = false
            }
        }

        return {
            email,
            password,
            errorMessage,
            loading,
            router,
            handleSignIn
        }
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    background: transparent;
    padding: 2rem 1rem;
}

.card {
    border-radius: 24px;
    border: 1.5px solid rgba(var(--primary-rgb), 0.2);
    box-shadow: 0 2px 12px rgba(var(--dark-rgb), 0.05);
    backdrop-filter: blur(10px);
    background: rgba(var(--white-rgb), 0.98);
    transition: all 0.3s ease;
}

.card:hover {
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.08);
    border-color: rgba(var(--primary-rgb), 0.28);
}

.card-body {
    background: transparent;
}

.home-link {
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.home-link:hover {
    color: var(--primary) !important;
}

.card-title {
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.5px;
}

.form-control:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.25rem rgba(var(--primary-rgb), 0.15);
    transform: translateY(-1px);
}

.form-label {
    font-weight: 600;
    color: var(--dark);
    margin-bottom: 0.5rem;
}

.btn-primary {
    background-color: var(--primary);
    border-color: var(--primary);
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.2s ease;
    padding: 0.875rem 1.5rem;
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--accent);
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.3);
}

.btn-outline-primary {
    border-color: var(--primary);
    color: var(--primary);
    background-color: transparent;
    border-width: 2px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.2s ease;
    padding: 0.875rem 1.5rem;
}

.btn-outline-primary:hover {
    background-color: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.25);
}

.alert {
    border-radius: 12px;
    border: none;
    background: rgba(var(--danger-rgb), 0.1);
    color: var(--danger);
}

@media (max-width: 768px) {
    .login-container {
        padding: 1rem;
    }
    
    .card-body {
        padding: 2rem 1.5rem !important;
    }
}
</style>