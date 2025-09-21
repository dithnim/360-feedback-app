import React from "react";
import { Button } from "../components/ui/Button";
import {
  apiPost,
  createCompanyUsers,
  createSurveyUsers,
} from "../lib/apiService";
import type { CreateUserData } from "../lib/apiService";
import { useForm } from "react-hook-form";
import PageNav from "../components/ui/pageNav";
import { useState, useMemo, useCallback, useEffect } from "react";
import Loader from "../components/ui/loader";
import { getUserFromToken } from "../lib/util";
import ImageUpload from "../components/ui/ImageUpload";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllTeams } from "@/lib/teamService";

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

interface CompanyUserFormData {
  name: string;
  email: string;
  designation: string;
}

interface CompanyUserWithId extends CompanyUserFormData {
  id: number; // Temporary frontend ID for UI - backend generates the real ID
  companyId: string;
}

//TODO
interface UserData {
  id: number;
  name: string;
  email: string;
  designation: string;
  type?: "Appraisee" | "Appraiser";
  role?: string;
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

// LocalStorage keys centralised
const LS_KEYS = {
  company: "Company",
  companyForm: "CompanyFormData",
  companyUsers: "CompanyUsers", // canonical key
  surveyUsers: "SurveyUsers",
  project: "Project",
} as const;

// Safe JSON parse helper
function safeParse<T = any>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

const Project = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get initial page case from location state, default to 1
  const initialCase = location.state?.initialCase || 1;

  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    formState: { errors },
    watch,
    reset: resetProject,
  } = useForm<ProjectFormData>();
  const [pageCase, setPageCase] = useState(initialCase);
  const startDate = pageCase === 3 ? watch("startDate") : undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Track submission state for forms / async ops
  const [userCreationError, setUserCreationError] = useState<string>("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  //!Page data states
  const [teams, setTeams] = useState<any[]>([]);

  //!Team data fetcher
  const fetchTeamsData = async () => {
    const fetchTeams = await getAllTeams();
    setTeams(fetchTeams);
  };

  //!Company User Handler
  const [companyUsers, setCompanyUsers] = useState<CompanyUserWithId[]>([]);
  const {
    register: registerInfo,
    handleSubmit: handleSubmitInfo,
    reset: resetInfo,
    formState: { errors: errorsInfo },
    setValue,
  } = useForm<CompanyUserFormData>();
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const {
    register: registerCompany,
    handleSubmit: handleSubmitCompany,
    formState: { errors: errorsCompany },
    setValue: setCompanyValue,
    watch: watchCompany,
    reset: resetCompany,
  } = useForm<CompanyFormData>();

  const [users, setUsers] = useState<UserData[]>([]);

  // Page 1: load company data + form data
  useEffect(() => {
    if (pageCase !== 1) return;
    const companyRaw = localStorage.getItem(LS_KEYS.company);
    const company = safeParse<any>(companyRaw, null);
    if (company) {
      if (company.name) setCompanyValue("companyName", company.name);
      if (company.contactPerson)
        setCompanyValue("contactPerson", company.contactPerson);
      if (company.email) setCompanyValue("email", company.email);
      if (company.contactNumber)
        setCompanyValue("phone", company.contactNumber);
    }

    const companyFormRaw = localStorage.getItem(LS_KEYS.companyForm);
    const companyForm = safeParse<any>(companyFormRaw, null);
    if (companyForm) {
      if (!company) {
        if (companyForm.companyName)
          setCompanyValue("companyName", companyForm.companyName);
        if (companyForm.contactPerson)
          setCompanyValue("contactPerson", companyForm.contactPerson);
        if (companyForm.email) setCompanyValue("email", companyForm.email);
        if (companyForm.phone) setCompanyValue("phone", companyForm.phone);
      }
      if (companyForm.description)
        setCompanyValue("description", companyForm.description);
    }
  }, [pageCase, setCompanyValue]);

  // Page 2: load existing company users (fallback to legacy lowercase key once)
  useEffect(() => {
    if (pageCase !== 2) return;
    const raw =
      localStorage.getItem(LS_KEYS.companyUsers) ||
      localStorage.getItem("companyUsers"); // legacy fallback
    const savedParticipants = safeParse<any[]>(raw, []);
    // If legacy key was used, migrate to canonical key
    if (raw && !localStorage.getItem(LS_KEYS.companyUsers)) {
      localStorage.setItem(LS_KEYS.companyUsers, raw);
      localStorage.removeItem("companyUsers");
    }
    if (savedParticipants.length) setCompanyUsers(savedParticipants);
    setUserCreationError("");
  }, [pageCase]);

  // Page 3: load teams (and silently validate company data presence)
  useEffect(() => {
    if (pageCase !== 3) return;
    fetchTeamsData();
    const savedCompanyData = localStorage.getItem(LS_KEYS.company);
    if (savedCompanyData) {
      const companyRaw = localStorage.getItem(LS_KEYS.company);
      try {
        JSON.parse(companyRaw || "null");
      } catch (error) {
        console.error("Error parsing saved company data:", error);
      }
    }
  }, [pageCase]);

  // Page 4: transform company users into role assignment list and load existing user groups
  useEffect(() => {
    if (pageCase !== 4) return;

    // Load company users
    const storedUsers = safeParse<any[]>(
      localStorage.getItem(LS_KEYS.companyUsers),
      []
    );
    const transformedUsers: UserData[] = storedUsers.map(
      (participant: any) => ({
        id: participant.id || Date.now() + Math.random(), // Use actual company user ID
        name: participant.name,
        email: participant.email,
        designation: participant.designation,
      })
    );
    setUsers(transformedUsers);

    // Load existing user groups from localStorage
    const existingGroups = safeParse<any[]>(
      localStorage.getItem(LS_KEYS.surveyUsers),
      []
    );

    if (existingGroups.length > 0) {
      setUserGroups(existingGroups);
      // Group counter is just for tracking, no need to set from existing groups since we use generated IDs
      setGroupCounter(existingGroups.length + 1);
    }
  }, [pageCase]);

  // Update users state whenever companyUsers is updated (to reflect server-generated IDs)
  useEffect(() => {
    if (pageCase === 4 && companyUsers.length > 0) {
      const transformedUsers: UserData[] = companyUsers.map(
        (participant: any) => ({
          id: participant.id || Date.now() + Math.random(), // Use actual company user ID
          name: participant.name,
          email: participant.email,
          designation: participant.designation,
        })
      );
      setUsers(transformedUsers);
    }
  }, [companyUsers, pageCase]);

  // Watch company form values to save to localStorage only when on company page
  const watchedCompanyValues = pageCase === 1 ? watchCompany() : {};

  // Save company form data to localStorage whenever form values change
  useEffect(() => {
    if (
      pageCase === 1 &&
      watchedCompanyValues &&
      Object.keys(watchedCompanyValues).length > 0
    ) {
      const hasNonEmptyValue = Object.values(watchedCompanyValues).some(
        (value) => value && value.toString().trim() !== ""
      );
      if (hasNonEmptyValue) {
        localStorage.setItem(
          "CompanyFormData",
          JSON.stringify(watchedCompanyValues)
        );
      }
    }
  }, [watchedCompanyValues, pageCase]);

  // Save companyUsers array to localStorage whenever it changes
  useEffect(() => {
    if (companyUsers.length > 0) {
      localStorage.setItem(LS_KEYS.companyUsers, JSON.stringify(companyUsers));
    }
  }, [companyUsers]);

  // Reset forms when switching pages to prevent cross-contamination
  useEffect(() => {
    // Reset company user form when not on company user page
    if (pageCase !== 2 && editIndex === null) {
      resetInfo();
    }
    // Reset project form when not on project page
    if (pageCase !== 3) {
      resetProject();
    }
  }, [pageCase, editIndex, resetInfo, resetProject]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [userTypes, setUserTypes] = useState<Record<number, string>>({});
  const [userGroups, setUserGroups] = useState<
    {
      id: string;
      appraisee: UserData | null;
      appraisers: UserData[];
    }[]
  >([]);
  const [groupCounter, setGroupCounter] = useState(1);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Helper function to generate unique group ID
  const generateGroupId = useCallback(() => {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

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
      id: generateGroupId(),
      appraisee: appraisee
        ? { ...appraisee, role: appraisee.role || "" }
        : null,
      appraisers: appraisers.map((appraiser) => ({
        ...appraiser,
        role: appraiser.role || "",
      })),
    };

    // Update state with the new group
    const updatedGroups = [...userGroups, newGroup];
    setUserGroups(updatedGroups);
    setGroupCounter((prev) => prev + 1); // Keep for UI tracking

    // Immediately save to localStorage
    localStorage.setItem(LS_KEYS.surveyUsers, JSON.stringify(updatedGroups));

    // Reset selection state
    setSelectedUsers(new Set());
    setUserTypes({});
  }, [selectedUsers, users, userTypes, groupCounter, userGroups]);

  const handleRemoveUserGroup = useCallback(
    (groupId: string) => {
      const updatedGroups = userGroups.filter((group) => group.id !== groupId);
      setUserGroups(updatedGroups);

      // Immediately save to localStorage
      localStorage.setItem(LS_KEYS.surveyUsers, JSON.stringify(updatedGroups));
    },
    [userGroups]
  );

  const handleEditUserGroup = useCallback(
    (groupId: string) => {
      const groupToEdit = userGroups.find((group) => group.id === groupId);
      if (!groupToEdit) return;

      // Set editing mode
      setEditingGroupId(groupId);

      // Clear current selections
      setSelectedUsers(new Set());
      setUserTypes({});

      // Populate form with existing group data by matching emails instead of IDs
      const groupUserIds = new Set<number>();
      const groupUserTypes: Record<number, string> = {};

      if (groupToEdit.appraisee) {
        // Find current user by email
        const currentAppraisee = users.find(
          (user) => user.email === groupToEdit.appraisee?.email
        );
        if (currentAppraisee) {
          groupUserIds.add(currentAppraisee.id);
          groupUserTypes[currentAppraisee.id] = "Appraisee";
        }
      }

      groupToEdit.appraisers.forEach((appraiser) => {
        // Find current user by email
        const currentAppraiser = users.find(
          (user) => user.email === appraiser.email
        );
        if (currentAppraiser) {
          groupUserIds.add(currentAppraiser.id);
          groupUserTypes[currentAppraiser.id] = "Appraiser";
        }
      });

      setSelectedUsers(groupUserIds);
      setUserTypes(groupUserTypes);

      // Update users state to reflect the roles from the editing group
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // Check if this user is the appraisee by email
          if (
            groupToEdit.appraisee &&
            user.email === groupToEdit.appraisee.email
          ) {
            return { ...user, role: groupToEdit.appraisee.role || "" };
          }

          // Check if this user is one of the appraisers by email
          const appraiser = groupToEdit.appraisers.find(
            (app) => app.email === user.email
          );
          if (appraiser) {
            return { ...user, role: appraiser.role || "" };
          }

          // For users not in the editing group, keep their current role
          return user;
        })
      );
    },
    [userGroups, users]
  );

  const handleUpdateUserGroup = useCallback(() => {
    if (editingGroupId === null) return;

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

    // Update the existing group with current roles from users state
    const updatedGroups = userGroups.map((group) =>
      group.id === editingGroupId
        ? {
            ...group,
            appraisee: appraisee
              ? { ...appraisee, role: appraisee.role || "" }
              : null,
            appraisers: appraisers.map((appraiser) => ({
              ...appraiser,
              role: appraiser.role || "",
            })),
          }
        : group
    );

    setUserGroups(updatedGroups);

    // Immediately save to localStorage
    localStorage.setItem(LS_KEYS.surveyUsers, JSON.stringify(updatedGroups));

    // Reset editing state and selections
    setEditingGroupId(null);
    setSelectedUsers(new Set());
    setUserTypes({});
  }, [editingGroupId, selectedUsers, users, userTypes, userGroups]);

  const handleCancelEdit = useCallback(() => {
    setEditingGroupId(null);
    setSelectedUsers(new Set());
    setUserTypes({});
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDesignation =
        filterDesignation === "" || user.designation === filterDesignation;
      return matchesSearch && matchesDesignation;
    });
  }, [users, searchTerm, filterDesignation]);

  const uniqueDesignations = useMemo(
    () => Array.from(new Set(users.map((user) => user.designation))),
    [users]
  );

  const handleNext = useCallback(() => {
    setPageCase((prev: number) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setPageCase((prev: number) => prev - 1);
  }, []);

  const handleEdit = useCallback(
    (index: number) => {
      const companyUser = companyUsers[index];
      setEditIndex(index);
      setValue("name", companyUser.name);
      setValue("email", companyUser.email);
      setValue("designation", companyUser.designation);
    },
    [companyUsers, setValue]
  );

  // Function to create users in the backend
  const createUsers = useCallback(
    async (companyUsersData: CompanyUserFormData[]) => {
      setUserCreationError("");
      try {
        const companyStr = localStorage.getItem("Company");
        let companyId = "";
        if (companyStr) {
          try {
            const companyObj = JSON.parse(companyStr);
            companyId = companyObj.id || "";
          } catch (e) {
            console.error("Error parsing company data:", e);
            setUserCreationError("Failed to get company information");
            return false;
          }
        }

        if (!companyId) {
          console.error("No company ID found");
          setUserCreationError("Company must be created before adding users");
          return false;
        }

        // Validate company users data
        if (!companyUsersData || companyUsersData.length === 0) {
          console.error("No company users data provided");
          setUserCreationError("No users to create");
          return false;
        }

        // Validate each user has required fields
        for (const user of companyUsersData) {
          if (!user.name || !user.email || !user.designation) {
            console.error("Invalid user data:", user);
            setUserCreationError(
              "All user fields (name, email, designation) are required"
            );
            return false;
          }
        }

        // Transform companyUsers data to match API structure (exclude frontend-generated IDs)
        const usersPayload: CreateUserData[] = companyUsersData.map(
          (companyUser) => ({
            name: companyUser.name,
            email: companyUser.email,
            designation: companyUser.designation,
            companyId: companyId,
            // Explicitly exclude frontend-generated id - backend will generate its own
          })
        );

        console.log(
          "Original company users data (with frontend IDs):",
          companyUsersData
        );
        console.log(
          "Sending user creation payload (IDs excluded):",
          usersPayload
        );
        console.log("Company ID:", companyId);

        const response = await createCompanyUsers(usersPayload);

        console.log("API Response:", response);
        console.log("Response type:", typeof response);
        console.log("Is Array:", Array.isArray(response));

        // Handle the response - it should be an array of created users directly
        let usersWithIds: any[] = [];

        if (response && Array.isArray(response)) {
          // Response is an array of created users - filter only required attributes
          usersWithIds = response.map((createdUser: any) => ({
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            designation: createdUser.designation,
            companyId: createdUser.companyId,
            // Exclude createdAt and passwordHash as requested
          }));
        } else {
          throw new Error("Invalid response format from server");
        }

        // Update the local state
        setCompanyUsers(usersWithIds);

        // Store in localStorage with the IDs
        localStorage.setItem(
          LS_KEYS.companyUsers,
          JSON.stringify(usersWithIds)
        );

        console.log("Created company users with IDs:", usersWithIds);

        // Users created successfully
        setUserCreationError("");
        return true;
      } catch (error: any) {
        console.error("User creation error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.message && error.message.includes("dup key")) {
          setUserCreationError("Duplicate emails found");
        } else if (error.message) {
          setUserCreationError(`Failed to create users: ${error.message}`);
        } else {
          setUserCreationError("Failed to create users. Please try again.");
        }

        return false;
      } finally {
        /* no separate isCreatingUsers state */
      }
    },
    []
  );

  const handleDelete = useCallback(
    (index: number) => {
      const updatedCompanyUsers = companyUsers.filter((_, i) => i !== index);
      setCompanyUsers(updatedCompanyUsers);

      setUserCreationError("");

      if (updatedCompanyUsers.length > 0) {
        localStorage.setItem(
          LS_KEYS.companyUsers,
          JSON.stringify(updatedCompanyUsers)
        );
      } else {
        // keep empty state; not removing key intentionally
      }

      if (editIndex === index) {
        setEditIndex(null);
        resetInfo({
          name: "",
          email: "",
          designation: "",
        });
      }
    },
    [companyUsers, editIndex, resetInfo]
  );

  //? Company creation handler
  const handlerCompanyCreation = useCallback(
    async (data: CompanyFormData) => {
      const payload = {
        name: data.companyName,
        description: data.description,
        email: data.email,
        contactNumber: data.phone,
        contactPerson: data.contactPerson,
        logoImg: companyLogoUrl || "",
        createdAt: new Date().toISOString(),
      };

      // Debug: Log the payload to see what's being sent
      console.log("Company creation payload:", payload);
      console.log("Form data:", data);

      // Company creation payload prepared
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("token") || "";
        console.log(
          "Sending POST request to /company with payload:",
          JSON.stringify(payload, null, 2)
        );

        const response = await apiPost<any>(
          "/company",
          payload,
          token ? { Authorization: `Bearer ${token}` } : {}
        );

        console.log("Company creation response:", response);
        // API responded with company data
        // Save the backend response data to localStorage if it contains an id
        if (response && response.id) {
          // Store the API response
          localStorage.setItem("Company", JSON.stringify(response));

          // Keep the form data with the company logo URL for display purposes
          const formDataWithLogo = {
            ...data,
            logoImg: companyLogoUrl,
            id: response.id,
            createdAt: response.createdAt || new Date().toISOString(),
          };
          localStorage.setItem(
            "CompanyFormData",
            JSON.stringify(formDataWithLogo)
          );

          // Update company data state
          // companyData state removed; form data already persisted

          // Reset the form after successful submission
          resetCompany();
          setCompanyLogoUrl(""); // Clear the logo URL
          setUploadError(""); // Clear any upload errors
        } else {
          console.error("Invalid response from API:", response);
          console.error("Expected response to have an 'id' field");
        }
      } catch (error) {
        // Handle error (e.g., show error message)
        console.error("Error creating company:", error);
        console.error("Error type:", typeof error);
        console.error(
          "Error message:",
          error instanceof Error ? error.message : String(error)
        );

        // Show user-friendly error message
        alert(
          `Failed to create company: ${error instanceof Error ? error.message : "Unknown error occurred"}`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyLogoUrl]
  );

  const onSubmitCompany = useCallback(
    (data: CompanyFormData) => {
      handlerCompanyCreation(data);
    },
    [handlerCompanyCreation]
  );

  //? Handler function for project creation
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
        assignTeamId: data.assigningTeam,
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
        // Project created successfully
        localStorage.setItem("Project", JSON.stringify(response));

        resetProject();
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

  const handleCompanyUserSubmit = useCallback(
    (data: CompanyUserFormData) => {
      if (editIndex !== null) {
        // Update existing company user
        const updatedCompanyUsers = companyUsers.map((p, i) =>
          i === editIndex ? { ...p, ...data } : p
        );
        setCompanyUsers(updatedCompanyUsers);
        setEditIndex(null);
      } else {
        // Add new participant without ID - backend will generate ID when saved
        const companyStr = localStorage.getItem("Company");
        let companyId = "";
        if (companyStr) {
          try {
            const companyObj = JSON.parse(companyStr);
            companyId = companyObj.id || "";
          } catch (e) {
            console.error("Error parsing company data:", e);
          }
        }

        const newParticipant: CompanyUserWithId = {
          ...data,
          id: Date.now(), // Temporary ID for UI only - backend will generate the real ID
          companyId: companyId,
        };
        const updatedParticipants = [...companyUsers, newParticipant];
        setCompanyUsers(updatedParticipants);
      }

      // Reset saved state since participants have changed
      setUserCreationError("");

      // Just update UI, don't call backend yet
      resetInfo({
        name: "",
        email: "",
        designation: "",
      });
    },
    [editIndex, resetInfo, companyUsers]
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
              <div className="flex justify-between items-center mb-5">
                <div className="me-10 w-full">
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
                <div className=" w-full">
                  <label className="block mb-2 text-lg text-gray-500">
                    Company Logo
                  </label>
                  <ImageUpload
                    onUploadSuccess={(imageUrl) => {
                      setCompanyLogoUrl(imageUrl);
                      setUploadError(""); // Clear any previous errors
                    }}
                    onUploadError={(error) => {
                      setUploadError(error);
                    }}
                    currentImageUrl={companyLogoUrl}
                    disabled={isSubmitting}
                    className="w-full"
                  />
                  {uploadError && (
                    <p className="mt-1 text-sm text-red-500">{uploadError}</p>
                  )}
                </div>
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
                <div className="w-full">
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
                  onClick={async () => {
                    setIsSubmitting(true);

                    try {
                      if (companyUsers.length > 0) {
                        const success = await createUsers(companyUsers);
                        if (!success) {
                          setIsSubmitting(false);
                          return; // Don't proceed if user creation failed
                        }
                      }

                      // Save to localStorage before navigating
                      if (companyUsers.length > 0) {
                        localStorage.setItem(
                          LS_KEYS.companyUsers,
                          JSON.stringify(companyUsers)
                        );
                      }

                      setIsSubmitting(false);
                      handleNext();
                    } catch (error) {
                      console.error("Error creating users:", error);
                      setIsSubmitting(false);
                    }
                  }}
                >
                  {isSubmitting ? "Creating Users..." : "next"}
                </Button>
              </div>
            </div>
            {userCreationError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {userCreationError}
                </p>
              </div>
            )}
            <form
              onSubmit={handleSubmitInfo(handleCompanyUserSubmit)}
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
                    errorsInfo.name ? "border-red-500" : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5`}
                  {...registerInfo("name", {
                    required: "Participant name is required",
                    minLength: {
                      value: 2,
                      message: "Participant name must be at least 2 characters",
                    },
                  })}
                />
                {errorsInfo.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorsInfo.name.message}
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
                      name: "",
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
          {companyUsers.length > 0 && (
            <div className="mt-10 px-50 pb-10">
              <table className="min-w-full bg-white">
                <tbody>
                  {companyUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td className="py-2 px-4 text-gray-900">{user.name}</td>
                      <td className="py-2 px-4 text-gray-900">{user.email}</td>
                      <td className="py-2 px-4 text-gray-900">
                        {user.designation}
                      </td>
                      {/* <td className="py-2 px-4 text-gray-900">
                        {user.appraisee}
                      </td>
                      <td className="py-2 px-4 text-gray-900">
                        {user.role}
                      </td> */}
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
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.teamName}
                    </option>
                  ))}
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
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const selectedDate = new Date(value);
                        selectedDate.setHours(0, 0, 0, 0);

                        if (selectedDate < today) {
                          return "End date cannot be in the past";
                        }

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
                  className={`font-semibold text-xl flex items-center justify-center p-6 ${
                    userGroups.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    // Validate that user groups have been created
                    if (userGroups.length === 0) {
                      alert(
                        "Please create at least one feedback group before proceeding."
                      );
                      return;
                    }
                    // Save the complete user groups data instead of just selected user IDs
                    localStorage.setItem(
                      LS_KEYS.surveyUsers,
                      JSON.stringify(userGroups)
                    );
                    handleNext();
                  }}
                  disabled={userGroups.length === 0}
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
                          <option value="Self">Self</option>
                          <option value="Boss">Boss</option>
                          <option value="Subordinate">Subordinate</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {editingGroupId !== null && (
              <div className="mb-4 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <div>
                    <h4 className="text-blue-800 font-medium">
                      Editing Group #{editingGroupId}
                    </h4>
                    <p className="text-blue-700 text-sm">
                      Modify the selections below and click "Update Group" to
                      save changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-10">
              <Button
                variant="save"
                className={`p-6 text-lg  ${selectedUsers.size === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onClick={
                  editingGroupId !== null
                    ? handleUpdateUserGroup
                    : handleAddUserGroup
                }
                disabled={selectedUsers.size === 0}
              >
                {editingGroupId !== null
                  ? "Update Group"
                  : "Add Selected Users"}
              </Button>
              {editingGroupId !== null && (
                <Button
                  variant="previous"
                  className="p-6 text-lg cursor-pointer"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
            <div className="review-section mt-8">
              {userGroups.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Selected User Groups
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                            Appraisee
                          </th>
                          <th className="text-left py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                            Appraisers
                          </th>
                          <th className="text-center py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {userGroups.map((group, index) => (
                          <tr
                            key={group.id}
                            className={`transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-25"
                            }`}
                          >
                            <td className="py-6 px-6 align-top">
                              {group.appraisee ? (
                                <div className="flex items-start space-x-3 max-w-sm">
                                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-4 rounded-lg w-full shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="font-semibold text-gray-900 text-base mb-1 flex items-center justify-between">
                                      {group.appraisee.name}
                                      <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shadow-sm">
                                        <i className="bx bx-user-check mr-1"></i>
                                        {group.appraisee.role}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                                      <i className="bx bx-envelope text-gray-400 mr-1"></i>
                                      {group.appraisee.email}
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <i className="bx bx-briefcase text-gray-400 mr-1"></i>
                                      {group.appraisee.designation}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400 text-sm italic bg-gray-50 px-4 py-3 rounded-lg border border-dashed border-gray-300">
                                  <i className="bx bx-user-x mr-2"></i>
                                  No appraisee assigned
                                </div>
                              )}
                            </td>

                            <td className="py-6 px-6 align-top">
                              {group.appraisers.length > 0 ? (
                                <div className="space-y-3 max-w-sm">
                                  {group.appraisers.map((appraiser) => (
                                    <div
                                      key={appraiser.id}
                                      className="flex items-start space-x-3"
                                    >
                                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg w-full shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="font-semibold text-gray-900 text-base mb-1 flex items-center justify-between">
                                          {appraiser.name}
                                          <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap shadow-sm ">
                                            <i className="bx bx-user-voice mr-1"></i>
                                            {appraiser.role}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1 flex items-center">
                                          <i className="bx bx-envelope text-gray-400 mr-1"></i>
                                          {appraiser.email}
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center">
                                          <i className="bx bx-briefcase text-gray-400 mr-1"></i>
                                          {appraiser.designation}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400 text-sm italic bg-gray-50 px-4 py-3 rounded-lg border border-dashed border-gray-300">
                                  <i className="bx bx-user-x mr-2"></i>
                                  No appraisers assigned
                                </div>
                              )}
                            </td>

                            <td className="py-6 px-6 align-top">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  variant="delete"
                                  onClick={() => handleEditUserGroup(group.id)}
                                  className="p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-md group"
                                  title="Edit Group"
                                >
                                  <i className="bx bxs-pencil group-hover:scale-110 transition-transform duration-200"></i>
                                </Button>
                                <Button
                                  variant="delete"
                                  onClick={() => {
                                    handleRemoveUserGroup(group.id);
                                    setGroupCounter((prev) => prev - 1);
                                  }}
                                  className="p-3 text-sm bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-all duration-200 hover:shadow-md group"
                                  title="Delete Group"
                                >
                                  <i className="bx bxs-trash group-hover:scale-110 transition-transform duration-200"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            {isSubmitting && (
              <div className="save-overley bg-black/30 w-full h-full absolute top-0 left-0 z-10 flex justify-center items-center flex-col">
                <Loader text="Creating Users & Finalizing..." />
              </div>
            )}
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

                    // Create users before finishing if participants exist
                    const participantsData = localStorage.getItem(
                      LS_KEYS.surveyUsers
                    );
                    if (participantsData) {
                      try {
                        const participants = JSON.parse(participantsData);
                        if (participants.length > 0) {
                          const response =
                            await createSurveyUsers(participants);

                          if (response && Array.isArray(response)) {
                            // Store the created survey users with their IDs in local storage
                            const surveyUsersWithIds = response.map(
                              (createdUser: any, index: number) => ({
                                ...participants[index], // Original form data
                                id:
                                  createdUser.id ||
                                  createdUser._id ||
                                  `survey_fallback_${Date.now()}_${index}`, // API-generated ID
                              })
                            );

                            // Store updated survey users with IDs back to localStorage
                            localStorage.setItem(
                              LS_KEYS.surveyUsers,
                              JSON.stringify(surveyUsersWithIds)
                            );

                            console.log(
                              "Created survey users with IDs:",
                              surveyUsersWithIds
                            );
                          } else if (!response) {
                            setIsSubmitting(false);
                            return; // Don't proceed if user creation failed
                          }
                        }
                        console.log(
                          "Participants data found:",
                          participantsData
                        );
                      } catch (error) {
                        console.error("Error parsing participants:", error);
                      }
                    }

                    // Clear all form data and localStorage after successful completion
                    // localStorage.removeItem("Company");
                    // localStorage.removeItem("CompanyFormData");
                    // localStorage.removeItem("CompanyUsers");
                    // localStorage.removeItem("SurveyUsers");
                    // localStorage.removeItem("Project");
                    // localStorage.removeItem("companyUsers");

                    // Reset all form states
                    resetCompany();
                    resetProject();
                    resetInfo();

                    // Reset component state
                    // companyData state removed
                    setCompanyUsers([]);
                    setUsers([]);
                    setUserGroups([]);
                    setSelectedUsers(new Set());
                    setUserTypes({});
                    setCompanyLogoUrl("");
                    setUploadError("");
                    setUserCreationError("");
                    setEditIndex(null);
                    setSearchTerm("");
                    setFilterDesignation("");
                    setGroupCounter(1);

                    setIsSubmitting(false);

                    navigate("/create");
                  }}
                  disabled={userGroups.length === 0 || isSubmitting}
                >
                  {isSubmitting ? "Creating Users & Finishing..." : "Finish"}
                </Button>
              </div>
            </div>

            {userCreationError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {userCreationError}
                </p>
              </div>
            )}

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

                {/* Table View for User Groups */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                          Appraisee
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                          Appraisers
                        </th>
                        <th className="text-left py-5 px-6 font-bold text-gray-800 text-sm uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userGroups.map((group, index) => (
                        <tr
                          key={group.id}
                          className={`transition-all duration-200 hover:bg-gray-50 hover:shadow-sm ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                        >
                          <td className="py-6 px-6 align-top">
                            {group.appraisee ? (
                              <div className="flex items-start space-x-3 max-w-sm">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 p-4 rounded-lg w-full shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="font-semibold text-gray-900 text-base mb-1 flex items-center justify-between">
                                    {group.appraisee.name}
                                    <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap shadow-sm">
                                      <i className="bx bx-user-check mr-1"></i>
                                      {group.appraisee.role}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-1 flex items-center">
                                    <i className="bx bx-envelope text-gray-400 mr-1"></i>
                                    {group.appraisee.email}
                                  </div>
                                  <div className="text-sm text-gray-600 flex items-center">
                                    <i className="bx bx-briefcase text-gray-400 mr-1"></i>
                                    {group.appraisee.designation}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400 text-sm italic bg-gray-50 px-4 py-3 rounded-lg border border-dashed border-gray-300">
                                <i className="bx bx-user-x mr-2"></i>
                                No appraisee assigned
                              </div>
                            )}
                          </td>

                          <td className="py-6 px-6 align-top">
                            {group.appraisers.length > 0 ? (
                              <div className="space-y-3 max-w-sm">
                                {group.appraisers.map((appraiser) => (
                                  <div
                                    key={appraiser.id}
                                    className="flex items-start space-x-3"
                                  >
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-4 rounded-lg w-full shadow-sm hover:shadow-md transition-shadow duration-200">
                                      <div className="font-semibold text-gray-900 text-base mb-1 flex items-center justify-between">
                                        {appraiser.name}
                                        <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap shadow-sm">
                                          <i className="bx bx-user-voice mr-1"></i>
                                          {appraiser.role}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600 mb-1 flex items-center">
                                        <i className="bx bx-envelope text-gray-400 mr-1"></i>
                                        {appraiser.email}
                                      </div>
                                      <div className="text-sm text-gray-600 flex items-center">
                                        <i className="bx bx-briefcase text-gray-400 mr-1"></i>
                                        {appraiser.designation}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400 text-sm italic bg-gray-50 px-4 py-3 rounded-lg border border-dashed border-gray-300">
                                <i className="bx bx-user-x mr-2"></i>
                                No appraisers assigned
                              </div>
                            )}
                          </td>

                          <td className="py-6 px-6 align-top">
                            <div className="flex flex-col space-y-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <i className="bx bx-check-circle mr-1"></i>
                                Ready to Deploy
                              </span>
                              <div className="text-xs text-gray-500">
                                {group.appraisee ? 1 : 0} Appraisee •{" "}
                                {group.appraisers.length} Appraiser
                                {group.appraisers.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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

  return (
    <>
      {showCompletionPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Project Created Successfully!
            </h3>
            <p className="text-gray-600">
              All forms have been reset and you will be redirected shortly.
            </p>
          </div>
        </div>
      )}
      {pageContent}
    </>
  );
};

export default Project;
