"use client";

import type React from "react";

import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { format, addDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { SignaturePad } from "@/app/components/ui/signature-pad";
import { FileUpload } from "@/app/components/ui/file-upload";
import { cn } from "@/lib/utils";
import { FormField as SharedFormField } from "../../../../shared/types";
import { TransformerCheckbox } from "./ui/custom-checkbox";

interface FormData {
  title: string;
  description: string;
  fields: SharedFormField[];
}

interface FormPreviewProps {
  formData: FormData;
}

export function FormPreview({ formData }: FormPreviewProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", responses);
    // Here you would typically send the data to your backend
  };

  const updateResponse = (fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: SharedFormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            value={(responses[field.id] as string) || ""}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            required={field.required}
            className="!bg-background !border-2 !border-white hover:!border-border transition-colors"
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={(responses[field.id] as string) || ""}
            onChange={(e) => updateResponse(field.id, e.target.value)}
            required={field.required}
            rows={4}
            className="!bg-background !border-2 !border-white hover:!border-border transition-colors"
          />
        );
      case "select":
        return (
          <Select
            value={(responses[field.id] as string) || ""}
            onValueChange={(value: string) => updateResponse(field.id, value)}
            required={field.required}
          >
            <SelectTrigger className="!bg-background !border-2 !border-white hover:!border-border transition-colors">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  value={option}
                  checked={(responses[field.id] as string) === option}
                  onChange={(e) => updateResponse(field.id, e.target.value)}
                  required={field.required}
                  className="text-primary"
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                {/* <input
                  type="checkbox"
                  id={`${field.id}-${index}`}
                  value={option}
                  checked={((responses[field.id] as string[]) || []).includes(
                    option
                  )}
                  onChange={(e) => {
                    const currentValues =
                      (responses[field.id] as string[]) || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    updateResponse(field.id, newValues);
                  }}
                  className="text-primary"
                /> */}
                <TransformerCheckbox
                  id={`${field.id}-${index}`}
                  checked={(responses[field.id] as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const currentValues = (responses[field.id] as string[]) || [];
                    if (checked) {
                      updateResponse(field.id, [...currentValues, option]);
                    } else {
                      updateResponse(field.id, currentValues.filter((v) => v !== option));
                    }
                  }}
                />
                <Label
                  htmlFor={`${field.id}-${index}`}
                  className="text-sm font-normal"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateResponse(field.id, star)}
                className={`text-2xl ${
                  ((responses[field.id] as number) || 0) >= star
                    ? "text-secondary"
                    : "text-muted-foreground"
                } hover:text-secondary transition-colors`}
              >
                ⭐
              </button>
            ))}
          </div>
        );
      case "date":
        return (
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal !bg-background !border-2 !border-white hover:!border-border transition-colors",
                    !responses[field.id] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {responses[field.id] ? (
                    format(responses[field.id] as Date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="max-w-[350px]">
                  <Calendar
                    mode="single"
                    selected={responses[field.id] as Date}
                    onSelect={(date) => updateResponse(field.id, date)}
                    className="rounded-md border-0"
                  />
                  <div className="flex flex-wrap gap-2 border-t p-3">
                    {[
                      { label: "Today", value: 0 },
                      { label: "Tomorrow", value: 1 },
                      { label: "In 3 days", value: 3 },
                      { label: "In a week", value: 7 },
                      { label: "In 2 weeks", value: 14 },
                    ].map((preset) => (
                      <Button
                        key={preset.value}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const newDate = addDays(new Date(), preset.value);
                          updateResponse(field.id, newDate);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );
      case "signature":
        return (
          <SignaturePad
            label=""
            required={field.required}
            onSignatureChange={(hasSignature) =>
              updateResponse(field.id, hasSignature)
            }
          />
        );
      case "file":
        return (
          <FileUpload
            label=""
            required={false}
            formId={"preview"}
            fieldId={field.id}
            accept={field.fileOptions?.accept || "*/*"}
            multiple={field.fileOptions?.multiple || false}
            maxSize={field.fileOptions?.maxSize || 15}
            onFileChange={(hasFile, fileUrl) => {
              if (hasFile && fileUrl) {
                const currentValue = responses[field.id];
                if (
                  field.fileOptions?.multiple &&
                  Array.isArray(currentValue)
                ) {
                  updateResponse(field.id, [
                    ...(currentValue as string[]),
                    fileUrl,
                  ]);
                } else if (field.fileOptions?.multiple) {
                  updateResponse(field.id, [fileUrl]);
                } else {
                  updateResponse(field.id, fileUrl);
                }
              } else if (!hasFile) {
                updateResponse(field.id, field.fileOptions?.multiple ? [] : "");
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-inter font-bold text-foreground">
              {formData.title}
            </h1>
            {formData.description && (
              <p className="text-muted-foreground">{formData.description}</p>
            )}
          </div>

          {/* Form Fields */}
          {formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {field.description && (
                  <p className="text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}

          {/* Submit Button */}
          {formData.fields.length > 0 && (
            <Button type="submit" className="w-full">
              Submit Response
            </Button>
          )}

          {formData.fields.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No fields added to this form yet.
              </p>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
