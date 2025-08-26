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

// Ensure the API URL has a protocol
const API_BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if available and needed
    if (useAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const config = {
      headers,
      ...options,
    };

    let response = await fetch(url, config);

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
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
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
    return this.request<Form>("/forms", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  async getForms(status?: string): Promise<Form[]> {
    const params = new URLSearchParams();
    if (status) params.append("status", status);

    const endpoint = `/forms${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    return this.request<Form[]>(endpoint);
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
    return this.request<Form>(`/forms/${id}/unpublish`, {
      method: "POST",
    });
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
    data: Record<string, unknown>
  ): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(
      "/responses",
      {
        method: "POST",
        body: JSON.stringify({ formId, data }),
      },
      false
    );
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    return this.request<FormResponse[]>(`/responses/form/${formId}`);
  }
}

export const apiService = new ApiService();
