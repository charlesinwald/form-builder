"use client"

import { Button } from "@/app/components/ui/button"
import { BarChart3, Eye, Settings, Plus, Home } from "lucide-react"

interface SidebarProps {
  activeView: "dashboard" | "builder" | "preview" | "analytics"
  onViewChange: (view: "dashboard" | "builder" | "preview" | "analytics") => void
  onNewForm: () => void
}

export function Sidebar({ activeView, onViewChange, onNewForm }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "All Forms", icon: Home },
    { id: "builder" as const, label: "Form Builder", icon: Settings },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-serif font-bold text-sidebar-foreground">FormCraft</h1>
        <p className="text-sm text-muted-foreground">Professional Form Builder</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button className="w-full gap-2" size="sm" onClick={onNewForm}>
          <Plus className="h-4 w-4" />
          New Form
        </Button>
      </div>
    </div>
  )
}
