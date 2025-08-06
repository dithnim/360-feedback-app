// Example of how to use the new team creation API function
// This file demonstrates the complete team creation process using the /team/all endpoint

import { createCompleteTeam, getCreatedUserIds } from "../lib/teamService";
import type { CreateCompleteTeamRequest } from "../lib/teamService";

// Example usage of the complete team creation API
export async function exampleTeamCreation() {
  try {
    // 1. Get user IDs from local storage (previously created users)
    const createdUserIds = getCreatedUserIds();

    if (createdUserIds.length === 0) {
      throw new Error("No created users found. Please create users first.");
    }

    // 2. Prepare the team creation data according to your specified structure
    const teamData: CreateCompleteTeamRequest = {
      clientManageTeam: {
        teamName: "Manage Team 1",
        description: "Test Description",
        createdUserId: "64dcd4fbe519be2a6c4e4b7e", // Current user's ID
      },
      clientManageTeamRule: [
        {
          ruleId: "64df2ae9352cde5dc1ab8d91",
        },
        {
          ruleId: "64df2ae9352cde5dc1ab8d92",
        },
      ],
      clientManageTeamUser: [
        {
          manageUserId: "64df2e12352cde5dc1ab8e10",
        },
        {
          manageUserId: "64df2e12352cde5dc1ab8e11",
        },
      ],
    };

    // 3. Call the API function
    const response = await createCompleteTeam(teamData);

    if (response.success) {
      console.log("Team created successfully:", response);
      return response;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

// Example with dynamic user IDs from local storage
export async function exampleTeamCreationWithLocalUsers() {
  try {
    // Get the current user from context/local storage
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      throw new Error("Current user not found");
    }

    // Get created user IDs from local storage
    const createdUserIds = getCreatedUserIds();

    if (createdUserIds.length === 0) {
      throw new Error("No created users found. Please create users first.");
    }

    // Get team rules from local storage or use default rule IDs
    const teamRules = JSON.parse(localStorage.getItem("teamRules") || "[]");
    const selectedRuleIds = teamRules
      .slice(0, 2)
      .map((rule: any) => rule.id || rule.ruleId);

    // Prepare the team creation data
    const teamData: CreateCompleteTeamRequest = {
      clientManageTeam: {
        teamName: "Dynamic Team",
        description: "Team created with dynamic user and rule data",
        createdUserId: currentUser.id,
      },
      clientManageTeamRule: selectedRuleIds.map((ruleId: string) => ({
        ruleId,
      })),
      clientManageTeamUser: createdUserIds.map((userId) => ({
        manageUserId: userId,
      })),
    };

    console.log("Creating team with data:", teamData);

    // Call the API function
    const response = await createCompleteTeam(teamData);

    if (response.success) {
      console.log("Team created successfully:", response);
      // Store the created team data
      localStorage.setItem("lastCreatedTeam", JSON.stringify(response));
      return response;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}
