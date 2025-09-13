import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Query, QueryState } from '../types/query.types'

const initialState: QueryState = {
  queries: [],
  selectedQuery: null,
  isLoading: false,
  error: null,
}

export const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    // Set all queries from API response
    setQueries: (state, action: PayloadAction<Query[]>) => {
      state.queries = action.payload
      state.isLoading = false
      state.error = null
    },
    
    // Select a specific query for analysis
    selectQuery: (state, action: PayloadAction<Query>) => {
      state.selectedQuery = action.payload
    },
    
    // Clear selected query
    clearSelectedQuery: (state) => {
      state.selectedQuery = null
    },
    
    // Add a new query to the list
    addQuery: (state, action: PayloadAction<Query>) => {
      const existingIndex = state.queries.findIndex(q => q.id === action.payload.id)
      if (existingIndex >= 0) {
        state.queries[existingIndex] = action.payload
      } else {
        state.queries.push(action.payload)
      }
    },
    
    // Update an existing query
    updateQuery: (state, action: PayloadAction<{ id: number; updates: Partial<Query> }>) => {
      const index = state.queries.findIndex(q => q.id === action.payload.id)
      if (index >= 0) {
        state.queries[index] = { ...state.queries[index], ...action.payload.updates }
        
        // Update selected query if it's the same one
        if (state.selectedQuery?.id === action.payload.id) {
          state.selectedQuery = { ...state.selectedQuery, ...action.payload.updates }
        }
      }
    },
    
    // Reset entire state
    resetQueryState: (state) => {
      state.queries = []
      state.selectedQuery = null
      state.isLoading = false
      state.error = null
    },
  },
})

export const {
  setLoading,
  setError,
  setQueries,
  selectQuery,
  clearSelectedQuery,
  addQuery,
  updateQuery,
  resetQueryState,
} = querySlice.actions

export default querySlice.reducer
