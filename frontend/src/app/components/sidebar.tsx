"use client";

import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChartBar, BarChart3, Eye, Settings, Plus, Home } from "lucide-react";

interface SidebarProps {
  activeView: "dashboard" | "builder" | "preview" | "analytics" | "responses";
  onViewChange: (
    view: "dashboard" | "builder" | "preview" | "analytics" | "responses"
  ) => void;
  onNewForm: () => void;
  isMobile?: boolean;
}

export function Sidebar({ activeView, onViewChange, onNewForm, isMobile = false }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "All Forms", icon: Home },
    { id: "builder" as const, label: "Form Builder", icon: Settings },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "responses" as const, label: "Responses", icon: ChartBar },
  ];
  
  // Mobile sidebar rendering - simple HTML structure
  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full bg-background">
        {/* Header */}
        <div className="px-4 py-6 border-b">
          <h1 className="text-2xl font-inter font-black tracking-tight">
            <span className="bg-gradient-to-b from-cyan-600 via-primary to-teal-700 bg-clip-text text-transparent">
              Form
            </span>
            <span className="bg-gradient-to-b from-teal-500 via-white to-teal-600 bg-clip-text text-transparent">
              Craft
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Professional Form Builder
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onNewForm}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span>New Form</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Desktop sidebar - use UI library components
  // Try to get sidebar state, but handle the case where it's not available
  let sidebarState = "expanded";
  try {
    const { state } = useSidebar();
    sidebarState = state;
  } catch {
    // useSidebar hook not available, default to expanded
    sidebarState = "expanded";
  }
  
  return (
    <UISidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <div className="px-3 py-4">
          <h1 className="text-3xl font-inter font-black tracking-tight group-data-[collapsible=icon]:hidden">
            <span className="bg-gradient-to-b from-cyan-600 via-primary to-teal-700 bg-clip-text text-transparent">
              Form
            </span>
            <span className="bg-gradient-to-b from-teal-500 via-white to-teal-600 bg-clip-text text-transparent">
              Craft
            </span>
          </h1>
          <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center hidden">
            <span className="text-xl font-inter font-black bg-gradient-to-b from-cyan-600 via-primary to-teal-700 bg-clip-text text-transparent">
              FC
            </span>
          </div>
          <p className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
            Professional Form Builder
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeView === item.id}
                      tooltip={item.label}
                      onClick={() => onViewChange(item.id)}
                      size="lg"
                      className={cn(
                        sidebarState !== "expanded" && "justify-center",
                        activeView === item.id &&
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                        "hover:bg-primary/50"
                      )}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          sidebarState === "expanded" ? "h-5 w-5" : "h-6 w-6"
                        }`}
                      />
                      {sidebarState === "expanded" && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onNewForm}
              tooltip="New Form"
              size="lg"
              className={cn("bg-primary text-primary-foreground hover:bg-primary/90", sidebarState !== "expanded" && "justify-center")}
            >
              <Plus className="h-5 w-5" />
              {sidebarState === "expanded" && <span>New Form</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
}
