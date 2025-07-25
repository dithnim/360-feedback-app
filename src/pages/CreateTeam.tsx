import { useState } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";

// TODO: Integrate with the backend
const permissionsList = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
];

// const initialTeams = [
//   {
//     email: "example1@example.com",
//     role: "Overseeing Recruitment Process",
//     permissions: [0, 1, 2],
//   },
//   {
//     email: "example2@example.com",
//     role: "Overseeing Recruitment Process",
//     permissions: [0, 1],
//   },
//   {
//     email: "example3@example.com",
//     role: "Overseeing Recruitment Process",
//     permissions: [0, 1, 2, 3],
//   },
// ];

const CreateTeam = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [teams, setTeams] = useState<
    { email: string; role: string; permissions: number[] }[]
  >([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handlePermissionChange = (idx: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleAdd = () => {
    if (!email || !role) return;
    if (editIndex !== null) {
      const updated = [...teams];
      updated[editIndex] = { email, role, permissions: selectedPermissions };
      setTeams(updated);
      setEditIndex(null);
    } else {
      setTeams([...teams, { email, role, permissions: selectedPermissions }]);
    }
    setEmail("");
    setRole("");
    setSelectedPermissions([]);
  };

  const handleEdit = (idx: number) => {
    setEditIndex(idx);
    setEmail(teams[idx].email);
    setRole(teams[idx].role);
    setSelectedPermissions(teams[idx].permissions);
  };

  const handleDelete = (idx: number) => {
    setTeams(teams.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setEditIndex(null);
      setEmail("");
      setRole("");
      setSelectedPermissions([]);
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
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-lg">Permissions</h3>
              <div className="flex flex-col gap-2 mb-10 ">
                {permissionsList.map((perm: string, idx: number) => (
                  <label key={idx} className="flex items-center gap-2 text-md">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(idx)}
                      onChange={() => handlePermissionChange(idx)}
                      className="accent-[#ed3f41]"
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <button
              className="bg-[#ed3f41] text-white rounded px-6 py-2 font-semibold mt-2 cursor-pointer"
              onClick={handleAdd}
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
          <Button variant="black" className="w-50 mt-8 flex items-center ">
            <i className="bx bx-plus-circle text-2xl"></i>
            Create New Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
