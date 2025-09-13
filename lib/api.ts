import apiClient, { setToken } from './axios-config'

export interface DatabaseConnectionResponse {
  token: string
  monitoringEnabled: boolean
  dbName: string
  username: string
}

// Database connection function
export const connectToDatabase = async (connectionData: any): Promise<DatabaseConnectionResponse> => {
  try {
    const response = await apiClient.post('/db/connect-db', connectionData)
    
    // Store the token for future API calls
    if (response.data.token) {
      setToken(response.data.token)
    }
    
    return response.data
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to connect to database')
  }
}

// Generic API functions using Axios instance
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get(url, config)
    return response.data
  },

  // POST request
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post(url, data, config)
    return response.data
  },

  // PUT request
  put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put(url, data, config)
    return response.data
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.patch(url, data, config)
    return response.data
  },

  // DELETE request
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete(url, config)
    return response.data
  },
}

// Re-export token utilities for convenience
export { getToken, setToken, removeToken, isTokenExpired } from './axios-config'
