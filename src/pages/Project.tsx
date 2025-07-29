import { Button } from "../components/ui/button";
import { apiPost } from "../lib/apiService";
import { useForm } from "react-hook-form";
import PageNav from "../components/ui/pageNav";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/loader";
import { getUserFromToken } from "../lib/util";

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
  appraisee: string;
  role: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  designation: string;
  type: "Appraisee" | "Appraiser";
  role: string;
}

interface CompanyFormData {
  companyName: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  file?: FileList;
}

// Helper function to format date as 2025-12-20T17:00:00Z
function toISODateWithTime(dateStr: string, hour = 17, minute = 0, second = 0) {
  const date = new Date(dateStr);
  date.setUTCHours(hour, minute, second, 0);
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

const Project = () => {
  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>();
  const navigate = useNavigate();
  const startDate = watch("startDate");
  const [pageCase, setPageCase] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [participants, setParticipants] = useState<
    {
      id: number;
      participantName: string;
      email: string;
      designation: string;
      appraisee: string;
      role: string;
    }[]
  >([]);
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo },
    setValue,
  } = useForm<ParticipantFormData>();
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    formState: { errors: errorsCompany },
    reset: resetCompany,
  } = useForm<CompanyFormData>();

  const [users, setUsers] = useState<UserData[]>([]);

  // Load participants from localStorage when pageCase changes to 4
  useEffect(() => {
    if (pageCase === 4) {
      const participantsFromStorage = localStorage.getItem("Participants");
      if (participantsFromStorage) {
        try {
          const parsedParticipants = JSON.parse(participantsFromStorage);
          const transformedUsers: UserData[] = parsedParticipants.map(
            (participant: any, index: number) => ({
              id: participant.id || index + 1,
              name: participant.participantName,
              email: participant.email,
              designation: participant.designation,
              type:
                (participant.appraisee as "Appraisee" | "Appraiser") ||
                "Appraisee",
              role: participant.role || "Peer",
            })
          );
          setUsers(transformedUsers);
        } catch (error) {
          console.error("Error parsing participants from localStorage:", error);
          // Reset to empty array on parse error
          setUsers([]);
        }
      } else {
        // Clear users if no participants in localStorage
        setUsers([]);
      }
    }
  }, [pageCase]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "Appraisee" | "Appraiser" | "All"
  >("All");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [userTypes, setUserTypes] = useState<Record<number, string>>({});
  const [userGroups, setUserGroups] = useState<
    {
      id: number;
      appraisee: UserData | null;
      appraisers: UserData[];
    }[]
  >([]);
  const [groupCounter, setGroupCounter] = useState(1);

  const handleRoleChange = useCallback((id: number, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
  }, []);

  const handleTypeChange = useCallback((id: number, newType: string) => {
    setUserTypes((prev) => ({ ...prev, [id]: newType }));
    // Auto-check the checkbox when a type is selected
    if (newType) {
      setSelectedUsers((prev) => new Set(prev).add(id));
    } else {
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, []);

  const handleCheckboxChange = useCallback((id: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => new Set(prev).add(id));
    } else {
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      // Clear the type when unchecked
      setUserTypes((prev) => ({ ...prev, [id]: "" }));
    }
  }, []);

  const handleAddUserGroup = useCallback(() => {
    const selectedUserIds = Array.from(selectedUsers);
    if (selectedUserIds.length === 0) return;

    const selectedUsersData = users.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    const appraisee =
      selectedUsersData.find((user) => userTypes[user.id] === "Appraisee") ||
      null;
    const appraisers = selectedUsersData.filter(
      (user) => userTypes[user.id] === "Appraiser"
    );

    if (!appraisee && appraisers.length === 0) return;

    const newGroup = {
      id: groupCounter,
      appraisee,
      appraisers,
    };

    setUserGroups((prev) => [...prev, newGroup]);
    setGroupCounter((prev) => prev + 1);

    // Reset selection state
    setSelectedUsers(new Set());
    setUserTypes({});
  }, [selectedUsers, users, userTypes, groupCounter]);

  const handleRemoveUserGroup = useCallback((groupId: number) => {
    setUserGroups((prev) => prev.filter((group) => group.id !== groupId));
  }, []);

  // Component to render user groups
  const UserGroupComponent = ({
    group,
    onRemove,
  }: {
    group: { id: number; appraisee: UserData | null; appraisers: UserData[] };
    onRemove: (id: number) => void;
  }) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-semibold text-gray-800">
          User Group #{group.id}
        </h4>
        <Button
          variant="delete"
          onClick={() => onRemove(group.id)}
          className="p-2 text-sm"
        >
          <i className="bx bxs-trash"></i>
        </Button>
      </div>

      {group.appraisee && (
        <div className="mb-3">
          <h5 className="text-md font-medium text-green-600 mb-2">
            Appraisee:
          </h5>
          <div className="pl-4 py-2 bg-green-50 rounded border-l-4 border-green-400">
            <p className="font-medium">{group.appraisee.name}</p>
            <p className="text-sm text-gray-600">{group.appraisee.email}</p>
            <p className="text-sm text-gray-600">
              {group.appraisee.designation}
            </p>
          </div>
        </div>
      )}

      {group.appraisers.length > 0 && (
        <div>
          <h5 className="text-md font-medium text-red-600 mb-2">
            Appraisers ({group.appraisers.length}):
          </h5>
          <div className="space-y-2">
            {group.appraisers.map((appraiser) => (
              <div
                key={appraiser.id}
                className="pl-4 py-2 bg-red-50 rounded border-l-4 border-red-400"
              >
                <p className="font-medium">{appraiser.name}</p>
                <p className="text-sm text-gray-600">{appraiser.email}</p>
                <p className="text-sm text-gray-600">{appraiser.designation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "All" || user.type === filterType;
      const matchesDesignation =
        filterDesignation === "" || user.designation === filterDesignation;
      return matchesSearch && matchesType && matchesDesignation;
    });
  }, [users, searchTerm, filterType, filterDesignation]);

  const uniqueDesignations = useMemo(
    () => Array.from(new Set(users.map((user) => user.designation))),
    [users]
  );

  const handleNext = useCallback(() => {
    setPageCase((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setPageCase((prev) => prev - 1);
  }, []);

  const handleFinish = useCallback(() => {
    localStorage.removeItem("Company");
    localStorage.removeItem("Project");
    navigate("/create");
  }, [navigate]);

  const handleEdit = useCallback(
    (index: number) => {
      const participant = participants[index];
      setEditIndex(index);
      setValue("participantName", participant.participantName);
      setValue("email", participant.email);
      setValue("designation", participant.designation);
    },
    [participants, setValue]
  );

  const handleDelete = useCallback(
    (index: number) => {
      setParticipants((prev) => prev.filter((_, i) => i !== index));
      if (editIndex === index) {
        setEditIndex(null);
        resetInfo({
          participantName: "",
          email: "",
          designation: "",
          appraisee: "",
          role: "",
        });
      }
    },
    [editIndex, resetInfo]
  );

  // Handler function for company creation, now has access to resetCompany
  const handlerCompanyCreation = async (data: CompanyFormData) => {
    const payload = {
      name: data.companyName,
      email: data.email,
      contactNumber: data.phone,
      contactPerson: data.contactPerson,
      logoImg: "https://example.com/images/acme-logo.png",
      createdAt: new Date().toISOString(),
    };
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || ""; // Get token from localStorage
      const response = await apiPost<any>(
        "/company",
        payload,
        token ? { Authorization: `Bearer ${token}` } : {}
      );
      console.log("RAW API response:", response);
      // Save the backend response data to localStorage if it contains an id
      if (response && response.id) {
        localStorage.setItem("Company", JSON.stringify(response));
        resetCompany();
      } else {
        console.error("Invalid response from API:", response);
      }
    } catch (error) {
      // Handle error (e.g., show error message)
      console.log("Error caught:", error);
      console.error("Error creating company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCompany = useCallback((data: CompanyFormData) => {
    handlerCompanyCreation(data);
  }, []);

  // TODO Handler function for project creation
  const handlerProjectCreation = async (data: ProjectFormData) => {
    setIsSubmitting(true); // Set loading state immediately
    try {
      const token = localStorage.getItem("token") || "";
      const user = getUserFromToken(token);
      const createdBy = user?.id || "";
      // Prepare payload for backend
      const startDateISO = toISODateWithTime(data.startDate);
      const endDateISO = toISODateWithTime(data.endDate);

      const companyStr = localStorage.getItem("Company");
      let companyId = "";
      if (companyStr) {
        try {
          const companyObj = JSON.parse(companyStr);
          companyId = companyObj.id || "";
        } catch (e) {
          companyId = "";
        }
      }

      const payload = {
        project_name: data.projectName,
        companyId: companyId,
        assignTeamId: "687e79c59eb4f512d6c66155",
        contactPerson: data.contactPerson,
        designation: data.designation,
        email: data.email,
        phoneNumber: data.phone,
        startDate: startDateISO,
        endDate: endDateISO,
        createdBy: createdBy,
      };
      // Post to backend
      try {
        const response = await apiPost<any>(
          "/project",
          payload,
          token ? { Authorization: `Bearer ${token}` } : {}
        );
        console.log("RAW API response:", response);
        localStorage.setItem("Project", JSON.stringify(response));
      } catch (error) {
        console.error("Error posting project data:", error);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsSubmitting(false); // Always reset loading state
    }
  };

  const onSubmitProject = useCallback((data: ProjectFormData) => {
    handlerProjectCreation(data);
  }, []);

  const handleParticipantSubmit = useCallback(
    (data: ParticipantFormData) => {
      if (editIndex !== null) {
        setParticipants((prev) =>
          prev.map((p, i) => (i === editIndex ? { ...p, ...data } : p))
        );
        setEditIndex(null);
      } else {
        setParticipants((prev) => [...prev, { ...data, id: Date.now() }]);
      }
      resetInfo({
        participantName: "",
        email: "",
        designation: "",
      });
    },
    [editIndex, resetInfo]
  );

  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const handleSearchChange = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 300),
    [debounce]
  );

  // Handler function for user creation
  // Batch handler for user creation
  const handlerUserCreation = async (userList: any[]) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token") || "";
      const company = localStorage.getItem("company") || "";
      // Get companyId from localStorage
      let companyId = "";
      const companyStr = localStorage.getItem("Company");
      if (companyStr) {
        try {
          const companyObj = JSON.parse(companyStr);
          companyId = companyObj.id || "";
        } catch (e) {
          // Fallback: try to parse company as JSON, otherwise use empty string
          try {
            const companyObj = JSON.parse(company);
            companyId = companyObj.id || "";
          } catch {
            companyId = "";
          }
        }
      }
      // Map users to backend DTO
      const payload = userList.map((data) => ({
        name: data.participantName || data.name,
        email: data.email,
        designation: data.designation,
        appraiser: data.appraisee === "Appraiser" ? true : false, // boolean: true if Appraiser, false otherwise
        role: data.role,
        companyId: companyId,
      }));
      const response = await apiPost<any>(
        "/company/user/set",
        payload,
        token ? { Authorization: `Bearer ${token}` } : {}
      );
      console.log("RAW API response:", response);
    } catch (error) {
      console.error("Error creating users:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove unused form state for user creation since it's not being used

  let pageContent;
  switch (pageCase) {
    case 1:
      pageContent = (
        <div>
          <PageNav position="CEO" title="Create New Company" />
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            {isSubmitting && (
              <div className="save-overley bg-black/30 w-full h-full absolute top-0 left-0 z-10 flex justify-center items-center flex-col">
                <Loader text="Saving..." />
              </div>
            )}
            <div className="flex justify-between">
              <label className="text-3xl font-semibold">Company Details</label>
              <Button
                variant="next"
                className="font-semibold text-xl flex items-center justify-center p-6"
                onClick={handleNext}
              >
                next
              </Button>
            </div>
            <form
              onSubmit={handleSubmitCompany(onSubmitCompany)}
              className="mt-10"
            >
              <div className="mb-5">
                <label
                  htmlFor="companyName"
                  className="block mb-2 text-lg text-gray-500"
                >
                  Company Name*
                </label>
                <input
                  type="text"
                  id="companyName"
                  className={`bg-gray-50 border ${
                    errorsCompany.companyName
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                  {...registerCompany("companyName", {
                    required: "Company name is required",
                    minLength: {
                      value: 2,
                      message: "Company name must be at least 2 characters",
                    },
                  })}
                />
                {errorsCompany.companyName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorsCompany.companyName.message}
                  </p>
                )}
              </div>
              <div className="mb-5">
                <label
                  htmlFor="description"
                  className="block mb-2 text-lg text-gray-500"
                >
                  Description*
                </label>
                <textarea
                  id="description"
                  className={`bg-gray-50 border ${
                    errorsCompany.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                  rows={7}
                  {...registerCompany("description", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters",
                    },
                  })}
                ></textarea>
                {errorsCompany.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorsCompany.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center mb-5">
                <div className="w-full me-10">
                  <label
                    htmlFor="contactPerson"
                    className="block mb-2 text-lg text-gray-500"
                  >
                    Contact Person*
                  </label>
                  <input
                    type="text"
                    id="contactPerson"
                    className={`bg-gray-50 border ${
                      errorsCompany.contactPerson
                        ? "border-red-500"
                        : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                    {...registerCompany("contactPerson", {
                      required: "Contact person is required",
                      pattern: {
                        value: /^[A-Za-z\s]+$/,
                        message:
                          "Contact person should only contain letters and spaces",
                      },
                    })}
                  />
                  {errorsCompany.contactPerson && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsCompany.contactPerson.message}
                    </p>
                  )}
                </div>
                <div className="w-full">
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
                      errorsCompany.email ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                    {...registerCompany("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errorsCompany.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsCompany.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-full me-10">
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-lg text-gray-500"
                  >
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className={`bg-gray-50 border ${
                      errorsCompany.phone ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                    onKeyPress={(e) => {
                      // Allow digits and '+' only as the first character
                      if (
                        !/[0-9]/.test(e.key) &&
                        !(e.key === "+" && e.currentTarget.value.length === 0)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={13}
                    {...registerCompany("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\+?[0-9]{10,12}$/,
                        message:
                          "Phone number must be 10-12 digits, optionally starting with +",
                      },
                    })}
                  />
                  {errorsCompany.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsCompany.phone.message}
                    </p>
                  )}
                </div>
                <div className="cursor-pointer">
                  <label
                    className="block mb-2 text-lg text-gray-500 cursor-pointer"
                    htmlFor="file_input"
                  >
                    Upload file
                  </label>
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-800 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 cursor-pointer"
                    id="user_avatar"
                    type="file"
                    {...registerCompany("file")}
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="save"
                className="mt-15 p-6 text-lg cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </form>
          </div>
        </div>
      );
      break;
    case 2:
      pageContent = (
        <div>
          <PageNav position="CEO" title="Participant Information" />
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            <div className="flex justify-between items-center mb-10">
              <label className="text-3xl font-semibold">User Details</label>
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
                  onClick={() => {
                    if (participants.length > 0) {
                      // Save to localStorage and proceed to next step
                      localStorage.setItem(
                        "Participants",
                        JSON.stringify(participants)
                      );
                      handleNext();
                    }
                  }}
                >
                  next
                </Button>
              </div>
            </div>
            <form
              onSubmit={handleSubmitInfo(handleParticipantSubmit)}
              className="mt-5"
            >
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
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
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
                      errorsInfo.email ? "border-red-500" : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                    {...registerInfo("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errorsInfo.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsInfo.email.message}
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
                      errorsInfo.designation
                        ? "border-red-500"
                        : "border-gray-300"
                    } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                    {...registerInfo("designation", {
                      required: "Designation is required",
                      minLength: {
                        value: 2,
                        message: "Designation must be at least 2 characters",
                      },
                    })}
                  />
                  {errorsInfo.designation && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsInfo.designation.message}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="submit"
                variant="save"
                className="mt-5 p-6 text-lg cursor-pointer"
              >
                {editIndex !== null ? "Update" : "Add"}
              </Button>
              {editIndex !== null && (
                <Button
                  type="button"
                  variant="previous"
                  className="mt-5 ms-3 p-6 text-lg cursor-pointer rounded-lg"
                  onClick={() => {
                    setEditIndex(null);
                    resetInfo({
                      participantName: "",
                      email: "",
                      designation: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </form>
          </div>
          <div className="h-[1px] bg-gray-300 w-[80%] mx-auto mt-15"></div>
          {participants.length > 0 && (
            <div className="mt-10 px-50 pb-10">
              <table className="min-w-full bg-white">
                <tbody>
                  {participants.map((participant, index) => (
                    <tr key={participant.id}>
                      <td className="py-2 px-4 text-gray-900">
                        {participant.participantName}
                      </td>
                      <td className="py-2 px-4 text-gray-900">
                        {participant.email}
                      </td>
                      <td className="py-2 px-4 text-gray-900">
                        {participant.designation}
                      </td>
                      <td className="py-2 px-4 text-gray-900">
                        {participant.appraisee}
                      </td>
                      <td className="py-2 px-4 text-gray-900">
                        {participant.role}
                      </td>
                      <td className="py-2 px-4">
                        <Button
                          variant="edit"
                          onClick={() => handleEdit(index)}
                          className="me-2 p-2"
                        >
                          <i className="bx bxs-pencil"></i>
                        </Button>
                        <Button
                          variant="delete"
                          onClick={() => handleDelete(index)}
                          className="me-2 p-2"
                        >
                          <i className="bx bxs-trash"></i>
                        </Button>
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
        <div className="min-h-screen bg-white">
          <PageNav position="CEO" title="Create New Project" />
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            {isSubmitting && (
              <div className="save-overley bg-black/30 w-full h-full absolute top-0 left-0 z-10 flex justify-center items-center flex-col">
                <Loader text="Saving..." />
              </div>
            )}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <label className="text-2xl sm:text-3xl font-semibold">
                Project Information
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
            <form
              onSubmit={handleSubmitProject(onSubmitProject)}
              className="mt-8 sm:mt-10"
            >
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
                  {...registerProject("projectName", {
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
                    {...registerProject("contactPerson", {
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
                    {...registerProject("designation", {
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
                    {...registerProject("email", {
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
                      // Allow digits, backspace, delete, and '+' only as the first character
                      if (
                        !/[0-9]/.test(e.key) &&
                        !(
                          e.key === "+" && e.currentTarget.value.length === 0
                        ) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={10}
                    {...registerProject("phone", {
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
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                  {...registerProject("assigningTeam", {
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
                    {...registerProject("startDate", {
                      required: "Start date is required",
                      validate: (value) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time for proper comparison
                        const selectedDate = new Date(value);
                        selectedDate.setHours(0, 0, 0, 0);
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
                    {...registerProject("endDate", {
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
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </form>
          </div>
        </div>
      );
      break;
    case 4:
      pageContent = (
        <div>
          <PageNav position="CEO" title="All Users" />
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            <div className="flex justify-between items-center mb-10">
              <label className="text-3xl font-semibold">Participants</label>
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
            <div className="flex items-center mb-5 justify-between">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 ps-10"
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                <div className="flex ms-3">
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
                </div>
              </div>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-3.5"
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

            {selectedUsers.size > 0 && (
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedUsers.size}</strong> user(s) selected. Choose
                  their roles as Appraisee or Appraiser, then click "Add
                  Selected Users".
                </p>
              </div>
            )}
            <div className="mt-10 border-1 border-gray-300 rounded-xl overflow-hidden">
              <table className="min-w-full">
                <thead className="user-table">
                  <tr>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600"></th>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600">
                      Participant Name
                    </th>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600">
                      Email Address
                    </th>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600">
                      Designation
                    </th>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600">
                      Appraisee/Appraiser
                    </th>
                    <th className="py-5 px-4 border-b border-gray-300 text-left text-gray-600">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-5 px-4 border-b border-gray-300 pt-6">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 accent-[#ee3e41]"
                          checked={selectedUsers.has(user.id)}
                          disabled={!userTypes[user.id]}
                          onChange={(e) =>
                            handleCheckboxChange(user.id, e.target.checked)
                          }
                        />
                      </td>
                      <td className="py-5 px-4 border-b border-gray-300 text-gray-900">
                        {user.name}
                      </td>
                      <td className="py-5 px-4 border-b border-gray-300 text-gray-900">
                        {user.email}
                      </td>
                      <td className="py-5 px-4 border-b border-gray-300 text-gray-900">
                        {user.designation}
                      </td>
                      <td className="py-5 px-4 border-b border-gray-300 text-gray-900">
                        <select
                          name="appraiser/appraisee"
                          id="app"
                          className="block w-full bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1.5"
                          value={userTypes[user.id] || ""}
                          onChange={(e) =>
                            handleTypeChange(user.id, e.target.value)
                          }
                        >
                          <option value="">Select Appraiser/Appraisee</option>
                          <option value="Appraisee">Appraisee</option>
                          <option value="Appraiser">Appraiser</option>
                        </select>
                      </td>
                      <td className="py-5 px-4 border-b border-gray-300">
                        <select
                          className="block w-full bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 px-2.5 py-1.5"
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                        >
                          <option value="">Select Role</option>
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
            <Button
              variant="save"
              className={`mt-10 p-6 text-lg  ${selectedUsers.size === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={handleAddUserGroup}
              disabled={selectedUsers.size === 0}
            >
              Add Selected Users
            </Button>
            <div className="review-section mt-8">
              {userGroups.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Selected User Groups
                  </h3>
                  <div className="space-y-4">
                    {userGroups.map((group) => (
                      <UserGroupComponent
                        key={group.id}
                        group={group}
                        onRemove={handleRemoveUserGroup}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
      break;
    case 5:
      pageContent = (
        <div>
          <PageNav position="CEO" title="Review Users" />
          <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
            <div className="flex justify-between items-center mb-10">
              <label className="text-3xl font-semibold">
                Review User Groups
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
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      // Create user data from groups for API submission
                      const allUsersData: any[] = [];
                      userGroups.forEach((group) => {
                        if (group.appraisee) {
                          allUsersData.push({
                            participantName: group.appraisee.name,
                            name: group.appraisee.name,
                            email: group.appraisee.email,
                            designation: group.appraisee.designation,
                            appraisee: "Appraisee",
                            role: group.appraisee.role,
                          });
                        }
                        group.appraisers.forEach((appraiser) => {
                          allUsersData.push({
                            participantName: appraiser.name,
                            name: appraiser.name,
                            email: appraiser.email,
                            designation: appraiser.designation,
                            appraisee: "Appraiser",
                            role: appraiser.role,
                          });
                        });
                      });

                      if (allUsersData.length > 0) {
                        await handlerUserCreation(allUsersData);
                      }
                    } catch (error) {
                      console.error("Error creating users:", error);
                    } finally {
                      setIsSubmitting(false);
                      handleFinish();
                    }
                  }}
                  disabled={userGroups.length === 0}
                >
                  Finish
                </Button>
              </div>
            </div>

            {userGroups.length === 0 ? (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No User Groups Created
                </h3>
                <p className="text-gray-500 mb-6">
                  Go back to the previous step to create feedback groups.
                </p>
                <Button
                  variant="previous"
                  onClick={handlePrev}
                  className="px-4 py-2"
                >
                  Go Back to Create Groups
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="text-blue-800 font-medium">
                        Review Summary
                      </h4>
                      <p className="text-blue-700 text-sm">
                        {userGroups.length} feedback group
                        {userGroups.length !== 1 ? "s" : ""} created with{" "}
                        {userGroups.reduce(
                          (total, group) =>
                            total +
                            (group.appraisee ? 1 : 0) +
                            group.appraisers.length,
                          0
                        )}{" "}
                        total participants
                      </p>
                    </div>
                  </div>
                </div>

                {userGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Feedback Group {group.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.appraisee ? 1 : 0} Appraisee •{" "}
                        {group.appraisers.length} Appraiser
                        {group.appraisers.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="p-6">
                      {group.appraisee && (
                        <div className="mb-6">
                          <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <h4 className="text-md font-medium text-green-700">
                              Appraisee
                            </h4>
                          </div>
                          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-lg">
                                  {group.appraisee.name}
                                </h5>
                                <p className="text-gray-600 mt-1">
                                  {group.appraisee.email}
                                </p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-500 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2h2a2 2 0 002-2V6z"
                                      />
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                      {group.appraisee.designation}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 text-gray-500 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span className="text-sm text-gray-600">
                                      {group.appraisee.role}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Being Evaluated
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {group.appraisers.length > 0 && (
                        <div>
                          <div className="flex items-center mb-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <h4 className="text-md font-medium text-red-700">
                              Appraisers ({group.appraisers.length})
                            </h4>
                          </div>
                          <div className="grid gap-3">
                            {group.appraisers.map(
                              (appraiser, appraiserIndex) => (
                                <div
                                  key={appraiser.id}
                                  className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900">
                                        {appraiser.name}
                                      </h5>
                                      <p className="text-gray-600 text-sm mt-1">
                                        {appraiser.email}
                                      </p>
                                      <div className="flex items-center mt-2 space-x-4">
                                        <div className="flex items-center">
                                          <svg
                                            className="w-4 h-4 text-gray-500 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2h2a2 2 0 002-2V6z"
                                            />
                                          </svg>
                                          <span className="text-sm text-gray-600">
                                            {appraiser.designation}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <svg
                                            className="w-4 h-4 text-gray-500 mr-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                          </svg>
                                          <span className="text-sm text-gray-600">
                                            {appraiser.role}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Evaluator #{appraiserIndex + 1}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Final Review Checklist
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {userGroups.length} feedback group
                        {userGroups.length !== 1 ? "s have" : " has"} been
                        configured
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        All participants have been assigned appropriate roles
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">
                        Ready to create 360-degree feedback project
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
