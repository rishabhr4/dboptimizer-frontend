"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Database,
  TrendingUp,
  Copy,
  Lightbulb,
  Play,
  CheckCircle,
  AlertTriangle,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAnalyzeQuery } from "@/hooks/use-ai-query"

// Mock data for the query analysis
const mockQueryData = {
  id: 1,
  query: `SELECT u.id, u.name, u.email, p.title, p.content, p.created_at, 
    COUNT(c.id) as comment_count, AVG(r.rating) as avg_rating
FROM users u 
JOIN posts p ON u.id = p.user_id 
LEFT JOIN comments c ON p.id = c.post_id 
LEFT JOIN ratings r ON p.id = r.post_id 
WHERE u.created_at > '2024-01-01' 
  AND p.status = 'published'
GROUP BY u.id, p.id 
ORDER BY p.created_at DESC 
LIMIT 50`,
  avgTime: 1250,
  avgLatency: 1250,
  frequency: 45,
  rowsScanned: 125000,
  lastRun: "2 minutes ago",
  severity: "high" as const,
}

// AI Response Mock Data - matching the exact structure that will come from backend
const mockAIResponse = {
  success: true,
  generalDescription: "Based on your query analysis, here are my recommendations:\n\n1. **Critical Index Missing**: The query is performing sequential scans on the users table. Adding an index on users.created_at will dramatically improve performance.\n\n2. **Join Order Optimization**: Moving the status filter into the JOIN condition will reduce the working set size earlier in the execution.\n\n3. **Aggregation Efficiency**: Including all selected columns in the GROUP BY clause will prevent potential issues and improve clarity.\n\n4. **Expected Performance Gain**: With the recommended indexes, this query should see a 85-90% reduction in execution time, from ~1250ms to ~150ms.\n\n5. **Monitoring Recommendation**: Set up alerts for queries exceeding 500ms execution time to catch performance regressions early.",
  
  recommendedIndexes: [
    {
      table: "users",
      columns: "created_at",
      priority: "High",
      description: "Eliminates sequential scan on users table",
      sqlStatement: "CREATE INDEX idx_users_created_at ON users (created_at);"
    },
    {
      table: "posts",
      columns: "user_id, status", 
      priority: "High",
      description: "Enables efficient join and filtering",
      sqlStatement: "CREATE INDEX idx_posts_user_status ON posts (user_id, status);"
    },
    {
      table: "comments",
      columns: "post_id",
      priority: "Medium", 
      description: "Improves left join performance",
      sqlStatement: "CREATE INDEX idx_comments_post_id ON comments (post_id);"
    }
  ],
  
  optimizedQuery: {
    description: "Optimized version with better join order and filtering",
    sqlStatement: "SELECT u.id, u.name, u.email, p.title, p.content, p.created_at, COUNT(c.id) as comment_count, AVG(r.rating) as avg_rating FROM users u INNER JOIN posts p ON u.id = p.user_id AND p.status = 'published' LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN ratings r ON p.id = r.post_id WHERE u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email, p.title, p.content, p.created_at ORDER BY p.created_at DESC"
  }
}

// Define the expected API response type to match your backend
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

export default function QueryAnalysisPage({ params }: { params: { id: string } }) {
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeQueryResponse | null>(null)
  const [simulationResult, setSimulationResult] = useState<string>("")
  const { toast } = useToast()
  
  // Use the existing analyze query hook
  const analyzeQueryMutation = useAnalyzeQuery()
  
  // Get selected query from Redux store
  const { selectedQuery, queries } = useAppSelector(state => state.query)
  
  // Find query by ID if selectedQuery is not available (direct URL access)
  const currentQuery = selectedQuery || queries.find(q => q.id === parseInt(params.id))
  
  // Use currentQuery data or fallback to mock data if no query found
  const queryData = currentQuery || mockQueryData

  const handleAskAI = async () => {
    try {
      console.log("🚀 Starting AI analysis for query ID:", params.id)
      
      const result = await analyzeQueryMutation.mutateAsync({ id: params.id })
      
      console.log("📊 AI Analysis result:", result)
      
      if (result.success) {
        setAiAnalysisResult(result)
        toast({
          title: "AI Analysis Complete",
          description: "Query optimization recommendations generated successfully",
        })
      } else {
        throw new Error('Analysis failed - success flag is false')
      }
    } catch (error: any) {
      console.error('❌ AI Analysis Error:', error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze query. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSimulateIndex = () => {
    const currentTime = queryData.avgLatency || queryData.avgTime || 1250
    const improvedTime = Math.round(currentTime * 0.13) // 87% improvement
    setSimulationResult(`Simulation complete! Expected performance improvement: 87% faster execution (${currentTime}ms → ${improvedTime}ms)`)
    toast({
      title: "Index Simulation Complete",
      description: "Expected 87% performance improvement with recommended indexes",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "SQL has been copied to your clipboard",
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Update the loading state to use the mutation's pending state
  const isLoadingAI = analyzeQueryMutation.isPending

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/queries">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queries
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">Query Analysis</h1>
            <p className="text-muted-foreground">Detailed performance analysis and optimization recommendations</p>
          </div>
        </div>

        {/* Query Info Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Query Information</CardTitle>
              <Badge className={getSeverityColor(queryData.severity)}>{queryData.severity} priority</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="font-semibold">{queryData.avgLatency || queryData.avgTime}ms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{queryData.frequency}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Rows Scanned</p>
                  <p className="font-semibold">{queryData.rowsScanned?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Run</p>
                  <p className="font-semibold">{queryData.lastRun || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Full Query Text</h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(queryData.query)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap">{queryData.query}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Optimization Recommendations
            </CardTitle>
            <CardDescription>Get AI-powered insights for query optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!aiAnalysisResult ? (
              <Button onClick={handleAskAI} disabled={isLoadingAI} className="w-full">
                {isLoadingAI ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-pulse" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Ask AI for Optimization
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-6">
                {/* General Description */}
                {aiAnalysisResult.generalDescription && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI Analysis Summary
                    </h3>
                    <pre className="text-sm whitespace-pre-wrap">{aiAnalysisResult.generalDescription}</pre>
                  </div>
                )}

                <Separator />

                {/* Recommended Indexes */}
                {aiAnalysisResult.recommendedIndexes && aiAnalysisResult.recommendedIndexes.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Recommended Indexes ({aiAnalysisResult.recommendedIndexes.length})</h3>
                    <div className="space-y-3">
                      {aiAnalysisResult.recommendedIndexes.map((index, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge className={getPriorityColor(index.priority)} variant="secondary">
                                {index.priority}
                              </Badge>
                              <div>
                                <p className="font-medium">
                                  {index.table} ({index.columns})
                                </p>
                                <p className="text-sm text-muted-foreground">{index.description}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(index.sqlStatement)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy SQL
                            </Button>
                          </div>
                          <div className="bg-muted p-2 rounded text-sm font-mono">{index.sqlStatement}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Optimized Query */}
                {aiAnalysisResult.optimizedQuery && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Optimized Query</h3>
                        <p className="text-sm text-muted-foreground">{aiAnalysisResult.optimizedQuery.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(aiAnalysisResult.optimizedQuery.sqlStatement)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy SQL
                      </Button>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{aiAnalysisResult.optimizedQuery.sqlStatement}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Query Replay Sandbox */}
        <Card>
          <CardHeader>
            <CardTitle>Query Replay Sandbox</CardTitle>
            <CardDescription>Test optimizations before applying to production</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={handleSimulateIndex} 
                variant="outline" 
                disabled={!aiAnalysisResult || !aiAnalysisResult.recommendedIndexes?.length}
              >
                <Play className="mr-2 h-4 w-4" />
                Simulate Recommended Indexes
              </Button>
              <Button 
                variant="outline" 
                disabled={!aiAnalysisResult || !aiAnalysisResult.optimizedQuery}
              >
                <Play className="mr-2 h-4 w-4" />
                Test Optimized Query
              </Button>
            </div>

            {simulationResult && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">{simulationResult}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}