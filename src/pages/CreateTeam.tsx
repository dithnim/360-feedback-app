import { useState } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";

const CreateTeam = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<
    {
      email: string;
      role: string;
    }[]
  >([]);

  const handleAddMember = () => {
    if (!email.trim() || !role.trim()) return;

    setTeamMembers([...teamMembers, { email, role }]);
    setEmail("");
    setRole("");
  };

  const handleDeleteMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleEditMember = (
    index: number,
    updatedEmail: string,
    updatedRole: string
  ) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { email: updatedEmail, role: updatedRole };
    setTeamMembers(updatedMembers);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav name="John Doe" position="HR Manager" title="Create New Team" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="mx-auto rounded-lg">
          <div className="grid grid-cols-2 gap-16 mb-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Role*
              </label>
              <input
                type="text"
                id="role"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="permissions"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`permission-${index}`}
                    className="mr-2"
                    onChange={(e) => {
                      const permission = `Permission ${index + 1}`;
                      if (e.target.checked) {
                        setPermissions([...permissions, permission]);
                      } else {
                        setPermissions(
                          permissions.filter((p) => p !== permission)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`permission-${index}`}
                    className="text-gray-700"
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Button
              variant="save"
              onClick={handleAddMember}
              className="bg-red-700 hover:bg-red-800 text-white rounded px-6 py-2"
            >
              Add
            </Button>
          </div>

          <div className="mt-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-2">Email</th>
                  <th className="border border-gray-300 p-2">Role</th>
                  <th className="border border-gray-300 p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member, index) => (
                  <tr key={index} className="border border-gray-300">
                    <td className="border border-gray-300 p-2">
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) =>
                          handleEditMember(index, e.target.value, member.role)
                        }
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-2">
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) =>
                          handleEditMember(index, member.email, e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-2 w-full"
                      />
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-1"
                        onClick={() => handleDeleteMember(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              variant="save"
              className="bg-red-700 hover:bg-red-800 text-white rounded px-6 py-2"
            >
              Create New Team
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTeam;
