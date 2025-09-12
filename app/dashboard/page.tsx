"use client"

import { useState, useEffect } from "react"
// Example of using authenticated API calls:
// import { useAuthenticatedQuery, useAuthenticatedMutation } from "@/hooks/use-authenticated-api"
// 
// const { data: metrics, isLoading } = useAuthenticatedQuery('/api/metrics')
// const updateSettings = useAuthenticatedMutation('/api/settings', { method: 'PUT' })
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Database, Clock, Activity, AlertTriangle, ArrowRight, RefreshCw, TrendingUp, Server } from "lucide-react"
import Link from "next/link"

// Mock data for demonstration
const mockMetrics = {
  totalQueries: 15420,
  avgLatency: 245,
  slowQueries: 23,
  connectedDB: "production_db",
}

const mockSlowQueries = [
  {
    id: 1,
    query: "SELECT u.*, p.title FROM users u JOIN posts p ON u.id = p.user_id WHERE u.created_at > ?",
    avgTime: 1250,
    frequency: 45,
    lastRun: "2 minutes ago",
    severity: "high",
  },
  {
    id: 2,
    query: "SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = ?",
    avgTime: 890,
    frequency: 78,
    lastRun: "5 minutes ago",
    severity: "medium",
  },
  {
    id: 3,
    query:
      "UPDATE inventory SET quantity = quantity - ? WHERE product_id IN (SELECT id FROM products WHERE category = ?)",
    avgTime: 650,
    frequency: 23,
    lastRun: "8 minutes ago",
    severity: "medium",
  },
  {
    id: 4,
    query: "SELECT * FROM analytics_events WHERE event_date BETWEEN ? AND ? ORDER BY created_at DESC",
    avgTime: 2100,
    frequency: 12,
    lastRun: "12 minutes ago",
    severity: "high",
  },
  {
    id: 5,
    query: "DELETE FROM temp_cache WHERE expires_at < NOW() AND user_id NOT IN (SELECT id FROM active_users)",
    avgTime: 450,
    frequency: 67,
    lastRun: "15 minutes ago",
    severity: "low",
  },
]

export default function DashboardPage() {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        setLastUpdated(new Date())
        // In a real app, this would trigger a data refresh
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

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
            <Button variant="outline" size="sm">
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
              <div className="text-2xl font-bold">{mockMetrics.totalQueries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Query Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground">-5ms from last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slow Queries</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{mockMetrics.slowQueries}</div>
              <p className="text-xs text-muted-foreground">Queries over 500ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected DB</CardTitle>
              <Server className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{mockMetrics.connectedDB}</div>
              <p className="text-xs text-muted-foreground">
                <Activity className="inline h-3 w-3 mr-1 text-primary" />
                Connected
              </p>
            </CardContent>
          </Card>
        </div>

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
                    <TableHead>Last Run</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSlowQueries.map((query) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-mono text-sm max-w-md">{truncateQuery(query.query)}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{query.avgTime}ms</span>
                      </TableCell>
                      <TableCell>{query.frequency}/hr</TableCell>
                      <TableCell className="text-muted-foreground">{query.lastRun}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(query.severity)}>{query.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/query-analysis/${query.id}`}>
                            Analyze
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
