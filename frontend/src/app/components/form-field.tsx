"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GripVertical, Settings, Trash2, Plus, X } from "lucide-react"

interface FormFieldData {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormFieldProps {
  field: FormFieldData
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<FormFieldData>) => void
  onDelete: () => void
}

export function FormField({ field, isSelected, onSelect, onUpdate, onDelete }: FormFieldProps) {
  const [showSettings, setShowSettings] = useState(false)

  const addOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || []
    onUpdate({ options: newOptions })
  }

  const renderFieldPreview = () => {
    switch (field.type) {
      case "text":
        return <Input placeholder={field.placeholder || "Enter text..."} disabled className="bg-muted/50" />
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || "Enter your response..."}
            disabled
            className="bg-muted/50"
            rows={3}
          />
        )
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className="bg-muted/50">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
          </Select>
        )
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="radio" disabled className="text-primary" />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled className="text-primary" />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} disabled className="text-muted-foreground">
                ⭐
              </button>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card
      className={`p-4 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover:shadow-md"}`}
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
              className="border-none p-0 font-medium focus-visible:ring-0"
              onClick={(e) => e.stopPropagation()}
            />
            {field.required && <span className="text-destructive text-sm">*</span>}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(!showSettings)
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Field Preview */}
        <div>{renderFieldPreview()}</div>

        {/* Field Settings */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
              />
            </div>

            {(field.type === "text" || field.type === "textarea") && (
              <div>
                <Label>Placeholder text</Label>
                <Input
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                />
              </div>
            )}

            {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={option} onChange={(e) => updateOption(index, e.target.value)} className="flex-1" />
                      <Button variant="ghost" size="sm" onClick={() => removeOption(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addOption} className="w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
