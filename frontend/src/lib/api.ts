const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userId: string;
  responseCount?: number;
}

export interface CreateFormRequest {
  title: string;
  description: string;
  fields: FormField[];
  status?: string;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  fields?: FormField[];
  status?: string;
  isActive?: boolean;
}

export interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createForm(formData: CreateFormRequest): Promise<Form> {
    return this.request<Form>('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async getForms(status?: string): Promise<Form[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const endpoint = `/forms${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Form[]>(endpoint);
  }

  async getForm(id: string): Promise<Form> {
    return this.request<Form>(`/forms/${id}`);
  }

  async updateForm(id: string, updates: UpdateFormRequest): Promise<Form> {
    return this.request<Form>(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteForm(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/forms/${id}`, {
      method: 'DELETE',
    });
  }

  async saveDraft(id: string, formData: Omit<CreateFormRequest, 'status'>): Promise<{ message: string; form: Form }> {
    return this.request<{ message: string; form: Form }>(`/forms/${id}/save-draft`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  async publishForm(id: string): Promise<Form> {
    return this.updateForm(id, { status: 'published', isActive: true });
  }

  async unpublishForm(id: string): Promise<Form> {
    return this.request<Form>(`/forms/${id}/unpublish`, {
      method: 'POST',
    });
  }

  async archiveForm(id: string): Promise<Form> {
    return this.updateForm(id, { status: 'archived', isActive: false });
  }

  async getPublicForm(id: string): Promise<Form> {
    console.log('API: Fetching public form with ID:', id)
    return this.request<Form>(`/public/forms/${id}`);
  }

  async submitFormResponse(formId: string, data: Record<string, any>): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>('/responses', {
      method: 'POST',
      body: JSON.stringify({ formId, data }),
    });
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    return this.request<FormResponse[]>(`/responses/form/${formId}`);
  }
}

export const apiService = new ApiService();