"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { TrendingUp, Users, Clock, Percent } from "lucide-react"

interface AnalyticsData {
  totalResponses: number
  responseRate: number
  averageCompletionTime: number
  lastUpdated: string
}

interface ResponseOverviewProps {
  data: AnalyticsData
}

export function ResponseOverview({ data }: ResponseOverviewProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const overviewCards = [
    {
      title: "Total Responses",
      value: data.totalResponses.toLocaleString(),
      icon: Users,
      trend: "+12% from last week",
      color: "text-chart-1",
    },
    {
      title: "Response Rate",
      value: `${data.responseRate}%`,
      icon: Percent,
      trend: "+5.2% from last week",
      color: "text-chart-2",
    },
    {
      title: "Avg. Completion Time",
      value: formatTime(Math.round(data.averageCompletionTime)),
      icon: Clock,
      trend: "-8s from last week",
      color: "text-chart-3",
    },
    {
      title: "Completion Rate",
      value: "94.2%",
      icon: TrendingUp,
      trend: "+2.1% from last week",
      color: "text-chart-4",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
