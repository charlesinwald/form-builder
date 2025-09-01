"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { CalendarWithPresets } from "@/app/components/ui/calendar-with-presets";
import { SignaturePad } from "@/app/components/ui/signature-pad";
import { GripVertical, Settings, Trash2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormField as SharedFormField } from "../../../../shared/types";
import { ConditionalLogicEditor } from "./conditional-logic-editor";
import { TransformerCheckbox } from "./ui/custom-checkbox";

interface FormFieldProps {
  field: SharedFormField;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SharedFormField>) => void;
  onDelete: () => void;
  allFields: SharedFormField[];
}

export function FormField({
  field,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  allFields,
}: FormFieldProps) {
  const [showSettings, setShowSettings] = useState(false);

  const addOption = () => {
    const newOptions = [
      ...(field.options || []),
      `Option ${(field.options?.length || 0) + 1}`,
    ];
    onUpdate({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: newOptions });
  };

  const renderFieldPreview = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder || "Enter text..."}
            disabled
            className="!bg-background !border-2 !border-white"
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your response..."}
            disabled
            className="!bg-background !border-2 !border-white"
            rows={3}
          />
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="!bg-background !border-2 !border-white">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
          </Select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <TransformerCheckbox disabled />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                {/* <input type="checkbox" disabled className="text-primary" /> */}
                <TransformerCheckbox
                  // checked={field.options?.includes(option)}
                  disabled
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} disabled className="text-muted-foreground">
                ⭐
              </button>
            ))}
          </div>
        );
      case "date":
        return (
          <div className="pointer-events-none">
            <CalendarWithPresets />
          </div>
        );
      case "signature":
        return (
          <div className="pointer-events-none">
            <SignaturePad
              label={field.label}
              required={field.required}
              disabled={true}
            />
          </div>
        );
      case "file":
        return (
          <div className="pointer-events-none">
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
              File upload area (preview)
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-primary" : "hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <div className="space-y-4">
        {/* Field Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="border-none p-0 font-medium focus-visible:ring-0 cursor-text hover:bg-muted/20 rounded-sm -mx-1 px-1"
              onClick={(e) => e.stopPropagation()}
              aria-label="Field label"
            />
            {field.required && (
              <span className="text-destructive text-sm">*</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Field Preview */}
        <div className="space-y-2">
          {field.description && (
            <p className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          <div>{renderFieldPreview()}</div>
        </div>

        {/* Field Settings */}
        {showSettings && (
          <div
            className="border-t pt-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked: boolean) =>
                  onUpdate({ required: checked })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={field.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Optional description to help users understand this field..."
                className="cursor-text hover:bg-muted/20"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will appear below the field label to provide additional context
              </p>
            </div>

            {(field.type === "text" || field.type === "textarea") && (
              <div>
                <Label>Placeholder text</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                  className="cursor-text hover:bg-muted/20"
                />
              </div>
            )}

            {(field.type === "select" ||
              field.type === "radio" ||
              field.type === "checkbox") && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 cursor-text hover:bg-muted/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {field.type === "checkbox" && (
              <div className="space-y-3">
                <div>
                  <Label>Maximum selections allowed</Label>
                  <Input
                    type="number"
                    min={1}
                    max={field.options?.length || 10}
                    value={field.checkboxOptions?.maxSelection || ""}
                    onChange={(e) => {
                      const maxSelection = e.target.value ? Number(e.target.value) : undefined;
                      onUpdate({
                        checkboxOptions: {
                          maxSelection,
                          minSelection: field.checkboxOptions?.minSelection,
                        },
                      });
                    }}
                    placeholder="No limit"
                    className="cursor-text hover:bg-muted/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for no limit
                  </p>
                </div>
                <div>
                  <Label>Minimum selections required</Label>
                  <Input
                    type="number"
                    min={0}
                    max={field.checkboxOptions?.maxSelection || field.options?.length || 10}
                    value={field.checkboxOptions?.minSelection || ""}
                    onChange={(e) => {
                      const minSelection = e.target.value ? Number(e.target.value) : undefined;
                      onUpdate({
                        checkboxOptions: {
                          maxSelection: field.checkboxOptions?.maxSelection,
                          minSelection,
                        },
                      });
                    }}
                    placeholder="0"
                    className="cursor-text hover:bg-muted/20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set to 0 or leave empty for no minimum requirement
                  </p>
                </div>
              </div>
            )}

            {field.type === "file" && (
              <div className="space-y-3">
                <div>
                  <Label>Accepted types (MIME or extensions)</Label>
                  <Input
                    value={field.fileOptions?.accept || "*/*"}
                    onChange={(e) =>
                      onUpdate({
                        fileOptions: {
                          accept: e.target.value,
                          multiple: field.fileOptions?.multiple || false,
                          maxSize: field.fileOptions?.maxSize || 15,
                        },
                      })
                    }
                    placeholder="e.g. image/*,application/pdf"
                    className="cursor-text hover:bg-muted/20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Allow multiple files</Label>
                  <Switch
                    checked={field.fileOptions?.multiple || false}
                    onCheckedChange={(checked: boolean) =>
                      onUpdate({
                        fileOptions: {
                          accept: field.fileOptions?.accept || "*/*",
                          multiple: checked,
                          maxSize: field.fileOptions?.maxSize || 15,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Max size (MB)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={field.fileOptions?.maxSize ?? 15}
                    onChange={(e) =>
                      onUpdate({
                        fileOptions: {
                          accept: field.fileOptions?.accept || "*/*",
                          multiple: field.fileOptions?.multiple || false,
                          maxSize: Number(e.target.value) || 15,
                        },
                      })
                    }
                    className="cursor-text hover:bg-muted/20"
                  />
                </div>
              </div>
            )}

            <ConditionalLogicEditor
              fields={allFields}
              currentFieldId={field.id}
              conditionalLogic={field.conditionalLogic || []}
              onUpdate={(conditionalLogic) => onUpdate({ conditionalLogic })}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
