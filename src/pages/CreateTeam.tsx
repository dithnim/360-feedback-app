import { useState, useEffect } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/skeleton";
import { useUser } from "../context/UserContext";
import {
  createTeam,
  getTeamRules,
  addUser,
  createCompleteTeam,
  getCreatedUserIds,
} from "../lib/teamService";
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  TeamValidationError,
  manageTeamUser,
  CreateCompleteTeamRequest,
  ClientManageTeamRule,
  ClientManageTeamUser,
} from "../lib/teamService";

// Extended validation errors interface
interface FormValidationError extends TeamValidationError {
  email?: string;
  role?: string;
  teamDescription?: string;
  general?: string;
}

const CreateTeam = () => {
  const { user } = useUser();
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FormValidationError>(
    {}
  );

  useEffect(() => {
    const fetchRules = async () => {
      setIsLoadingPermissions(true);
      const fetchedRules = await getTeamRules();
      setPermissions(fetchedRules);
      setIsLoadingPermissions(false);
      console.log("Fetched rules:", fetchedRules);
    };
    fetchRules();
  }, []);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamPermissions, setTeamPermissions] = useState<number[]>([]);
  const [teams, setTeams] = useState<{ email: string; role: string }[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<any[]>([]);
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [createdUsers, setCreatedUsers] = useState<manageTeamUser[]>([]);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    // Check for duplicate emails
    if (
      teams.some((team, index) => team.email === email && index !== editIndex)
    ) {
      return "This email is already added to the team";
    }
    return null;
  };

  const validateRole = (role: string): string | null => {
    if (!role.trim()) {
      return "Role is required";
    }
    if (role.trim().length < 2) {
      return "Role must be at least 2 characters long";
    }
    if (role.trim().length > 100) {
      return "Role must not exceed 100 characters";
    }
    return null;
  };

  const validateTeamName = (name: string): string | null => {
    if (!name.trim()) {
      return "Team name is required";
    }
    if (name.trim().length < 2) {
      return "Team name must be at least 2 characters long";
    }
    if (name.trim().length > 50) {
      return "Team name must not exceed 50 characters";
    }
    return null;
  };

  const validateTeamDescription = (description: string): string | null => {
    if (!description.trim()) {
      return "Description is required";
    }
    if (description.trim().length < 10) {
      return "Description must be at least 10 characters long";
    }
    if (description.trim().length > 500) {
      return "Description must not exceed 500 characters";
    }
    return null;
  };

  const handlePermissionChange = (idx: number) => {
    setTeamPermissions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleAdd = () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate email and role
    const emailError = validateEmail(email);
    const roleError = validateRole(role);

    if (emailError || roleError) {
      setValidationErrors({
        email: emailError || undefined,
        role: roleError || undefined,
      });
      return;
    }

    if (editIndex !== null) {
      const updated = [...teams];
      updated[editIndex] = {
        email: email.trim(),
        role: role.trim(),
      };
      setTeams(updated);
      setEditIndex(null);
    } else {
      setTeams([
        ...teams,
        {
          email: email.trim(),
          role: role.trim(),
        },
      ]);
    }
    setEmail("");
    setRole("");
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEmail(teams[idx].email);
    setRole(teams[idx].role);
  };

  const handleDelete = (idx: number) => {
    setTeams(teams.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setEditIndex(null);
      setEmail("");
      setRole("");
    }
  };

  const handleSaveTeam = async () => {
    // Clear previous errors
    setValidationErrors({});

    // Validate team name and description
    const teamNameError = validateTeamName(teamName);
    const teamDescriptionError = validateTeamDescription(teamDescription);

    if (teamNameError || teamDescriptionError) {
      setValidationErrors({
        teamName: teamNameError || undefined,
        teamDescription: teamDescriptionError || undefined,
      });
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      setValidationErrors({ general: "User not authenticated" });
      return;
    }

    // Get user IDs from local storage (previously created users)
    const createdUserIds = getCreatedUserIds();

    // Check if there are created users (either from current session or previous)
    if (createdUserIds.length === 0 && createdUsers.length === 0) {
      setValidationErrors({
        general:
          "No team members found. Please add users first by clicking 'Create New Team' button in the main form.",
      });
      return;
    }

    // Check if at least one permission is selected
    if (teamPermissions.length === 0) {
      setValidationErrors({
        general: "Please select at least one team permission",
      });
      return;
    }

    setIsCreatingTeam(true);

    try {
      // Use created user IDs from local storage or current session
      const finalUserIds =
        createdUserIds.length > 0
          ? createdUserIds
          : createdUsers
              .map((user) => user.id || user.manageUserId)
              .filter((id): id is string => !!id);

      if (finalUserIds.length === 0) {
        setValidationErrors({
          general: "No valid user IDs found. Please try adding users again.",
        });
        setIsCreatingTeam(false);
        return;
      }

      // Prepare team rules based on selected permissions
      const clientManageTeamRule: ClientManageTeamRule[] = teamPermissions.map(
        (permissionIndex) => ({
          ruleId:
            permissions[permissionIndex]?.id ||
            permissions[permissionIndex]?.ruleId ||
            `rule_${permissionIndex}`,
        })
      );

      // Prepare team users from created users
      const clientManageTeamUser: ClientManageTeamUser[] = finalUserIds.map(
        (userId) => ({
          manageUserId: userId,
        })
      );

      // Create the complete team using the new API specification
      const completeTeamData: CreateCompleteTeamRequest = {
        clientManageTeam: {
          teamName: teamName.trim(),
          description: teamDescription.trim(),
          createdUserId: user.id,
        },
        clientManageTeamRule: clientManageTeamRule,
        clientManageTeamUser: clientManageTeamUser,
      };

      console.log("Creating complete team with data:", completeTeamData);

      const response = await createCompleteTeam(completeTeamData);
      console.log("API Response:", response);

      // Handle different response formats - check if response exists and has data
      if (
        response &&
        (response.success === true || response.success === undefined)
      ) {
        // Store the team creation response
        console.log("Complete team created successfully:", response);

        // Reset form on success
        setTeamName("");
        setTeamDescription("");
        setTeamPermissions([]);
        setIsModalOpen(false);
        setTeams([]);

        // Success notification
        alert(
          `Team "${teamName}" created successfully with ${clientManageTeamUser.length} users and ${clientManageTeamRule.length} permissions!`
        );
      } else {
        // If response.success is explicitly false
        throw new Error(response?.message || "Failed to create team");
      }
    } catch (error: any) {
      console.error("Error creating complete team:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });

      // If the error message suggests team was actually created, treat as success
      if (
        error.message?.includes("created") ||
        error.message?.includes("success")
      ) {
        console.log(
          "Team might have been created despite error, treating as success"
        );

        // Reset form on success
        setTeamName("");
        setTeamDescription("");
        setTeamPermissions([]);
        setIsModalOpen(false);
        setTeams([]);

        localStorage.removeItem("createdUsers");

        alert(`Team "${teamName}" was created successfully!`);
        return;
      }

      // Handle validation errors from the API
      if (error.message && error.message.includes("400")) {
        setValidationErrors({
          general: "Invalid team data. Please check all fields and try again.",
        });
      } else if (error.message && error.message.includes("401")) {
        setValidationErrors({
          general: "Authentication failed. Please login again.",
        });
      } else {
        // Handle other errors
        setValidationErrors({
          general: error.message || "Failed to create team. Please try again.",
        });
      }
    } finally {
      setIsCreatingTeam(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-0 m-0">
      <div className=" rounded-lg shadow-lg w-full h-full max-w-none flex flex-col justify-between">
        <div>
          <PageNav title="Create New Team" position="HR Manager" />
          <div className="mb-6 py-8 px-20">
            <h2 className="text-2xl font-semibold mb-8">Team Details</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="block text-md mb-1">Email Address*</label>
                <input
                  type="email"
                  className={`border rounded-lg p-2 w-full ${
                    validationErrors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear validation error when user starts typing
                    if (validationErrors.email) {
                      setValidationErrors({
                        ...validationErrors,
                        email: undefined,
                      });
                    }
                  }}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-md mb-1">Role*</label>
                <input
                  type="text"
                  className={`border rounded-lg p-2 w-full ${
                    validationErrors.role ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Overseeing Recruitment Process"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    // Clear validation error when user starts typing
                    if (validationErrors.role) {
                      setValidationErrors({
                        ...validationErrors,
                        role: undefined,
                      });
                    }
                  }}
                />
                {validationErrors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.role}
                  </p>
                )}
              </div>
            </div>
            <button
              className="bg-[#ed3f41] text-white rounded px-6 py-2 font-semibold mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAdd}
              disabled={!email.trim() || !role.trim()}
            >
              {editIndex !== null ? "Update" : "Add"}
            </button>
            {validationErrors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-red-600 text-sm">
                  {validationErrors.general}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto px-20">
          <table className="min-w-full bg-white">
            <tbody>
              {teams.map((team, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 flex w-full justify-between px-20"
                >
                  <td className="py-2  text-gray-900">{team.email}</td>
                  <td className="py-2  text-gray-900">{team.role}</td>
                  <td className="py-2">
                    <button
                      className="bg-[#ed3f41] text-white rounded p-2 me-2"
                      onClick={() => handleEdit(idx)}
                    >
                      <i className="bx bxs-pencil"></i>
                    </button>
                    <button
                      className="bg-[#ed3f41] text-white rounded p-2"
                      onClick={() => handleDelete(idx)}
                    >
                      <i className="bx bxs-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* //TODO: Integrate with the backend */}
          <Button
            variant="black"
            className="w-50 mt-8 flex items-center "
            onClick={async () => {
              // Validate that there are team members before proceeding
              if (teams.length === 0) {
                setValidationErrors({
                  general:
                    "Please add at least one team member before creating the team",
                });
                return;
              }

              // Clear any previous validation errors
              setValidationErrors({});

              try {
                console.log("Adding users to database...");
                const addedUsers: manageTeamUser[] = [];

                // Use a for loop to add each user to the database
                for (const teamMember of teams) {
                  const addedUser = await addUser({
                    email: teamMember.email,
                    role: teamMember.role,
                  });

                  // Store the returned user details
                  addedUsers.push(addedUser);

                  console.log(
                    `Added user: ${teamMember.email} with role: ${teamMember.role}`
                  );
                }

                // Update state with the created users
                setCreatedUsers(addedUsers);

                // Store the created users in local storage with user IDs
                const usersWithIds = addedUsers.map((user, index) => ({
                  ...user,
                  id: user.id || `user_${Date.now()}_${index}`, // Ensure each user has an ID
                  manageUserId: user.id || `user_${Date.now()}_${index}`, // Add manageUserId for team creation
                }));

                localStorage.setItem(
                  "createdUsers",
                  JSON.stringify(usersWithIds)
                );

                console.log(
                  `Successfully added ${teams.length} users to the database`
                );
                console.log(
                  "Created users stored in local storage:",
                  usersWithIds
                );

                alert(
                  `Successfully added ${teams.length} users to the database! Now you can create the team.`
                );

                // Open the team creation modal
                setIsModalOpen(true);

                // Clear the teams array after successful addition
                setTeams([]);
              } catch (error) {
                console.error("Error adding users to database:", error);
                setValidationErrors({
                  general: "Failed to add users to database. Please try again.",
                });
              }
            }}
          >
            <i className="bx bx-plus-circle text-2xl"></i>
            Create New Team
          </Button>
        </div>
      </div>
      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <h2 className="text-lg font-semibold mb-4">Create Team</h2>
            <label className="block text-md mb-1">Team Name*</label>
            <input
              type="text"
              className={`border rounded-lg p-2 w-[45%] mb-1 ${
                validationErrors.teamName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                // Clear validation error when user starts typing
                if (validationErrors.teamName) {
                  setValidationErrors({
                    ...validationErrors,
                    teamName: undefined,
                  });
                }
              }}
            />
            {validationErrors.teamName && (
              <p className="text-red-500 text-sm mb-4">
                {validationErrors.teamName}
              </p>
            )}
            {!validationErrors.teamName && <div className="mb-4" />}
            <label className="block text-md mb-1">Description*</label>
            <textarea
              className={`border rounded-lg p-2 w-full mb-1 ${
                validationErrors.teamDescription
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Description"
              value={teamDescription}
              onChange={(e) => {
                setTeamDescription(e.target.value);
                // Clear validation error when user starts typing
                if (validationErrors.teamDescription) {
                  setValidationErrors({
                    ...validationErrors,
                    teamDescription: undefined,
                  });
                }
              }}
              rows={3}
            />
            {validationErrors.teamDescription && (
              <p className="text-red-500 text-sm mb-4">
                {validationErrors.teamDescription}
              </p>
            )}
            {!validationErrors.teamDescription && <div className="mb-4" />}

            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-lg">Team Permissions</h3>
              {validationErrors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">
                    {validationErrors.general}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2 mb-4">
                {isLoadingPermissions
                  ? // Show skeleton loaders in modal while permissions are loading
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))
                  : permissions.map((perm: any, idx: number) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 text-md"
                      >
                        <input
                          type="checkbox"
                          checked={teamPermissions.includes(idx)}
                          onChange={() => handlePermissionChange(idx)}
                          className="accent-[#ed3f41]"
                        />
                        {perm.rule || perm}
                      </label>
                    ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-lg">Team Members</h3>
              <div className="max-h-40 overflow-y-auto">
                {createdUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    {getCreatedUserIds().length > 0
                      ? `${getCreatedUserIds().length} users were added in previous session`
                      : "No team members added yet"}
                  </p>
                ) : (
                  createdUsers.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded mb-2"
                    >
                      <div>
                        <span className="font-medium">{member.email}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          ({member.role})
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {getCreatedUserIds().length > 0 &&
                  createdUsers.length === 0 && (
                    <p className="text-blue-600 text-sm mt-2">
                      ✓ {getCreatedUserIds().length} users from previous session
                      will be included
                    </p>
                  )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-200 text-gray-700 rounded px-4 py-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#a02a2b] text-white rounded px-4 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleSaveTeam}
                disabled={
                  !teamName ||
                  !teamDescription ||
                  isLoadingPermissions ||
                  isCreatingTeam
                }
              >
                {isCreatingTeam && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isCreatingTeam ? "Creating..." : "Save Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTeam;
