'use client'

import { useMutation, useQuery } from '@tanstack/react-query'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

interface AIQueryParams {
  prompt: string
  system?: string
  model?: string
}

interface AIOptimizeParams {
  query: string
  schema?: string
}

// Hook for general AI queries (non-streaming)
export function useAIQuery() {
  return useMutation<string, Error, AIQueryParams>({
    mutationFn: async ({ prompt, system, model }) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

      try {
        const response = await fetch(`${BACKEND_URL}/ai/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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

// Hook for query optimization
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
        const response = await fetch(`${BACKEND_URL}/ai/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
