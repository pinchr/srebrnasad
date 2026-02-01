import axios, { AxiosInstance } from 'axios'

// Get the backend URL
const getBackendUrl = (): string => {
  // If on ngrok, use full backend URL (same domain as frontend)
  // Otherwise use /api prefix - vite proxy will handle routing to localhost:8000
  const hostname = window.location.hostname
  
  if (hostname.includes('ngrok')) {
    // On ngrok: API is on same domain, just different path
    // ngrok only proxies the frontend, so we route /api to the backend via same ngrok tunnel
    return '/api'
  }
  
  // On localhost: vite proxy handles /api → localhost:8000
  return '/api'
}

const backendUrl = getBackendUrl()

console.log('[Axios Config]', {
  hostname: window.location.hostname,
  backendUrl: backendUrl || '(using relative paths)',
  frontendUrl: window.location.href
})

// Create axios instance with proper base URL
export const apiClient: AxiosInstance = axios.create({
  baseURL: backendUrl || '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Log all requests in development
apiClient.interceptors.request.use(config => {
  const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url
  console.log('[API Request]', config.method?.toUpperCase(), fullUrl)
  return config
})

// Log all responses
apiClient.interceptors.response.use(
  response => {
    console.log('[API Response]', response.status, response.config.url)
    return response
  },
  error => {
    console.error('[API Error]', error.response?.status, error.config?.url, error.message)
    return Promise.reject(error)
  }
)

export default apiClient
