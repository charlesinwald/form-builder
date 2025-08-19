// Shared TypeScript types for the form builder application

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userId: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface FormAnalytics {
  totalResponses: number;
  responseRate: number;
  averageCompletionTime: number;
  fieldAnalytics: {
    fieldId: string;
    fieldLabel: string;
    responses: number;
    mostCommonValue?: string;
    values?: Record<string, number>;
  }[];
  responsesByDay: {
    date: string;
    count: number;
  }[];
}

export interface CreateFormRequest {
  title: string;
  description: string;
  fields: Omit<FormField, 'id'>[];
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  isActive?: boolean;
}

export interface CreateResponseRequest {
  formId: string;
  data: Record<string, any>;
}