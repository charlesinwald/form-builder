'use client';

import { useState, useEffect } from 'react';
import { RealTimeAnalyticsDashboard } from '@/app/components/real-time-analytics-dashboard';
import { RealTimeNotifications, useNotifications } from '@/app/components/real-time-notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { useWebSocketAnalytics } from '@/hooks/use-websocket-analytics';
import { Activity, Send, Rocket, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Demo form ID - in production, this would come from route params or props
const DEMO_FORM_ID = '6789c7f2e8b9a0d1e2f3a4b5';

export default function AnalyticsPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();

  // Initialize WebSocket analytics for notifications
  const { lastResponse, newResponsesCount } = useWebSocketAnalytics({
    formId: DEMO_FORM_ID,
    onNewResponse: (response) => {
      // Add notification for new response
      addNotification({
        type: 'response',
        title: '🎉 New Response!',
        description: `${response.data.name || 'Someone'} just submitted a response from ${response.device}`,
        actions: [
          {
            label: 'View Response',
            action: () => console.log('Viewing response:', response)
          }
        ]
      });

      // Check for milestones
      if (newResponsesCount > 0 && newResponsesCount % 10 === 0) {
        addNotification({
          type: 'milestone',
          title: '🏆 Milestone Reached!',
          description: `You've received ${newResponsesCount} responses today!`,
        });
      }
    },
    autoConnect: true
  });

  // Simulate form submissions for demo
  const simulateSubmission = async () => {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
    const devices = ['Mobile', 'Desktop', 'Tablet'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];

    const formData = {
      name: randomName,
      email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
      feedback: 'This is a simulated response for testing real-time analytics.',
      rating: Math.floor(Math.random() * 5) + 1
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': randomDevice === 'Mobile' ? 'Mobile Device' : 'Desktop Browser'
          },
          body: JSON.stringify({
            formId: DEMO_FORM_ID,
            data: formData
          })
        }
      );

      if (response.ok) {
        console.log('Simulated submission successful');
      }
    } catch (error) {
      console.error('Error simulating submission:', error);
    }
  };

  // Start/stop simulation
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
      setIsSimulating(false);
      addNotification({
        type: 'info',
        title: 'Simulation Stopped',
        description: 'Automatic form submissions have been paused.'
      });
    } else {
      // Submit immediately, then every 5-15 seconds
      simulateSubmission();
      const interval = setInterval(() => {
        simulateSubmission();
      }, Math.random() * 10000 + 5000);
      setSimulationInterval(interval);
      setIsSimulating(true);
      addNotification({
        type: 'info',
        title: 'Simulation Started',
        description: 'Automatic form submissions will occur every 5-15 seconds.'
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  return (
    <div className="min-h-screen bg-background">
      {/* Real-time notifications */}
      <RealTimeNotifications
        notifications={notifications}
        onDismiss={removeNotification}
        onDismissAll={clearNotifications}
        position="top-right"
        maxNotifications={5}
        autoHideDuration={8000}
      />

      {/* Page Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Real-Time Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor form responses with live WebSocket updates
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Activity className="h-3 w-3" />
                Demo Mode
              </Badge>
              <Button
                onClick={toggleSimulation}
                variant={isSimulating ? "destructive" : "default"}
                className="gap-2"
              >
                {isSimulating ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    Stop Simulation
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Start Simulation
                  </>
                )}
              </Button>
              <Button
                onClick={simulateSubmission}
                variant="outline"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Test Response
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This dashboard updates in real-time via WebSocket connection. 
                {isSimulating 
                  ? ' Automatic submissions are currently running.'
                  : ' Click "Start Simulation" to see live updates or submit test responses manually.'}
              </AlertDescription>
            </Alert>

            {/* Real-Time Analytics Dashboard */}
            <RealTimeAnalyticsDashboard
              formId={DEMO_FORM_ID}
              formTitle="Demo Feedback Form"
            />
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use the Real-Time Analytics Dashboard</CardTitle>
                <CardDescription>
                  Experience live data updates without page refreshes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Features
                  </h3>
                  <ul className="space-y-2 ml-6 text-sm">
                    <li>• WebSocket connection for instant updates</li>
                    <li>• Live response notifications with sound and visual alerts</li>
                    <li>• Real-time chart updates and animations</li>
                    <li>• Device and field analytics tracking</li>
                    <li>• Response trend visualization</li>
                    <li>• Export analytics data as JSON</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Testing the Dashboard</h3>
                  <ol className="space-y-2 ml-6 text-sm list-decimal">
                    <li>Click "Start Simulation" to begin automatic form submissions</li>
                    <li>Watch as responses appear in real-time on the dashboard</li>
                    <li>Notice the live notifications in the top-right corner</li>
                    <li>Observe chart animations and data updates</li>
                    <li>Click "Submit Test Response" for manual submissions</li>
                    <li>Toggle connection on/off to test reconnection</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Connection States
                  </h3>
                  <ul className="space-y-2 ml-6 text-sm">
                    <li><Badge variant="default" className="mr-2">CONNECTED</Badge> Receiving live updates</li>
                    <li><Badge variant="secondary" className="mr-2">CONNECTING</Badge> Establishing connection</li>
                    <li><Badge variant="outline" className="mr-2">DISCONNECTED</Badge> No live updates</li>
                    <li><Badge variant="destructive" className="mr-2">ERROR</Badge> Connection failed</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Architecture</CardTitle>
                <CardDescription>
                  How the real-time analytics system works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Backend (Go + Fiber)</h3>
                  <ul className="space-y-2 ml-6 text-sm">
                    <li>• WebSocket server using Gorilla WebSocket</li>
                    <li>• Hub pattern for managing client connections</li>
                    <li>• Form-specific subscription channels</li>
                    <li>• Real-time broadcasting on new responses</li>
                    <li>• MongoDB for data persistence</li>
                    <li>• Analytics service for data aggregation</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Frontend (Next.js + React)</h3>
                  <ul className="space-y-2 ml-6 text-sm">
                    <li>• WebSocket client with automatic reconnection</li>
                    <li>• React hooks for state management</li>
                    <li>• Recharts for data visualization</li>
                    <li>• Framer Motion for animations</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Real-time notification system</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Data Flow</h3>
                  <ol className="space-y-2 ml-6 text-sm list-decimal">
                    <li>User submits form response</li>
                    <li>Backend saves to MongoDB</li>
                    <li>Backend broadcasts via WebSocket to subscribed clients</li>
                    <li>Frontend receives message and updates UI</li>
                    <li>Charts and stats update with animations</li>
                    <li>Notifications appear for important events</li>
                  </ol>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">WebSocket Message Types</h4>
                  <div className="space-y-1 text-sm font-mono">
                    <div>• new_response - New form submission</div>
                    <div>• analytics_update - Updated analytics data</div>
                    <div>• heartbeat - Keep-alive signal</div>
                    <div>• subscribe/unsubscribe - Channel management</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

