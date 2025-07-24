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
      <PageNav position="HR Manager" title="All Users" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="mx-auto rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Participants</h2>

          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 p-2">Participant Name</th>
                <th className="border border-gray-300 p-2">Email Address</th>
                <th className="border border-gray-300 p-2">Designation</th>
                <th className="border border-gray-300 p-2">
                  Appraisee/Appraiser
                </th>
                <th className="border border-gray-300 p-2">Role</th>
                <th className="border border-gray-300 p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="border border-gray-300 p-2">John Doe</td>
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
                  <td className="border border-gray-300 p-2">HR Manager</td>
                  <td className="border border-gray-300 p-2">Appraiser</td>
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

          <div className="flex justify-end mt-6">
            <Button
              variant="save"
              className="bg-red-700 hover:bg-red-800 text-white rounded px-6 py-2"
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTeam;
