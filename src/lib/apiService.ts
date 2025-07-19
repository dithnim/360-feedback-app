// src/lib/apiService.ts
// API service for communicating with Spring Boot backend on localhost:3010

const BASE_URL = "http://localhost:3010/api/v1";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = sessionStorage.getItem("token"); // Assuming token is stored in localStorage
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost<T>(
  endpoint: string,
  data: any,
  headers: Record<string, string> = {}
): Promise<T> {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: mergedHeaders,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`PUT ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
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
