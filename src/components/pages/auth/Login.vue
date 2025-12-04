<template>
    <div class="container h-100">
        <div class="row h-100 justify-content-center align-items-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <form @submit.prevent="handleSignIn" class="d-flex flex-column gap-3">
                            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                                {{ errorMessage }}
                            </div>
                            <div>
                                <label class="form-label">e-mail</label>
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    v-model="email"
                                    required
                                />  
                            </div>
                    
                            <div>
                                <label class="form-label">password</label>
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    v-model="password"
                                    required
                                />
                            </div>
                            <div class="col-12">
                                <WButton 
                                    type="submit" 
                                    class="btn-primary"
                                    :disabled="loading"
                                >
                                    {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                                </WButton>

                            </div>    
                        
                        </form>
                        
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
import { useRouter } from 'vue-router'
import WButton from '../../utils/WButton.vue'

export default {
    components: {
        WButton
    },
    setup() {
        const email = ref('')
        const password = ref('')
        const errorMessage = ref('')
        const loading = ref(false)
        const router = useRouter()

        const handleSignIn = async () => {
            errorMessage.value = ''
            loading.value = true

            try {
                await signInWithEmailAndPassword(auth, email.value, password.value)
                // Sign in successful, redirect to dashboard or home
                router.push('/dashboard')
            } catch (error) {
                // Handle errors
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage.value = 'El correo electrónico no es válido.'
                        break
                    case 'auth/user-disabled':
                        errorMessage.value = 'Esta cuenta ha sido deshabilitada.'
                        break
                    case 'auth/user-not-found':
                        errorMessage.value = 'No existe una cuenta con este correo electrónico.'
                        break
                    case 'auth/wrong-password':
                        errorMessage.value = 'La contraseña es incorrecta.'
                        break
                    case 'auth/invalid-credential':
                        errorMessage.value = 'Las credenciales son incorrectas.'
                        break
                    default:
                        errorMessage.value = 'Error al iniciar sesión. Por favor, intenta de nuevo.'
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
            handleSignIn
        }
    }
}
</script>

<style>

</style>