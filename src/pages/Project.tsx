import { Button } from "../components/ui/Button";
import { useForm } from "react-hook-form";
import PageNav from "../components/ui/pageNav";
import { useState } from "react";

interface ProjectFormData {
  projectName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  assigningTeam: string;
  startDate: string;
  endDate: string;
}

interface ParticipantFormData {
  participantName: string;
  email: string;
  designation: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  designation: string;
  type: "Appraisee" | "Appraiser";
  role: string;
}

const Project = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>();

  const startDate = watch("startDate");
  const [pageCase, setPageCase] = useState(1);

  //!Info states
  const [participants, setParticipants] = useState<
    { participantName: string; email: string; designation: string }[]
  >([]);
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo },
  } = useForm<ParticipantFormData>();

  //!User states
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

  const handleNext = () => {
    setPageCase((prev) => prev + 1);
  };

  const handlePrev = () => {
    setPageCase((prev) => prev - 1);
  };

  const handleEdit = (index: number) => {
    // Implement edit logic here, e.g., populate form with data for editing
    console.log("Edit participant at index:", index);
  };

  const handleDelete = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProjectFormData) => {
    console.log(data);
    // Handle form submission here
  };

  let pageContent;
  switch (pageCase) {
    case 1:
      pageContent = (
        <div className="min-h-screen bg-white">
          <div className="">
            <PageNav
              name="Jese Leos"
              position="CEO"
              title="Create New Project"
            />
          </div>
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <label
                htmlFor="project details"
                className="text-2xl sm:text-3xl font-semibold"
              >
                Project Information
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  variant="previous"
                  className="font-semibold text-base sm:text-xl flex items-center justify-center px-4 py-3 sm:p-6"
                  onClick={handlePrev}
                >
                  previous
                </Button>
                <Button
                  variant="next"
                  className="font-semibold text-base sm:text-xl flex items-center justify-center px-4 py-3 sm:p-6"
                  onClick={handleNext}
                >
                  next
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 sm:mt-10">
              <div className="mb-5">
                <label
                  htmlFor="projectName"
                  className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                >
                  Project Name*
                </label>
                <input
                  type="text"
                  id="projectName"
                  placeholder="Project Name"
                  className={`bg-gray-50 border ${
                    errors.projectName ? "border-red-500" : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                  {...register("projectName", {
                    required: "Project name is required",
                    minLength: {
                      value: 2,
                      message: "Project name must be at least 2 characters",
                    },
                  })}
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-0 md:gap-8 mb-5">
                <div className="w-full md:me-10 mb-5 md:mb-0">
                  <label
                    htmlFor="contactPerson"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                  >
                    Contact Person*
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    placeholder="Contact Person"
                    className={`bg-gray-50 border ${
                      errors.contactPerson
                        ? "border-red-500"
                        : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    {...register("contactPerson", {
                      required: "Contact person is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message:
                          "Contact person should only contain letters and spaces",
                      },
                    })}
                  />
                  {errors.contactPerson && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contactPerson.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="designation"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                  >
                    Designation*
                  </label>
                  <input
                    type="text"
                    id="designation"
                    placeholder="Designation"
                    className={`bg-gray-50 border ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    {...register("designation", {
                      required: "Designation is required",
                      minLength: {
                        value: 2,
                        message: "Designation must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.designation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-0 md:gap-8 mb-5">
                <div className="w-full md:me-10 mb-5 md:mb-0">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                  >
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Email Address"
                    className={`bg-gray-50 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Phone Number"
                    className={`bg-gray-50 border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Phone number must be 10 digits",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-5 w-full md:w-1/2 md:pe-9">
                <label
                  htmlFor="assigningTeam"
                  className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                >
                  Assigning Team*
                </label>
                <select
                  id="assigningTeam"
                  className={`bg-gray-50 border ${
                    errors.assigningTeam ? "border-red-500" : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                  {...register("assigningTeam", {
                    required: "Assigning team is required",
                  })}
                >
                  <option value="">Assigning Team</option>
                  <option value="Maliban 360 Project 1">
                    Maliban 360 Project 1
                  </option>
                  <option value="Team A">Team A</option>
                  <option value="Team B">Team B</option>
                </select>
                {errors.assigningTeam && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.assigningTeam.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-0 md:gap-8 mb-5">
                <div className="w-full md:me-10 mb-5 md:mb-0">
                  <label
                    htmlFor="startDate"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                    
                  >
                    Project Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    placeholder="Project Start Date"
                    className={`bg-gray-50 border ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    {...register("startDate", {
                      required: "Start date is required",
                      validate: (value) => {
                        const today = new Date();
                        const selectedDate = new Date(value);
                        return (
                          selectedDate >= today ||
                          "Start date cannot be in the past"
                        );
                      },
                    })}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="endDate"
                    className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                  >
                    End Date*
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    placeholder="End Date"
                    className={`bg-gray-50 border ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
                    {...register("endDate", {
                      required: "End date is required",
                      validate: (value) => {
                        if (!startDate) return true;
                        const start = new Date(startDate);
                        const end = new Date(value);
                        return (
                          end > start || "End date must be after start date"
                        );
                      },
                    })}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="save"
                className="mt-8 sm:mt-12 px-4 py-3 sm:p-6 text-base sm:text-lg cursor-pointer w-full md:w-auto"
              >
                Save
              </Button>
            </form>
          </div>
        </div>
      );
      break;
    case 2:
      pageContent = (
        <div>
          <div>
            <PageNav
              name="Jese Leos"
              position="CEO"
              title="Participant Information"
            />
          </div>
          <div className="h-full px-50 pt-10">
            <div className="flex justify-between items-center mb-10">
              <label htmlFor="User details" className="text-3xl font-semibold">
                User Details
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

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
              <div className="mb-5">
                <label
                  htmlFor="participantName"
                  className="block mb-2 text-lg text-gray-500"
                >
                  Participant Name*
                </label>
                <input
                  type="text"
                  id="participantName"
                  className={`bg-gray-50 border ${
                    errorsInfo.participantName
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                  {...registerInfo("participantName", {
                    required: "Participant name is required",
                    minLength: {
                      value: 2,
                      message: "Participant name must be at least 2 characters",
                    },
                  })}
                />
                {errorsInfo.participantName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorsInfo.participantName.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-5">
                <div className="w-full me-10">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-lg text-gray-500"
                  >
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={`bg-gray-50 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="designation"
                    className="block mb-2 text-lg text-gray-500"
                  >
                    Designation*
                  </label>
                  <input
                    type="text"
                    id="designation"
                    className={`bg-gray-50 border ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                    {...register("designation", {
                      required: "Designation is required",
                      minLength: {
                        value: 2,
                        message: "Designation must be at least 2 characters",
                      },
                    })}
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.designation.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="save"
                className="mt-5 p-6 text-lg cursor-pointer"
                onClick={handleSubmitInfo((data) => {
                  setParticipants([...participants, data]);
                  resetInfo();
                })}
              >
                Add
              </Button>
            </form>
          </div>
          {/* User Preview Section at the very bottom */}
          {participants.length > 0 && (
            <div className="mt-10 px-50 pb-10">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                      Participant Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                      Email Address
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                      Designation
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                        {participant.participantName}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                        {participant.email}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                        {participant.designation}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-500 hover:text-blue-700 me-2"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
      break;
    case 3:
      pageContent = (
        <div>
          <div>
            <PageNav
              name="Jese Leos"
              position="CEO"
              title="All Users"
            />
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
                variant="success"
                className="me-3 h-13"
                onClick={() => setFilterType("Appraisee")}
              >
                Appraisee
              </Button>
              <Button
                variant="save"
                onClick={() => setFilterType("Appraiser")}
                className="me-3 h-13"
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
      break;
    default:
      pageContent = null;
  }
  return pageContent;
};

export default Project;
