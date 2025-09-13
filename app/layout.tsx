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
