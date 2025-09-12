"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type ConnectionStatus = "idle" | "connecting" | "success" | "error"
export default function OnboardingPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    dbName: "",
    dbType: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  const handleConnect = async () => {
    setConnectionStatus("connecting")

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock success for demo
      setConnectionStatus("success")
      toast({
        title: "Connection Successful",
        description: "Successfully connected to your database!",
      })

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      setConnectionStatus("error")
      toast({
        title: "Connection Failed",
        description: "Unable to connect to database. Please check your credentials.",
        variant: "destructive",
      })
    }
  }

  const handleUseSampleDB = () => {
    toast({
      title: "Sample Database Loaded",
      description: "Using demo database for exploration.",
    })
    router.push("/dashboard")
  }

  const isFormValid =
    formData.host && formData.port && formData.username && formData.password && formData.dbName && formData.dbType

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-balance">DB Monitor</h1>
          <p className="text-muted-foreground text-pretty">
            Connect your database to start monitoring performance and get AI-powered optimization insights.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Enter your database credentials to establish a connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  value={formData.host}
                  onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="5432"
                  value={formData.port}
                  onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbType">Database Type</Label>
              <Select
                value={formData.dbType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, dbType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mariadb">MariaDB</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="postgres"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <Input
                id="dbName"
                placeholder="myapp_production"
                value={formData.dbName}
                onChange={(e) => setFormData((prev) => ({ ...prev, dbName: e.target.value }))}
              />
            </div>

            {connectionStatus !== "idle" && (
              <Alert
                className={
                  connectionStatus === "success"
                    ? "border-primary"
                    : connectionStatus === "error"
                      ? "border-destructive"
                      : ""
                }
              >
                <div className="flex items-center gap-2">
                  {connectionStatus === "connecting" && <Loader2 className="h-4 w-4 animate-spin" />}
                  {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-primary" />}
                  {connectionStatus === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                  <AlertDescription>
                    {connectionStatus === "connecting" && "Connecting to database..."}
                    {connectionStatus === "success" && "Successfully connected to database!"}
                    {connectionStatus === "error" && "Failed to connect. Please check your credentials."}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleConnect}
                disabled={!isFormValid || connectionStatus === "connecting"}
                className="w-full"
              >
                {connectionStatus === "connecting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Database"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleUseSampleDB} className="w-full bg-transparent">
                Use Sample Database
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
