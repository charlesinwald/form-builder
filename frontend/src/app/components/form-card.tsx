"use client";

import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  BarChart3,
  Share,
  Archive,
  FileText,
  MessageSquare,
} from "lucide-react";

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: unknown[];
  status: "draft" | "published" | "archived";
  createdAt: string;
  updatedAt: string;
  responseCount?: number;
}

interface FormCardProps {
  form: FormData;
  viewMode: "grid" | "list";
  isStatusChanging?: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStatusChange: (status: "draft" | "published" | "archived") => void;
  onShare?: () => void;
  onViewResponses?: () => void;
  context?: "dashboard" | "analytics";
}

export function FormCard({
  form,
  viewMode,
  isStatusChanging = false,
  onSelect,
  onDuplicate,
  onDelete,
  onStatusChange,
  onShare,
  onViewResponses,
  context = "dashboard",
}: FormCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-secondary text-secondary-foreground";
      case "archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-chart-2 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = () => {
    // Context-aware behavior
    if (context === "analytics") {
      // On analytics page, always show analytics for the selected form
      onSelect();
    } else {
      // On dashboard, if there are responses, go to responses view, otherwise go to form builder
      if (form.responseCount && form.responseCount > 0 && onViewResponses) {
        onViewResponses();
      } else {
        onSelect();
      }
    }
  };

  if (viewMode === "list") {
    return (
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">
                    {form.title}
                  </h3>
                  <Badge
                    className={`${getStatusColor(form.status)} ${
                      isStatusChanging ? "animate-pulse" : ""
                    }`}
                  >
                    {isStatusChanging ? "updating..." : form.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {form.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div
                className="text-center cursor-pointer"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onViewResponses?.();
                }}
              >
                <div className="font-medium text-foreground">
                  {form.responseCount || 0}
                </div>
                <div>Responses</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-foreground">
                  {form.fields.length}
                </div>
                <div>Fields</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-foreground">
                  {formatDate(form.updatedAt)}
                </div>
                <div>Updated</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onSelect();
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDuplicate();
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  {onViewResponses && (
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onViewResponses();
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Responses
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {form.status !== "published" && (
                    <DropdownMenuItem
                      disabled={isStatusChanging}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (!isStatusChanging) onStatusChange("published");
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      {isStatusChanging ? "Publishing..." : "Publish"}
                    </DropdownMenuItem>
                  )}
                  {form.status !== "archived" && (
                    <DropdownMenuItem
                      disabled={isStatusChanging}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        if (!isStatusChanging) onStatusChange("archived");
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {isStatusChanging ? "Archiving..." : "Archive"}
                    </DropdownMenuItem>
                  )}
                  {form.status === "published" && onShare && (
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onShare();
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-foreground truncate">
                {form.title}
              </h3>
              <Badge
                className={`${getStatusColor(form.status)} ${
                  isStatusChanging ? "animate-pulse" : ""
                }`}
              >
                {isStatusChanging ? "updating..." : form.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {form.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {onViewResponses && (
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onViewResponses();
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Responses
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {form.status !== "published" && (
                <DropdownMenuItem
                  disabled={isStatusChanging}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!isStatusChanging) onStatusChange("published");
                  }}
                >
                  <Share className="h-4 w-4 mr-2" />
                  {isStatusChanging ? "Publishing..." : "Publish"}
                </DropdownMenuItem>
              )}
              {form.status !== "archived" && (
                <DropdownMenuItem
                  disabled={isStatusChanging}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (!isStatusChanging) onStatusChange("archived");
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isStatusChanging ? "Archiving..." : "Archive"}
                </DropdownMenuItem>
              )}
              {form.status === "published" && onShare && (
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onShare();
                  }}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewResponses?.();
              }}
            >
              <BarChart3 className="h-4 w-4" />
              <span>{form.responseCount || 0} responses</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{form.fields.length} fields</span>
            </div>
          </div>
          <span>Updated {formatDate(form.updatedAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
