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
}

export function Sidebar({ activeView, onViewChange, onNewForm }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "All Forms", icon: Home },
    { id: "builder" as const, label: "Form Builder", icon: Settings },
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "responses" as const, label: "Responses", icon: ChartBar },
  ];
  const { state } = useSidebar();
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
                        state !== "expanded" && "justify-center",
                        activeView === item.id &&
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                        "hover:bg-primary/50"
                      )}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          state === "expanded" ? "h-5 w-5" : "h-6 w-6"
                        }`}
                      />
                      {state === "expanded" && <span>{item.label}</span>}
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
              className={cn("bg-primary text-primary-foreground hover:bg-primary/90", state !== "expanded" && "justify-center")}
            >
              <Plus className="h-5 w-5" />
              {state === "expanded" && <span>New Form</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </UISidebar>
  );
}
