"use client";
import { Button } from "@/app/components/ui/button";
import {
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  Star,
  Calendar,
} from "lucide-react";

interface FieldToolboxProps {
  onAddField: (
    type:
      | "text"
      | "textarea"
      | "select"
      | "radio"
      | "checkbox"
      | "rating"
      | "date"
  ) => void;
}

export function FieldToolbox({ onAddField }: FieldToolboxProps) {
  const fieldTypes = [
    { type: "text" as const, label: "Text Input", icon: Type },
    { type: "textarea" as const, label: "Text Area", icon: AlignLeft },
    { type: "select" as const, label: "Dropdown", icon: List },
    { type: "radio" as const, label: "Multiple Choice", icon: Circle },
    { type: "checkbox" as const, label: "Checkboxes", icon: CheckSquare },
    { type: "rating" as const, label: "Rating", icon: Star },
    { type: "date" as const, label: "Date Picker", icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground mb-3">Field Types</h3>
        <div className="space-y-2">
          {fieldTypes.map((fieldType) => {
            const Icon = fieldType.icon;
            return (
              <Button
                key={fieldType.type}
                variant="ghost"
                className="w-full justify-start gap-3 h-auto p-3"
                onClick={() => onAddField(fieldType.type)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{fieldType.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
