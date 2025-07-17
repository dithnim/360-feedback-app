import React, { useState } from "react";

const permissionsList = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo",
];

const initialTeams = [
  {
    email: "example1@example.com",
    role: "Overseeing Recruitment Process",
    permissions: [0, 1, 2],
  },
  {
    email: "example2@example.com",
    role: "Overseeing Recruitment Process",
    permissions: [0, 1],
  },
  {
    email: "example3@example.com",
    role: "Overseeing Recruitment Process",
    permissions: [0, 1, 2, 3],
  },
];

const CreateTeam = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [teams, setTeams] = useState(initialTeams);
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
    <div className="w-screen h-screen bg-[#222] flex items-center justify-center p-0 m-0">
      <div className="bg-white rounded-lg shadow-lg w-full h-full max-w-none p-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#ed3f41] w-8 h-8 flex items-center justify-center rounded">
                <span className="text-white text-xl font-bold">=</span>
              </div>
              <span className="text-[#ed3f41] text-xl font-semibold">
                Create New Team
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-gray-500 text-lg font-bold">&#9679;</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-semibold text-sm">
                  John Doe
                </span>
                <span className="text-gray-500 text-xs">HR Manager</span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Team Details</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Email Address*
                </label>
                <input
                  type="email"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Role*</label>
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
              <h3 className="font-semibold mb-2">Permissions</h3>
              <div className="flex flex-col gap-2">
                {permissionsList.map((perm, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(idx)}
                      onChange={() => handlePermissionChange(idx)}
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
        <div className="flex-1 overflow-auto mb-6">
          <table className="min-w-full bg-white">
            <tbody>
              {teams.map((team, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{team.email}</td>
                  <td className="py-2 px-4 text-gray-900">{team.role}</td>
                  <td className="py-2 px-4">
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
        </div>
        <button className="bg-black text-white rounded px-6 py-2 font-semibold flex items-center gap-2 w-full justify-center">
          <span className="text-lg">&#9679;</span> Create New Team
        </button>
      </div>
    </div>
  );
};

export default CreateTeam;
