"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Save, Share, Eye } from "lucide-react"

interface HeaderProps {
  formTitle: string
  onTitleChange: (title: string) => void
  activeView: "dashboard" | "builder" | "preview" | "analytics"
  onShare: () => void
  formStatus?: "draft" | "published" | "archived"
  showFormControls?: boolean
}

export function Header({
  formTitle,
  onTitleChange,
  activeView,
  onShare,
  formStatus = "draft",
  showFormControls = true,
}: HeaderProps) {
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

  if (!showFormControls) {
    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif font-bold text-foreground">Forms Dashboard</h2>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Input
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg font-medium bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Form Title"
        />
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(formStatus)}>{formStatus}</Badge>
          <span className="text-sm text-muted-foreground capitalize">{activeView}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button size="sm" className="gap-2" onClick={onShare}>
          <Share className="h-4 w-4" />
          Share
        </Button>
      </div>
    </header>
  )
}
