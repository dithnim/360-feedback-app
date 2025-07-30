// src/lib/apiService.ts
// API service for communicating with Spring Boot backend on Railway

import { clearAuthData } from "./util";

// const BASE_URL = "https://360-backend-production-8ab2.up.railway.app/api/v1";
const BASE_URL = "http://localhost:3010/api/v1";

// Function to handle unauthorized responses
const handleUnauthorized = () => {
  clearAuthData();
  window.location.href = "/login";
};

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token"); // Get token from localStorage
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
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
  headers: Record<string, string> = {}
): Promise<T | string> {
  const token = localStorage.getItem("token");
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: mergedHeaders,
    body: JSON.stringify(data),
  });

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

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`PUT ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

// Delete a company/organization by ID
export async function deleteOrganization(companyId: string): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const response = await fetch(`${BASE_URL}/company/${companyId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error(`DELETE /company/${companyId} failed: ${response.status}`);
  }
  return response.json();
}

// Delete a user by company ID
export async function deleteUserByCompanyId(companyId: string): Promise<any> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const response = await fetch(`${BASE_URL}/company/user/${companyId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    if (response.status === 401) {
      handleUnauthorized();
    }
    throw new Error(
      `DELETE /company/user/${companyId} failed: ${response.status}`
    );
  }
  return response.json();
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

// Create a new competency
export async function createCompetency(competency: string) {
  return apiPost<{ id: string; competency: string }>("/competency", {
    competency,
  });
}

// Create a new question for a competency
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
  const response = await fetch(`${BASE_URL}/survey/public/${token}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

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
  const response = await fetch(`${BASE_URL}/survey/public/${token}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ responses }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit survey: ${response.status}`);
  }

  return response.json();
}
