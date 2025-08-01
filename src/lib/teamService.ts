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

export interface manageTeamUser {
  email: string;
  role: string;
}

export async function getTeamRules(): Promise<any> {
  try {
    const response = await apiGet<{ data: any }>("/team/rules");
    return response.data;
  } catch (error) {
    console.error("Error fetching team rules:", error);
    return [];
  }
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    const response = await apiGet<Team[]>("/team");
    return response || [];
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

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

export async function addUser(
  userData: manageTeamUser
): Promise<manageTeamUser> {
  try {
    const response = await apiPost<manageTeamUser>(
      "/team/manage/user",
      userData
    );
    console.log("User added to team successfully:", response);
    return response as manageTeamUser;
  } catch (error) {
    console.error("Error adding user to team:", error);
    throw error;
  }
}
