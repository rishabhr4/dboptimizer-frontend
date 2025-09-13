import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Hook for authenticated mutations
export const useAuthenticatedMutation = <TData = any, TVariables = any>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
  }
) => {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables: TVariables) => {
      const method = options?.method || 'POST'
      
      switch (method) {
        case 'GET':
          return api.get<TData>(endpoint, variables)
        case 'POST':
          return api.post<TData>(endpoint, variables)
        case 'PUT':
          return api.put<TData>(endpoint, variables)
        case 'PATCH':
          return api.patch<TData>(endpoint, variables)
        case 'DELETE':
          return api.delete<TData>(endpoint, variables)
        default:
          return api.post<TData>(endpoint, variables)
      }
    },
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// Hook for authenticated queries
export const useAuthenticatedQuery = <TData = any>(
  endpoint: string,
  options?: {
    enabled?: boolean
    staleTime?: number
    refetchOnWindowFocus?: boolean
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    params?: any
    data?: any
  }
) => {
  return useQuery<TData, Error>({
    queryKey: [endpoint, options?.params, options?.data],
    queryFn: () => {
      const method = options?.method || 'GET'
      
      switch (method) {
        case 'GET':
          return api.get<TData>(endpoint, { params: options?.params })
        case 'POST':
          return api.post<TData>(endpoint, options?.data || {})
        case 'PUT':
          return api.put<TData>(endpoint, options?.data || {})
        case 'PATCH':
          return api.patch<TData>(endpoint, options?.data || {})
        case 'DELETE':
          return api.delete<TData>(endpoint, { params: options?.params })
        default:
          return api.get<TData>(endpoint, { params: options?.params })
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })
}
