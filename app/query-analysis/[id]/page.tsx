"use client"

import { useState } from "react"
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
  avgLatency: 1250,
  frequency: 45,
  rowsScanned: 125000,
  lastRun: "2 minutes ago",
  severity: "high",
}

const mockExecutionPlan = {
  original: `Limit  (cost=15234.45..15234.57 rows=50 width=128)
  ->  Sort  (cost=15234.45..15284.67 rows=20089 width=128)
        Sort Key: p.created_at DESC
        ->  HashAggregate  (cost=14234.12..14434.01 rows=20089 width=128)
              Group Key: u.id, p.id
              ->  Hash Left Join  (cost=8234.45..13234.56 rows=100000 width=96)
                    Hash Cond: (p.id = r.post_id)
                    ->  Hash Left Join  (cost=4234.12..8234.45 rows=100000 width=88)
                          Hash Cond: (p.id = c.post_id)
                          ->  Hash Join  (cost=1234.45..3234.56 rows=50000 width=80)
                                Hash Cond: (u.id = p.user_id)
                                ->  Seq Scan on users u  (cost=0.00..1234.45 rows=25000 width=40)
                                      Filter: (created_at > '2024-01-01'::date)
                                ->  Hash  (cost=1000.00..1000.00 rows=18750 width=48)
                                      ->  Seq Scan on posts p  (cost=0.00..1000.00 rows=18750 width=48)
                                            Filter: (status = 'published'::text)
                          ->  Hash  (cost=2000.00..2000.00 rows=100000 width=16)
                                ->  Seq Scan on comments c  (cost=0.00..2000.00 rows=100000 width=16)
                    ->  Hash  (cost=3000.00..3000.00 rows=150000 width=16)
                          ->  Seq Scan on ratings r  (cost=0.00..3000.00 rows=150000 width=16)`,

  hypothetical: `Limit  (cost=234.45..234.57 rows=50 width=128)
  ->  Sort  (cost=234.45..284.67 rows=20089 width=128)
        Sort Key: p.created_at DESC
        ->  HashAggregate  (cost=134.12..334.01 rows=20089 width=128)
              Group Key: u.id, p.id
              ->  Nested Loop Left Join  (cost=34.45..234.56 rows=100000 width=96)
                    ->  Nested Loop Left Join  (cost=24.12..134.45 rows=100000 width=88)
                          ->  Nested Loop  (cost=14.45..84.56 rows=50000 width=80)
                                ->  Index Scan using idx_users_created_at on users u  (cost=0.43..34.45 rows=25000 width=40)
                                      Index Cond: (created_at > '2024-01-01'::date)
                                ->  Index Scan using idx_posts_user_status on posts p  (cost=0.43..2.00 rows=2 width=48)
                                      Index Cond: ((user_id = u.id) AND (status = 'published'::text))
                          ->  Index Scan using idx_comments_post_id on comments c  (cost=0.43..2.00 rows=4 width=16)
                                Index Cond: (post_id = p.id)
                    ->  Index Scan using idx_ratings_post_id on ratings r  (cost=0.43..2.00 rows=6 width=16)
                          Index Cond: (post_id = p.id)`,
}

const mockRecommendations = {
  indexes: [
    {
      table: "users",
      columns: ["created_at"],
      sql: "CREATE INDEX idx_users_created_at ON users (created_at);",
      impact: "High - Eliminates sequential scan on users table",
    },
    {
      table: "posts",
      columns: ["user_id", "status"],
      sql: "CREATE INDEX idx_posts_user_status ON posts (user_id, status);",
      impact: "High - Enables efficient join and filtering",
    },
    {
      table: "comments",
      columns: ["post_id"],
      sql: "CREATE INDEX idx_comments_post_id ON comments (post_id);",
      impact: "Medium - Improves left join performance",
    },
  ],
  queryRewrite: `-- Optimized version with better join order and filtering
SELECT u.id, u.name, u.email, p.title, p.content, p.created_at, 
    COUNT(c.id) as comment_count, AVG(r.rating) as avg_rating
FROM users u 
JOIN posts p ON u.id = p.user_id AND p.status = 'published'
LEFT JOIN comments c ON p.id = c.post_id 
LEFT JOIN ratings r ON p.id = r.post_id 
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email, p.id, p.title, p.content, p.created_at
ORDER BY p.created_at DESC 
LIMIT 50;`,
  partitioning:
    "Consider partitioning the posts table by created_at date for better performance on time-based queries.",
}

export default function QueryAnalysisPage({ params }: { params: { id: string } }) {
  const [aiRecommendations, setAiRecommendations] = useState<string>("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [simulationResult, setSimulationResult] = useState<string>("")
  const { toast } = useToast()

  const handleAskAI = async () => {
    setIsLoadingAI(true)
    // Simulate AI API call
    setTimeout(() => {
      setAiRecommendations(`Based on your query analysis, here are my recommendations:

1. **Critical Index Missing**: The query is performing sequential scans on the users table. Adding an index on users.created_at will dramatically improve performance.

2. **Join Order Optimization**: Moving the status filter into the JOIN condition will reduce the working set size earlier in the execution.

3. **Aggregation Efficiency**: Including all selected columns in the GROUP BY clause will prevent potential issues and improve clarity.

4. **Expected Performance Gain**: With the recommended indexes, this query should see a 85-90% reduction in execution time, from ~1250ms to ~150ms.

5. **Monitoring Recommendation**: Set up alerts for queries exceeding 500ms execution time to catch performance regressions early.`)
      setIsLoadingAI(false)
    }, 2000)
  }

  const handleSimulateIndex = () => {
    setSimulationResult("Simulation complete! Expected performance improvement: 87% faster execution (1250ms → 163ms)")
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
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
              <Badge className={getSeverityColor(mockQueryData.severity)}>{mockQueryData.severity} priority</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="font-semibold">{mockQueryData.avgLatency}ms</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="font-semibold">{mockQueryData.frequency}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Rows Scanned</p>
                  <p className="font-semibold">{mockQueryData.rowsScanned.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Run</p>
                  <p className="font-semibold">{mockQueryData.lastRun}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Full Query Text</h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(mockQueryData.query)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap">{mockQueryData.query}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution Plan Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Plan Analysis</CardTitle>
            <CardDescription>Compare current execution plan with optimized version</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original Plan</TabsTrigger>
                <TabsTrigger value="hypothetical">Hypothetical Plan</TabsTrigger>
              </TabsList>
              <TabsContent value="original" className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{mockExecutionPlan.original}</pre>
                </div>
              </TabsContent>
              <TabsContent value="hypothetical" className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">{mockExecutionPlan.hypothetical}</pre>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">87% performance improvement expected</span>
                </div>
              </TabsContent>
            </Tabs>
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
            {!aiRecommendations ? (
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
              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{aiRecommendations}</pre>
                </div>
              </div>
            )}

            <Separator />

            {/* Index Suggestions */}
            <div>
              <h3 className="font-semibold mb-3">Recommended Indexes</h3>
              <div className="space-y-3">
                {mockRecommendations.indexes.map((index, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {index.table}.{index.columns.join(", ")}
                        </p>
                        <p className="text-sm text-muted-foreground">{index.impact}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(index.sql)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy SQL
                      </Button>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm font-mono">{index.sql}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Query Rewrite */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Optimized Query</h3>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(mockRecommendations.queryRewrite)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SQL
                </Button>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap">{mockRecommendations.queryRewrite}</pre>
              </div>
            </div>
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
              <Button onClick={handleSimulateIndex} variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Simulate Index
              </Button>
              <Button variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Test Rewritten Query
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
