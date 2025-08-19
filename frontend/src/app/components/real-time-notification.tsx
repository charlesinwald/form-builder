"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Bell, X, Eye } from "lucide-react";

interface FormResponse {
  id: string;
  submittedAt: string;
  responses: Record<string, unknown>;
  completionTime: number;
}

interface RealTimeNotificationProps {
  newResponses: FormResponse[];
  onDismiss: () => void;
  onViewResponse: (response: FormResponse) => void;
}

export function RealTimeNotification({
  newResponses,
  onDismiss,
  onViewResponse,
}: RealTimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newResponses.length > 0) {
      setIsVisible(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [newResponses, onDismiss]);

  if (!isVisible || newResponses.length === 0) return null;

  const latestResponse = newResponses[newResponses.length - 1];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <Card className="p-4 max-w-sm shadow-lg border-l-4 border-l-secondary">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-secondary/10 rounded-full">
              <Bell className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">New Response</h4>
                {newResponses.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    +{newResponses.length - 1} more
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(typeof latestResponse.responses.name === "string" &&
                  latestResponse.responses.name) ||
                  "Anonymous"}{" "}
                just submitted a response
              </p>
              {typeof latestResponse.responses.rating === "number" &&
                latestResponse.responses.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Rating:
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xs ${
                            star <= (latestResponse.responses.rating as number)
                              ? "text-secondary"
                              : "text-muted-foreground"
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewResponse(latestResponse)}
            className="flex-1 h-7 text-xs bg-transparent"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </Card>
    </div>
  );
}
