import { clearAuthData } from "./util";

const BASE_URL = import.meta.env.VITE_API_ENDPOINT;

// Default network settings
const DEFAULT_TIMEOUT_MS = 20_000; // 20s

// Fetch with timeout and abort to avoid hanging requests consuming memory
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

const handleUnauthorized = () => {
  clearAuthData();
  window.location.href = "/login";
};

export async function apiGet<T>(
  endpoint: string,
  opts?: { timeoutMs?: number; headers?: HeadersInit }
): Promise<T> {
  const token = localStorage.getItem("token"); // Get token from localStorage
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts?.headers ?? {}),
  };

  const response = await fetchWithTimeout(
    `${BASE_URL}${endpoint}`,
    { headers },
    opts?.timeoutMs
  );
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`GET ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  data: any,
  headers: Record<string, string> = {},
  opts?: { timeoutMs?: number }
): Promise<T | string> {
  const token = localStorage.getItem("token");
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetchWithTimeout(
    `${BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: mergedHeaders,
      body: JSON.stringify(data),
    },
    opts?.timeoutMs
  );

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`POST ${endpoint} failed: ${response.status}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    return response.text();
  }
}

export async function apiPut<T>(
  endpoint: string,
  data: any,
  opts?: { timeoutMs?: number }
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetchWithTimeout(
    `${BASE_URL}${endpoint}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    },
    opts?.timeoutMs
  );

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`PUT ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete<T>(
  endpoint: string,
  opts?: { timeoutMs?: number }
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetchWithTimeout(
    `${BASE_URL}${endpoint}`,
    {
      method: "DELETE",
      headers,
    },
    opts?.timeoutMs
  );

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function deleteOrganization(companyId: string): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const response = await fetchWithTimeout(`${BASE_URL}/company/${companyId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error(`DELETE /company/${companyId} failed: ${response.status}`);
  }
}

// Delete a user by company ID
export async function deleteUserByCompanyId(companyId: string): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const response = await fetchWithTimeout(
    `${BASE_URL}/company/user/${companyId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  console.log("Delete user response:", response);
  if (!response.ok) {
    throw new Error(
      `DELETE /company/user/${companyId} failed: ${response.status}`
    );
  }

  return response.status;
}

// Create users for a company
export interface CreateUserData {
  name: string;
  email: string;
  designation: string;
  companyId: string;
}

export async function createCompanyUsers(
  users: CreateUserData[]
): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetchWithTimeout(`${BASE_URL}/company/user/set`, {
    method: "POST",
    headers,
    body: JSON.stringify(users),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Error response body:", errorText);
    throw new Error(
      errorText || `POST /company/user/set failed: ${response.status}`
    );
  }

  return response.json();
}

export async function createSurveyUsers(users: CreateUserData[]): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetchWithTimeout(`${BASE_URL}/survey/user/set`, {
    method: "POST",
    headers,
    body: JSON.stringify(users),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log("Error response body:", errorText);
    throw new Error(
      errorText || `POST /survey/user/set failed: ${response.status}`
    );
  }

  const responseText = await response.text();
  return responseText;
}

// Authentication types
export interface LoginData {
  email: string;
  password: string;
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

export async function getCompanies(): Promise<Company[]> {
  return apiGet<Company[]>("/company");
}

export async function createQuestion(data: {
  competencyId: string;
  question: string;
  optionType: string;
  options: string[];
}) {
  return apiPost<{
    id: string;
    competencyId: string;
    question: string;
    optionType: string;
    options: string[];
  }>("/question", data);
}

// Authentication functions
export async function login(loginData: LoginData): Promise<any> {
  return apiPost<any>("/auth/login", loginData);
}

export async function registerClient(
  registrationData: ClientRegistrationData
): Promise<any> {
  return apiPost<any>("/auth/register", registrationData);
}

// Survey related types and functions
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

// Get survey data by token (public endpoint - no auth required)
export async function getSurveyByToken(token: string): Promise<Survey> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/survey/public/${token}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch survey: ${response.status}`);
  }

  return response.json();
}

// Submit survey responses (public endpoint - no auth required)
export async function submitSurveyResponse(
  token: string,
  responses: SurveyResponse[]
): Promise<any> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/survey/public/${token}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ responses }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to submit survey: ${response.status}`);
  }

  return response.json();
}

// Team-related types and functions
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

// Create a new team
export async function createTeamAPI(
  teamData: CreateTeamData
): Promise<TeamResponse> {
  return apiPost<TeamResponse>("/team", teamData) as Promise<TeamResponse>;
}

// Survey creation types and functions
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
  }[];
}

// Create a complete survey with all data
export async function createSurveyAll(
  surveyData: SurveyCreationData
): Promise<any> {
  return apiPost<any>("/project/survey/all", surveyData);
}
