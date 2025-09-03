"use client";

import { useState } from "react";
import { useFormSession } from "@/hooks/use-form-session";
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
import { TransformerCheckbox } from "@/app/components/ui/custom-checkbox";
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
import { isFieldVisible, isFieldRequired, isFieldDisabled, getVisibleFields } from "@/lib/conditional-logic";

interface PublicFormProps {
  form: Form;
  onSubmit: (data: Record<string, unknown>, sessionData?: any) => Promise<void>;
  isSubmitting?: boolean;
}

export function PublicForm({
  form,
  onSubmit,
  isSubmitting = false,
}: PublicFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Track form session for analytics
  const { getSessionDataForSubmission } = useFormSession({
    formId: form.id,
    autoStart: true,
    onError: (error) => {
      console.warn("Session tracking error:", error);
    },
  });

  const validateField = (field: FormField, value: unknown): string | null => {
    // Only validate visible fields
    if (!isFieldVisible(field, formData, form.fields)) {
      return null;
    }

    // Check if field is required (considering conditional logic)
    const fieldRequired = isFieldRequired(field, formData, form.fields);
    
    if (fieldRequired) {
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

    // Checkbox-specific validation
    if (field.type === "checkbox" && Array.isArray(value)) {
      const selectedCount = value.length;
      
      if (field.checkboxOptions?.minSelection && selectedCount < field.checkboxOptions.minSelection) {
        return `Please select at least ${field.checkboxOptions.minSelection} option${field.checkboxOptions.minSelection > 1 ? 's' : ''}`;
      }
      
      if (field.checkboxOptions?.maxSelection && selectedCount > field.checkboxOptions.maxSelection) {
        return `Please select no more than ${field.checkboxOptions.maxSelection} option${field.checkboxOptions.maxSelection > 1 ? 's' : ''}`;
      }
    }

    // Email validation
    if (field.type === "email" && value && typeof value === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address";
      }
    }

    // Number validation
    if (field.type === "number" && value && typeof value === "string") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return "Please enter a valid number";
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `Value must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `Value must be at most ${field.validation.max}`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("🚀 PublicForm: handleSubmit called");
    e.preventDefault();

    console.log("📝 PublicForm: Form data before validation:", formData);
    console.log("📋 PublicForm: Form fields:", form.fields);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    form.fields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        console.log(`❌ PublicForm: Validation error for field ${field.id}:`, error);
      }
    });

    setErrors(newErrors);
    console.log("🔍 PublicForm: Validation errors:", newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log("✅ PublicForm: Validation passed, submitting form data:", formData);
        const sessionData = getSessionDataForSubmission();
        console.log("📊 PublicForm: Session data:", sessionData);
        console.log("🎯 PublicForm: Calling onSubmit...");
        await onSubmit(formData, sessionData);
        console.log("🎉 PublicForm: Form submission completed successfully");
      } catch (error) {
        console.error("❌ PublicForm: Form submission error:", error);
      }
    } else {
      console.log("⚠️ PublicForm: Form has validation errors, not submitting");
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
    // Check if field should be visible
    if (!isFieldVisible(field, formData, form.fields)) {
      return null;
    }

    const value = field.type === "checkbox" ? (formData[field.id] || []) : (formData[field.id] || "");
    const error = errors[field.id];
    const fieldRequired = isFieldRequired(field, formData, form.fields);
    const fieldDisabled = isFieldDisabled(field, formData, form.fields);

    console.log('PublicForm: Rendering field:', { 
      id: field.id, 
      type: field.type, 
      label: field.label,
      visible: true,
      required: fieldRequired,
      disabled: fieldDisabled
    });

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}{" "}
                {fieldRequired && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={fieldDisabled}
              className={cn(
                "bg-background border-2 hover:border-border transition-colors",
                error ? "border-destructive" : "!border-muted-foreground",
                fieldDisabled && "opacity-60 cursor-not-allowed"
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "email":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}{" "}
                {fieldRequired && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <Input
              id={field.id}
              type="email"
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={fieldDisabled}
              className={cn(
                "bg-background border-2 hover:border-border transition-colors",
                error ? "border-destructive" : "!border-muted-foreground",
                fieldDisabled && "opacity-60 cursor-not-allowed"
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}{" "}
                {fieldRequired && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={fieldDisabled}
              min={field.validation?.min}
              max={field.validation?.max}
              className={cn(
                "bg-background border-2 hover:border-border transition-colors",
                error ? "border-destructive" : "!border-muted-foreground",
                fieldDisabled && "opacity-60 cursor-not-allowed"
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}{" "}
                {fieldRequired && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={fieldDisabled}
              className={cn(
                "!bg-background !border-2 hover:!border-border transition-colors",
                error ? "!border-destructive" : "!border-muted-foreground",
                fieldDisabled && "opacity-60 cursor-not-allowed"
              )}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <div
              className={`space-y-2 ${
                error ? "border border-destructive rounded-md p-3" : ""
              }`}
            >
{field.options?.map((option) => {
                const currentValues = (value as string[]) || [];
                const isChecked = currentValues.includes(option);
                const maxReached = field.checkboxOptions?.maxSelection 
                  ? currentValues.length >= field.checkboxOptions.maxSelection 
                  : false;
                const shouldDisable = fieldDisabled || (maxReached && !isChecked);

                return (
                  <div key={option} className="flex items-center space-x-2">
                    <TransformerCheckbox
                      id={`${field.id}-${option}`}
                      checked={isChecked}
                      disabled={shouldDisable}
                      onChange={(e) => {
                        const checked = e.target.checked;
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
                    <Label 
                      htmlFor={`${field.id}-${option}`} 
                      className={cn(
                        "text-sm",
                        shouldDisable && "text-muted-foreground"
                      )}
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
              {field.checkboxOptions?.maxSelection && (
                <p className="text-xs text-muted-foreground mt-2">
                  {(value as string[] || []).length} of {field.checkboxOptions.maxSelection} selections
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        );

      case "rating":
        return (
          <div key={field.id} className="space-y-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <SignaturePad 
              label=""
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
            <div className="space-y-1">
              <Label className="text-sm font-medium">
                {field.label}{" "}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
            <FileUpload
              label=""
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
