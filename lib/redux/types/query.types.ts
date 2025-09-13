export interface Query {
  id: number
  query: string
  avgTime: number
  avgLatency?: number // For compatibility with mock data
  frequency: number
  severity: 'high' | 'medium' | 'low'
  rowsScanned?: number
  lastRun?: string
  createdAt?: string
  updatedAt?: string
}

export interface QueryState {
  queries: Query[]
  selectedQuery: Query | null
  isLoading: boolean
  error: string | null
}

export interface QueryAnalysisData {
  query: Query
  executionPlan?: {
    original: string
    hypothetical: string
  }
  recommendations?: {
    indexes: Array<{
      table: string
      columns: string[]
      sql: string
      impact: string
    }>
    queryRewrite: string
    partitioning?: string
  }
  aiRecommendations?: string
}
