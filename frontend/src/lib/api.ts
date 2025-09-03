import {
  FormField,
  Form,
  CreateFormRequest,
  UpdateFormRequest,
  FormResponse,
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
} from "../../../shared/types";
import { AnalyticsData } from "../hooks/use-websocket-analytics";

// Ensure the API URL has a protocol and force IPv4 localhost
const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";
  // If the URL doesn't start with http:// or https://, add http://
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    return `http://${url}`;
  }
  return url;
})();

// Token management
let authToken: string | null = null;
let refreshToken: string | null = null;

if (typeof window !== "undefined") {
  authToken = localStorage.getItem("authToken");
  refreshToken = localStorage.getItem("refreshToken");
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API: Making request to:', url, 'with options:', options);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if available and needed
    if (useAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
      console.log('API: Using auth token:', authToken ? 'present' : 'missing');
    }

    const config = {
      headers,
      ...options,
    };

    console.log('🌐 API: Sending request with config:', config);
    let response = await fetch(url, config);
    console.log('📡 API: Response status:', response.status, 'for', endpoint);
    console.log('📡 API: Response headers:', Object.fromEntries(response.headers.entries()));

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && refreshToken && useAuth) {
      try {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${authToken}`;
          response = await fetch(url, { ...config, headers });
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        this.clearAuthTokens();
        throw new Error("Authentication expired. Please log in again.");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API: Error response:', errorData);
      console.error('❌ API: Response status text:', response.statusText);
      console.error('❌ API: Full response details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log('API: Success response data:', data);
    return data;
  }

  private setAuthTokens(token: string, refresh: string): void {
    authToken = token;
    refreshToken = refresh;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refresh);
    }
  }

  private clearAuthTokens(): void {
    authToken = null;
    refreshToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
    }
  }

  private async refreshAuthToken(): Promise<boolean> {
    if (!refreshToken) return false;

    try {
      const response = await this.request<AuthResponse>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        },
        false
      );

      this.setAuthTokens(response.token, response.refreshToken);
      return true;
    } catch (error) {
      console.error("Refresh token failed:", error);
      return false;
    }
  }

  // Authentication methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false
    );
    this.setAuthTokens(response.token, response.refreshToken);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      false
    );
    this.setAuthTokens(response.token, response.refreshToken);
    return response;
  }

  async logout(): Promise<void> {
    this.clearAuthTokens();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/user/me");
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    return this.request<User>("/user/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>("/user/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  isAuthenticated(): boolean {
    return !!authToken;
  }

  async createForm(formData: CreateFormRequest): Promise<Form> {
    console.log('API: Creating form with data:', formData);
    const result = this.request<Form>("/forms", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    console.log('API: Create form response:', result);
    return result;
  }

  async getForms(status?: string): Promise<Form[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const endpoint = `/forms${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    console.log('API: Fetching forms from endpoint:', endpoint);
    const result = this.request<Form[]>(endpoint);
    console.log('API: Forms response:', result);
    return result;
  }

  async getForm(id: string): Promise<Form> {
    return this.request<Form>(`/forms/${id}`);
  }

  async updateForm(id: string, updates: UpdateFormRequest): Promise<Form> {
    return this.request<Form>(`/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteForm(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/forms/${id}`, {
      method: "DELETE",
    });
  }

  async saveDraft(
    id: string,
    formData: Omit<CreateFormRequest, "status">
  ): Promise<{ message: string; form: Form }> {
    return this.request<{ message: string; form: Form }>(
      `/forms/${id}/save-draft`,
      {
        method: "POST",
        body: JSON.stringify(formData),
      }
    );
  }

  async publishForm(id: string): Promise<Form> {
    return this.updateForm(id, { status: "published", isActive: true });
  }

  async unpublishForm(id: string): Promise<Form> {
    return this.updateForm(id, { status: "draft", isActive: false });
  }

  async archiveForm(id: string): Promise<Form> {
    return this.updateForm(id, { status: "archived", isActive: false });
  }

  async getPublicForm(id: string): Promise<Form> {
    console.log("API: Fetching public form with ID:", id);
    return this.request<Form>(`/public/forms/${id}`, {}, false);
  }

  async submitFormResponse(
    formId: string,
    data: Record<string, unknown>,
    sessionData?: { sessionId?: string; startedAt?: Date }
  ): Promise<{ message: string; id: string }> {
    console.log("🚀 APIService: submitFormResponse called");
    console.log("🆔 APIService: Form ID:", formId);
    console.log("📝 APIService: Form data:", data);
    console.log("📊 APIService: Session data:", sessionData);
    
    const payload: any = { formId, data };
    
    // Add session tracking data if available
    if (sessionData?.sessionId) {
      payload.sessionId = sessionData.sessionId;
      console.log("📋 APIService: Added session ID:", sessionData.sessionId);
    }
    if (sessionData?.startedAt) {
      payload.startedAt = sessionData.startedAt.toISOString();
      console.log("⏰ APIService: Added start time:", sessionData.startedAt.toISOString());
    }
    
    console.log("📦 APIService: Final payload:", payload);
    console.log("🌐 APIService: Making request to /responses endpoint");
    
    try {
      const result = await this.request<{ message: string; id: string }>(
        "/responses",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        false
      );
      console.log("🎉 APIService: Request successful:", result);
      return result;
    } catch (error) {
      console.error("❌ APIService: Request failed:", error);
      throw error;
    }
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    return this.request<FormResponse[]>(`/responses/form/${formId}`);
  }

  async getFormAnalytics(formId: string): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/analytics/form/${formId}`);
  }

  // File upload methods
  async uploadFile(
    file: File,
    formId?: string,
    fieldId?: string,
    forcePublic?: boolean
  ): Promise<{ id: string; filename: string; url: string; size: number; mimeType: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (formId) formData.append('formId', formId);
    if (fieldId) formData.append('fieldId', fieldId);

    // Use public upload endpoint if no auth token or if forcePublic is true
    const usePublic = !authToken || forcePublic;
    const url = usePublic ? `${API_BASE_URL}/public/files/upload` : `${API_BASE_URL}/files/upload`;
    const headers: Record<string, string> = {};

    if (authToken && !forcePublic) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUserFiles(): Promise<any[]> {
    return this.request<any[]>('/files/user');
  }

  async getUserFormFiles(): Promise<any[]> {
    return this.request<any[]>('/files/user-forms');
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
