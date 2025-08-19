"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { useWebSocketAnalytics } from "@/hooks/use-websocket-analytics";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Bell,
  BellOff,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface RealTimeAnalyticsDashboardProps {
  formId: string;
  formTitle?: string;
}

const COLORS = [
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
];

export function RealTimeAnalyticsDashboard({
  formId,
  formTitle = "Form",
}: RealTimeAnalyticsDashboardProps) {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    analytics,
    loading,
    error,
    isConnected,
    connectionState,
    newResponsesCount,
    lastResponse,
    connect,
    disconnect,
    resetNewResponsesCount,
    refreshAnalytics,
  } = useWebSocketAnalytics({
    formId,
    onNewResponse: useCallback(
      (response) => {
        if (notificationsEnabled) {
          toast({
            title: "🎉 New Response!",
            description: `A new response was just submitted${
              response.data.name ? ` by ${response.data.name}` : ""
            }.`,
            duration: 5000,
          });
        }
      },
      [notificationsEnabled, toast]
    ),
    onAnalyticsUpdate: useCallback(() => {
      console.log("Analytics updated in real-time");
    }, []),
  });

  // Handle connection toggle
  const toggleConnection = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "Disconnected",
        description: "Real-time updates paused",
      });
    } else {
      connect();
      toast({
        title: "Connected",
        description: "Real-time updates resumed",
      });
    }
  };

  // Handle notifications toggle
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: notificationsEnabled
        ? "Notifications Disabled"
        : "Notifications Enabled",
      description: notificationsEnabled
        ? "You won't receive notifications for new responses"
        : "You'll be notified when new responses arrive",
    });
  };

  // Export data
  const exportData = () => {
    if (!analytics) return;

    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-${formId}-${new Date().toISOString()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Data Exported",
      description: "Analytics data has been downloaded",
    });
  };

  // Format device data for pie chart
  const deviceData = analytics?.deviceStats
    ? Object.entries(analytics.deviceStats).map(([name, value]) => ({
        name,
        value,
        icon:
          name === "Mobile"
            ? "📱"
            : name === "Desktop"
            ? "💻"
            : name === "Tablet"
            ? "📱"
            : "🌐",
      }))
    : [];

  // Format trend data for line chart
  const trendData = analytics?.responseTrends || [];

  // Format field analytics for bar chart
  const fieldData = analytics?.fieldAnalytics
    ? Object.values(analytics.fieldAnalytics).map((field) => ({
        name: field.fieldLabel,
        responses: field.responseCount,
        skipped: field.skipCount,
        rate:
          field.responseCount > 0
            ? Math.round(
                (field.responseCount /
                  (field.responseCount + field.skipCount)) *
                  100
              )
            : 0,
      }))
    : [];

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Real-Time Analytics
          </h2>
          <p className="text-muted-foreground mt-1">
            {formTitle} • Live Dashboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* New Responses Badge */}
          <AnimatePresence>
            {newResponsesCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Badge
                  variant="default"
                  className="bg-primary text-primary-foreground animate-pulse cursor-pointer"
                  onClick={resetNewResponsesCount}
                >
                  {newResponsesCount} new response
                  {newResponsesCount > 1 ? "s" : ""}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Connection Status */}
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className="gap-1"
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connectionState}
          </Badge>

          {/* Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleNotifications}
            className="gap-2"
          >
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {notificationsEnabled ? "Notifications On" : "Notifications Off"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnection}
            className={isConnected ? "border-green-500 text-green-600" : ""}
          >
            {isConnected ? (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={refreshAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Responses
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.totalResponses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                +{analytics?.todayResponses || 0} today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.completionRate?.toFixed(1) || 0}%
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-full bg-secondary rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics?.completionRate || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor((analytics?.averageTime || 0) / 60)}:
                {String(
                  Math.floor((analytics?.averageTime || 0) % 60)
                ).padStart(2, "0")}
              </div>
              <p className="text-xs text-muted-foreground">
                minutes per response
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.peakHour || 0}:00
              </div>
              <p className="text-xs text-muted-foreground">Most active time</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs for different views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Response Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Response Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient
                      id="colorResponse"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="label"
                    className="text-xs"
                    tick={{ fill: "currentColor" }}
                  />
                  <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorResponse)"
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Responses
                {lastResponse && (
                  <Badge variant="secondary" className="ml-2 animate-pulse">
                    Live
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <AnimatePresence>
                  {analytics?.recentResponses
                    ?.slice(0, 5)
                    .map((response, index) => (
                      <motion.div
                        key={response.id}
                        initial={
                          index === 0 && lastResponse?.id === response.id
                            ? { x: -20, opacity: 0 }
                            : false
                        }
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          index === 0 && lastResponse?.id === response.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <div>
                            <p className="text-sm font-medium">
                              {response.responseData?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(response.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {response.device === "Mobile"
                              ? "📱"
                              : response.device === "Desktop"
                              ? "💻"
                              : "📱"}
                            {response.device}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Response Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RechartsLineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="label" tick={{ fill: "currentColor" }} />
                  <YAxis tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Responses"
                    animationDuration={1000}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Device Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device, index) => (
                    <div
                      key={device.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-medium">
                          {device.icon} {device.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {device.value}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          responses
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Field Response Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={fieldData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "currentColor" }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fill: "currentColor" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="responses"
                    fill="#10b981"
                    name="Responded"
                    animationDuration={1000}
                  />
                  <Bar
                    dataKey="skipped"
                    fill="#ef4444"
                    name="Skipped"
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Connection Status Footer */}
      {!isConnected && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Real-time updates are paused. Click &quot;Connect&quot; to resume
            live updates.
          </AlertDescription>
        </Alert>
      )}

      {/* Last Update Time */}
      {analytics && (
        <div className="text-center text-xs text-muted-foreground">
          Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
          {isConnected && (
            <span className="ml-2">• Receiving live updates</span>
          )}
        </div>
      )}
    </div>
  );
}
