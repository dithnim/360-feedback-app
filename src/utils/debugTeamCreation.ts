// Debug helper to test team creation API
// This file helps debug the team creation response format

import { createCompleteTeam } from "../lib/teamService";
import type { CreateCompleteTeamRequest } from "../lib/teamService";

export async function debugTeamCreation() {
  console.log("=== DEBUG: Testing Team Creation API ===");

  // Sample data for testing
  const testData: CreateCompleteTeamRequest = {
    clientManageTeam: {
      teamName: "Debug Test Team",
      description: "Test team for debugging API response",
      createdUserId: "test-user-id-123",
    },
    clientManageTeamRule: [
      { ruleId: "test-rule-1" },
      { ruleId: "test-rule-2" },
    ],
    clientManageTeamUser: [
      { manageUserId: "test-user-1" },
      { manageUserId: "test-user-2" },
    ],
  };

  try {
    console.log("Sending test request with data:", testData);
    const response = await createCompleteTeam(testData);

    console.log("=== API Response Analysis ===");
    console.log("Response type:", typeof response);
    console.log("Response value:", response);
    console.log("Response keys:", response ? Object.keys(response) : "No keys");
    console.log("Has success property:", "success" in (response || {}));
    console.log("Success value:", response?.success);

    if (typeof response === "string") {
      console.log("Response is a string, likely success message");
      return { success: true, message: response };
    } else if (response && typeof response === "object") {
      console.log("Response is an object");
      return response;
    }
  } catch (error: any) {
    console.error("=== Error Analysis ===");
    console.error("Error type:", typeof error);
    console.error("Error message:", error?.message);
    console.error("Error details:", error);

    // Check if it's actually a successful response disguised as an error
    if (
      error?.message?.toLowerCase().includes("success") ||
      error?.message?.toLowerCase().includes("created")
    ) {
      console.log(
        "Error message suggests success - API might have created the team"
      );
    }

    throw error;
  }
}

// Helper function to test with real user data from localStorage
export async function debugWithRealData() {
  console.log("=== DEBUG: Testing with Real Data ===");

  try {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const createdUsers = JSON.parse(
      localStorage.getItem("createdUsers") || "[]"
    );

    console.log("Current user:", currentUser);
    console.log("Created users:", createdUsers);

    if (!currentUser.id) {
      console.error("No current user found");
      return;
    }

    if (createdUsers.length === 0) {
      console.error("No created users found");
      return;
    }

    const testData: CreateCompleteTeamRequest = {
      clientManageTeam: {
        teamName: "Real Data Test Team",
        description: "Test team using real data from localStorage",
        createdUserId: currentUser.id,
      },
      clientManageTeamRule: [{ ruleId: "real-rule-1" }],
      clientManageTeamUser: createdUsers.slice(0, 2).map((user: any) => ({
        manageUserId: user.id || user.manageUserId || `fallback-${Date.now()}`,
      })),
    };

    return await debugTeamCreation();
  } catch (error) {
    console.error("Error in real data test:", error);
    throw error;
  }
}

// Call this from browser console to test:
// import { debugTeamCreation, debugWithRealData } from './src/utils/debugTeamCreation.ts'
// debugTeamCreation() or debugWithRealData()
