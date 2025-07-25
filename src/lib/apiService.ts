// src/lib/apiService.ts
// API service for communicating with Spring Boot backend on localhost:3010

import { clearAuthData } from "./util";

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
