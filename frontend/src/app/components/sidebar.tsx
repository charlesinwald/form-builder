"use client";

import { Button } from "@/app/components/ui/button";
import { ChartBar,BarChart3, Eye, Settings, Plus, Home } from "lucide-react";

interface SidebarProps {
  activeView: "dashboard" | "builder" | "preview" | "analytics" | "responses";
  onViewChange: (
    view: "dashboard" | "builder" | "preview" | "analytics" | "responses"
  ) => void;
  onNewForm: () => void;
}

export function Sidebar({ activeView, onViewChange, onNewForm }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "All Forms", icon: Home },
    { id: "builder" as const, label: "Form Builder", icon: Settings },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "responses" as const, label: "Responses", icon: ChartBar },
  ];

  return (
    <div className="w-full md:w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen md:fixed md:left-0 md:top-0">
      <div className="p-3 sm:p-4 border-b border-sidebar-border">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-inter font-black tracking-tight">
          <span className="bg-gradient-to-b from-cyan-600 via-primary to-teal-700 bg-clip-text text-transparent">
            Form
          </span>
          <span className="bg-gradient-to-b from-teal-500 via-white to-teal-600 bg-clip-text text-transparent">
            Craft
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Professional Form Builder
        </p>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-2 sm:gap-3 text-sm"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t border-sidebar-border">
        <Button className="w-full gap-2 text-sm" size="sm" onClick={onNewForm}>
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">New Form</span>
        </Button>
      </div>
    </div>
  );
}
