import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // send/receive connect.sid cookie
  headers: { 'Content-Type': 'application/json' }
})

// if the server returns 401, broadcast so the app can redirect to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status
    if (status === 401) window.dispatchEvent(new Event('hostly:unauth'))
    return Promise.reject(err)
  }
)

export default api
