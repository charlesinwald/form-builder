"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Send } from "lucide-react";
import { Form } from "../../../../shared/types";
import { useConditionalForm } from "@/hooks/use-conditional-form";
import { ConditionalFormField } from "./conditional-form-field";

interface ConditionalPublicFormProps {
  form: Form;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
}

export function ConditionalPublicForm({
  form,
  onSubmit,
  isSubmitting = false,
}: ConditionalPublicFormProps) {
  const {
    formData,
    errors,
    visibleFields,
    setFieldValue,
    setErrors,
    isFieldRequired,
    isFieldDisabled,
    validateField,
  } = useConditionalForm(form);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all visible fields
    const newErrors: Record<string, string> = {};
    visibleFields.forEach((field) => {
      const error = validateField(field);
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
              {visibleFields.map((field) => (
                <ConditionalFormField
                  key={field.id}
                  field={field}
                  value={formData[field.id]}
                  onChange={(value) => setFieldValue(field.id, value)}
                  error={errors[field.id]}
                  isRequired={isFieldRequired(field)}
                  isDisabled={isFieldDisabled(field)}
                  formId={form.id}
                />
              ))}

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || visibleFields.length === 0} 
                  className="gap-2"
                >
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