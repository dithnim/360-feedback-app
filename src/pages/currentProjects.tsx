import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiDelete } from "../lib/apiService";
import { useState, useCallback, useEffect } from "react";
import { Skeleton } from "../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const getProjects = async (companyId: string) => {
  const response = await apiGet(`/project/company/${companyId}`);
  if (response && Array.isArray(response)) {
    return response;
  }
  throw new Error("Invalid response from API");
};

const deleteProject = async (projectId: string) => {
  return await apiDelete(`/project/${projectId}`);
};

const getCompanies = async (companyId: string) => {
  try {
    const response = await apiGet(`/company/${companyId}`);
    if (response && typeof response === "object") {
      localStorage.setItem("Company", JSON.stringify(response));
      console.log("Company data saved to localStorage:", response);
      return response;
    }
    throw new Error("Invalid response from API");
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
};

const getParticipants = async (companyId: string) => {
  try {
    console.log("Fetching participants for company ID:", companyId);
    const response = await apiGet(`/company/user/company/${companyId}`);
    console.log("Raw participants response:", response);

    if (response && Array.isArray(response)) {
      localStorage.setItem("Participants", JSON.stringify(response));
      console.log("Participants data saved to localStorage:", response);
      return response;
    }

    console.warn("Invalid participants response format:", response);
    throw new Error(
      "Invalid response from API - expected array but got: " + typeof response
    );
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};

interface Project {
  id: string;
  project_name: string;
  companyId: string;
  assignTeamId: string;
  contactPerson: string;
  designation: string;
  email: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
}

export default function CurrentProjectsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the organization from the passed state, fallback to hardcoded ID if not available
  const org = location.state?.org;
  const companyId = org?.id;

  // Debug logging
  console.log("CurrentProjectsPage - location.state:", location.state);
  console.log("CurrentProjectsPage - org:", org);
  console.log("CurrentProjectsPage - companyId:", companyId);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyDataLoaded, setCompanyDataLoaded] = useState(false);

  // Function to check and log localStorage data
  const checkLocalStorageData = useCallback(() => {
    const company = localStorage.getItem("Company");
    const participants = localStorage.getItem("Participants");

    console.log("LocalStorage check:");
    console.log("- Company data:", company ? JSON.parse(company) : "Not found");
    console.log(
      "- Participants data:",
      participants ? JSON.parse(participants) : "Not found"
    );

    return {
      hasCompany: !!company,
      hasParticipants: !!participants,
      companyData: company ? JSON.parse(company) : null,
      participantsData: participants ? JSON.parse(participants) : null,
    };
  }, []);

  // Memoized function to fetch company and participant data only once
  const fetchCompanyData = useCallback(async () => {
    if (!companyId) {
      console.error("Cannot fetch company data: companyId is missing");
      throw new Error("Company ID is required but not provided");
    }

    if (companyDataLoaded) {
      console.log("Skipping fetchCompanyData - data already loaded");
      return;
    }

    try {
      console.log(
        "Fetching company and participant details for ID:",
        companyId
      );

      // Check if data already exists in localStorage
      const localStorageCheck = checkLocalStorageData();

      if (localStorageCheck.hasCompany && localStorageCheck.hasParticipants) {
        console.log(
          "Company and participant data already available in localStorage"
        );
        setCompanyDataLoaded(true);
        return;
      }

      // Fetch both company and participants data in parallel
      console.log(
        "Starting parallel fetch of company and participants data..."
      );
      const [companyData, participantsData] = await Promise.all([
        getCompanies(companyId).catch((error) => {
          console.error("Company fetch failed:", error);
          throw new Error(`Company fetch failed: ${error.message}`);
        }),
        getParticipants(companyId).catch((error) => {
          console.error("Participants fetch failed:", error);
          throw new Error(`Participants fetch failed: ${error.message}`);
        }),
      ]);

      console.log("Company data fetched:", companyData);
      console.log("Participants data fetched:", participantsData);
      console.log("Company and participant details fetched successfully");
      setCompanyDataLoaded(true);
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      throw error;
    }
  }, [companyId, companyDataLoaded]);

  // Function to handle navigation to project creation
  const handleCreateProject = useCallback(async () => {
    try {
      await fetchCompanyData();
      navigate("/project", { state: { initialCase: 3 } });
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      // Navigate anyway, but without company data pre-filled
      alert(
        "Failed to load company details. You'll need to enter them manually in the project form."
      );
      navigate("/project", { state: { initialCase: 3 } });
    }
  }, [fetchCompanyData, navigate]);

  const fetchProjects = useCallback(async () => {
    if (!companyId) {
      console.error("Cannot fetch projects: companyId is missing");
      setError(
        "Company ID is missing. Please navigate from the company selection page."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Fetching projects for companyId:", companyId);
      const data = await getProjects(companyId);
      console.log("Projects fetched:", data);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const navigateToViewParticipants = (projectId: string) => {
    navigate(`/preview-participants`, { state: { projectId } });
  };

  const handleProjectSelect = (projectId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjects);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(new Set(projects.map((p) => p.id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProjectStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: "Upcoming", color: "bg-blue-100 text-blue-800" };
    } else if (now > end) {
      return { status: "Completed", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Active", color: "bg-yellow-100 text-yellow-800" };
    }
  };

  const handleDeleteProject = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteProject(projectToDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav position="CEO" title="Current Projects" />
        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold">
              {org?.name
                ? `${org.name} - Project Dashboard`
                : "Project Dashboard"}
            </h2>
            <div className="flex gap-2">
              {/* Debug button to test participant fetching */}
              <Button
                variant="next"
                className="border border-blue-500 text-blue-500 bg-transparent px-4 py-2 rounded-lg"
                onClick={async () => {
                  console.log("=== DEBUG: Testing participant fetch ===");
                  checkLocalStorageData();
                  if (companyId) {
                    try {
                      await fetchCompanyData();
                      console.log("=== DEBUG: Fetch completed ===");
                      checkLocalStorageData();
                    } catch (error) {
                      console.error("=== DEBUG: Fetch failed ===", error);
                    }
                  } else {
                    console.error("=== DEBUG: No companyId available ===");
                  }
                }}
              >
                Debug Data
              </Button>
              <Button
                variant="black"
                className="text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2"
                onClick={handleCreateProject}
              >
                <i className="bx bx-plus text-xl"></i>
                Create New Project
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-medium text-xl mb-2">Active Projects</h3>
            <div className="flex items-center gap-2 mt-2 justify-between pe-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="download-all"
                  className="accent-[#A10000]"
                  checked={
                    selectedProjects.size === projects.length &&
                    projects.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="download-all" className="text-sm ms-2">
                  Download All Reports ({selectedProjects.size} selected)
                </label>
              </div>
              <button
                className="text-[#A10000]"
                disabled={selectedProjects.size === 0}
              >
                <i className="bx bx-download text-2xl"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center p-6 border border-gray-200 rounded-lg bg-white"
                >
                  <Skeleton className="w-12 h-12 rounded-full mr-4" />

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>

                    <div>
                      <Skeleton className="h-4 w-16 mb-2" />
                      <Skeleton className="h-4 w-28" />
                    </div>

                    <div>
                      <Skeleton className="h-4 w-12 mb-2" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const projectStatus = getProjectStatus(
                  project.startDate,
                  project.endDate
                );
                return (
                  <div
                    key={project.id}
                    className="flex items-center p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 text-white font-bold text-lg">
                      {project.project_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {project.project_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Contact: {project.contactPerson}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Duration
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(project.startDate)} -{" "}
                          {formatDate(project.endDate)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Status
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${projectStatus.color}`}
                        >
                          {projectStatus.status}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Contact Info
                        </div>
                        <div className="text-sm text-gray-600">
                          {project.email}
                        </div>
                        <div className="text-sm text-gray-600">
                          {project.phoneNumber}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <Button
                        variant="next"
                        className="border border-[#ee3f40] text-[#ee3f40] bg-transparent  rounded-full cursor-pointer px-4 py-2"
                        onClick={() => navigateToViewParticipants(project.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="next"
                        className="border border-red-500 text-white bg-[#ee3f40] hover:bg-red-500 rounded-full cursor-pointer px-4 py-2"
                        onClick={(e) => handleDeleteProject(project, e)}
                      >
                        Delete
                      </Button>
                      <input
                        type="checkbox"
                        className="accent-[#A10000] w-4 h-4"
                        checked={selectedProjects.has(project.id)}
                        onChange={(e) =>
                          handleProjectSelect(project.id, e.target.checked)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-700">{error}</div>
              <button
                onClick={fetchProjects}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && projects.length === 0 && !error && (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-8xl mb-6 opacity-50">📋</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">
                  No Projects Found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {org?.name
                    ? `There are no projects available for ${org.name} yet.`
                    : "There are no projects available for this company yet."}
                  <br />
                  Get started by creating your first project.
                </p>
                <Button
                  variant="next"
                  className="bg-[#ee3f40] hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3"
                  onClick={handleCreateProject}
                >
                  <i className="bx bx-plus text-xl"></i>
                  Create Your First Project
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project '
              {projectToDelete?.project_name}'? This action cannot be undone and
              will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
