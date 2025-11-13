import React, { useEffect, useState } from "react";
import PageNav from "../components/ui/pageNav";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useUser } from "../context/UserContext";

type UserGroup = {
  groupId: string;
  groupName: string;
  appraisee: {
    id: string;
    name: string;
    email: string;
    designation?: string;
    role?: string;
  };
  appraisers: Array<{
    id: string;
    name: string;
    email: string;
    designation?: string;
    role?: string;
  }>;
};

export default function ProjectParticipants() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [selectedReports, setSelectedReports] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // Load project name
    try {
      const projectRaw = localStorage.getItem("Project");
      if (projectRaw) {
        const project = JSON.parse(projectRaw);
        setProjectName(project.projectName || project.name || "Project");
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }

    // Load survey details from localStorage
    try {
      const surveyDetailsRaw = localStorage.getItem("SurveyDetails");
      console.log("Loading SurveyDetails from localStorage:", surveyDetailsRaw);

      if (surveyDetailsRaw) {
        const surveyDetailsData = JSON.parse(surveyDetailsRaw);
        console.log("Parsed SurveyDetails data:", surveyDetailsData);

        let surveyData: any = null;
        let userGroups: any[] = [];

        // Extract survey data from the response
        if (Array.isArray(surveyDetailsData) && surveyDetailsData.length > 0) {
          // Response is an array of survey objects
          surveyData = surveyDetailsData[0];
        } else if (surveyDetailsData && typeof surveyDetailsData === "object") {
          // Response is a single survey object
          surveyData = surveyDetailsData;
        }

        // Process userDetails to create proper groups
        if (
          surveyData &&
          surveyData.userDetails &&
          Array.isArray(surveyData.userDetails)
        ) {
          const userDetails = surveyData.userDetails;

          // Group users by their group field
          const groupsMap = new Map<string, any[]>();

          userDetails.forEach((user: any) => {
            const groupId = user.group;
            if (!groupsMap.has(groupId)) {
              groupsMap.set(groupId, []);
            }
            groupsMap.get(groupId)!.push(user);
          });

          console.log("Groups map:", groupsMap);

          // Transform each group into the expected format
          const finalGroups: UserGroup[] = [];
          let groupIndex = 0;

          groupsMap.forEach((users, groupId) => {
            // Find the appraisee (user with appraiser: false)
            const appraisee = users.find((user) => !user.appraiser);

            // Find all appraisers (users with appraiser: true)
            const appraisers = users.filter((user) => user.appraiser);

            if (appraisee) {
              finalGroups.push({
                groupId: groupId,
                groupName: `Group ${groupIndex + 1}`,
                appraisee: {
                  id:
                    appraisee._id || appraisee.id || `appraisee-${groupIndex}`,
                  name: appraisee.name || `Appraisee ${groupIndex + 1}`,
                  email:
                    appraisee.email || `appraisee${groupIndex + 1}@example.com`,
                  designation: appraisee.role || "Employee",
                  role: appraisee.role,
                },
                appraisers: appraisers.map(
                  (appraiser: any, appraiserIndex: number) => ({
                    id:
                      appraiser._id ||
                      appraiser.id ||
                      `appraiser-${groupIndex}-${appraiserIndex}`,
                    name: appraiser.name || `Appraiser ${appraiserIndex + 1}`,
                    email:
                      appraiser.email ||
                      `appraiser${appraiserIndex + 1}@example.com`,
                    designation: appraiser.role || "Employee",
                    role: appraiser.role,
                  })
                ),
              });
              groupIndex++;
            }
          });

          console.log("Final user groups for display:", finalGroups);
          setUserGroups(finalGroups);
        }
      }
    } catch (error) {
      console.error("Error loading survey details from localStorage:", error);
    }
  }, []);

  const handleToggleSelect = (appraiseeId: string) => {
    setSelectedReports((prev) => {
      const next = new Set(prev);
      if (next.has(appraiseeId)) {
        next.delete(appraiseeId);
      } else {
        next.add(appraiseeId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedReports.size === userGroups.length) {
      setSelectedReports(new Set());
    } else {
      const allIds = userGroups.map((group) => group.appraisee.id);
      setSelectedReports(new Set(allIds));
    }
  };

  const handlePreviewReport = (userId: string, appraiseeId: string) => {
    console.log(
      "Preview report for user:",
      userId,
      "in appraisee group:",
      appraiseeId
    );

    // Always store the appraisee ID (not the clicked user's ID) for the report component to use
    localStorage.setItem("selectedAppraiseeId", appraiseeId);

    // Get surveyId from localStorage
    try {
      const surveyDetailsRaw = localStorage.getItem("SurveyDetails");
      if (surveyDetailsRaw) {
        const surveyDetailsData = JSON.parse(surveyDetailsRaw);
        let currentSurveyId = null;

        // Extract survey ID from the response
        if (Array.isArray(surveyDetailsData) && surveyDetailsData.length > 0) {
          currentSurveyId =
            surveyDetailsData[0].id || surveyDetailsData[0].surveyId;
        } else if (surveyDetailsData && typeof surveyDetailsData === "object") {
          currentSurveyId = surveyDetailsData.id || surveyDetailsData.surveyId;
        }

        if (currentSurveyId) {
          // Navigate to the feedback report page with both surveyId and appraiseeId
          navigate(
            `/feedback-report?surveyId=${currentSurveyId}&appraiseeId=${appraiseeId}`
          );
        } else {
          console.error("Survey ID not found in localStorage");
          alert("Survey ID not found. Please try again.");
        }
      } else {
        console.error("SurveyDetails not found in localStorage");
        alert("Survey details not found. Please try again.");
      }
    } catch (error) {
      console.error("Error parsing survey details:", error);
      alert("Error loading survey details. Please try again.");
    }
  };

  const handleDownloadAllReports = () => {
    console.log("Download all reports");
    // TODO: Implement download all reports functionality
    alert("Downloading all reports...");
  };

  const handlePrevious = () => {
    console.log("Previous button clicked");
    navigate("/preview-participants");
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav
          position={user?.role || "Current Projects"}
          title="Current Projects"
        />

        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              {projectName}
            </h2>
            <div className="flex gap-3">
              <Button
                variant="previous"
                className="font-semibold text-md flex items-center justify-center px-6 py-5"
                onClick={handlePrevious}
              >
                Previous
              </Button>
              <Button
                variant="next"
                className="font-semibold text-md flex items-center justify-center px-6 py-5"
                onClick={() => alert("Next step")}
              >
                Download All Reports
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Participants
              </h3>

              {/* Download All Reports Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedReports.size === userGroups.length &&
                      userGroups.length > 0
                    }
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 accent-[#ee3f40] cursor-pointer rounded"
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    Download All Reports
                  </span>
                </div>
                <button
                  onClick={handleDownloadAllReports}
                  className="text-[#ee3f40] hover:text-red-600 transition-colors"
                  disabled={selectedReports.size === 0}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div className="space-y-4">
              {userGroups.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  No participants found
                </div>
              ) : (
                userGroups.map((group) => (
                  <div
                    key={group.groupId}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Group Header */}
                    <div className="px-6 py-3 border-b border-gray-100">
                      <h4 className="text-md font-medium text-gray-700">
                        {group.groupName}
                      </h4>
                    </div>

                    {/* Appraisee Section */}
                    <div className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="#6b7280"
                            className="w-6 h-6"
                          >
                            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 1120 0v1H2v-1z" />
                          </svg>
                        </div>

                        {/* Name and Designation */}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-lg">
                            {group.appraisee.name}
                            <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Appraisee
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {group.appraisee.designation}
                          </div>
                          <div className="text-xs text-gray-500">
                            {group.appraisee.email}
                          </div>
                        </div>

                        {/* Preview Report Button */}
                        <button
                          onClick={() =>
                            handlePreviewReport(
                              group.appraisee.id,
                              group.appraisee.id
                            )
                          }
                          className="border border-[#ee3f40] text-[#ee3f40] hover:bg-red-50 px-6 py-2 rounded-full font-medium transition-colors"
                        >
                          Preview Report
                        </button>

                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedReports.has(group.appraisee.id)}
                          onChange={() =>
                            handleToggleSelect(group.appraisee.id)
                          }
                          className="w-4 h-4 accent-[#ee3f40] cursor-pointer rounded"
                        />
                      </div>

                      {/* Appraisers Section */}
                      {group.appraisers && group.appraisers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-600 mb-3">
                            Appraisers ({group.appraisers.length})
                          </h5>
                          <div className="flex flex-col justify-between ">
                            {group.appraisers.map((appraiser, index) => (
                              <div
                                key={appraiser.id}
                                className="flex items-center gap-3 px-3 py-5 bg-gray-50 rounded-lg w-full mb-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="#6b7280"
                                    className="w-4 h-4"
                                  >
                                    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 1120 0v1H2v-1z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-800 truncate">
                                    {appraiser.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {appraiser.designation}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
