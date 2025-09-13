"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowRight, Clock, Database, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-api"


export default function QueriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [isMounted, setIsMounted] = useState(false)

  // API call to get all queries
  const { data: queriesData, isLoading: isLoadingQueries, error: queriesError, refetch: refetchQueries } = useAuthenticatedQuery('/db/get-all-queries', {
    enabled: typeof window !== 'undefined',
    method: 'GET'
  })

  // Initialize on client side to prevent hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const filteredQueries = queriesData?.logs?.filter((query: any) => {
    const matchesSearch = query.query.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = selectedSeverity === "all" || query.severity === selectedSeverity
    return matchesSearch && matchesSeverity
  }) || []

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
                ) : isLoadingQueries ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading queries...
                    </TableCell>
                  </TableRow>
                ) : queriesError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      Error loading queries: {queriesError.message}
                    </TableCell>
                  </TableRow>
                ) : !queriesData?.logs?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No queries found
                    </TableCell>
                  </TableRow>
                ) : filteredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No queries match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueries.map((query: any) => (
                    <TableRow key={query.id}>
                      <TableCell className="font-mono text-sm max-w-md">{truncateQuery(query.query)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{query.avgTime}ms</span>
                        </div>
                      </TableCell>
                      <TableCell>{query.frequency}</TableCell>
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
