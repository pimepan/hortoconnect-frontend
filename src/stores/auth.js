import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'
import config from '../config.js'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        userProfile: null,
        loading: true
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        hasContractorRole: (state) => {
            return state.userProfile && state.userProfile.roles && state.userProfile.roles.includes('contractor')
        },
        hasBidPosterRole: (state) => {
            return state.userProfile && state.userProfile.roles && state.userProfile.roles.includes('bid_poster')
        },
        hasBuyerRole: (state) => {
            return state.userProfile && state.userProfile.roles && state.userProfile.roles.includes('bid_poster')
        },
        hasBrokerageRole: (state) => {
            return state.userProfile && state.userProfile.roles && state.userProfile.roles.includes('brokerage')
        },
        currentUserType: (state) => state.userProfile?.userType || null
    },

    actions: {
        async initializeAuth() {
            // Wait for Firebase to restore the session from persistence (or confirm no user)
            // so we don't mount the app and run router guards with a false null user.
            return new Promise((resolve) => {
                let resolved = false
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    this.user = firebaseUser
                    this.loading = false
                    if (firebaseUser) {
                        await this.fetchUserProfile()
                    } else {
                        this.userProfile = null
                    }
                    if (!resolved) {
                        resolved = true
                        resolve()
                    }
                })
            })
        },

        async getAuthToken() {
            if (this.user) {
                return await this.user.getIdToken()
            }
            
            // Wait for auth state if not ready
            return new Promise((resolve, reject) => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    unsubscribe()
                    if (user) {
                        user.getIdToken().then(resolve).catch(reject)
                    } else {
                        reject(new Error('User not authenticated'))
                    }
                })
            })
        },

        async fetchUserProfile() {
            try {
                const token = await this.getAuthToken()
                if (!token) return

                const response = await fetch(`${config.backend.api}/api/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    this.userProfile = data.profile
                } else {
                    this.userProfile = null
                }
            } catch (error) {
                console.error('Error fetching user profile:', error)
                this.userProfile = null
            }
        },

        async logout() {
            const { signOut } = await import('firebase/auth')
            await signOut(auth)
            this.user = null
            this.userProfile = null
        },

        setUser(user) {
            this.user = user
        },

        setUserProfile(profile) {
            this.userProfile = profile
        }
    },

    persist: {
        key: 'auth-store',
        storage: localStorage,
        paths: ['userProfile'] // Only persist userProfile, user is handled by Firebase auth persistence
    }
})

