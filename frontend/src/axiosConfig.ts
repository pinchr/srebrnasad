import axios, { AxiosInstance } from 'axios'

// Get the backend URL
const getBackendUrl = (): string => {
  // Always use relative paths - vite proxy handles localhost/127.0.0.1
  // and for production/ngrok, frontend and backend APIs are on same domain
  return ''
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
