import React, { useEffect, useMemo, useState } from "react";
import PageNav from "../components/ui/pageNav";
import { useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/apiService";
import { Button } from "../components/ui/Button";
import { Bell } from "lucide-react";

type SurveyUser = {
  userId: string;
  name?: string;
  email?: string;
  designation?: string;
  role?: string;
  appraiser: boolean;
  hasResponded?: boolean;
};

export default function PreviewParticipants() {
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyUsers, setSurveyUsers] = useState<SurveyUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Get surveyId from location state or localStorage
  const surveyId = useMemo(() => {
    const fromState = (location.state as any)?.surveyId;
    if (fromState) return fromState;

    try {
      // Try to get from localStorage
      const selectedSurveyId = localStorage.getItem("SelectedSurveyId");
      if (selectedSurveyId) return selectedSurveyId;

      // Try to get from Project localStorage
      const projectRaw = localStorage.getItem("Project");
      const project = projectRaw ? JSON.parse(projectRaw) : null;
      return project?.surveyId || project?.id || null;
    } catch {
      return null;
    }
  }, [location.state]);

  // Fetch survey details from API
  useEffect(() => {
    let cancelled = false;

    async function fetchSurveyDetails() {
      if (!surveyId) {
        console.warn("No survey ID available to fetch survey details");
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching survey details for survey ID: ${surveyId}`);
        const response = await apiGet<any>(`/look/survey/${surveyId}`);

        if (!cancelled) {
          console.log("Survey details API response:", response);

          // Save complete survey details to localStorage
          try {
            localStorage.setItem("SurveyDetails", JSON.stringify(response));
            console.log("Saved survey details to localStorage");
          } catch (storageError) {
            console.warn(
              "Failed to save survey details to localStorage:",
              storageError
            );
          }

          // Extract user details from the response
          let users: SurveyUser[] = [];
          if (Array.isArray(response) && response.length > 0) {
            // Response is an array of survey objects
            const surveyData = response[0];
            if (
              surveyData.userDetails &&
              Array.isArray(surveyData.userDetails)
            ) {
              users = surveyData.userDetails.map((user: any) => ({
                userId: user._id || user.id,
                name: user.name,
                email: user.email,
                designation: user.designation,
                role: user.role,
                appraiser: user.appraiser,
                hasResponded: user.hasResponded ?? false,
              }));
            }
          } else if (
            response.userDetails &&
            Array.isArray(response.userDetails)
          ) {
            // Response is a single survey object
            users = response.userDetails.map((user: any) => ({
              userId: user._id || user.id,
              name: user.name,
              email: user.email,
              designation: user.designation,
              role: user.role,
              appraiser: user.appraiser,
              hasResponded: user.hasResponded ?? false,
            }));
          }

          setSurveyUsers(users);
          console.log("Extracted user details:", users);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error("Error fetching survey details:", e);
          // Try to load from localStorage as fallback
          try {
            const stored = localStorage.getItem("SurveyDetails");
            if (stored) {
              const surveyDetails = JSON.parse(stored);
              let users: SurveyUser[] = [];

              if (Array.isArray(surveyDetails) && surveyDetails.length > 0) {
                const surveyData = surveyDetails[0];
                if (
                  surveyData.userDetails &&
                  Array.isArray(surveyData.userDetails)
                ) {
                  users = surveyData.userDetails.map((user: any) => ({
                    userId: user._id || user.id,
                    name: user.name,
                    email: user.email,
                    designation: user.designation,
                    role: user.role,
                    appraiser: user.appraiser,
                    hasResponded: user.hasResponded ?? false,
                  }));
                }
              } else if (
                surveyDetails.userDetails &&
                Array.isArray(surveyDetails.userDetails)
              ) {
                users = surveyDetails.userDetails.map((user: any) => ({
                  userId: user._id || user.id,
                  name: user.name,
                  email: user.email,
                  designation: user.designation,
                  role: user.role,
                  appraiser: user.appraiser,
                  hasResponded: user.hasResponded ?? false,
                }));
              }

              setSurveyUsers(users);
            }
          } catch {
            console.error("Failed to load from localStorage");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSurveyDetails();
    return () => {
      cancelled = true;
    };
  }, [surveyId]);

  const handleViewReport = (userId: string) => {
    console.log("View report for user:", userId);
    // TODO: Navigate to report view page
    navigate(`/view-project?participantId=${encodeURIComponent(userId)}`);
  };

  const handleSendNotification = (user: SurveyUser) => {
    console.log("Send notification to:", user);
    // TODO: Implement email notification API call
    alert(`Sending notification to ${user.email || user.name || "user"}...`);
  };

  const handleNext = () => {
    console.log("Next button clicked");
    navigate("/project-participants");
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav position="HR Manager" title="All Users" />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Participants
            </h2>
            <Button
              variant="next"
              className="bg-[#ee3f40] hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-lg"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
              <div>Participant Name</div>
              <div>Email Address</div>
              <div>Designation</div>
              <div>Appraisee/Appraiser</div>
              <div>Role</div>
              <div></div>
            </div>

            {/* Table Body */}
            {loading ? (
              <div className="px-6 py-12 text-center text-gray-500">
                Loading participants...
              </div>
            ) : surveyUsers.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No participants found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {surveyUsers.map((user, index) => {
                  const hasResponded = user.hasResponded ?? false;
                  const rowBgColor = hasResponded
                    ? "bg-white hover:bg-gray-50"
                    : "bg-red-50 hover:bg-red-100";

                  return (
                    <div
                      key={user.userId || index}
                      className={`grid grid-cols-6 gap-4 px-6 py-4 items-center transition-colors ${rowBgColor}`}
                    >
                      <div className="font-medium text-gray-800">
                        {user.name || "Placeholder Name"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {user.email || "email@example.com"}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {user.designation || "HR Manager"}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">
                          {user.appraiser ? "Appraiser" : "Appraisee"}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {user.role || "Manager"}
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {hasResponded ? (
                          <Button
                            variant="next"
                            className="border border-[#ee3f40] text-[#ee3f40] bg-transparent hover:bg-red-50 rounded-full px-4 py-2 text-sm"
                            onClick={() => handleViewReport(user.userId)}
                          >
                            View Report
                          </Button>
                        ) : (
                          <button
                            onClick={() => handleSendNotification(user)}
                            className="text-[#ee3f40] hover:text-red-600 transition-colors p-2"
                            title="Send notification"
                          >
                            <Bell className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
