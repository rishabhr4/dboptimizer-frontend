"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Bell, AlertTriangle } from "lucide-react"
import QueryAlertPopup from "@/components/ui/alert-queries"
import { useState, useEffect } from "react"
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-api"
import Link from "next/link"


export default function TrendsPage() {
  const [isMounted, setIsMounted] = useState(false)

  // API call to get alerts
  const { data: alertsData, isLoading: isLoadingAlerts, error: alertsError, refetch: refetchAlerts } = useAuthenticatedQuery('/alerts/query-with-alerts', {
    enabled: typeof window !== 'undefined',
    method: 'GET'
  })

  // Initialize on client side to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
            <QueryAlertPopup />
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
                ) : isLoadingAlerts ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading alerts...
                    </TableCell>
                  </TableRow>
                ) : alertsError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      Error loading alerts: {alertsError.message}
                    </TableCell>
                  </TableRow>
                ) : !alertsData?.queries?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No alerts found
                    </TableCell>
                  </TableRow>
                ) : (
                  alertsData.queries.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell className="font-mono text-sm max-w-xs">
                        {alert.query.length > 50 ? alert.query.substring(0, 50) + "..." : alert.query}
                      </TableCell>
                      <TableCell>{alert.threshold}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={'/query-analysis/' + alert.id}><Button variant="ghost" size="sm">
                          Investigate
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
    </div>
  )
}
