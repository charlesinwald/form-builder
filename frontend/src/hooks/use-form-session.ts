"use client";

import { useEffect, useRef, useState } from "react";

interface FormSessionOptions {
  formId: string;
  autoStart?: boolean;
  onSessionStart?: (sessionId: string, startedAt: Date) => void;
  onError?: (error: string) => void;
}

interface FormSessionData {
  sessionId: string;
  startedAt: Date;
  formId: string;
}

export function useFormSession({
  formId,
  autoStart = true,
  onSessionStart,
  onError,
}: FormSessionOptions) {
  const [session, setSession] = useState<FormSessionData | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const sessionStarted = useRef(false);

  // Generate a unique session ID
  const generateSessionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Start a new form session
  const startSession = async (customSessionId?: string) => {
    if (sessionStarted.current || isStarting) {
      return session;
    }

    setIsStarting(true);
    const sessionId = customSessionId || generateSessionId();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/sessions/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            formId,
            sessionId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start session");
      }

      const data = await response.json();
      const startedAt = new Date(data.startedAt);
      
      const sessionData = {
        sessionId: data.sessionId,
        startedAt,
        formId,
      };

      setSession(sessionData);
      sessionStarted.current = true;
      
      // Store in localStorage for persistence
      localStorage.setItem(`form-session-${formId}`, JSON.stringify(sessionData));
      
      onSessionStart?.(data.sessionId, startedAt);
      return sessionData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to start form session:", errorMessage);
      onError?.(errorMessage);
      return null;
    } finally {
      setIsStarting(false);
    }
  };

  // Get completion time in seconds
  const getCompletionTime = () => {
    if (!session) return 0;
    return (Date.now() - session.startedAt.getTime()) / 1000;
  };

  // Get session data for form submission
  const getSessionDataForSubmission = () => {
    if (!session) return {};
    
    return {
      sessionId: session.sessionId,
      startedAt: session.startedAt,
    };
  };

  // Auto-start session on mount
  useEffect(() => {
    if (!autoStart || sessionStarted.current) return;

    // Check for existing session in localStorage
    const stored = localStorage.getItem(`form-session-${formId}`);
    if (stored) {
      try {
        const sessionData = JSON.parse(stored);
        // Validate that it's for the same form and not too old (> 1 hour)
        const age = Date.now() - new Date(sessionData.startedAt).getTime();
        if (sessionData.formId === formId && age < 3600000) {
          setSession({
            ...sessionData,
            startedAt: new Date(sessionData.startedAt),
          });
          sessionStarted.current = true;
          return;
        }
      } catch (error) {
        console.warn("Failed to parse stored session data:", error);
      }
    }

    // Start new session
    startSession();
  }, [formId, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: Could send a "session ended" event here
    };
  }, []);

  return {
    session,
    isStarting,
    startSession,
    getCompletionTime,
    getSessionDataForSubmission,
    isSessionActive: !!session,
  };
}