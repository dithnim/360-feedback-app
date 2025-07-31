import { useState, useEffect } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/skeleton";
import { useUser } from "../context/UserContext";
import { createTeam, getTeamRules } from "../lib/teamService";
import type {
  CreateTeamRequest,
  CreateTeamResponse,
  TeamValidationError,
} from "../lib/teamService";

const CreateTeam = () => {
  const { user } = useUser();
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [validationErrors, setValidationErrors] = useState<TeamValidationError>(
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

  const handlePermissionChange = (idx: number) => {
    setTeamPermissions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleAdd = () => {
    if (!email || !role) return;
    if (editIndex !== null) {
      const updated = [...teams];
      updated[editIndex] = {
        email,
        role,
      };
      setTeams(updated);
      setEditIndex(null);
    } else {
      setTeams([
        ...teams,
        {
          email,
          role,
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
    if (!teamName || !teamDescription) return;

    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    setIsCreatingTeam(true);
    setValidationErrors({});

    try {
      // Create the team using the API specification
      const teamData: CreateTeamRequest = {
        teamName: teamName,
        description: teamDescription,
        createdUserId: user.id,
      };

      const response: CreateTeamResponse = await createTeam(teamData);
      localStorage.setItem("team", JSON.stringify(response));
      console.log("Team created successfully:", response);

      // Reset form on success
      setTeamName("");
      setTeamDescription("");
      setTeamPermissions([]);
      setIsModalOpen(false);

      // You can add success notification here
      alert("Team created successfully!");
    } catch (error: any) {
      console.error("Error creating team:", error);

      // Handle validation errors from the API
      if (error.message && error.message.includes("400")) {
        setValidationErrors({ teamName: "Team name is required" });
      } else {
        // Handle other errors
        alert("Failed to create team. Please try again.");
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
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-md mb-1">Role*</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="Overseeing Recruitment Process"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>
            </div>
            <button
              className="bg-[#ed3f41] text-white rounded px-6 py-2 font-semibold mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAdd}
              disabled={!email || !role}
            >
              {editIndex !== null ? "Update" : "Add"}
            </button>
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
            onClick={() => setIsModalOpen(true)}
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
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              placeholder="Description"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              rows={3}
            />

            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-lg">Team Permissions</h3>
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
                {teams.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No team members added yet
                  </p>
                ) : (
                  teams.map((member, idx) => (
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
