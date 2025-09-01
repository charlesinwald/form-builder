"use client";

import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { FieldToolbox } from "@/app/components/field-toolbox";
import { FormField } from "@/app/components/form-field";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Sheet, SheetContent } from "@/app/components/ui/sheet";
import { FormField as SharedFormField } from "../../../../shared/types";

interface FormData {
  title: string;
  description: string;
  fields: SharedFormField[];
}

interface FormBuilderProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
}

export function FormBuilder({ formData, onFormDataChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);

  const addField = (type: SharedFormField["type"]) => {
    const newField: SharedFormField = {
      id: `field-${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      ...(type === "select" || type === "radio" || type === "checkbox"
        ? { options: ["Option 1", "Option 2"] }
        : {}),
      ...(type === "file"
        ? { fileOptions: { accept: "*/*", multiple: false, maxSize: 15 } }
        : {}),
    };

    console.log("FormBuilder: Adding new field:", newField);
    console.log("FormBuilder: Current fields before add:", formData.fields);

    const updatedFormData = {
      ...formData,
      fields: [...formData.fields, newField],
    };

    console.log(
      "FormBuilder: Updated fields after add:",
      updatedFormData.fields
    );
    onFormDataChange(updatedFormData);
  };

  const updateField = (fieldId: string, updates: Partial<SharedFormField>) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
  };

  const deleteField = (fieldId: string) => {
    onFormDataChange({
      ...formData,
      fields: formData.fields.filter((field) => field.id !== fieldId),
    });
    setSelectedFieldId(null);
  };

  const handleDragEnd = (result: {
    destination?: { index: number } | null;
    source: { index: number };
  }) => {
    if (!result.destination) return;

    const items = Array.from(formData.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onFormDataChange({
      ...formData,
      fields: items,
    });
  };

  return (
    <div className="flex h-full">
      {/* Field Toolbox - desktop */}
      <div className="hidden md:block w-64 bg-muted/30 border-r border-border p-4">
        <FieldToolbox
          onAddField={(type) => {
            addField(type);
          }}
        />
      </div>

      {/* Field Toolbox - mobile sheet */}
      <Sheet open={isToolboxOpen} onOpenChange={setIsToolboxOpen}>
        <SheetContent side="left" className="p-4 w-full" label="Field types">
          <FieldToolbox
            onAddField={(type) => {
              addField(type);
              setIsToolboxOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Form Canvas */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Form Header */}
          <Card className="p-6">
            <div className="space-y-4">
              <Input
                value={formData.title}
                onChange={(e) =>
                  onFormDataChange({ ...formData, title: e.target.value })
                }
                className="text-2xl font-inter font-bold border-none p-0 focus-visible:ring-0 cursor-text hover:bg-muted/20 rounded-sm -mx-1 px-1"
                placeholder="Form title (tap to edit)"
                aria-label="Form title"
              />
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ ...formData, description: e.target.value })
                }
                placeholder="Form description (optional) — tap to edit"
                className="border-none p-0 focus-visible:ring-0 resize-none cursor-text hover:bg-muted/20 rounded-sm -mx-1 px-1"
                rows={2}
                aria-label="Form description"
              />
            </div>
          </Card>

          {/* Form Fields */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {formData.fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(
                        provided: DraggableProvided,
                        snapshot: DraggableStateSnapshot
                      ) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${
                            snapshot.isDragging ? "opacity-50" : ""
                          }`}
                        >
                          <FormField
                            field={field}
                            isSelected={selectedFieldId === field.id}
                            onSelect={() => setSelectedFieldId(field.id)}
                            onUpdate={(updates) =>
                              updateField(field.id, updates)
                            }
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
                  <h3 className="font-medium text-foreground">
                    Start building your form
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag field types from the left panel to get started
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Mobile floating action button to open toolbox */}
        <Button
          className="md:hidden fixed bottom-6 right-6 rounded-full h-12 w-12 shadow-lg"
          variant="secondary"
          size="icon"
          onClick={() => setIsToolboxOpen(true)}
          aria-label="Add field"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
