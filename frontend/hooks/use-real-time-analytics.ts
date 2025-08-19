"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface FormResponse {
  id: string
  submittedAt: string
  responses: Record<string, any>
  completionTime: number
}

interface TrendData {
  date: string
  responses: number
}

interface AnalyticsData {
  totalResponses: number
  responseRate: number
  averageCompletionTime: number
  lastUpdated: string
  responses: FormResponse[]
  trends: TrendData[]
}

interface UseRealTimeAnalyticsOptions {
  formId?: string
  pollingInterval?: number
  onNewResponse?: (response: FormResponse) => void
}

export function useRealTimeAnalytics({
  formId,
  pollingInterval = 5000,
  onNewResponse,
}: UseRealTimeAnalyticsOptions = {}) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPolling, setIsPolling] = useState(false)
  const [newResponsesCount, setNewResponsesCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<string | null>(null)

  // Mock data generator with incremental updates
  const generateMockData = useCallback(
    (isUpdate = false): AnalyticsData => {
      const baseResponses: FormResponse[] = [
        {
          id: "1",
          submittedAt: "2024-01-15T10:30:00Z",
          completionTime: 120,
          responses: {
            name: "John Doe",
            email: "john@example.com",
            rating: 5,
            service: "Customer Support",
            feedback: "Excellent service, very helpful staff!",
          },
        },
        {
          id: "2",
          submittedAt: "2024-01-15T14:20:00Z",
          completionTime: 95,
          responses: {
            name: "Jane Smith",
            email: "jane@example.com",
            rating: 4,
            service: "Technical Support",
            feedback: "Good support, resolved my issue quickly.",
          },
        },
        {
          id: "3",
          submittedAt: "2024-01-16T09:15:00Z",
          completionTime: 180,
          responses: {
            name: "Mike Johnson",
            email: "mike@example.com",
            rating: 3,
            service: "Billing",
            feedback: "Process was okay, could be more streamlined.",
          },
        },
        {
          id: "4",
          submittedAt: "2024-01-16T16:45:00Z",
          completionTime: 75,
          responses: {
            name: "Sarah Wilson",
            email: "sarah@example.com",
            rating: 5,
            service: "Product Demo",
            feedback: "Amazing demo, very impressed with the features!",
          },
        },
        {
          id: "5",
          submittedAt: "2024-01-17T11:30:00Z",
          completionTime: 110,
          responses: {
            name: "David Brown",
            email: "david@example.com",
            rating: 4,
            service: "Customer Support",
            feedback: "Helpful team, quick response time.",
          },
        },
      ]

      // Simulate new responses during updates
      const additionalResponses: FormResponse[] = []
      if (isUpdate && Math.random() > 0.7) {
        const names = ["Alex Chen", "Maria Garcia", "Tom Wilson", "Lisa Anderson", "Chris Taylor"]
        const services = ["Customer Support", "Technical Support", "Billing", "Product Demo"]
        const feedbacks = [
          "Great experience overall!",
          "Very satisfied with the service.",
          "Could use some improvements.",
          "Excellent support team.",
          "Quick and efficient process.",
        ]

        const newResponse: FormResponse = {
          id: `new-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          completionTime: Math.floor(Math.random() * 120) + 60,
          responses: {
            name: names[Math.floor(Math.random() * names.length)],
            email: `user${Date.now()}@example.com`,
            rating: Math.floor(Math.random() * 5) + 1,
            service: services[Math.floor(Math.random() * services.length)],
            feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
          },
        }

        additionalResponses.push(newResponse)
        onNewResponse?.(newResponse)
      }

      const allResponses = [...baseResponses, ...additionalResponses]

      const trends: TrendData[] = [
        { date: "2024-01-11", responses: 2 },
        { date: "2024-01-12", responses: 3 },
        { date: "2024-01-13", responses: 1 },
        { date: "2024-01-14", responses: 4 },
        { date: "2024-01-15", responses: 6 },
        { date: "2024-01-16", responses: 5 },
        { date: "2024-01-17", responses: allResponses.length },
      ]

      return {
        totalResponses: allResponses.length,
        responseRate: 78.5 + (isUpdate ? Math.random() * 2 : 0),
        averageCompletionTime: allResponses.reduce((acc, r) => acc + r.completionTime, 0) / allResponses.length,
        lastUpdated: new Date().toISOString(),
        responses: allResponses,
        trends,
      }
    },
    [onNewResponse],
  )

  const fetchData = useCallback(
    async (isUpdate = false) => {
      if (isUpdate) setIsPolling(true)
      else setLoading(true)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, isUpdate ? 500 : 1000))
        const newData = generateMockData(isUpdate)

        // Check for new responses
        if (data && isUpdate) {
          const newResponsesCount = newData.responses.length - data.responses.length
          if (newResponsesCount > 0) {
            setNewResponsesCount((prev) => prev + newResponsesCount)
          }
        }

        setData(newData)
        lastUpdateRef.current = newData.lastUpdated
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
      } finally {
        setLoading(false)
        setIsPolling(false)
      }
    },
    [data, generateMockData],
  )

  const startPolling = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      fetchData(true)
    }, pollingInterval)
  }, [fetchData, pollingInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const refreshData = useCallback(() => {
    fetchData(false)
    setNewResponsesCount(0)
  }, [fetchData])

  const clearNewResponsesCount = useCallback(() => {
    setNewResponsesCount(0)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchData(false)
  }, [])

  // Start/stop polling based on component mount
  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    isPolling,
    newResponsesCount,
    refreshData,
    clearNewResponsesCount,
    startPolling,
    stopPolling,
  }
}
