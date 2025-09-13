import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

// Token management utilities
export const TOKEN_KEY = 'db_optimizer_token'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error getting token from localStorage:', error)
    return null
  }
}

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Error setting token in localStorage:', error)
  }
}

export const removeToken = (): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error removing token from localStorage:', error)
  }
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiry:', error)
    return true
  }
}

// Logout function that removes token and redirects to home
export const logout = (): void => {
  removeToken()
  // Redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to automatically attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        removeToken()
        throw new Error('Authentication token has expired')
      }
      
      // Attach token to Authorization header
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      logout()
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
