"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthenticatedMutation } from "@/hooks/use-authenticated-api"
import { toast } from "@/components/ui/use-toast"

export default function QueryAlertPopup({ queryId }: { queryId?: string }) {
  const [query, setQuery] = useState("")
  const [email, setEmail] = useState("")
  const [open, setOpen] = useState(false)

  // Debug logging for component mount
  console.log("QueryAlertPopup rendering, queryId:", queryId)

  // Use authenticated mutation hook like in dashboard page
  const { mutate: addAlert, isLoading } = useAuthenticatedMutation('/db/alerts', {
    onMutate: (variables) => {
      // This will fire immediately when mutation is triggered
      console.log("Mutation starting with variables:", variables)
    },
    onSuccess: (data) => {
      console.log("Alert created successfully:", data)
      toast({
        title: "Alert created successfully",
        description: "You will be notified when this query runs.",
      })
      setOpen(false) // Close the dialog after submitting
      setQuery("") // Reset form
      setEmail("")
    },
    onError: (error) => {
      console.error("Failed to create alert:", error)
      toast({
        title: "Failed to create alert",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  })

  const handleSubmit = () => {
    try {
      console.log("handleSubmit called")
      
      // Validate inputs before submitting
      if (!query && !queryId) {
        console.error("No query or queryId provided")
        toast({
          title: "Missing query",
          description: "Please enter a SQL query.",
          variant: "destructive",
        })
        return
      }

      const payload = {
        query,
        queryId,
        email
      }
      
      console.log("Submitting alert data:", payload)
      addAlert(payload)
    } catch (err) {
      console.error("Error in handleSubmit:", err)
    }
  }

  const handleCancel = () => {
    console.log("Cancel clicked")
    setOpen(false) // Close the dialog when cancel is clicked
  }

  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      console.log("Dialog onOpenChange:", newOpenState)
      setOpen(newOpenState)
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          onClick={() => console.log("Trigger button clicked")}
        >
          Add Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <Card>
          <CardContent className="space-y-4 p-6">
            <DialogHeader>
              <DialogTitle>Create Alert</DialogTitle>
              <DialogDescription>
                Enter the SQL query and email to receive notifications.
              </DialogDescription>
            </DialogHeader>

            {/* Query input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Query</label>
              <Textarea
                placeholder="Enter your SQL query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log("Cancel button clicked")
                  handleCancel()
                }} 
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  console.log("Save button clicked")
                  handleSubmit()
                }} 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Alert"}
              </Button>
            </DialogFooter>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}