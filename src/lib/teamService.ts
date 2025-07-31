// src/lib/teamService.ts
// Team service for managing team-related API calls

import { apiPost, apiGet } from "./apiService";

// Types for team operations
export interface CreateTeamRequest {
  teamName: string;
  description: string;
  createdUserId: string;
}

export interface CreateTeamResponse {
  id: string;
  teamName: string;
  createdUserId: string;
  createdAt: string;
}

export interface TeamValidationError {
  teamName?: string;
}

export interface Team {
  id: string;
  teamName: string;
  description?: string;
  createdUserId: string;
  createdAt: string;
}

/**
 * Create a new team
 *
 * @param teamData - The team data including teamName and createdUserId
 * @returns Promise<CreateTeamResponse> - The created team data
 *
 * API Specification:
 * POST /team
 * Request Body: { "teamName": "Development Team", "createdUserId": "685b9b5d31d84e2c5911ff11" }
 * Success Response (201): { "id": "686c135ac0e4965cb0e9cb90", "teamName": "Development Team", "createdUserId": "685b9b5d31d84e2c5911ff11", "createdAt": "2025-07-19T12:34:56Z" }
 * Validation Error (400): { "teamName": "Team name is required" }
 */
export async function createTeam(
  teamData: CreateTeamRequest
): Promise<CreateTeamResponse> {
  try {
    const response = await apiPost<CreateTeamResponse>("/team", teamData);
    return response as CreateTeamResponse;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

// Get team rules/permissions (existing functionality)
export async function getTeamRules(): Promise<any> {
  try {
    const response = await apiGet<{ data: any }>("/team/rules");
    return response.data;
  } catch (error) {
    console.error("Error fetching team rules:", error);
    return [];
  }
}

/**
 * Get all teams
 * @returns Promise<Team[]> - List of all teams
 *
 * API Specification:
 * GET /team
 * Success Response (200): Array of team objects
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const response = await apiGet<Team[]>("/team");
    return response || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}
