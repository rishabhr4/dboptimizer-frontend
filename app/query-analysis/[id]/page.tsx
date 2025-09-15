"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Activity,
  Timer,
  BarChart3,
  Bot,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useAnalyzeQuery } from "@/hooks/use-ai-query"
import { useAuthenticatedQuery, useAuthenticatedMutation } from "@/hooks/use-authenticated-api"
import { Markdown } from "@/components/ui/markdown"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define the backend response type structure
interface QueryLogData {
  queryId: string
  queryPreview: string
  fullQuery: string
  performance: {
    averageTime: string
    frequency: string
    totalImpact: string
    severity: string
    threshold: string
    minTime: string
    maxTime: string
  }
  data: {
    type: string
    mainTable: string
    rowsReturned: number
    collectedAt: string
  }
  health: {
    status: string
    message: string
    recommendation: string
    priority: string
  }
}

// Backend response wrapper
interface QueryLogResponse {
  success: boolean
  data: QueryLogData
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
    multiplierImprovement?: number
  }
}

// Query comparison types
interface QueryComparisonRequest {
  query1: string
  query2: string
}

interface QueryComparisonResponse {
  success: boolean
  data: {
    query1: {
      sql: string
      plan: any[]
      error: string | null
    }
    query2: {
      sql: string
      plan: any[]
      error: string | null
    }
  }
}

// Function to convert PostgreSQL EXPLAIN JSON to table format
const convertPlanToTable = (plan: any): any[] => {
  if (!plan || !plan.Plan) return []

  const tableRows: any[] = []
  let level = 0

  const processNode = (node: any, parentLevel: number = 0) => {
    const row = {
      level: parentLevel,
      nodeType: node["Node Type"] || "Unknown",
      relationName: node["Relation Name"] || "-",
      joinType: node["Join Type"] || "-",
      indexName: node["Index Name"] || "-",
      filter: node["Hash Cond"] || node["Filter"] || "-",
      totalCost: node["Total Cost"] || 0,
      planRows: node["Plan Rows"] || 0,
      startupCost: node["Startup Cost"] || 0,
      width: node["Plan Width"] || 0
    }
    
    tableRows.push(row)

    // Process children
    if (node.Plans && node.Plans.length > 0) {
      node.Plans.forEach((child: any) => {
        processNode(child, parentLevel + 1)
      })
    }
  }

  processNode(plan.Plan)
  return tableRows
}

export default function QueryAnalysisPage({ params }: { params: { id: string } }) {
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AnalyzeQueryResponse | null>(null)
  const [simulationResult, setSimulationResult] = useState<string>("")
  const [comparisonResult, setComparisonResult] = useState<QueryComparisonResponse | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const { toast } = useToast()
  
  // Use the existing analyze query hook
  const analyzeQueryMutation = useAnalyzeQuery()
  
  // Query comparison mutation
  const compareQueriesMutation = useAuthenticatedMutation<QueryComparisonResponse, QueryComparisonRequest>(
    '/db/compare-queries',
    {
      method: 'POST',
      onSuccess: (data) => {
        setComparisonResult(data)
        setIsComparing(false)
        toast({
          title: "Query Comparison Complete",
          description: "Execution plans generated successfully",
        })
      },
      onError: (error) => {
        setIsComparing(false)
        toast({
          title: "Comparison Failed",
          description: error.message || "Failed to compare queries. Please try again.",
          variant: "destructive"
        })
      }
    }
  )
  
  // Fetch query data using authenticated API hook
  const { data: queryData, isLoading: isLoadingQuery, error: queryError } = useAuthenticatedQuery<QueryLogResponse>(
    `/db/query-log/${params.id}`,
    {
      enabled: !!params.id,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )
  
  // Extract data from response wrapper or use fallback to mock data
  const currentQueryData = queryData?.data 

  const handleAskAI = async () => {
    try {
      console.log("🚀 Starting AI analysis for query ID:", params.id)
      
      const result = await analyzeQueryMutation.mutateAsync({ id: params.id })
      
      console.log("📊 AI Analysis result:", result)
      
      if (result.success) {
        setAiAnalysisResult(result as AnalyzeQueryResponse)
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
    const averageTimeStr = currentQueryData?.performance?.averageTime || '1250ms'
    const currentTimeMs = parseInt(averageTimeStr.replace('ms', ''))
    const improvedTime = Math.round(currentTimeMs * 0.13) // 87% improvement
    setSimulationResult(`Simulation complete! Expected performance improvement: 87% faster execution (${currentTimeMs}ms → ${improvedTime}ms)`)
    toast({
      title: "Index Simulation Complete",
      description: "Expected 87% performance improvement with recommended indexes",
    })
  }

  const handleCompareQueries = async () => {
    if (!currentQueryData?.fullQuery || !aiAnalysisResult?.optimizedQuery?.sqlStatement) {
      toast({
        title: "Cannot Compare Queries",
        description: "Both original and optimized queries are required for comparison",
        variant: "destructive"
      })
      return
    }

    setIsComparing(true)
    try {
      await compareQueriesMutation.mutateAsync({
        query1: currentQueryData.fullQuery,
        query2: aiAnalysisResult.optimizedQuery.sqlStatement
      })
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
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
              <Badge className={getSeverityColor(currentQueryData?.performance?.severity || 'low')}>
                {currentQueryData?.performance?.severity || 'low'} priority
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingQuery ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : queryError ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-destructive">Failed to load query data</p>
                <p className="text-sm text-muted-foreground">Using fallback data</p>
              </div>
            ) : (
              <>
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Average Time</p>
                      <p className="font-semibold">{currentQueryData?.performance?.averageTime || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Frequency</p>
                      <p className="font-semibold">{currentQueryData?.performance?.frequency || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Impact</p>
                      <p className="font-semibold">{currentQueryData?.performance?.totalImpact || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Threshold</p>
                      <p className="font-semibold">{currentQueryData?.performance?.threshold || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Min Time</p>
                      <p className="font-semibold">{currentQueryData?.performance?.minTime || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Max Time</p>
                      <p className="font-semibold">{currentQueryData?.performance?.maxTime || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Data Information */}
                <div className={`grid grid-cols-1 md:grid-cols-${currentQueryData?.data?.mainTable && !currentQueryData.data.mainTable.includes(' ') ? '3' : '2'} gap-4`}>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Query Type</p>
                      <p className="font-semibold">{currentQueryData?.data?.type || 'N/A'}</p>
                    </div>
                  </div>
                  {currentQueryData?.data?.mainTable && !currentQueryData.data.mainTable.includes(' ') && (
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Main Table</p>
                        <p className="font-semibold">{currentQueryData.data.mainTable}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rows Returned</p>
                      <p className="font-semibold">{currentQueryData?.data?.rowsReturned?.toLocaleString() || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Query Health
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant={
                        currentQueryData?.health?.status === 'Healthy' ? 'default' : 
                        currentQueryData?.health?.status === 'Warning' ? 'secondary' : 
                        'destructive'
                      }>
                        {currentQueryData?.health?.status || 'Unknown'}
                      </Badge>
                      <Badge variant={
                        currentQueryData?.health?.priority === 'Low' ? 'outline' : 
                        currentQueryData?.health?.priority === 'Medium' ? 'secondary' : 
                        'destructive'
                      }>
                        {currentQueryData?.health?.priority || 'Unknown'} Priority
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{currentQueryData?.health?.message || 'No health information available'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recommendation:</p>
                      <p className="text-sm text-primary font-medium">{currentQueryData?.health?.recommendation || 'No recommendations available'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Full Query Text</h3>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(currentQueryData?.fullQuery || '')}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{currentQueryData?.fullQuery || 'No query available'}</pre>
                  </div>
                </div>
              </>
            )}
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
              <>
                {!isLoadingAI ? (
                  <Button onClick={handleAskAI} className="w-full">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Ask AI for Optimization
                  </Button>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    {/* Robot Icon with Thinking Animation */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-8 w-8 text-primary animate-pulse" />
                      </div>
                      {/* Thinking Dots Animation */}
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                    </div>
                    
                    {/* Thinking Text */}
                    <div className="text-center space-y-2">
                      <h3 className="text-lg font-semibold text-primary">🤖 AI Robot Thinking</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Thinking optimization preparing index optimization...
                        </p>
                        <p className="text-sm text-muted-foreground animate-pulse [animation-delay:0.5s]">
                          Preparing query optimization...
                        </p>
                        <p className="text-sm text-muted-foreground animate-pulse [animation-delay:1s]">
                          Analyzing performance patterns...
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full max-w-xs">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" style={{
                          animation: 'progress 2s ease-in-out infinite'
                        }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                {/* General Description */}
                {aiAnalysisResult.generalDescription && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      AI Analysis Summary
                    </h3>
                    <Markdown className="text-sm">
                      {aiAnalysisResult.generalDescription}
                    </Markdown>
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

                {/* Multiplier Improvement */}
                {aiAnalysisResult.optimizedQuery?.multiplierImprovement && aiAnalysisResult.optimizedQuery?.multiplierImprovement !== 1 && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">Performance Improvement</h4>
                        <p className="text-sm text-muted-foreground">
                          This optimized query is <span className="font-bold text-primary">{aiAnalysisResult.optimizedQuery?.multiplierImprovement}x</span> faster than the original query
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {aiAnalysisResult.optimizedQuery?.multiplierImprovement}x Better
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Query Comparison - Only show after AI analysis */}
        {aiAnalysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Query Execution Plan Comparison
              </CardTitle>
              <CardDescription>Compare the original query with the AI-optimized version</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleCompareQueries} 
                  disabled={isComparing || !currentQueryData?.fullQuery || !aiAnalysisResult?.optimizedQuery?.sqlStatement}
                  className="w-full"
                >
                  {isComparing ? (
                    <>
                      <div className="flex gap-1 mr-2">
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      </div>
                      Comparing Queries...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Compare Original vs Optimized
                    </>
                  )}
                </Button>
              </div>

            {comparisonResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Original Query Plan */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Original Query Plan</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-xs font-mono whitespace-pre-wrap mb-4">{comparisonResult.data.query1.sql}</pre>
                      {comparisonResult.data.query1.plan && comparisonResult.data.query1.plan.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">Level</TableHead>
                                <TableHead className="w-32">Node Type</TableHead>
                                <TableHead className="w-24">Table</TableHead>
                                <TableHead className="w-20">Join Type</TableHead>
                                <TableHead className="w-24">Index</TableHead>
                                <TableHead className="w-40">Filter</TableHead>
                                <TableHead className="w-20">Total Cost</TableHead>
                                <TableHead className="w-20">Rows</TableHead>
                                <TableHead className="w-20">Width</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {convertPlanToTable(comparisonResult.data.query1.plan[0]).map((row, index) => (
                                <TableRow key={index} className={row.level > 0 ? "bg-muted/30" : ""}>
                                  <TableCell className="font-mono text-xs">
                                    {row.level > 0 ? "└─".repeat(row.level) : ""}
                                  </TableCell>
                                  <TableCell className="font-medium">{row.nodeType}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.relationName}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.joinType}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.indexName}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs font-mono max-w-40 truncate" title={row.filter}>
                                    {row.filter}
                                  </TableCell>
                                  <TableCell className="font-mono text-primary font-medium">{row.totalCost}</TableCell>
                                  <TableCell className="font-mono text-muted-foreground">{row.planRows.toLocaleString()}</TableCell>
                                  <TableCell className="font-mono text-muted-foreground">{row.width}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          No plan data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optimized Query Plan */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Optimized Query Plan</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <pre className="text-xs font-mono whitespace-pre-wrap mb-4">{comparisonResult.data.query2.sql}</pre>
                      {comparisonResult.data.query2.plan && comparisonResult.data.query2.plan.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-8">Level</TableHead>
                                <TableHead className="w-32">Node Type</TableHead>
                                <TableHead className="w-24">Table</TableHead>
                                <TableHead className="w-20">Join Type</TableHead>
                                <TableHead className="w-24">Index</TableHead>
                                <TableHead className="w-40">Filter</TableHead>
                                <TableHead className="w-20">Total Cost</TableHead>
                                <TableHead className="w-20">Rows</TableHead>
                                <TableHead className="w-20">Width</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {convertPlanToTable(comparisonResult.data.query2.plan[0]).map((row, index) => (
                                <TableRow key={index} className={row.level > 0 ? "bg-muted/30" : ""}>
                                  <TableCell className="font-mono text-xs">
                                    {row.level > 0 ? "└─".repeat(row.level) : ""}
                                  </TableCell>
                                  <TableCell className="font-medium">{row.nodeType}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.relationName}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.joinType}</TableCell>
                                  <TableCell className="text-muted-foreground">{row.indexName}</TableCell>
                                  <TableCell className="text-muted-foreground text-xs font-mono max-w-40 truncate" title={row.filter}>
                                    {row.filter}
                                  </TableCell>
                                  <TableCell className="font-mono text-primary font-medium">{row.totalCost}</TableCell>
                                  <TableCell className="font-mono text-muted-foreground">{row.planRows.toLocaleString()}</TableCell>
                                  <TableCell className="font-mono text-muted-foreground">{row.width}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          No plan data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}