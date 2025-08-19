"use client"

import { useState } from "react"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { FieldToolbox } from "@/app/components/field-toolbox"
import { FormField } from "@/app/components/form-field"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"

interface FormData {
  title: string
  description: string
  fields: FormFieldData[]
}

interface FormFieldData {
  id: string
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating"
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface FormBuilderProps {
  formData: FormData
  onFormDataChange: (data: FormData) => void
}

export function FormBuilder({ formData, onFormDataChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)

  const addField = (type: FormFieldData["type"]) => {
    const newField: FormFieldData = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === "select" || type === "radio" || type === "checkbox" ? { options: ["Option 1", "Option 2"] } : {}),
    }

    onFormDataChange({
      ...formData,
      fields: [...formData.fields, newField],
    })
  }

  const updateField = (fieldId: string, updates: Partial<FormFieldData>) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
    })
  }

  const deleteField = (fieldId: string) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.filter((field) => field.id !== fieldId),
    })
    setSelectedFieldId(null)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(formData.fields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onFormDataChange({
      ...formData,
      fields: items,
    })
  }

  return (
    <div className="flex h-full">
      {/* Field Toolbox */}
      <div className="w-64 bg-muted/30 border-r border-border p-4">
        <FieldToolbox onAddField={addField} />
      </div>

      {/* Form Canvas */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Form Header */}
          <Card className="p-6">
            <div className="space-y-4">
              <Input
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                className="text-2xl font-serif font-bold border-none p-0 focus-visible:ring-0"
                placeholder="Form Title"
              />
              <Textarea
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="Form description (optional)"
                className="border-none p-0 focus-visible:ring-0 resize-none"
                rows={2}
              />
            </div>
          </Card>

          {/* Form Fields */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {formData.fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? "opacity-50" : ""}`}
                        >
                          <FormField
                            field={field}
                            isSelected={selectedFieldId === field.id}
                            onSelect={() => setSelectedFieldId(field.id)}
                            onUpdate={(updates) => updateField(field.id, updates)}
                            onDelete={() => deleteField(field.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Add Field Button */}
          {formData.fields.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Start building your form</h3>
                  <p className="text-sm text-muted-foreground">Drag field types from the left panel to get started</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
