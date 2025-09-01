"use client";

import { FormField } from "../../../../shared/types";
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
import { Button } from "@/app/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { SignaturePad } from "@/app/components/ui/signature-pad";
import { FileUpload } from "@/app/components/ui/file-upload";
import { cn } from "@/lib/utils";

interface ConditionalFormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isRequired: boolean;
  isDisabled: boolean;
  formId?: string;
}

export function ConditionalFormField({
  field,
  value,
  onChange,
  error,
  isRequired,
  isDisabled,
  formId,
}: ConditionalFormFieldProps) {
  const fieldValue = field.type === "checkbox" ? (value || []) : (value || "");

  const renderFieldInput = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={fieldValue as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            className={cn(
              "bg-background border-2 hover:border-border transition-colors",
              error ? "border-destructive" : "!border-muted-foreground",
              isDisabled && "opacity-60 cursor-not-allowed"
            )}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={fieldValue as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            className={cn(
              "!bg-background !border-2 hover:!border-border transition-colors",
              error ? "!border-destructive" : "!border-muted-foreground",
              isDisabled && "opacity-60 cursor-not-allowed"
            )}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={fieldValue as string}
            onValueChange={onChange}
            disabled={isDisabled}
          >
            <SelectTrigger
              className={cn(
                "!bg-background !border-2 hover:!border-border transition-colors",
                error ? "!border-destructive" : "!border-muted-foreground",
                isDisabled && "opacity-60 cursor-not-allowed"
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
        );

      case "radio":
        return (
          <RadioGroup
            value={fieldValue as string}
            onValueChange={onChange}
            disabled={isDisabled}
            className={cn(
              error ? "border border-destructive rounded-md p-3" : "",
              isDisabled && "opacity-60"
            )}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`${field.id}-${option}`}
                  disabled={isDisabled}
                />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div
            className={cn(
              "space-y-2",
              error ? "border border-destructive rounded-md p-3" : "",
              isDisabled && "opacity-60"
            )}
          >
{field.options?.map((option) => {
              const currentValues = (fieldValue as string[]) || [];
              const isChecked = currentValues.includes(option);
              const maxReached = field.checkboxOptions?.maxSelection 
                ? currentValues.length >= field.checkboxOptions.maxSelection 
                : false;
              const shouldDisable = isDisabled || (maxReached && !isChecked);

              return (
                <div key={option} className="flex items-center space-x-2">
                  <TransformerCheckbox
                    id={`${field.id}-${option}`}
                    checked={isChecked}
                    disabled={shouldDisable}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v) => v !== option));
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
                {(fieldValue as string[] || []).length} of {field.checkboxOptions.maxSelection} selections
              </p>
            )}
          </div>
        );

      case "rating":
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={isDisabled}
                onClick={() => onChange(star)}
                className={cn(
                  "text-3xl transition-colors hover:scale-110 transform",
                  ((fieldValue as number) || 0) >= star
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-secondary",
                  isDisabled && "opacity-60 cursor-not-allowed hover:scale-100"
                )}
              >
                ⭐
              </button>
            ))}
            {(fieldValue as number) > 0 && (
              <span className="ml-3 text-sm text-muted-foreground self-center">
                {fieldValue as number} out of 5
              </span>
            )}
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isDisabled}
                className={cn(
                  "w-full justify-start text-left font-normal !bg-background !border-2 hover:!border-border transition-colors",
                  !fieldValue && "text-muted-foreground",
                  error ? "!border-destructive" : "!border-muted-foreground",
                  isDisabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fieldValue ? (
                  format(fieldValue as Date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="max-w-[350px]">
                <Calendar
                  mode="single"
                  selected={fieldValue as Date}
                  onSelect={onChange}
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
                        const newDate = addDays(new Date(), preset.value);
                        onChange(newDate);
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );

      case "signature":
        return (
          <div className={cn(isDisabled && "opacity-60 pointer-events-none")}>
            <SignaturePad 
              label=""
              required={isRequired}
              formId={formId}
              fieldId={field.id}
              allowUpload={true}
              publicUpload={true}
              disabled={isDisabled}
              onSignatureChange={(hasSignature, signatureData, fileUrl) => {
                const signatureValue = fileUrl || signatureData;
                onChange(signatureValue);
              }}
            />
          </div>
        );

      case "file":
        return (
          <div className={cn(isDisabled && "opacity-60 pointer-events-none")}>
            <FileUpload
              label=""
              required={isRequired}
              formId={formId}
              fieldId={field.id}
              accept={field.fileOptions?.accept || "*/*"}
              multiple={field.fileOptions?.multiple || false}
              maxSize={field.fileOptions?.maxSize || 15}
              disabled={isDisabled}
              onFileChange={(hasFile, fileUrl, filename) => {
                if (hasFile && fileUrl) {
                  const currentValue = fieldValue;
                  if (field.fileOptions?.multiple && Array.isArray(currentValue)) {
                    onChange([...currentValue, fileUrl]);
                  } else if (field.fileOptions?.multiple) {
                    onChange([fileUrl]);
                  } else {
                    onChange(fileUrl);
                  }
                } else if (!hasFile) {
                  onChange(field.fileOptions?.multiple ? [] : "");
                }
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}{" "}
          {isRequired && <span className="text-destructive">*</span>}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">
            {field.description}
          </p>
        )}
      </div>
      {renderFieldInput()}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}