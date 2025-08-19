"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Share, Eye } from "lucide-react"

interface HeaderProps {
  formTitle: string
  onTitleChange: (title: string) => void
  activeView: "builder" | "preview" | "analytics"
  onShare: () => void
}

export function Header({ formTitle, onTitleChange, activeView, onShare }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Input
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg font-medium bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Form Title"
        />
        <span className="text-sm text-muted-foreground capitalize">{activeView}</span>
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
