import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { QueryProvider } from "@/lib/query-client"
import { DatabaseProvider } from "@/contexts/database-context"
import { ReduxProvider } from "@/lib/redux/provider"
import { AppLayout } from "@/components/layout/app-layout"
import { Suspense } from "react"
import "./globals.css"

// Suppress hydration warnings in development - client side only
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const consoleError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && (
      args[0].includes("hydration") || 
      args[0].includes("Hydration") ||
      args[0].includes("Text content does not match") ||
      args[0].includes("Expected server HTML")
    )) {
      return; // Ignore hydration warnings
    }
    consoleError(...args);
  };
  
  // Also suppress React warnings
  const consoleWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === "string" && (
      args[0].includes("hydration") || 
      args[0].includes("Hydration")
    )) {
      return; // Ignore hydration warnings
    }
    consoleWarn(...args);
  };
}

export const metadata: Metadata = {
  title: "DB Monitor - Database Performance Dashboard",
  description: "Monitor and optimize your database performance with AI-powered insights",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration errors immediately
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  if (typeof args[0] === 'string' && (
                    args[0].includes('hydration') || 
                    args[0].includes('Hydration') ||
                    args[0].includes('Text content does not match') ||
                    args[0].includes('Expected server HTML')
                  )) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  if (typeof args[0] === 'string' && (
                    args[0].includes('hydration') || 
                    args[0].includes('Hydration')
                  )) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ReduxProvider>
          <QueryProvider>
            <DatabaseProvider>
              <AppLayout>
                <Suspense fallback={null}>
                  {children}
                  <Toaster />
                  <Analytics />
                </Suspense>
              </AppLayout>
            </DatabaseProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
