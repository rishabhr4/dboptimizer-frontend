"use client"

import type React from "react"
import { usePathname } from "next/navigation"

import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { ThemeProvider } from "@/components/theme-provider"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  
  // Don't show sidebar on the onboarding page
  const showSidebar = pathname !== "/"

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {showSidebar ? (
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <div className="w-64 shrink-0">
            <Sidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      ) : (
        // Full screen layout for onboarding
        <div className="h-screen bg-background">
          {children}
        </div>
      )}
    </ThemeProvider>
  )
}
