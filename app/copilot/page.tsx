"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Copy, Lightbulb, Database, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAIChat, type Message } from "@/hooks/use-ai-chat"

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: `Hello! I'm your database performance copilot. I can help you with:

• Analyzing slow queries and suggesting optimizations
• Recommending indexes for better performance  
• Explaining execution plans in simple terms
• Identifying bottlenecks in your database schema
• Best practices for query optimization

What would you like to know about your database performance?`,
    timestamp: new Date(),
    suggestions: [
      "How do I speed up my dashboard queries?",
      "What indexes should I add?",
      "Explain this execution plan",
      "Why is my JOIN query slow?",
    ],
  },
]

export default function CopilotPage() {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  // Use the custom AI chat hook
  const { messages, isStreaming, sendMessage, initializeChat } = useAIChat()

  // Initialize chat with welcome message
  useEffect(() => {
    initializeChat(initialMessages)
  }, [initializeChat])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (message?: string) => {
    const messageText = message || input.trim()
    if (!messageText || isStreaming) return

    setInput("")
    await sendMessage(messageText)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Message content copied successfully",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Bot className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-balance">Database Performance Copilot</h1>
            <p className="text-muted-foreground text-pretty">
              Get AI-powered insights and recommendations for optimizing your database performance
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Ask questions about database performance and optimization</CardDescription>
            </CardHeader>
            
            {/* Messages - Scrollable Area */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => {
                    // Don't render the currently streaming message if it's empty
                    if (isStreaming && message.id === messages[messages.length - 1]?.id && message.role === "assistant" && !message.content.trim()) {
                      return null;
                    }
                    
                    return (
                    <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {message.role === "assistant" && !(isStreaming && message.id === messages[messages.length - 1]?.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mb-2 h-6 px-2 text-xs float-right"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          )}
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        </div>
                        {message.suggestions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleSend(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    )
                  })}
                    {isStreaming && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Input - Fixed at bottom */}
            <div className="flex-shrink-0 border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about database performance, slow queries, indexes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={isStreaming}
                />
                <Button onClick={() => handleSend()} disabled={!input.trim() || isStreaming}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}