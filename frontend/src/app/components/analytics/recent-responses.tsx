"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";

interface FormResponse {
  id: string;
  submittedAt: string;
  responses: Record<string, any>;
  completionTime: number;
}

interface RecentResponsesProps {
  responses: FormResponse[];
}

export function RecentResponses({ responses }: RecentResponsesProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return "bg-secondary text-secondary-foreground";
    if (rating >= 3) return "bg-chart-2 text-white";
    return "bg-destructive text-destructive-foreground";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-inter">Recent Responses</CardTitle>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Eye className="h-4 w-4" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {responses.slice(0, 5).map((response) => (
            <div
              key={response.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">
                    {response.responses.name || "Anonymous"}
                  </span>
                  {response.responses.rating && (
                    <Badge
                      className={getRatingBadgeColor(response.responses.rating)}
                    >
                      {response.responses.rating} ⭐
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatDate(response.submittedAt)}</span>
                  <span>
                    Completed in {formatTime(response.completionTime)}
                  </span>
                  {response.responses.service && (
                    <span>{response.responses.service}</span>
                  )}
                </div>
                {response.responses.feedback && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {response.responses.feedback}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
