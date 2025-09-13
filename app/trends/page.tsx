"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Bell } from "lucide-react"
import QueryAlertPopup from "@/components/ui/alert-queries"

// Mock data for trends and alerts
const mockAlerts = [
  {
    id: 1,
    type: "High Latency",
    query: "SELECT u.*, p.title FROM users u JOIN posts p...",
    timestamp: "2 minutes ago",
    severity: "high",
    threshold: "2000ms",
    actual: "2450ms",
  },
  {
    id: 2,
    type: "Slow Query",
    query: "SELECT COUNT(*) FROM orders o JOIN customers...",
    timestamp: "15 minutes ago",
    severity: "medium",
    threshold: "1000ms",
    actual: "1340ms",
  },
  {
    id: 3,
    type: "Index Missing",
    query: "UPDATE inventory SET quantity = quantity - ?...",
    timestamp: "1 hour ago",
    severity: "low",
    threshold: "N/A",
    actual: "Recommendation",
  },
]

const mockTrends = [
  {
    metric: "Average Query Latency",
    current: "245ms",
    change: "-12%",
    trend: "down",
    period: "Last 24h",
  },
  {
    metric: "Query Frequency",
    current: "15,420",
    change: "+8%",
    trend: "up",
    period: "Last 24h",
  },
  {
    metric: "Slow Queries Count",
    current: "23",
    change: "-35%",
    trend: "down",
    period: "Last 24h",
  },
  {
    metric: "Database Connections",
    current: "156",
    change: "+5%",
    trend: "up",
    period: "Last 24h",
  },
]

export default function TrendsPage() {
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

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Trends & Alerts</h1>
        <p className="text-muted-foreground">Monitor performance trends and get notified about critical issues</p>
      </div>

      {/* Performance Trends */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockTrends.map((trend, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{trend.metric}</CardTitle>
              {getTrendIcon(trend.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trend.current}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={trend.trend === "up" ? "text-green-500" : "text-red-500"}>{trend.change}</span>
                {trend.period}
              </p>
            </CardContent>
          </Card>
        ))} */}
      {/* </div> */}

      {/* Performance Charts Placeholder
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Query Latency Trend</CardTitle>
            <CardDescription>Average query execution time over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Query Frequency</CardTitle>
            <CardDescription>Number of queries executed per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Chart visualization would go here</p>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>Recent performance alerts and notifications</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Configure Alerts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.type}</TableCell>
                    <TableCell className="font-mono text-sm max-w-xs">
                      {alert.query.length > 50 ? alert.query.substring(0, 50) + "..." : alert.query}
                    </TableCell>
                    <TableCell>{alert.threshold}</TableCell>
                    <TableCell className="font-semibold">{alert.actual}</TableCell>
                    <TableCell className="text-muted-foreground">{alert.timestamp}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alert Queries button at the bottom */}
      <div className="flex justify-end">
        <QueryAlertPopup />
      </div>
    </div>
  )
}
