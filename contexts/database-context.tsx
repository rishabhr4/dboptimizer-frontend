"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DatabaseConnectionResponse, getToken, removeToken } from '@/lib/api'

interface DatabaseContextType {
  // Connection state
  isConnected: boolean
  token: string | null
  monitoringEnabled: boolean
  dbName: string | null
  username: string | null
  
  // Actions
  setConnectionInfo: (info: DatabaseConnectionResponse) => void
  clearConnection: () => void
  updateConnectionInfo: (updates: Partial<DatabaseConnectionResponse>) => void
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

interface DatabaseProviderProps {
  children: ReactNode
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [monitoringEnabled, setMonitoringEnabled] = useState(false)
  const [dbName, setDbName] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = getToken()
    if (storedToken) {
      // Try to get additional info from localStorage
      const storedDbName = localStorage.getItem('db_name')
      const storedUsername = localStorage.getItem('db_username')
      const storedMonitoringEnabled = localStorage.getItem('db_monitoring_enabled') === 'true'
      
      if (storedDbName && storedUsername) {
        setToken(storedToken)
        setDbName(storedDbName)
        setUsername(storedUsername)
        setMonitoringEnabled(storedMonitoringEnabled)
        setIsConnected(true)
      }
    }
  }, [])

  const setConnectionInfo = (info: DatabaseConnectionResponse) => {
    setToken(info.token)
    setMonitoringEnabled(info.monitoringEnabled)
    setDbName(info.dbName)
    setUsername(info.username)
    setIsConnected(true)
    
    // Store in localStorage for persistence
    localStorage.setItem('db_name', info.dbName)
    localStorage.setItem('db_username', info.username)
    localStorage.setItem('db_monitoring_enabled', info.monitoringEnabled.toString())
  }

  const clearConnection = () => {
    setToken(null)
    setMonitoringEnabled(false)
    setDbName(null)
    setUsername(null)
    setIsConnected(false)
    
    // Clear from localStorage
    removeToken()
    localStorage.removeItem('db_name')
    localStorage.removeItem('db_username')
    localStorage.removeItem('db_monitoring_enabled')
  }

  const updateConnectionInfo = (updates: Partial<DatabaseConnectionResponse>) => {
    if (updates.token !== undefined) setToken(updates.token)
    if (updates.monitoringEnabled !== undefined) setMonitoringEnabled(updates.monitoringEnabled)
    if (updates.dbName !== undefined) {
      setDbName(updates.dbName)
      localStorage.setItem('db_name', updates.dbName)
    }
    if (updates.username !== undefined) {
      setUsername(updates.username)
      localStorage.setItem('db_username', updates.username)
    }
  }

  const value: DatabaseContextType = {
    isConnected,
    token,
    monitoringEnabled,
    dbName,
    username,
    setConnectionInfo,
    clearConnection,
    updateConnectionInfo,
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

// Convenience hooks for specific data
export function useDatabaseInfo() {
  const { dbName, username, isConnected } = useDatabase()
  return { dbName, username, isConnected }
}

export function useConnectionStatus() {
  const { isConnected, monitoringEnabled } = useDatabase()
  return { isConnected, monitoringEnabled }
}
