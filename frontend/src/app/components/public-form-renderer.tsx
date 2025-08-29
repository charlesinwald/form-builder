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
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { format, addDays } from "date-fns";
import { CalendarIcon, Loader2, Send, Wifi } from "lucide-react";
import { SignaturePad } from "@/app/components/ui/signature-pad";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormFieldData[];
}

interface FormFieldData {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating" | "date" | "signature";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface PublicFormRendererProps {
  formData: FormData;
  onSubmissionSuccess: () => void;
}

export function PublicFormRenderer({
  formData,
  onSubmissionSuccess,
}: PublicFormRendererProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const updateResponse = (fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    formData.fields.forEach((field) => {
      if (field.required) {
        const value = responses[field.id];
        if (
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          value === ""
        ) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API submission with real-time update
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, you would send the data to your backend:
      // const response = await fetch('/api/forms/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     formId: formData.id,
      //     responses,
      //     submittedAt: new Date().toISOString()
      //   })
      // })

      console.log("Form submitted:", {
        formId: formData.id,
        responses,
        submittedAt: new Date().toISOString(),
      });

      toast({
        title: "Form submitted successfully!",
        description: "Your response will appear in real-time analytics.",
        action: (
          <div className="flex items-center gap-1 text-xs">
            <Wifi className="h-3 w-3" />
            Live
          </div>
        ),
      });

      onSubmissionSuccess();
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormFieldData) => {
    const hasError = !!errors[field.id];

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Input
              placeholder={field.placeholder}
              value={(responses[field.id] as string) || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              className={cn(
                "!bg-background !border-2 hover:!border-border transition-colors",
                hasError
                  ? "!border-destructive focus-visible:ring-destructive"
                  : "!border-white"
              )}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder={field.placeholder}
              value={(responses[field.id] as string) || ""}
              onChange={(e) => updateResponse(field.id, e.target.value)}
              rows={4}
              className={cn(
                "!bg-background !border-2 hover:!border-border transition-colors",
                hasError
                  ? "!border-destructive focus-visible:ring-destructive"
                  : "!border-white"
              )}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "select":
        return (
          <div className="space-y-2">
            <Select
              value={(responses[field.id] as string) || ""}
              onValueChange={(value: string) => updateResponse(field.id, value)}
            >
              <SelectTrigger
                className={cn(
                  "!bg-background !border-2 hover:!border-border transition-colors",
                  hasError
                    ? "!border-destructive focus:ring-destructive"
                    : "!border-white"
                )}
              >
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
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={`${field.id}-${index}`}
                    name={field.id}
                    value={option}
                    checked={(responses[field.id] as string) === option}
                    onChange={(e) => updateResponse(field.id, e.target.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                  />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
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
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "rating":
        return (
          <div className="space-y-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => updateResponse(field.id, star)}
                  className={`text-3xl transition-colors hover:scale-110 transform ${
                    ((responses[field.id] as number) || 0) >= star
                      ? "text-secondary"
                      : "text-muted-foreground hover:text-secondary"
                  }`}
                >
                  ⭐
                </button>
              ))}
              {(responses[field.id] as number) > 0 && (
                <span className="ml-3 text-sm text-muted-foreground self-center">
                  {responses[field.id] as number} out of 5
                </span>
              )}
            </div>
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
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
                    "w-full justify-start text-left font-normal !bg-background !border-2 hover:!border-border transition-colors",
                    !responses[field.id] && "text-muted-foreground",
                    hasError
                      ? "!border-destructive focus-visible:ring-destructive"
                      : "!border-white"
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
                          updateResponse(field.id, newDate)
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      case "signature":
        return (
          <div className="space-y-2">
            <SignaturePad 
              label=""
              required={field.required}
              onSignatureChange={(hasSignature) => updateResponse(field.id, hasSignature)}
            />
            {hasError && (
              <p className="text-sm text-destructive">{errors[field.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Header */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-inter font-bold text-foreground">
              {formData.title}
            </h1>
            {formData.description && (
              <p className="text-muted-foreground text-lg">
                {formData.description}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {formData.fields.map((field) => (
              <div key={field.id} className="space-y-3">
                <Label className="text-base font-medium text-foreground">
                  {field.label}
                  {field.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Response
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
