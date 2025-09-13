"use client"

import { useState, useEffect } from "react"
import { useAuthenticatedMutation, useAuthenticatedQuery } from "@/hooks/use-authenticated-api"
import { useDatabase } from "@/contexts/database-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, Clock, Activity, AlertTriangle, ArrowRight, RefreshCw, TrendingUp, Server, Lightbulb, MessageCircle } from "lucide-react"
import Link from "next/link"


export default function DashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const { dbName, username, isConnected } = useDatabase()

  // API calls - disable on server to prevent hydration issues
  const { data: metricsData, isLoading: isLoadingMetrics, error: metricsError, refetch: refetchMetrics } = useAuthenticatedQuery('/db/metric-data', {
    enabled: typeof window !== 'undefined',
    method: 'GET'
  })

  const { data: slowQueriesData, isLoading: isLoadingSlowQueries, error: slowQueriesError, refetch: refetchSlowQueries } = useAuthenticatedQuery('/db/top-k-slow-queries', {
    enabled: typeof window !== 'undefined',
    method: 'POST'
  })

  const { data: insightsData, isLoading: isLoadingInsights, error: insightsError, refetch: refetchInsights } = useAuthenticatedQuery('/db/get-insights', {
    enabled: typeof window !== 'undefined',
    method: 'GET'
  })


  // Initialize on client side to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
    setLastUpdated(new Date())
  }, [])


  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date())
        refetchMetrics()
        refetchSlowQueries()
        refetchInsights()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh, refetchMetrics, refetchSlowQueries, refetchInsights])

  const handleRefresh = () => {
    setLastUpdated(new Date())
    refetchMetrics()
    refetchSlowQueries()
    refetchInsights()
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

  const truncateQuery = (query: string, maxLength = 80) => {
    return query.length > maxLength ? query.substring(0, maxLength) + "..." : query
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Database Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your database performance and identify optimization opportunities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingMetrics ? '...' : metricsData?.totalQueries?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {metricsError ? 'Error loading data' : 'Total queries executed'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Query Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingMetrics ? '...' : `${metricsData?.avgLatency || 0}ms`}
              </div>
              <p className="text-xs text-muted-foreground">
                {metricsError ? 'Error loading data' : 'Average query latency'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {isLoadingMetrics ? '...' : metricsData?.slowQueries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {metricsError ? 'Error loading data' : 'Queries over 500ms'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected DB</CardTitle>
              <Server className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{isConnected && dbName ? dbName : 'Not connected'}</div>
              <p className="text-xs text-muted-foreground">
                <Activity className={`inline h-3 w-3 mr-1 ${isConnected ? 'text-primary' : 'text-destructive'}`} />
                {isConnected ? `Connected as ${username}` : 'Disconnected'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Database Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Database Insights
            </CardTitle>
            <CardDescription>AI-powered suggestions to improve your database performance</CardDescription>
          </CardHeader>
          <CardContent>
            {!isMounted ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading insights...</p>
              </div>
            ) : isLoadingInsights ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading insights...</p>
              </div>
            ) : insightsError ? (
              <div className="text-center py-8 text-destructive">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Error loading insights: {insightsError.message}</p>
              </div>
            ) : !insightsData?.suggestions?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-8 w-8 mx-auto mb-2" />
                <p className="mb-2">{insightsData?.message || "No insights available at the moment"}</p>
                {insightsData?.lastUpdated && (
                  <p className="text-xs">
                    Last updated: {new Date(insightsData.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Message and Last Updated */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p>{insightsData?.message || "Top 3 database optimization suggestions"}</p>
                  {insightsData?.lastUpdated && (
                    <p className="text-xs">
                      Updated: {new Date(insightsData.lastUpdated).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {insightsData.suggestions.map((suggestion: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground hover:text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{suggestion.title || `Suggestion ${index + 1}`}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.description || suggestion}</p>
                        {suggestion.impact && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              Impact: {suggestion.impact}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <Link href="/copilot">
                    <Button className="w-full hover:text-foreground hover:bg-background" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Get more suggestions with AI Chatbot
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slow Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Slow Queries</CardTitle>
            <CardDescription>Queries with the highest execution times that need optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Avg Time</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isMounted ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : isLoadingSlowQueries ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading slow queries...
                      </TableCell>
                    </TableRow>
                  ) : slowQueriesError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-destructive">
                        Error loading slow queries: {slowQueriesError.message}
                      </TableCell>
                    </TableRow>
                  ) : !slowQueriesData?.logs?.length ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No slow queries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    slowQueriesData.logs.map((query: any, index: number) => (
                      <TableRow key={query.id || index}>
                        <TableCell className="font-mono text-sm max-w-md">{truncateQuery(query.query)}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{query.avgTime}ms</span>
                        </TableCell>
                        <TableCell>{query.frequency}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(query.severity)}>{query.severity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/query-analysis/${query.id || index}`}>
                            <Button variant="ghost" size="sm">
                              Analyze
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Loading...'}
        </div>
      </div>
    </div>
  )
}
