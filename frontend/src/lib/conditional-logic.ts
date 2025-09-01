import { ConditionalRule, ConditionalLogic, FormField, Form, FormSection, FormPage } from "../../../shared/types";

export type FormData = Record<string, any>;

/**
 * Evaluates a single conditional rule against form data
 */
export function evaluateRule(rule: ConditionalRule, formData: FormData, fields: FormField[]): boolean {
  const fieldValue = formData[rule.fieldId];
  const targetValue = rule.value;
  
  // Get field definition to understand its type
  const field = fields.find(f => f.id === rule.fieldId);
  if (!field) {
    console.warn(`Field ${rule.fieldId} not found for conditional rule`);
    return false;
  }

  switch (rule.operator) {
    case 'equals':
      if (field.type === 'checkbox' && Array.isArray(fieldValue)) {
        // For checkbox fields, check if arrays are equal
        return JSON.stringify(fieldValue?.sort()) === JSON.stringify((targetValue as string[])?.sort());
      }
      return fieldValue === targetValue;

    case 'not_equals':
      if (field.type === 'checkbox' && Array.isArray(fieldValue)) {
        return JSON.stringify(fieldValue?.sort()) !== JSON.stringify((targetValue as string[])?.sort());
      }
      return fieldValue !== targetValue;

    case 'contains':
      if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
        return fieldValue.toLowerCase().includes(targetValue.toLowerCase());
      }
      if (Array.isArray(fieldValue) && typeof targetValue === 'string') {
        return fieldValue.includes(targetValue);
      }
      return false;

    case 'not_contains':
      if (typeof fieldValue === 'string' && typeof targetValue === 'string') {
        return !fieldValue.toLowerCase().includes(targetValue.toLowerCase());
      }
      if (Array.isArray(fieldValue) && typeof targetValue === 'string') {
        return !fieldValue.includes(targetValue);
      }
      return true;

    case 'greater_than':
      const numValue = typeof fieldValue === 'string' ? parseFloat(fieldValue) : fieldValue;
      const numTarget = typeof targetValue === 'string' ? parseFloat(targetValue as string) : targetValue;
      return !isNaN(numValue) && !isNaN(numTarget as number) && numValue > (numTarget as number);

    case 'less_than':
      const numValue2 = typeof fieldValue === 'string' ? parseFloat(fieldValue) : fieldValue;
      const numTarget2 = typeof targetValue === 'string' ? parseFloat(targetValue as string) : targetValue;
      return !isNaN(numValue2) && !isNaN(numTarget2 as number) && numValue2 < (numTarget2 as number);

    case 'is_empty':
      return !fieldValue || 
             fieldValue === '' || 
             (Array.isArray(fieldValue) && fieldValue.length === 0);

    case 'is_not_empty':
      return fieldValue && 
             fieldValue !== '' && 
             (!Array.isArray(fieldValue) || fieldValue.length > 0);

    default:
      console.warn(`Unknown operator: ${rule.operator}`);
      return false;
  }
}

/**
 * Evaluates all rules in a conditional logic with AND/OR logic
 */
export function evaluateConditionalLogic(conditionalLogic: ConditionalLogic, formData: FormData, fields: FormField[]): boolean {
  if (!conditionalLogic.rules || conditionalLogic.rules.length === 0) {
    return true; // No rules means always show
  }

  let result = evaluateRule(conditionalLogic.rules[0], formData, fields);

  for (let i = 1; i < conditionalLogic.rules.length; i++) {
    const rule = conditionalLogic.rules[i];
    const ruleResult = evaluateRule(rule, formData, fields);
    
    // Use the logical operator from the previous rule (or default to AND)
    const operator = conditionalLogic.rules[i - 1].logicalOperator || 'AND';
    
    if (operator === 'AND') {
      result = result && ruleResult;
    } else if (operator === 'OR') {
      result = result || ruleResult;
    }
  }

  return result;
}

/**
 * Determines if a field should be visible based on its conditional logic
 */
export function isFieldVisible(field: FormField, formData: FormData, fields: FormField[]): boolean {
  if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
    return true; // No conditional logic means always visible
  }

  // Check if any logic rules have "show" action - these fields should be hidden by default
  const hasShowLogic = field.conditionalLogic.some(logic => logic.action === 'show');
  
  // If field has "show" logic, it starts as hidden and only shows when conditions are met
  let isVisible = !hasShowLogic;

  // Evaluate all conditional logic rules for this field
  for (const logic of field.conditionalLogic) {
    const conditionMet = evaluateConditionalLogic(logic, formData, fields);
    
    if (logic.action === 'hide' && conditionMet) {
      return false; // Hide takes precedence
    } else if (logic.action === 'show' && conditionMet) {
      isVisible = true; // Show when condition is met
    }
  }

  return isVisible;
}

/**
 * Determines if a field should be required based on its conditional logic
 */
export function isFieldRequired(field: FormField, formData: FormData, fields: FormField[]): boolean {
  let isRequired = field.required;

  if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
    return isRequired;
  }

  // Check if any conditional logic affects the required state
  for (const logic of field.conditionalLogic) {
    if (logic.action === 'require') {
      const conditionMet = evaluateConditionalLogic(logic, formData, fields);
      if (conditionMet) {
        isRequired = true;
      }
    }
  }

  return isRequired;
}

/**
 * Determines if a field should be disabled based on its conditional logic
 */
export function isFieldDisabled(field: FormField, formData: FormData, fields: FormField[]): boolean {
  if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
    return false;
  }

  // Check if any conditional logic disables the field
  for (const logic of field.conditionalLogic) {
    if (logic.action === 'disable') {
      const conditionMet = evaluateConditionalLogic(logic, formData, fields);
      if (conditionMet) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Gets all visible fields for a form based on current form data
 * This considers field-level, section-level, and page-level visibility
 */
export function getVisibleFields(form: Form, formData: FormData): FormField[] {
  // Start with fields that are in visible pages (if pages exist)
  let visibleFields = form.pages ? getFieldsInVisiblePages(form, formData) : form.fields;
  
  // Filter by section visibility (if sections exist but not organized in pages)
  if (form.sections && !form.pages) {
    visibleFields = getFieldsInVisibleSections(form, formData);
  }
  
  // Finally filter by individual field visibility
  return visibleFields.filter(field => isFieldVisible(field, formData, form.fields));
}

/**
 * Gets all fields that should be validated (visible and required)
 */
export function getFieldsToValidate(form: Form, formData: FormData): FormField[] {
  return form.fields.filter(field => {
    const visible = isFieldVisible(field, formData, form.fields);
    const required = isFieldRequired(field, formData, form.fields);
    return visible && required;
  });
}

/**
 * Determines if a section should be visible based on its conditional logic
 */
export function isSectionVisible(section: FormSection, formData: FormData, fields: FormField[]): boolean {
  if (!section.conditionalLogic || section.conditionalLogic.length === 0) {
    return true; // No conditional logic means always visible
  }

  // Evaluate all conditional logic rules for this section
  for (const logic of section.conditionalLogic) {
    const conditionMet = evaluateConditionalLogic(logic, formData, fields);
    
    if (logic.action === 'hide' && conditionMet) {
      return false;
    } else if (logic.action === 'show' && !conditionMet) {
      return false;
    }
  }

  return true;
}

/**
 * Gets all visible sections for a form based on current form data
 */
export function getVisibleSections(form: Form, formData: FormData): FormSection[] {
  if (!form.sections) return [];
  return form.sections.filter(section => isSectionVisible(section, formData, form.fields));
}

/**
 * Gets fields that belong to visible sections
 */
export function getFieldsInVisibleSections(form: Form, formData: FormData): FormField[] {
  const visibleSections = getVisibleSections(form, formData);
  const visibleSectionIds = new Set(visibleSections.map(s => s.id));
  
  return form.fields.filter(field => {
    // If field has no section, it's always included
    if (!field.sectionId) return true;
    // Otherwise, check if its section is visible
    return visibleSectionIds.has(field.sectionId);
  });
}

/**
 * Determines if a page should be visible based on its conditional logic
 */
export function isPageVisible(page: FormPage, formData: FormData, fields: FormField[]): boolean {
  if (!page.conditionalLogic || page.conditionalLogic.length === 0) {
    return true; // No conditional logic means always visible
  }

  // Evaluate all conditional logic rules for this page
  for (const logic of page.conditionalLogic) {
    const conditionMet = evaluateConditionalLogic(logic, formData, fields);
    
    if (logic.action === 'hide' && conditionMet) {
      return false;
    } else if (logic.action === 'show' && !conditionMet) {
      return false;
    }
  }

  return true;
}

/**
 * Gets all visible pages for a form based on current form data
 */
export function getVisiblePages(form: Form, formData: FormData): FormPage[] {
  if (!form.pages) return [];
  return form.pages.filter(page => isPageVisible(page, formData, form.fields));
}

/**
 * Gets sections that belong to visible pages
 */
export function getSectionsInVisiblePages(form: Form, formData: FormData): FormSection[] {
  if (!form.pages || !form.sections) return form.sections || [];
  
  const visiblePages = getVisiblePages(form, formData);
  const visiblePageSectionIds = new Set(
    visiblePages.flatMap(page => page.sections)
  );
  
  return form.sections.filter(section => {
    // If no pages are defined, all sections are visible
    if (form.pages.length === 0) return true;
    // Otherwise, check if section belongs to a visible page
    return visiblePageSectionIds.has(section.id);
  });
}

/**
 * Gets fields that belong to sections in visible pages
 */
export function getFieldsInVisiblePages(form: Form, formData: FormData): FormField[] {
  const sectionsInVisiblePages = getSectionsInVisiblePages(form, formData);
  const visibleSectionIds = new Set(sectionsInVisiblePages.map(s => s.id));
  
  return form.fields.filter(field => {
    // If no sections/pages structure, include all fields
    if (!form.sections || !form.pages) return true;
    // If field has no section, include it
    if (!field.sectionId) return true;
    // Otherwise, check if its section is in a visible page
    return visibleSectionIds.has(field.sectionId);
  });
}

/**
 * Utility to get available fields for condition targets (excludes the current field)
 */
export function getAvailableConditionFields(fields: FormField[], currentFieldId?: string): FormField[] {
  return fields.filter(field => field.id !== currentFieldId);
}

/**
 * Utility to get available operators for a specific field type
 */
export function getAvailableOperators(fieldType: FormField['type']): Array<{value: ConditionalRule['operator'], label: string}> {
  const baseOperators = [
    { value: 'is_empty' as const, label: 'Is empty' },
    { value: 'is_not_empty' as const, label: 'Is not empty' },
  ];

  switch (fieldType) {
    case 'text':
    case 'email':
    case 'textarea':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
        ...baseOperators,
      ];

    case 'number':
    case 'rating':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'greater_than', label: 'Greater than' },
        { value: 'less_than', label: 'Less than' },
        ...baseOperators,
      ];

    case 'select':
    case 'radio':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        ...baseOperators,
      ];

    case 'checkbox':
      return [
        { value: 'equals', label: 'Equals (exact match)' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
        ...baseOperators,
      ];

    case 'date':
    case 'signature':
    case 'file':
      return baseOperators;

    default:
      return baseOperators;
  }
}