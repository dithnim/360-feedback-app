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
  id?: string;
  email: string;
  role: string;
  manageUserId?: string;
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

// Types for comprehensive team creation
export interface ClientManageTeam {
  teamName: string;
  description: string;
  createdUserId: string;
}

export interface ClientManageTeamRule {
  ruleId: string;
}

export interface ClientManageTeamUser {
  manageUserId: string;
}

export interface CreateCompleteTeamRequest {
  clientManageTeam: ClientManageTeam;
  clientManageTeamRule: ClientManageTeamRule[];
  clientManageTeamUser: ClientManageTeamUser[];
}

export interface CreateCompleteTeamResponse {
  success?: boolean;
  teamId?: string;
  message?: string;
  data?: any;
  id?: string; // Alternative field for team ID
  [key: string]: any; // Allow any additional properties
}

// Create a complete team with rules and users using /team/all endpoint
export async function createCompleteTeam(
  teamData: CreateCompleteTeamRequest
): Promise<CreateCompleteTeamResponse> {
  try {
    console.log("Sending team creation request to /team/all:", teamData);
    const response = await apiPost<CreateCompleteTeamResponse>(
      "/team/all",
      teamData
    );
    console.log("Raw API response:", response);

    // If the response is a string (like "Team created successfully"), wrap it
    if (typeof response === "string") {
      return {
        success: true,
        message: response,
        data: response,
      };
    }

    // If response is an object but doesn't have success field, assume success
    if (
      response &&
      typeof response === "object" &&
      response.success === undefined
    ) {
      return {
        ...response,
        success: true,
      };
    }

    return response as CreateCompleteTeamResponse;
  } catch (error) {
    console.error("Error creating complete team:", error);
    throw error;
  }
}

// Helper function to get user IDs from local storage
export function getCreatedUserIds(): string[] {
  try {
    const createdUsers = localStorage.getItem("createdUsers");
    if (createdUsers) {
      const users = JSON.parse(createdUsers);
      // Extract user IDs from the created users, trying different possible ID field names
      return users
        .map(
          (user: any) =>
            user.manageUserId ||
            user.id ||
            user._id ||
            user.userId ||
            `generated_${Date.now()}_${Math.random()}`
        )
        .filter((id: string) => id); // Filter out any undefined/null values
    }
    return [];
  } catch (error) {
    console.error("Error getting user IDs from local storage:", error);
    return [];
  }
}
