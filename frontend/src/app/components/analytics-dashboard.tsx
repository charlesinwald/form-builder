"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ResponseOverview } from "@/app/components/analytics/response-overview"
import { ResponseTrends } from "@/app/components/analytics/response-trends"
import { FieldAnalytics } from "@/app/components/analytics/field-analytics"
import { RecentResponses } from "@/app/components/analytics/recent-responses"
import { RealTimeNotification } from "@/app/components/real-time-notification"
import { useRealTimeAnalytics } from "@/hooks/use-real-time-analytics"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Download, Wifi, WifiOff } from "lucide-react"

interface FormData {
  title: string
  description: string
  fields: FormFieldData[]
}

interface FormFieldData {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormResponse {
  id: string
  submittedAt: string
  responses: Record<string, any>
  completionTime: number
}

interface AnalyticsDashboardProps {
  formData: FormData
}

export function AnalyticsDashboard({ formData }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [newResponses, setNewResponses] = useState<FormResponse[]>([])
  const { toast } = useToast()

  const {
    data: analyticsData,
    loading,
    isPolling,
    newResponsesCount,
    refreshData,
    clearNewResponsesCount,
    startPolling,
    stopPolling,
  } = useRealTimeAnalytics({
    formId: "demo-form-123",
    pollingInterval: 5000,
    onNewResponse: useCallback(
      (response: FormResponse) => {
        setNewResponses((prev) => [...prev, response])
        toast({
          title: "New Response Received!",
          description: `${response.responses.name || "Anonymous"} just submitted a response.`,
        })
      },
      [toast],
    ),
  })

  const handleDismissNotification = () => {
    setNewResponses([])
    clearNewResponsesCount()
  }

  const handleViewResponse = (response: FormResponse) => {
    console.log("Viewing response:", response)
    handleDismissNotification()
  }

  const togglePolling = () => {
    if (isPolling) {
      stopPolling()
      toast({
        title: "Real-time updates paused",
        description: "Click to resume live updates.",
      })
    } else {
      startPolling()
      toast({
        title: "Real-time updates resumed",
        description: "Dashboard will update automatically.",
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-foreground">Analytics Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">No Data Available</h2>
          <p className="text-muted-foreground">Start collecting responses to see analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Real-time Notification */}
      <RealTimeNotification
        newResponses={newResponses}
        onDismiss={handleDismissNotification}
        onViewResponse={handleViewResponse}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Analytics Dashboard</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">
                Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                {isPolling ? (
                  <Wifi className="h-4 w-4 text-secondary" />
                ) : (
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">{isPolling ? "Live" : "Paused"}</span>
              </div>
            </div>
          </div>
          {newResponsesCount > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              {newResponsesCount} new response{newResponsesCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePolling}
            className={`gap-2 bg-transparent ${isPolling ? "border-secondary text-secondary" : ""}`}
          >
            {isPolling ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isPolling ? "Live" : "Paused"}
          </Button>

          <Button variant="outline" size="sm" onClick={refreshData} className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <ResponseOverview data={analyticsData} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTrends trends={analyticsData.trends} />
        <FieldAnalytics formData={formData} responses={analyticsData.responses} />
      </div>

      {/* Recent Responses */}
      <RecentResponses responses={analyticsData.responses} />
    </div>
  )
}
