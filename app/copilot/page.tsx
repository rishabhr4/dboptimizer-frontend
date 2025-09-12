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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

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
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (message?: string) => {
    const messageText = message || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userMessage: string): { content: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("slow") || lowerMessage.includes("performance")) {
      return {
        content: `I can help you identify and fix slow queries! Here are the most common causes and solutions:

**Top 3 Performance Issues I'm Seeing:**

1. **Missing Indexes** - Your users table scan is taking 1.2s
   - Add: \`CREATE INDEX idx_users_created_at ON users (created_at);\`
   - Expected improvement: 85% faster

2. **Inefficient JOINs** - Posts table lacks composite index  
   - Add: \`CREATE INDEX idx_posts_user_status ON posts (user_id, status);\`
   - Expected improvement: 70% faster

3. **Large Result Sets** - Consider pagination for queries returning >1000 rows

**Quick Wins:**
- Enable query caching for repeated dashboard queries
- Use EXPLAIN ANALYZE to identify bottlenecks
- Consider read replicas for reporting queries

Would you like me to analyze a specific slow query?`,
        suggestions: [
          "Analyze my JOIN query",
          "Show me index recommendations",
          "How do I use EXPLAIN ANALYZE?",
          "What about query caching?",
        ],
      }
    }

    if (lowerMessage.includes("index") || lowerMessage.includes("indexes")) {
      return {
        content: `Great question! Here are my index recommendations based on your current query patterns:

**High Priority Indexes:**
\`\`\`sql
-- For user lookups by creation date
CREATE INDEX idx_users_created_at ON users (created_at);

-- For post filtering and joins  
CREATE INDEX idx_posts_user_status ON posts (user_id, status);

-- For comment aggregations
CREATE INDEX idx_comments_post_id ON comments (post_id);
\`\`\`

**Index Strategy Tips:**
• Put most selective columns first in composite indexes
• Avoid over-indexing (impacts INSERT/UPDATE performance)
• Monitor index usage with pg_stat_user_indexes
• Consider partial indexes for filtered queries

**Expected Impact:**
- Dashboard load time: 2.3s → 0.4s  
- User query performance: 85% improvement
- Overall database efficiency: +60%

Want me to explain how any of these indexes work?`,
        suggestions: [
          "Explain composite indexes",
          "How do I monitor index usage?",
          "What about partial indexes?",
          "Show me more optimization tips",
        ],
      }
    }

    if (lowerMessage.includes("join") || lowerMessage.includes("joins")) {
      return {
        content: `JOIN performance issues are very common! Let me help you optimize them:

**Your Current JOIN Issues:**
1. **Hash Join on large tables** - users ⋈ posts taking 800ms
2. **Missing foreign key indexes** - posts.user_id needs indexing  
3. **Wrong join order** - Filter early, join late

**Optimization Strategy:**
\`\`\`sql
-- Before: Slow nested loops
SELECT u.name, p.title 
FROM users u 
JOIN posts p ON u.id = p.user_id 
WHERE u.created_at > '2024-01-01';

-- After: Optimized with proper indexing
SELECT u.name, p.title 
FROM users u 
JOIN posts p ON u.id = p.user_id 
WHERE u.created_at > '2024-01-01'
-- Indexes: users(created_at), posts(user_id)
\`\`\`

**JOIN Performance Tips:**
• Index all foreign key columns
• Filter before joining when possible  
• Use EXISTS instead of IN for large subqueries
• Consider denormalization for frequently joined data

Performance gain expected: 75% faster execution!`,
        suggestions: [
          "Show me EXISTS vs IN examples",
          "How do I optimize subqueries?",
          "What about LEFT JOIN performance?",
          "Explain denormalization strategies",
        ],
      }
    }

    // Default response
    return {
      content: `I'd be happy to help with that! As your database performance copilot, I can assist with:

**Query Optimization:**
- Analyzing execution plans
- Suggesting better query structures  
- Index recommendations

**Performance Monitoring:**
- Identifying bottlenecks
- Setting up alerts
- Tracking query performance over time

**Best Practices:**
- Schema design recommendations
- Caching strategies
- Scaling considerations

Could you share more details about what specific database performance challenge you're facing? For example, you could paste a slow query or describe what's running slowly.`,
      suggestions: [
        "I have a slow query to analyze",
        "My dashboard is loading slowly",
        "Help me understand execution plans",
        "What indexes should I add?",
      ],
    }
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Queries Analyzed</p>
                    <p className="font-semibold">1,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Improvement</p>
                    <p className="font-semibold">73%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Recommendations</p>
                    <p className="font-semibold">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Ask questions about database performance and optimization</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
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
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-6 px-2 text-xs"
                              onClick={() => copyToClipboard(message.content)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          )}
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
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about database performance, slow queries, indexes..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                  />
                  <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
