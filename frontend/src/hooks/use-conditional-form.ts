import { useState, useEffect, useCallback } from 'react';
import { Form, FormField } from '../../../shared/types';
import { isFieldVisible, isFieldRequired, isFieldDisabled } from '@/lib/conditional-logic';

export interface ConditionalFormState {
  formData: Record<string, any>;
  errors: Record<string, string>;
  visibleFields: FormField[];
  setFieldValue: (fieldId: string, value: any) => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isFieldVisible: (field: FormField) => boolean;
  isFieldRequired: (field: FormField) => boolean;
  isFieldDisabled: (field: FormField) => boolean;
  validateField: (field: FormField, value?: any) => string | null;
  clearHiddenFieldData: () => void;
}

export function useConditionalForm(form: Form): ConditionalFormState {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get visible fields based on current form data
  const visibleFields = form.fields.filter(field => 
    isFieldVisible(field, formData, form.fields)
  );

  // Clear data for fields that are no longer visible
  const clearHiddenFieldData = useCallback(() => {
    const visibleFieldIds = new Set(visibleFields.map(f => f.id));
    const updatedFormData = { ...formData };
    let hasChanges = false;

    Object.keys(formData).forEach(fieldId => {
      if (!visibleFieldIds.has(fieldId)) {
        delete updatedFormData[fieldId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFormData(updatedFormData);
    }
  }, [formData, visibleFields]);

  // Auto-clear hidden field data when visibility changes
  useEffect(() => {
    clearHiddenFieldData();
  }, [clearHiddenFieldData]);

  const setFieldValue = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[fieldId]) {
        const { [fieldId]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  const validateField = useCallback((field: FormField, value?: any): string | null => {
    // Only validate visible fields
    if (!isFieldVisible(field, formData, form.fields)) {
      return null;
    }

    // Use provided value or get from formData
    const fieldValue = value !== undefined ? value : formData[field.id];
    
    // Check if field is required (considering conditional logic)
    const fieldRequired = isFieldRequired(field, formData, form.fields);
    
    if (fieldRequired) {
      if (field.type === "signature") {
        if (!fieldValue || 
            fieldValue === false || 
            (typeof fieldValue === "string" && fieldValue.trim() === "")) {
          return `${field.label} is required`;
        }
      } else if (field.type === "file") {
        if (!fieldValue || 
            (typeof fieldValue === "string" && fieldValue.trim() === "") ||
            (Array.isArray(fieldValue) && fieldValue.length === 0)) {
          return `${field.label} is required`;
        }
      } else if (!fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "")) {
        return `${field.label} is required`;
      }
    }

    // Checkbox-specific validation
    if (field.type === "checkbox" && Array.isArray(fieldValue)) {
      const selectedCount = fieldValue.length;
      
      if (field.checkboxOptions?.minSelection && selectedCount < field.checkboxOptions.minSelection) {
        return `Please select at least ${field.checkboxOptions.minSelection} option${field.checkboxOptions.minSelection > 1 ? 's' : ''}`;
      }
      
      if (field.checkboxOptions?.maxSelection && selectedCount > field.checkboxOptions.maxSelection) {
        return `Please select no more than ${field.checkboxOptions.maxSelection} option${field.checkboxOptions.maxSelection > 1 ? 's' : ''}`;
      }
    }

    return null;
  }, [formData, form.fields]);

  return {
    formData,
    errors,
    visibleFields,
    setFieldValue,
    setErrors,
    isFieldVisible: useCallback((field: FormField) => isFieldVisible(field, formData, form.fields), [formData, form.fields]),
    isFieldRequired: useCallback((field: FormField) => isFieldRequired(field, formData, form.fields), [formData, form.fields]),
    isFieldDisabled: useCallback((field: FormField) => isFieldDisabled(field, formData, form.fields), [formData, form.fields]),
    validateField,
    clearHiddenFieldData,
  };
}