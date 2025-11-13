import React, { useEffect, useMemo, useState } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "../lib/apiService";
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

type Survey = {
  id: string;
  surveyName: string;
  projectId: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  participants?: number;
  responses?: number;
  description?: string;
};

type Project = {
  id: string;
  project_name: string;
  companyId: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
};

export default function ViewSurveys() {
  const navigate = useNavigate();
  const location = useLocation();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurveys, setSelectedSurveys] = useState<Set<string>>(
    new Set()
  );
  const [projectInfo, setProjectInfo] = useState<Project | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);

  // Get project details from localStorage or navigation state
  const getProjectDetails = useMemo(() => {
    // Try to get from navigation state first
    const projectId = (location.state as any)?.projectId;

    // Try to get project details from localStorage
    try {
      const projectDetailsData = localStorage.getItem("ProjectDetails");
      if (projectDetailsData) {
        const projectDetails = JSON.parse(projectDetailsData);

        if (Array.isArray(projectDetails)) {
          // If projectId is provided, find specific project
          if (projectId) {
            const project = projectDetails.find((p) => p.id === projectId);
            return { projectId, project };
          }
          // Otherwise use first project
          return {
            projectId: projectDetails[0]?.id,
            project: projectDetails[0],
          };
        } else if (projectDetails.id) {
          return { projectId: projectDetails.id, project: projectDetails };
        }
      }
    } catch (error) {
      console.error("Error parsing project details from localStorage:", error);
    }

    return { projectId: null, project: null };
  }, [location.state]);

  // Function to get surveys from localStorage (fallback)
  const getSurveysFromLocalStorage = () => {
    try {
      const surveyDetailsData = localStorage.getItem("SurveyDetails");
      if (surveyDetailsData) {
        const surveyDetails = JSON.parse(surveyDetailsData);
        console.log("Survey details from localStorage:", surveyDetails);

        // Handle different data structures
        if (Array.isArray(surveyDetails)) {
          return surveyDetails;
        } else if (surveyDetails.id || surveyDetails.surveyId) {
          return [surveyDetails];
        }
      }

      // Try specific project survey details
      const specificSurveyData = localStorage.getItem(
        "SpecificProjectSurveyDetails"
      );
      if (specificSurveyData) {
        const specificSurvey = JSON.parse(specificSurveyData);
        return Array.isArray(specificSurvey)
          ? specificSurvey
          : [specificSurvey];
      }

      return [];
    } catch (error) {
      console.error("Error parsing survey details from localStorage:", error);
      return [];
    }
  };

  // Fetch surveys from API
  const fetchSurveys = async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching surveys for project ID:", projectId);
      const response = await apiGet(`/project/${projectId}/survey`);

      if (response) {
        const surveysArray = Array.isArray(response) ? response : [response];
        const mappedSurveys: Survey[] = surveysArray.map((survey: any) => ({
          id: survey.id || survey.surveyId || "",
          surveyName: survey.surveyName || survey.name || "Untitled Survey",
          projectId: survey.projectId || projectId,
          status: survey.status || "Active",
          createdAt: survey.createdAt || new Date().toISOString(),
          updatedAt: survey.updatedAt,
          participants: survey.participants || 0,
          responses: survey.responses || 0,
          description: survey.description || "",
        }));

        setSurveys(mappedSurveys);
        // Store in localStorage for future use
        localStorage.setItem("SurveyDetails", JSON.stringify(response));
      } else {
        setSurveys([]);
      }
    } catch (err) {
      console.error("Failed to fetch surveys:", err);
      // Try to load from localStorage as fallback
      const localSurveys = getSurveysFromLocalStorage();
      if (localSurveys.length > 0) {
        setSurveys(localSurveys);
        setError(null);
      } else {
        setError("Failed to load surveys. Please try again.");
        setSurveys([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const { projectId, project } = getProjectDetails;

    if (project) {
      setProjectInfo(project);
    }

    if (projectId) {
      fetchSurveys(projectId);
    } else {
      // Try to load surveys from localStorage anyway
      const localSurveys = getSurveysFromLocalStorage();
      if (localSurveys.length > 0) {
        setSurveys(localSurveys);
      } else {
        setError(
          "Project ID not found. Please navigate from the projects page."
        );
      }
    }
  }, [getProjectDetails]);

  // Handle survey selection
  const handleSurveySelect = (surveyId: string, checked: boolean) => {
    const newSelected = new Set(selectedSurveys);
    if (checked) {
      newSelected.add(surveyId);
    } else {
      newSelected.delete(surveyId);
    }
    setSelectedSurveys(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSurveys(new Set(surveys.map((s) => s.id)));
    } else {
      setSelectedSurveys(new Set());
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get survey status styling
  const getSurveyStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return { status: "Active", color: "bg-green-100 text-green-800" };
      case "draft":
        return { status: "Draft", color: "bg-yellow-100 text-yellow-800" };
      case "completed":
        return { status: "Completed", color: "bg-blue-100 text-blue-800" };
      case "closed":
        return { status: "Closed", color: "bg-gray-100 text-gray-800" };
      default:
        return { status: "Active", color: "bg-green-100 text-green-800" };
    }
  };

  // Handle survey deletion
  const handleDeleteSurvey = (survey: Survey, event: React.MouseEvent) => {
    event.stopPropagation();
    setSurveyToDelete(survey);
    setIsDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!surveyToDelete) return;

    try {
      // Here you would call the delete API
      // await apiDelete(`/survey/${surveyToDelete.id}`);
      setSurveys((prev) => prev.filter((s) => s.id !== surveyToDelete.id));
      setSurveyToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete survey:", error);
      alert("Failed to delete survey. Please try again.");
    }
  };

  // Navigate to survey details or participants
  const handleViewSurvey = (surveyId: string) => {
    // Store survey ID for navigation
    localStorage.setItem("SelectedSurveyId", surveyId);
    navigate(`/preview-participants`, { state: { surveyId } });
  };

  // Navigate to create new survey
  const handleCreateSurvey = () => {
    const { projectId } = getProjectDetails;
    navigate("/create-survey", { state: { projectId } });
  };

  // Skeleton loading component
  const SurveySkeleton = () => (
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
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav title="View Surveys" />
        <main className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-semibold">
                {projectInfo?.project_name
                  ? `${projectInfo.project_name} - Surveys`
                  : "Project Surveys"}
              </h2>
              {projectInfo && (
                <p className="text-gray-600 mt-1">
                  Contact: {projectInfo.contactPerson} | {projectInfo.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="black"
                className="text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2"
                onClick={handleCreateSurvey}
              >
                <i className="bx bx-plus text-xl"></i>
                Create New Survey
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-xl mb-2">Available Surveys</h3>
            <div className="flex items-center gap-2 mt-2 justify-between pe-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="download-all"
                  className="accent-[#A10000]"
                  checked={
                    selectedSurveys.size === surveys.length &&
                    surveys.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="download-all" className="text-sm ms-2">
                  Select All Surveys ({selectedSurveys.size} selected)
                </label>
              </div>
              <button
                className="text-[#A10000]"
                disabled={selectedSurveys.size === 0}
              >
                <i className="bx bx-download text-2xl"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <SurveySkeleton />
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => {
                const surveyStatus = getSurveyStatus(survey.status || "active");
                return (
                  <div
                    key={survey.id}
                    className="flex items-center p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow duration-200 bg-white"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mr-4 text-white font-bold text-lg">
                      {survey.surveyName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {survey.surveyName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {survey.description || "No description"}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Created
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(survey.createdAt)}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Status
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${surveyStatus.color}`}
                        >
                          {surveyStatus.status}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Participants/Responses
                        </div>
                        <div className="text-sm text-gray-600">
                          {survey.participants || 0} / {survey.responses || 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      <Button
                        variant="next"
                        className="border border-[#ee3f40] text-[#ee3f40] bg-transparent rounded-full cursor-pointer px-4 py-2"
                        onClick={() => handleViewSurvey(survey.id)}
                      >
                        View Participants
                      </Button>
                      <Button
                        variant="next"
                        className="border border-red-500 text-white bg-[#ee3f40] hover:bg-red-500 rounded-full cursor-pointer px-4 py-2"
                        onClick={(e) => handleDeleteSurvey(survey, e)}
                      >
                        Delete
                      </Button>
                      <input
                        type="checkbox"
                        className="accent-[#A10000] w-4 h-4"
                        checked={selectedSurveys.has(survey.id)}
                        onChange={(e) =>
                          handleSurveySelect(survey.id, e.target.checked)
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
                onClick={() => {
                  const { projectId } = getProjectDetails;
                  if (projectId) fetchSurveys(projectId);
                }}
                className="mt-2 text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && surveys.length === 0 && !error && (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="text-8xl mb-6 opacity-50">📋</div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-700">
                  No Surveys Found
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {projectInfo?.project_name
                    ? `There are no surveys available for ${projectInfo.project_name} yet.`
                    : "There are no surveys available for this project yet."}
                  <br />
                  Get started by creating your first survey.
                </p>
                <Button
                  variant="next"
                  className="bg-[#ee3f40] hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3"
                  onClick={handleCreateSurvey}
                >
                  <i className="bx bx-plus text-xl"></i>
                  Create Your First Survey
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
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the survey '
              {surveyToDelete?.surveyName}'? This action cannot be undone and
              will permanently remove all associated data and responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
