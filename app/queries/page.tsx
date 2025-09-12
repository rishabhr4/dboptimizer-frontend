"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowRight, Clock, Database } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock data for queries
const mockQueries = [
  {
    id: 1,
    query: "SELECT u.*, p.title FROM users u JOIN posts p ON u.id = p.user_id WHERE u.created_at > ?",
    avgTime: 1250,
    frequency: 45,
    lastRun: "2 minutes ago",
    severity: "high",
    database: "production_db",
  },
  {
    id: 2,
    query: "SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.status = ?",
    avgTime: 890,
    frequency: 78,
    lastRun: "5 minutes ago",
    severity: "medium",
    database: "production_db",
  },
  {
    id: 3,
    query:
      "UPDATE inventory SET quantity = quantity - ? WHERE product_id IN (SELECT id FROM products WHERE category = ?)",
    avgTime: 650,
    frequency: 23,
    lastRun: "8 minutes ago",
    severity: "medium",
    database: "production_db",
  },
  {
    id: 4,
    query: "SELECT * FROM analytics_events WHERE event_date BETWEEN ? AND ? ORDER BY created_at DESC",
    avgTime: 2100,
    frequency: 12,
    lastRun: "12 minutes ago",
    severity: "high",
    database: "analytics_db",
  },
  {
    id: 5,
    query: "DELETE FROM temp_cache WHERE expires_at < NOW() AND user_id NOT IN (SELECT id FROM active_users)",
    avgTime: 450,
    frequency: 67,
    lastRun: "15 minutes ago",
    severity: "low",
    database: "production_db",
  },
]

export default function QueriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")

  const filteredQueries = mockQueries.filter((query) => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = selectedSeverity === "all" || query.severity === selectedSeverity
    return matchesSearch && matchesSeverity
  })

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Query Analysis</h1>
        <p className="text-muted-foreground">Analyze and optimize slow database queries for better performance</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find specific queries or filter by performance criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedSeverity === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity("all")}
              >
                All
              </Button>
              <Button
                variant={selectedSeverity === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity("high")}
              >
                High Priority
              </Button>
              <Button
                variant={selectedSeverity === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity("medium")}
              >
                Medium
              </Button>
              <Button
                variant={selectedSeverity === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity("low")}
              >
                Low
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Database Queries ({filteredQueries.length})</CardTitle>
          <CardDescription>Performance analysis for all monitored queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead>Database</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell className="font-mono text-sm max-w-md">{truncateQuery(query.query)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        {query.database}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{query.avgTime}ms</span>
                      </div>
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
    </div>
  )
}
