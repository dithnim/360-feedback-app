import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface UserData {
  id: number;
  name: string;
  email: string;
  designation: string;
  type: "Appraisee" | "Appraiser";
  role: string;
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([
    {
      id: 1,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraisee",
      role: "Peer",
    },
    {
      id: 2,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 3,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "CEO",
      type: "Appraisee",
      role: "Boss",
    },
    {
      id: 4,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Subordinate",
    },
    {
      id: 5,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraiser",
      role: "Subordinate",
    },
    {
      id: 6,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 7,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 8,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraiser",
      role: "Subordinate",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "Appraisee" | "Appraiser" | "All"
  >("All");
  const [filterDesignation, setFilterDesignation] = useState("");

  const handlePrev = () => {
    navigate("/info"); // Assuming /info is the previous page
  };

  const handleNext = () => {
    // Implement next page navigation if needed
    navigate("/review");
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || user.type === filterType;
    const matchesDesignation =
      filterDesignation === "" || user.designation === filterDesignation;
    return matchesSearch && matchesType && matchesDesignation;
  });

  const uniqueDesignations = Array.from(
    new Set(users.map((user) => user.designation))
  );

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
        <div className="flex justify-between items-center mb-10">
          <label htmlFor="participants" className="text-3xl font-semibold">
            Participants
          </label>

          <div className="flex">
            <Button
              variant="previous"
              className="font-semibold text-xl flex items-center justify-center p-6 me-3"
              onClick={handlePrev}
            >
              previous
            </Button>
            <Button
              variant="next"
              className="font-semibold text-xl flex items-center justify-center p-6"
              onClick={handleNext}
            >
              next
            </Button>
          </div>
        </div>

        <div className="flex items-center mb-5">
          <div className="relative me-3 w-64">
            <input
              type="text"
              placeholder="Name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold ps-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
          </div>
          <Button
            variant="outline"
            className={`me-3 p-3 ${
              filterType === "Appraisee"
                ? "bg-green-500 text-white"
                : "border border-green-500 text-green-500"
            }`}
            onClick={() => setFilterType("Appraisee")}
          >
            Appraisee
          </Button>
          <Button
            variant="outline"
            className={`me-3 p-3 ${
              filterType === "Appraiser"
                ? "bg-red-500 text-white"
                : "border border-red-500 text-red-500"
            }`}
            onClick={() => setFilterType("Appraiser")}
          >
            Appraiser
          </Button>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-3.5 font-bold"
            value={filterDesignation}
            onChange={(e) => setFilterDesignation(e.target.value)}
          >
            <option value="">Filter by Designation</option>
            {uniqueDesignations.map((designation) => (
              <option key={designation} value={designation}>
                {designation}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-10">
          <table className="min-w-full border-1 border-gray-200 rounded-full ">
            <thead className="">
              <tr>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600"></th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Participant Name
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Email Address
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Designation
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Appraisee/Appraiser
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="py-5 px-4 border-b border-gray-200">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-red-600"
                    />
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.name}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.email}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.designation}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.type}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200">
                    <select
                      className="block w-full bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1.5"
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="Peer">Peer</option>
                      <option value="Manager">Manager</option>
                      <option value="Boss">Boss</option>
                      <option value="Subordinate">Subordinate</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="save" className="mt-10 p-6 text-lg cursor-pointer">
          Add
        </Button>
      </div>
    </div>
  );
};

export default Users;
