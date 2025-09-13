"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Database, Search, Bot, Settings, Menu, X, Home, TrendingUp } from "lucide-react"
import { useDatabase } from "@/contexts/database-context"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and metrics",
  },
  {
    name: "Query Analysis",
    href: "/queries",
    icon: Search,
    description: "Analyze slow queries",
  },
  {
    name: "Trends & Alerts",
    href: "/trends",
    icon: TrendingUp,
    description: "Performance trends",
  },
  {
    name: "AI Copilot",
    href: "/copilot",
    icon: Bot,
    description: "AI-powered insights",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Database settings",
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { dbName, username, isConnected } = useDatabase()

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sidebar-primary rounded-lg">
            <Database className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">DB Monitor</h2>
              <p className="text-xs text-sidebar-foreground/60">Performance Dashboard</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-60">{item.description}</div>
                    </div>
                  </>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {!isCollapsed && (
            <span>
              {isConnected && dbName && username 
                ? `Connected to ${dbName} as ${username}`
                : 'Not connected'
              }
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
