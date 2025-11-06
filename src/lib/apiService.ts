import axios from "axios";
import { clearAuthData } from "./util";

// Environment configuration
const BASE_URL = import.meta.env.VITE_API_ENDPOINT;
const DEFAULT_TIMEOUT_MS = 20_000; // 20 seconds

// Types
export interface ApiError extends Error {
  status?: number;
  data?: any;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: any;
  message?: string;
}

export interface ClientRegistrationData {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
}

export interface Company {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  contactNumber: string;
  logoImg: string;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  designation: string;
  companyId: string;
}

export interface SurveyQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface SurveyCompetency {
  id: number;
  name: string;
  description: string;
  questions: SurveyQuestion[];
}

export interface Survey {
  id: string;
  title: string;
  employee: string;
  competencies: SurveyCompetency[];
}

export interface SurveyResponse {
  questionId: number;
  answer: string;
  comment?: string;
}

export interface CreateTeamData {
  teamName: string;
  createdUserId: string;
}

export interface TeamResponse {
  id: string;
  teamName: string;
  createdUserId: string;
  createdAt: string;
}

export interface SurveyCreationData {
  survey: {
    surveyName: string;
    projectId: string;
  };
  questions: {
    questionId: string;
  }[];
  users: {
    userId: string;
    appraiser: boolean;
    role: string;
    group: string;
  }[];
}

export interface TemplateCreationData {
  survey: {
    surveyName: string;
    projectId: string | null;
  };
  questions: {
    questionId: string;
  }[];
}

export interface SurveyUserRecord {
  surveyId: string;
  userId: string;
  appraiser: boolean;
  role: string;
  group: string;
}

export interface QuestionData {
  competencyId: string;
  question: string;
  optionType: string;
  options: string[];
}

// Token management with better security
class TokenManager {
  private static TOKEN_KEY = "token";

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Failed to retrieve token:", error);
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to store token:", error);
    }
  }

  static removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  }
}

// Create and configure Axios instance
class ApiClient {
  private axiosInstance: any;
  private publicAxiosInstance: any;

  constructor() {
    // Main instance with authentication
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Public instance without authentication
    this.publicAxiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        const token = TokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor for public instance
    this.publicAxiosInstance.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private handleUnauthorized(): void {
    clearAuthData();
    TokenManager.removeToken();
    window.location.href = "/login";
  }

  private createApiError(error: any): ApiError {
    const apiError: ApiError = new Error(
      error.response?.data?.message ||
        error.message ||
        "An unknown error occurred"
    );
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    return apiError;
  }

  // Generic HTTP methods
  async get<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.get(endpoint, config);
    return response.data;
  }

  async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.post(endpoint, data, config);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.axiosInstance.put(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.axiosInstance.delete(endpoint, config);
    return response.data;
  }

  // Public endpoints (no authentication)
  async getPublic<T>(endpoint: string, config?: any): Promise<T> {
    const response = await this.publicAxiosInstance.get(endpoint, config);
    return response.data;
  }

  async postPublic<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    const response = await this.publicAxiosInstance.post(
      endpoint,
      data,
      config
    );
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// ============================================
// Public API Functions
// ============================================

// Authentication
export async function login(loginData: LoginData): Promise<LoginResponse> {
  const response = await apiClient.postPublic<LoginResponse>(
    "/auth/login",
    loginData
  );
  // Store token if login successful
  if (response?.token) {
    TokenManager.setToken(response.token);
  }
  return response;
}

export async function registerClient(
  registrationData: ClientRegistrationData
): Promise<any> {
  return apiClient.postPublic("/auth/register", registrationData);
}

// Company Management
export async function getCompanies(): Promise<Company[]> {
  return apiClient.get<Company[]>("/company");
}

export async function deleteOrganization(companyId: string): Promise<void> {
  if (!companyId) {
    throw new Error("Company ID is required");
  }
  await apiClient.delete(`/company/${companyId}`);
}

// User Management
export async function deleteUserByCompanyId(
  companyId: string
): Promise<number> {
  if (!companyId) {
    throw new Error("Company ID is required");
  }
  const response = await apiClient.delete<any>(`/company/user/${companyId}`);
  return response.status || 200;
}

export async function createCompanyUsers(
  users: CreateUserData[]
): Promise<any> {
  if (!users || users.length === 0) {
    throw new Error("At least one user is required");
  }
  return apiClient.post("/company/user/set", users);
}

export async function createSurveyUsers(
  users: CreateUserData[]
): Promise<string> {
  if (!users || users.length === 0) {
    throw new Error("At least one user is required");
  }
  return apiClient.post<string>("/survey/user/set", users);
}

// Question Management
export async function createQuestion(
  data: QuestionData
): Promise<QuestionData & { id: string }> {
  return apiClient.post<QuestionData & { id: string }>("/question", data);
}

// Survey Management (Public)
export async function getSurveyByToken(token: string): Promise<Survey> {
  if (!token) {
    throw new Error("Survey token is required");
  }
  return apiClient.getPublic<Survey>(`/survey/public/${token}`);
}

export async function submitSurveyResponse(
  token: string,
  responses: SurveyResponse[]
): Promise<any> {
  if (!token) {
    throw new Error("Survey token is required");
  }
  if (!responses || responses.length === 0) {
    throw new Error("At least one response is required");
  }
  return apiClient.postPublic(`/survey/public/${token}/submit`, { responses });
}

// Team Management
export async function createTeamAPI(
  teamData: CreateTeamData
): Promise<TeamResponse> {
  return apiClient.post<TeamResponse>("/team", teamData);
}

// Survey Creation
export async function createSurveyAll(
  surveyData: SurveyCreationData
): Promise<any> {
  return apiClient.post("/project/survey/all", surveyData);
}

export async function createTemplateAll(
  templateData: TemplateCreationData
): Promise<any> {
  return apiClient.post("/survey/template/survey/all", templateData);
}

export async function createSurveyUserRecords(
  surveyUsers: SurveyUserRecord[]
): Promise<any> {
  if (!surveyUsers || surveyUsers.length === 0) {
    throw new Error("At least one survey user record is required");
  }
  return apiClient.post("/project/survey/user/set", surveyUsers);
}

// Utility function to check authentication status
export function isAuthenticated(): boolean {
  return TokenManager.getToken() !== null;
}

// Export the token manager for advanced use cases
export { TokenManager };

// Export the raw client for custom endpoints if needed
export { apiClient };

// Generic post function for backward compatibility
export async function apiPost<T>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> {
  return apiClient.post<T>(endpoint, data, config);
}

// Generic get function for backward compatibility
export async function apiGet<T>(endpoint: string, config?: any): Promise<T> {
  return apiClient.get<T>(endpoint, config);
}

// Generic delete function for backward compatibility
export async function apiDelete<T>(endpoint: string, config?: any): Promise<T> {
  return apiClient.delete<T>(endpoint, config);
}
