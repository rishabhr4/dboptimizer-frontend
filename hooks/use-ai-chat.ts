'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface StreamChatParams {
  prompt: string
  system?: string
  history?: Array<{
    role: string
    parts: Array<{ text: string }>
  }>
  model?: string
}

interface StreamChatResponse {
  success: boolean
  message?: string
  error?: string
}

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

// Custom hook for streaming AI chat
export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const { toast } = useToast()

  const streamChatMutation = useMutation<StreamChatResponse, Error, StreamChatParams>({
    mutationFn: async ({ prompt, system, history, model }) => {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          system,
          history,
          model: model || "gemini-2.5-pro"
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      return { success: true }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      })
      setIsStreaming(false)
    },
  })

  const sendMessage = useCallback(async (
    messageText: string,
    systemPrompt?: string
  ) => {
    console.log("🚀 sendMessage called with:", messageText, systemPrompt);
    if (!messageText.trim()) return

    // Allow queuing messages even while streaming
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    console.log("📝 Adding user message:", userMessage);
    setMessages((prev) => [...prev, userMessage])
    
    // Wait for any current streaming to complete
    if (isStreaming) {
      console.log("⚠️ Already streaming, showing toast");
      toast({
        title: "Please wait",
        description: "Please wait for the current response to complete before asking another question.",
        variant: "default"
      })
      return
    }
    
    console.log("🔄 Setting streaming to true");
    setIsStreaming(true)

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

    try {
      // Convert messages to history format for the API
      const history = messages
        .filter(msg => msg.role !== "assistant" || !msg.suggestions) // Exclude initial message with suggestions
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }))

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      console.log("📡 Making fetch request to:", `${NEXT_PUBLIC_BACKEND_URL}/ai/stream`);
      console.log("📤 Request body:", {
        prompt: messageText,
        system: systemPrompt || `You are a database performance expert and copilot. Help users optimize their database queries, suggest indexes, explain execution plans, and provide best practices for database performance. Be specific, actionable, and include code examples when relevant.`,
        history: history,
        model: "gemini-2.5-pro"
      });

      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageText,
          system: systemPrompt || `You are a database performance expert and copilot. Help users optimize their database queries, suggest indexes, explain execution plans, and provide best practices for database performance. Be specific, actionable, and include code examples when relevant.`,
          history: history,
          model: "gemini-2.5-pro"
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      console.log("📥 Response received:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      reader = response.body?.getReader() || null
      if (!reader) {
        throw new Error('No response body')
      }

      console.log("📖 Starting to read stream");
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      console.log("🤖 Adding assistant message:", assistantMessage);
      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("✅ Stream reading completed");
            break;
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            console.log("📄 Processing line:", line);
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log("📦 Parsed data:", data);
                if (data.text) {
                  console.log("✏️ Updating message with text:", data.text);
                  setMessages((prev) => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: msg.content + data.text }
                        : msg
                    )
                  )
                }
              } catch (e) {
                console.log("⚠️ Failed to parse JSON:", e);
                // Handle non-JSON data (like ping messages)
              }
            } else if (line.startsWith('event: done')) {
              console.log("🏁 Stream completed event received");
              // Stream completed
              break
            } else if (line.startsWith('event: error')) {
              const errorData = JSON.parse(lines[lines.indexOf(line) + 1]?.slice(6) || '{}')
              throw new Error(errorData.message || 'Unknown error')
            }
          }
        }
      } finally {
        // Always close the reader
        reader?.releaseLock()
      }

    } catch (error) {
      console.error('❌ Error in sendMessage:', error)
      
      let errorMessage = "Failed to get AI response"
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message
        }
      }
      
      console.log("🚨 Showing error toast:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      // Add error message to chat
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      console.log("💬 Adding error message to chat:", errorMsg);
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      // Always clean up
      if (reader) {
        try {
          reader.releaseLock()
        } catch (e) {
          // Reader already released
        }
      }
      console.log("🔄 Setting streaming to false");
      setIsStreaming(false)
    }
  }, [messages, isStreaming, toast])

  const initializeChat = useCallback((initialMessages: Message[]) => {
    setMessages(initialMessages)
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    initializeChat,
    clearChat,
    isLoading: streamChatMutation.isPending
  }
}
