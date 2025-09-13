'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { getToken } from '@/lib/axios-config'

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

interface AIQueryParams {
  prompt: string
  system?: string
  model?: string
}

interface AIOptimizeParams {
  query: string
  schema?: string
}

// Interface for analyze-query response (structured data from backend)
interface AnalyzeQueryResponse {
  success: boolean
  generalDescription: string
  recommendedIndexes: Array<{
    table: string
    columns: string
    priority: string
    description: string
    sqlStatement: string
  }>
  optimizedQuery: {
    description: string
    sqlStatement: string
  }
}

// Hook for general AI queries (streaming)
export function useAIQuery() {
  return useMutation<string, Error, AIQueryParams>({
    mutationFn: async ({ prompt, system, model }) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

      try {
        // Get JWT token for authentication
        const token = getToken()
        
        if (!token) {
          throw new Error('Authentication required. Please log in.')
        }

        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/ai/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            prompt,
            system,
            model: model || "gemini-2.5-pro"
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          } else if (response.status === 403) {
            throw new Error('Access denied. Invalid token.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        reader = response.body?.getReader() || null
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let fullResponse = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.text) {
                    fullResponse += data.text
                  }
                } catch (e) {
                  // Handle non-JSON data (like ping messages)
                }
              } else if (line.startsWith('event: done')) {
                return fullResponse
              } else if (line.startsWith('event: error')) {
                const errorData = JSON.parse(lines[lines.indexOf(line) + 1]?.slice(6) || '{}')
                throw new Error(errorData.message || 'Unknown error')
              }
            }
          }
        } finally {
          reader?.releaseLock()
        }

        return fullResponse
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw error
      } finally {
        clearTimeout(timeoutId)
        if (reader) {
          try {
            reader.releaseLock()
          } catch (e) {
            // Reader already released
          }
        }
      }
    },
  })
}

// Hook for query optimization (streaming)
export function useQueryOptimization() {
  return useMutation<string, Error, AIOptimizeParams>({
    mutationFn: async ({ query, schema }) => {
      const systemPrompt = `You are a database performance expert. Analyze the provided SQL query and suggest optimizations. Consider:
      1. Index recommendations
      2. Query structure improvements
      3. Performance bottlenecks
      4. Best practices
      
      ${schema ? `Database schema context: ${schema}` : ''}
      
      Provide specific, actionable recommendations with explanations.`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

      try {
        // Get JWT token for authentication
        const token = getToken()
        
        if (!token) {
          throw new Error('Authentication required. Please log in.')
        }

        const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/ai/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            prompt: `Please analyze and optimize this SQL query:\n\n${query}`,
            system: systemPrompt,
            model: "gemini-2.5-pro"
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          } else if (response.status === 403) {
            throw new Error('Access denied. Invalid token.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        reader = response.body?.getReader() || null
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''
        let fullResponse = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.text) {
                    fullResponse += data.text
                  }
                } catch (e) {
                  // Handle non-JSON data (like ping messages)
                }
              } else if (line.startsWith('event: done')) {
                return fullResponse
              } else if (line.startsWith('event: error')) {
                const errorData = JSON.parse(lines[lines.indexOf(line) + 1]?.slice(6) || '{}')
                throw new Error(errorData.message || 'Unknown error')
              }
            }
          }
        } finally {
          reader?.releaseLock()
        }

        return fullResponse
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.')
        }
        throw error
      } finally {
        clearTimeout(timeoutId)
        if (reader) {
          try {
            reader.releaseLock()
          } catch (e) {
            // Reader already released
          }
        }
      }
    },
  })
}

// NEW: Hook specifically for the /analyze-query endpoint (structured response)
export function useAnalyzeQuery() {
  return useMutation<AnalyzeQueryResponse, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const token = getToken()
      
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      console.log("📡 Making authenticated request to /analyze-query with ID:", id);

      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/ai/analyze-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      })

      console.log("📥 Analyze query response:", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        } else if (response.status === 403) {
          throw new Error('Access denied. Invalid token.')
        } else if (response.status === 400) {
          throw new Error('Invalid query ID provided.')
        } else if (response.status === 404) {
          throw new Error('Query not found.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("📊 Analysis result:", data);
      
      return data
    }
  })
}