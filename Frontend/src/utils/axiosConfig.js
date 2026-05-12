import axios from 'axios'

// Pre-configured axios instance used by all components.
// withCredentials: true — automatically sends the HttpOnly cookie with every request.
// X-Requested-With: XMLHttpRequest — custom header that triggers CORS preflight,
//   preventing cross-origin CSRF attacks since malicious sites cannot set custom headers.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
})

export default api
