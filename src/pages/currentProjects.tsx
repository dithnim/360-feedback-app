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

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects(companyId);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch projects");
      setProjects([]);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const navigateToViewProject = (projectId: string) => {
    navigate(`/view-project`, { state: { projectId } });
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
          <h2 className="text-3xl font-semibold mb-6">
            {org?.name
              ? `${org.name} - Project Dashboard`
              : "Project Dashboard"}
          </h2>
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
                        onClick={() => navigateToViewProject(project.id)}
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

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium mb-2">No Projects Found</h3>
              <p>There are no projects available for this company.</p>
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
