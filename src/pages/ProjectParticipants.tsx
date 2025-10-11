import React, { useEffect, useState } from "react";
import PageNav from "../components/ui/pageNav";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";

type UserGroup = {
  groupId: string;
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

        let userDetails: any[] = [];

        // Extract userDetails from the survey details response
        if (Array.isArray(surveyDetailsData) && surveyDetailsData.length > 0) {
          // Response is an array of survey objects
          const surveyData = surveyDetailsData[0];
          if (surveyData.userDetails && Array.isArray(surveyData.userDetails)) {
            userDetails = surveyData.userDetails;
          }
        } else if (
          surveyDetailsData.userDetails &&
          Array.isArray(surveyDetailsData.userDetails)
        ) {
          // Response is a single survey object
          userDetails = surveyDetailsData.userDetails;
        }

        console.log("Extracted user details:", userDetails);

        // Transform all users into display groups
        if (userDetails.length > 0) {
          const finalGroups: UserGroup[] = userDetails.map(
            (user: any, index: number) => ({
              groupId: `group-${index}`,
              appraisee: {
                id: user._id || user.id || `user-${index}`,
                name: user.name || `User ${index + 1}`,
                email: user.email || `user${index + 1}@example.com`,
                designation: user.designation || user.role || "Employee",
                role: user.role,
              },
              appraisers: [],
            })
          );

          console.log("Displaying all users from survey details:", finalGroups);
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

  const handlePreviewReport = (appraiseeId: string) => {
    console.log("Preview report for:", appraiseeId);
    navigate(`/view-project?participantId=${encodeURIComponent(appraiseeId)}`);
  };

  const handleDownloadAllReports = () => {
    console.log("Download all reports");
    // TODO: Implement download all reports functionality
    alert("Downloading all reports...");
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav position="Current Projects" title="Current Projects" />

        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-8">
              {projectName}
            </h2>

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
            <div className="space-y-3">
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
                    <div className="flex items-center gap-4 px-6 py-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#fff"
                          className="w-6 h-6"
                        >
                          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 1120 0v1H2v-1z" />
                        </svg>
                      </div>

                      {/* Name and Designation */}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-lg">
                          {group.appraisee.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {group.appraisee.designation}
                        </div>
                      </div>

                      {/* Preview Report Button */}
                      <button
                        onClick={() => handlePreviewReport(group.appraisee.id)}
                        className="border border-[#ee3f40] text-[#ee3f40] hover:bg-red-50 px-6 py-2 rounded-full font-medium transition-colors"
                      >
                        Preview Report
                      </button>

                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedReports.has(group.appraisee.id)}
                        onChange={() => handleToggleSelect(group.appraisee.id)}
                        className="w-4 h-4 accent-[#ee3f40] cursor-pointer rounded"
                      />
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
