"use client"

import { Card, CardContent, CardHeader } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Copy, Trash2, BarChart3, Share, Archive, FileText } from "lucide-react"

interface FormData {
  id: string
  title: string
  description: string
  fields: any[]
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  responseCount: number
}

interface FormCardProps {
  form: FormData
  viewMode: "grid" | "list"
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onStatusChange: (status: "draft" | "published" | "archived") => void
}

export function FormCard({ form, viewMode, onSelect, onDuplicate, onDelete, onStatusChange }: FormCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-secondary text-secondary-foreground"
      case "archived":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-chart-2 text-white"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-foreground truncate">{form.title}</h3>
                  <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{form.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-medium text-foreground">{form.responseCount}</div>
                <div>Responses</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-foreground">{form.fields.length}</div>
                <div>Fields</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-foreground">{formatDate(form.updatedAt)}</div>
                <div>Updated</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect()
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDuplicate()
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {form.status !== "published" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange("published")
                      }}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  {form.status !== "archived" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange("archived")
                      }}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
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
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-foreground truncate">{form.title}</h3>
              <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate()
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {form.status !== "published" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange("published")
                  }}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              {form.status !== "archived" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange("archived")
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
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
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>{form.responseCount} responses</span>
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
  )
}
