const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export default {
    backend: {
        api: isLocalhost ? "http://localhost:8080" : "https://hortoconnect-backend.onrender.com"
    },
}