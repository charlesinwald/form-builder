"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Calendar } from "@/app/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { format, addDays } from "date-fns";
import { Send, CalendarIcon } from "lucide-react";
import { SignaturePad } from "@/app/components/ui/signature-pad";
import { SimpleSignaturePad } from "@/app/components/ui/simple-signature-pad";
import { FileUpload } from "@/app/components/ui/file-upload";
import { Form, FormField } from "../../../../shared/types";
import { cn } from "@/lib/utils";

interface PublicFormProps {
  form: Form;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
}

export function PublicForm({
  form,
  onSubmit,
  isSubmitting = false,
}: PublicFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: FormField, value: unknown): string | null => {
    if (field.required) {
      if (field.type === "signature") {
        // Check if signature data exists (either base64 data, file URL, or boolean true)
        if (!value || 
            value === false || 
            (typeof value === "string" && value.trim() === "")) {
          return `${field.label} is required`;
        }
      } else if (field.type === "file") {
        // Check if file data exists (URL string or array of URLs)
        if (!value || 
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0)) {
          return `${field.label} is required`;
        }
      } else if (!value || (typeof value === "string" && value.trim() === "")) {
        return `${field.label} is required`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log("Submitting form data:", formData);
        await onSubmit(formData);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || "";
    const error = errors[field.id];

    console.log('PublicForm: Rendering field:', { id: field.id, type: field.type, label: field.label });

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={cn(
                "bg-background border-2 hover:border-border transition-colors",
                error ? "border-destructive" : "!border-muted-foreground"
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={cn(
                "!bg-background !border-2 hover:!border-border transition-colors",
                error ? "!border-destructive" : "!border-muted-foreground"
              )}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={value as string}
              onValueChange={(val: string) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger
                className={cn(
                  "!bg-background !border-2 hover:!border-border transition-colors",
                  error ? "!border-destructive" : "!border-muted-foreground"
                )}
              >
                <SelectValue
                  placeholder={field.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={value as string}
              onValueChange={(val: string) => handleFieldChange(field.id, val)}
              className={
                error ? "border border-destructive rounded-md p-3" : ""
              }
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-3">
            <Label className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div
              className={`space-y-2 ${
                error ? "border border-destructive rounded-md p-3" : ""
              }`}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(value as string[])?.includes(option) || false}
                    onCheckedChange={(checked: boolean) => {
                      const currentValues = (value as string[]) || [];
                      if (checked) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(
                          field.id,
                          currentValues.filter((v) => v !== option)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "rating":
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleFieldChange(field.id, star)}
                  className={`text-3xl transition-colors hover:scale-110 transform ${
                    ((value as number) || 0) >= star
                      ? "text-secondary"
                      : "text-muted-foreground hover:text-secondary"
                  }`}
                >
                  ⭐
                </button>
              ))}
              {(value as number) > 0 && (
                <span className="ml-3 text-sm text-muted-foreground self-center">
                  {value as number} out of 5
                </span>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {field.label}{" "}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal !bg-background !border-2 hover:!border-border transition-colors",
                    !value && "text-muted-foreground",
                    error ? "!border-destructive" : "!border-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? (
                    format(value as Date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="max-w-[350px]">
                  <Calendar
                    mode="single"
                    selected={value as Date}
                    onSelect={(date) => handleFieldChange(field.id, date)}
                    initialFocus
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
                          const newDate = addDays(new Date(), preset.value)
                          handleFieldChange(field.id, newDate)
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "signature":
        return (
          <div key={field.id} className="space-y-2">
            <SignaturePad 
              label={field.label}
              required={field.required}
              formId={form.id}
              fieldId={field.id}
              allowUpload={true}
              publicUpload={true}
              onSignatureChange={(hasSignature, signatureData, fileUrl) => {
                console.log('PublicForm: Signature changed', { hasSignature, signatureData: signatureData && typeof signatureData === 'string' ? signatureData.substring(0, 50) + '...' : signatureData, fileUrl });
                // Store either the signature data (base64) or file URL
                const signatureValue = fileUrl || signatureData;
                console.log('PublicForm: Setting signature value', { fieldId: field.id, value: signatureValue && typeof signatureValue === 'string' ? signatureValue.substring(0, 50) + '...' : signatureValue });
                handleFieldChange(field.id, signatureValue);
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <FileUpload
              label={field.label}
              required={field.required}
              formId={form.id}
              fieldId={field.id}
              accept={field.fileOptions?.accept || "*/*"}
              multiple={field.fileOptions?.multiple || false}
              maxSize={field.fileOptions?.maxSize || 15}
              onFileChange={(hasFile, fileUrl, filename) => {
                // Store the file URL or an array of URLs for multiple files
                if (hasFile && fileUrl) {
                  const currentValue = formData[field.id];
                  if (field.fileOptions?.multiple && Array.isArray(currentValue)) {
                    // Add to existing array
                    handleFieldChange(field.id, [...currentValue, fileUrl]);
                  } else if (field.fileOptions?.multiple) {
                    // Create new array
                    handleFieldChange(field.id, [fileUrl]);
                  } else {
                    // Single file
                    handleFieldChange(field.id, fileUrl);
                  }
                } else if (!hasFile) {
                  // No file - clear the field
                  handleFieldChange(field.id, field.fileOptions?.multiple ? [] : "");
                }
              }}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{form.title}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map(renderField)}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
