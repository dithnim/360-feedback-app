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
  group?: string;
  appraiser: boolean;
  hasResponded?: boolean;
};

export default function PreviewParticipants() {
  const location = useLocation();
  const navigate = useNavigate();
  const [surveyUsers, setSurveyUsers] = useState<SurveyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

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
                group: user.group || user.groupId || user.group_id,
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
              group: user.group || user.groupId || user.group_id,
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
                    group: user.group || user.groupId || user.group_id,
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
                  group: user.group || user.groupId || user.group_id,
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

  // Group users by their group attribute with appraisees and appraisers in same group
  const groupedUsers = useMemo(() => {
    const groups: Record<
      string,
      { appraisees: SurveyUser[]; appraisers: SurveyUser[] }
    > = {};

    surveyUsers.forEach((user) => {
      const groupId = user.group || "ungrouped";

      if (!groups[groupId]) {
        groups[groupId] = { appraisees: [], appraisers: [] };
      }

      if (user.appraiser) {
        groups[groupId].appraisers.push(user);
      } else {
        groups[groupId].appraisees.push(user);
      }
    });

    // Convert to numbered group names
    const finalGroups: Record<
      string,
      { appraisees: SurveyUser[]; appraisers: SurveyUser[] }
    > = {};

    Object.keys(groups).forEach((groupId, index) => {
      finalGroups[`Group ${index + 1}`] = groups[groupId];
    });

    return finalGroups;
  }, [surveyUsers]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

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
        <PageNav title="All Users" />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800">
              Participants
            </h2>
            <Button
              variant="next"
              className="bg-[#ee3f40] hover:bg-red-600 text-white font-semibold px-13 py-5 rounded-full"
              onClick={handleNext}
            >
              Next
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                {Object.entries(groupedUsers).map(([groupName, groupData]) => {
                  const isExpanded = expandedGroups[groupName] ?? true;
                  const allUsers = [
                    ...groupData.appraisees,
                    ...groupData.appraisers,
                  ];
                  const respondedCount = allUsers.filter(
                    (u) => u.hasResponded
                  ).length;
                  const totalCount = allUsers.length;

                  return (
                    <div key={groupName} className="border-b border-gray-200">
                      {/* Group Header */}
                      <div
                        className="flex items-center justify-between px-6 py-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors mt-10"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`transform transition-transform ${isExpanded ? "rotate-90" : "rotate-0"}`}
                          >
                            ▶
                          </div>
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {groupName}
                          </h3>
                          <span className="text-sm text-gray-600">
                            ({totalCount} participant
                            {totalCount !== 1 ? "s" : ""})
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            Progress: {respondedCount}/{totalCount}
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${totalCount > 0 ? (respondedCount / totalCount) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Group Content */}
                      {isExpanded && (
                        <div className="">
                          {/* Appraisee Section */}
                          {groupData.appraisees.length > 0 && (
                            <div className="">
                              <div className="px-6 py-2 border-b border-green-200">
                                <h4 className="font-medium text-green-800">
                                  Appraisee ({groupData.appraisees.length})
                                </h4>
                              </div>
                              {groupData.appraisees.map((user, index) => {
                                const hasResponded = user.hasResponded ?? false;
                                const rowBgColor = hasResponded
                                  ? "bg-green-25 hover:bg-green-50"
                                  : "bg-green-50 hover:bg-green-100";

                                return (
                                  <div
                                    key={user.userId || `appraisee-${index}`}
                                    className={`flex items-center justify-between px-8 py-4 border-l-4 border-l-green-400 transition-colors ${rowBgColor}`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-800">
                                            {user.name || "Placeholder Name"}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {user.email || "email@example.com"}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {user.designation || "HR Manager"}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium text-gray-700">
                                            {user.role || "Manager"}
                                          </div>
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Self
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 ml-4">
                                      {hasResponded ? (
                                        <Button
                                          variant="next"
                                          className="border border-[#ee3f40] text-[#ee3f40] bg-transparent hover:bg-red-50 rounded-full px-4 py-2 text-sm"
                                          onClick={() =>
                                            handleViewReport(user.userId)
                                          }
                                        >
                                          View Report
                                        </Button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleSendNotification(user)
                                          }
                                          className="text-[#ee3f40] hover:text-red-600 transition-colors p-2 cursor-pointer"
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

                          {/* Appraiser Section */}
                          {groupData.appraisers.length > 0 && (
                            <div className="bg-white">
                              <div className="px-6 py-2 bg-red-50 border-b border-red-200">
                                <h4 className="font-medium text-red-800">
                                  Appraisers ({groupData.appraisers.length})
                                </h4>
                              </div>
                              {groupData.appraisers.map((user, index) => {
                                const hasResponded = user.hasResponded ?? false;
                                const rowBgColor = hasResponded
                                  ? "bg-white hover:bg-gray-50"
                                  : "bg-red-50 hover:bg-red-100";

                                return (
                                  <div
                                    key={user.userId || `appraiser-${index}`}
                                    className={`flex items-center justify-between px-8 py-4 border-l-4 border-l-red-400 transition-colors ${rowBgColor}`}
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                          <div className="font-semibold text-gray-800">
                                            {user.name || "Placeholder Name"}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {user.email || "email@example.com"}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {user.designation || "HR Manager"}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium text-gray-700">
                                            {user.role || "Manager"}
                                          </div>
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {user.role || "Appraiser"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 ml-4">
                                      {hasResponded ? (
                                        <Button
                                          variant="next"
                                          className="border border-[#ee3f40] text-[#ee3f40] bg-transparent hover:bg-red-50 rounded-full px-4 py-2 text-sm"
                                          onClick={() =>
                                            handleViewReport(user.userId)
                                          }
                                        >
                                          View Report
                                        </Button>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleSendNotification(user)
                                          }
                                          className="text-[#ee3f40] hover:text-red-600 transition-colors p-2 cursor-pointer"
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
                      )}
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
