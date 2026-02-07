<template>
    <div class="container-fluid h-100 d-flex align-items-center justify-content-center signup-container">
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
                            <h2 class="card-title mb-2 fw-bold">Create account</h2>
                            <p class="text-muted mb-0">Sign up to get started</p>
                        </div>

                        <form @submit.prevent="handleSignUp" class="d-flex flex-column gap-3">
                            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                                <AlertTriangle class="me-2" :size="18" />
                                <span>{{ errorMessage }}</span>
                            </div>

                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <User class="me-2" :size="18" />Full name <Required />
                                </label>
                                <input 
                                    type="text" 
                                    class="form-control form-control-lg" 
                                    v-model="name"
                                    placeholder="Enter your full name"
                                    required
                                    :disabled="loading"
                                />  
                            </div>
                    
                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Mail class="me-2" :size="18" />Email <Required />
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
                                    <Lock class="me-2" :size="18" />Password <Required />
                                </label>
                                <input 
                                    type="password" 
                                    class="form-control form-control-lg" 
                                    v-model="password"
                                    placeholder="At least 6 characters"
                                    required
                                    minlength="6"
                                    :disabled="loading"
                                />
                            </div>

                            <div>
                                <label class="form-label fw-semibold d-flex align-items-center">
                                    <Lock class="me-2" :size="18" />Confirm password <Required />
                                </label>
                                <input 
                                    type="password" 
                                    class="form-control form-control-lg" 
                                    v-model="confirmPassword"
                                    placeholder="Confirm your password"
                                    required
                                    minlength="6"
                                    :disabled="loading"
                                />
                            </div>

                            <div class="mt-2">
                                <WButton 
                                    type="submit" 
                                    class="btn-primary w-100"
                                    :loading="loading"
                                    :disabled="loading"
                                >
                                    {{ loading ? 'Creating account…' : 'Sign up' }}
                                </WButton>
                            </div>
                        </form>

                        <div class="text-center mt-4 pt-3 border-top">
                            <p class="text-muted mb-2">
                                Already have an account?
                            </p>
                            <button 
                                class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                                @click="router.push('/login')"
                            >
                                <LogIn class="me-2" :size="18" />Sign in
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
import { useRouter, useRoute } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../../firebase.js'
import { AlertTriangle, User, Mail, Lock, LogIn, Home } from 'lucide-vue-next'
import WButton from '../../utils/WButton.vue'
import Required from '../../utils/Required.vue'
import config from '../../../config.js'

export default {
    components: {
        WButton,
        Required,
        AlertTriangle,
        User,
        Mail,
        Lock,
        LogIn
    },
    setup() {
        const name = ref('')
        const email = ref('')
        const password = ref('')
        const confirmPassword = ref('')
        const errorMessage = ref('')
        const loading = ref(false)
        const router = useRouter()
        const route = useRoute()

        const handleSignUp = async () => {
            errorMessage.value = ''
            loading.value = true

            try {
                // Validate password match
                if (password.value !== confirmPassword.value) {
                    errorMessage.value = 'Passwords do not match.'
                    loading.value = false
                    return
                }

                // Validate password length
                if (password.value.length < 6) {
                    errorMessage.value = 'Password must be at least 6 characters.'
                    loading.value = false
                    return
                }

                // Send signup request to backend
                const response = await fetch(`${config.backend.api}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name.value,
                        email: email.value,
                        password: password.value
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    errorMessage.value = data.error || 'Account creation failed. Please try again.'
                    return
                }

                // After successful signup, sign in the user on the frontend
                try {
                    await signInWithEmailAndPassword(auth, email.value, password.value)
                    // Sign in successful, redirect to role selection (optionally pre-selected)
                    const role = route.query.role
                    if (role) {
                        router.push({ path: '/select-role', query: { role } })
                    } else {
                        router.push('/select-role')
                    }
                } catch (authError) {
                    // If sign in fails, still redirect but user might need to login manually
                    console.error('Auto sign-in error:', authError)
                    errorMessage.value = 'Account created, but we could not sign you in automatically. Please sign in.'
                    // Still redirect to login after a short delay
                    setTimeout(() => {
                        router.push('/login')
                    }, 2000)
                }
            } catch (error) {
                errorMessage.value = 'Connection error. Please try again.'
                console.error('Signup error:', error)
            } finally {
                loading.value = false
            }
        }

        return {
            name,
            email,
            password,
            confirmPassword,
            errorMessage,
            loading,
            router,
            handleSignUp
        }
    }
}
</script>

<style scoped>
.signup-container {
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
    .signup-container {
        padding: 1rem;
    }
    
    .card-body {
        padding: 2rem 1.5rem !important;
    }
}
</style>
