'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getWebSocketClient, WebSocketClient, WSMessage } from '@/lib/websocket';

export interface AnalyticsData {
  formId: string;
  totalResponses: number;
  todayResponses: number;
  weekResponses: number;
  monthResponses: number;
  completionRate: number;
  averageTime: number;
  deviceStats: Record<string, number>;
  fieldAnalytics: Record<string, FieldStats>;
  responseTrends: TrendPoint[];
  recentResponses: ResponseSummary[];
  lastUpdated: string;
  peakHour: number;
  topReferrer: string;
}

export interface FieldStats {
  fieldId: string;
  fieldLabel: string;
  responseCount: number;
  skipCount: number;
  topValues: Record<string, number>;
  averageValue?: number;
  distribution?: Record<string, any>;
}

export interface TrendPoint {
  time: string;
  count: number;
  label: string;
}

export interface ResponseSummary {
  id: string;
  submittedAt: string;
  device: string;
  location: string;
  responseData: Record<string, any>;
}

export interface NewResponseData {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, any>;
  device: string;
}

interface UseWebSocketAnalyticsOptions {
  formId: string;
  onNewResponse?: (response: NewResponseData) => void;
  onAnalyticsUpdate?: (analytics: AnalyticsData) => void;
  autoConnect?: boolean;
}

interface UseWebSocketAnalyticsReturn {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionState: string;
  newResponsesCount: number;
  lastResponse: NewResponseData | null;
  connect: () => void;
  disconnect: () => void;
  resetNewResponsesCount: () => void;
  refreshAnalytics: () => Promise<void>;
}

export function useWebSocketAnalytics({
  formId,
  onNewResponse,
  onAnalyticsUpdate,
  autoConnect = true
}: UseWebSocketAnalyticsOptions): UseWebSocketAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [newResponsesCount, setNewResponsesCount] = useState(0);
  const [lastResponse, setLastResponse] = useState<NewResponseData | null>(null);
  
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const formIdRef = useRef(formId);

  // Fetch initial analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/analytics/form/${formId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [formId]);

  // Handle WebSocket messages
  const handleNewResponse = useCallback((data: NewResponseData) => {
    console.log('New response received:', data);
    setLastResponse(data);
    setNewResponsesCount(prev => prev + 1);
    
    // Add to recent responses in analytics
    setAnalytics(prev => {
      if (!prev) return prev;
      
      const newResponse: ResponseSummary = {
        id: data.id,
        submittedAt: data.submittedAt,
        device: data.device,
        location: 'Unknown',
        responseData: data.data
      };

      return {
        ...prev,
        totalResponses: prev.totalResponses + 1,
        todayResponses: prev.todayResponses + 1,
        weekResponses: prev.weekResponses + 1,
        monthResponses: prev.monthResponses + 1,
        recentResponses: [newResponse, ...prev.recentResponses.slice(0, 9)],
        lastUpdated: new Date().toISOString()
      };
    });

    onNewResponse?.(data);
  }, [onNewResponse]);

  const handleAnalyticsUpdate = useCallback((data: AnalyticsData) => {
    console.log('Analytics update received:', data);
    setAnalytics(data);
    onAnalyticsUpdate?.(data);
  }, [onAnalyticsUpdate]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsClientRef.current?.isConnected()) {
      console.log('Already connected to WebSocket');
      return;
    }

    console.log('Connecting to WebSocket for form:', formId);
    
    const client = getWebSocketClient({
      onOpen: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionState('CONNECTED');
        setError(null);
        
        // Subscribe to form updates
        client.subscribe(formId);
      },
      onClose: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionState('DISCONNECTED');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setConnectionState('ERROR');
      },
      onMessage: (message: WSMessage) => {
        // Handle different message types
        switch (message.type) {
          case 'new_response':
            if (message.formId === formId && message.data) {
              handleNewResponse(message.data as NewResponseData);
            }
            break;
          case 'analytics_update':
            if (message.formId === formId && message.data) {
              handleAnalyticsUpdate(message.data as AnalyticsData);
            }
            break;
          case 'heartbeat':
            // Keep connection alive
            break;
          case 'subscribed':
            console.log(`Subscribed to form ${message.formId}`);
            break;
          case 'unsubscribed':
            console.log(`Unsubscribed from form ${message.formId}`);
            break;
        }
      }
    });

    client.connect();
    wsClientRef.current = client;
  }, [formId, handleNewResponse, handleAnalyticsUpdate]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsClientRef.current) {
      wsClientRef.current.unsubscribe(formId);
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
      setIsConnected(false);
      setConnectionState('DISCONNECTED');
    }
  }, [formId]);

  // Reset new responses count
  const resetNewResponsesCount = useCallback(() => {
    setNewResponsesCount(0);
  }, []);

  // Refresh analytics
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Update connection state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsClientRef.current) {
        const state = wsClientRef.current.getConnectionState();
        setConnectionState(state);
        setIsConnected(state === 'CONNECTED');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle form ID changes
  useEffect(() => {
    if (formId !== formIdRef.current) {
      // Unsubscribe from old form
      if (formIdRef.current && wsClientRef.current?.isConnected()) {
        wsClientRef.current.unsubscribe(formIdRef.current);
      }
      
      // Subscribe to new form
      if (formId && wsClientRef.current?.isConnected()) {
        wsClientRef.current.subscribe(formId);
      }
      
      formIdRef.current = formId;
      
      // Fetch new analytics
      fetchAnalytics();
    }
  }, [formId, fetchAnalytics]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      fetchAnalytics();
      connect();
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect]); // Only run on mount/unmount

  return {
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
    refreshAnalytics
  };
}