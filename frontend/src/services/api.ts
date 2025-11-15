/**
 * API Service for LINCOLN Backend
 * Handles all HTTP requests to the C++ backend
 */

// Use relative URLs in development (Vite proxy handles it)
// Use full URL in production or if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8080');

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Merge headers properly
    const mergedHeaders: Record<string, string> = {
      ...defaultHeaders,
    };
    
    // Handle options.headers which can be Headers, string[][], or Record<string, string>
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          mergedHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          mergedHeaders[key] = value;
        });
      } else {
        Object.assign(mergedHeaders, options.headers);
      }
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, config);
      
      // Check if response is ok
      if (!response.ok) {
        // Try to parse error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        // Special handling for 500 errors
        if (response.status === 500) {
          console.error('Backend error:', errorMessage);
          console.error('Make sure the backend server is running on http://localhost:8080');
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }

      const data = await response.json();

      return {
        success: data.success !== false,
        message: data.message,
        token: data.token,
        user: data.user,
        data: data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Network error. Please check if the backend server is running on http://localhost:8080',
      };
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse> {
    const response = await this.request<ApiResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token if login successful
    if (response.success && response.token) {
      localStorage.setItem('auth_token', response.token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  }

  /**
   * Logout user (clear local storage)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): { id: number; name: string; email: string } | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

