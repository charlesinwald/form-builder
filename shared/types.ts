// Shared TypeScript types for the form builder application

export interface ConditionalRule {
  id: string;
  fieldId: string; // Field to check
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: string | number | boolean | string[];
  logicalOperator?: 'AND' | 'OR'; // For combining multiple rules
}

export interface ConditionalLogic {
  id: string;
  action: 'show' | 'hide' | 'require' | 'disable';
  rules: ConditionalRule[];
  targetType: 'field' | 'section' | 'page';
  targetId: string; // ID of the field, section, or page to affect
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[]; // Array of field IDs
  conditionalLogic?: ConditionalLogic[];
}

export interface FormPage {
  id: string;
  title: string;
  sections: string[]; // Array of section IDs
  conditionalLogic?: ConditionalLogic[];
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'rating' | 'signature' | 'file';
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
  fileOptions?: {
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in MB
  };
  sectionId?: string; // Optional section assignment
  conditionalLogic?: ConditionalLogic[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  sections?: FormSection[];
  pages?: FormPage[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userId: string;
  conditionalLogic?: ConditionalLogic[];
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
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  isActive?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreateResponseRequest {
  formId: string;
  data: Record<string, any>;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// File upload types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  userId: string;
  formId?: string;
  fieldId?: string;
  createdAt: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}