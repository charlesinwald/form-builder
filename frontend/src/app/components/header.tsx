"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Save, Share, Eye, Globe } from "lucide-react";

interface HeaderProps {
  formTitle: string;
  onTitleChange: (title: string) => void;
  activeView: "dashboard" | "builder" | "preview" | "analytics";
  onShare: () => void;
  onPreview?: () => void;
  onPublish?: () => void;
  formStatus?: "draft" | "published" | "archived";
  showFormControls?: boolean;
  isFormDraft?: boolean;
  isFormPublished?: boolean;
}

export function Header({
  formTitle,
  onTitleChange,
  activeView,
  onShare,
  onPreview,
  onPublish,
  formStatus = "draft",
  showFormControls = true,
  isFormDraft = true,
  isFormPublished = false,
}: HeaderProps) {
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

  if (!showFormControls) {
    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-inter font-bold text-foreground">
            Forms Dashboard
          </h2>
        </div>
      </header>
    );
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
          <span className="text-sm text-muted-foreground capitalize">
            {activeView}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-transparent"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        
        {isFormDraft && onPublish && (
          <Button size="sm" className="gap-2" onClick={onPublish}>
            <Globe className="h-4 w-4" />
            Publish
          </Button>
        )}
        
        {isFormPublished && (
          <Button size="sm" className="gap-2" onClick={onShare}>
            <Share className="h-4 w-4" />
            Share
          </Button>
        )}
        
        {!isFormPublished && !isFormDraft && (
          <Button size="sm" className="gap-2" onClick={onShare}>
            <Share className="h-4 w-4" />
            Share
          </Button>
        )}
      </div>
    </header>
  );
}
