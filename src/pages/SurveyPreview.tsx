import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageNav from "../components/ui/pageNav";
import { createSurveyAll, createSurveyUserRecords } from "../lib/apiService";
import { sendBulkEmails } from "../lib/mailService";
import type { BulkEmailRecipient } from "../lib/mailService";

interface SurveyData {
  survey: {
    surveyName: string;
    projectId: string;
  };
  questions: {
    questionId: string;
  }[];
  users: {
    userId: string;
    appraiser: boolean;
    role: string;
  }[];
}

const SurveyPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for submission
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // State for competency navigation
  const [currentCompetencyIndex, setCurrentCompetencyIndex] = useState(0);

  // Data passed from SurvayScratch via location.state
  const templatePreviews = location.state?.templatePreviews || [];
  const surveyName = location.state?.surveyName || "";

  // Current competency based on index
  const currentCompetency = templatePreviews[currentCompetencyIndex];
  const totalCompetencies = templatePreviews.length;

  // Create survey from localStorage function
  const createSurveyFromLocalStorage = useCallback((): SurveyData | null => {
    try {
      const projectData = JSON.parse(localStorage.getItem("Project") || "{}");
      const questionsData = JSON.parse(
        localStorage.getItem("savedQuestions") || "[]"
      );
      const surveyUsersData = JSON.parse(
        localStorage.getItem("SurveyUsers") || "[]"
      );

      if (
        !projectData.id ||
        questionsData.length === 0 ||
        surveyUsersData.length === 0
      ) {
        console.error("Missing required data in localStorage");
        console.log("Project data:", projectData);
        console.log("Questions data:", questionsData);
        console.log("Survey Users data:", surveyUsersData);
        return null;
      }

      const questions = questionsData.map((q: any) => ({
        questionId: q.questionId,
      }));

      const users: SurveyData["users"] = [];

      // Process Survey Users data
      surveyUsersData.forEach((userGroup: any) => {
        // Add appraisee (the person being evaluated)
        if (userGroup.appraisee) {
          users.push({
            userId: userGroup.appraisee.id,
            appraiser: false,
            role:
              userGroup.appraisee.role ||
              userGroup.appraisee.designation ||
              "Employee",
          });
        }

        // Add appraisers (the people doing the evaluation)
        if (userGroup.appraisers && Array.isArray(userGroup.appraisers)) {
          userGroup.appraisers.forEach((appraiser: any) => {
            users.push({
              userId: appraiser.id,
              appraiser: true,
              role: appraiser.role || appraiser.designation || "Appraiser",
            });
          });
        }
      });

      // Remove duplicates based on userId
      const uniqueUsers = users.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.userId === user.userId)
      );

      return {
        survey: {
          surveyName: surveyName || "360 Feedback Survey",
          projectId: projectData.id,
        },
        questions,
        users: uniqueUsers,
      };
    } catch (error) {
      console.error("Error creating survey from localStorage:", error);
      return null;
    }
  }, [surveyName]);

  // Extract email recipients grouped by user group from localStorage
  const getEmailRecipientsByGroup = useCallback(() => {
    try {
      const surveyUsersData = JSON.parse(
        localStorage.getItem("SurveyUsers") || "[]"
      );
      const createdUsers = JSON.parse(
        localStorage.getItem("createdUsers") || "[]"
      );
      const companyUsers = JSON.parse(
        localStorage.getItem("CompanyUsers") || "[]"
      );

      // Create a mapping of user IDs to user details
      const userDetailsMap = new Map<string, any>();

      // First try createdUsers (most reliable source)
      createdUsers.forEach((user: any) => {
        if (user.id || user._id || user.manageUserId) {
          const userId = user.id || user._id || user.manageUserId;
          userDetailsMap.set(userId, user);
        }
      });

      // Fallback to companyUsers if createdUsers is empty
      if (userDetailsMap.size === 0 && companyUsers.length > 0) {
        companyUsers.forEach((user: any) => {
          if (user.id) {
            userDetailsMap.set(user.id, user);
          }
        });
      }

      // Group recipients by user group (each group represents a separate evaluation)
      const recipientGroups: Array<{
        recipients: BulkEmailRecipient[];
        appraiseeInfo: { name: string; email: string; id: string };
      }> = [];

      // Process each user group separately
      surveyUsersData.forEach((userGroup: any, groupIndex: number) => {
        const groupRecipients: BulkEmailRecipient[] = [];
        let appraiseeInfo = null;

        // Add appraisee
        if (userGroup.appraisee) {
          const userDetails = userDetailsMap.get(userGroup.appraisee.id);
          if (userDetails && userDetails.email) {
            const name =
              userDetails.firstName && userDetails.lastName
                ? `${userDetails.firstName} ${userDetails.lastName}`
                : userDetails.username || userDetails.email.split("@")[0];

            appraiseeInfo = {
              name,
              email: userDetails.email,
              id: userGroup.appraisee.id,
            };

            groupRecipients.push({
              [name]: userDetails.email,
            });
          }
        }

        // Add appraisers
        if (userGroup.appraisers && Array.isArray(userGroup.appraisers)) {
          userGroup.appraisers.forEach((appraiser: any) => {
            const userDetails = userDetailsMap.get(appraiser.id);
            if (userDetails && userDetails.email) {
              const name =
                userDetails.firstName && userDetails.lastName
                  ? `${userDetails.firstName} ${userDetails.lastName}`
                  : userDetails.username || userDetails.email.split("@")[0];

              groupRecipients.push({
                [name]: userDetails.email,
              });
            }
          });
        }

        // Only add group if it has recipients and appraisee info
        if (groupRecipients.length > 0 && appraiseeInfo) {
          recipientGroups.push({
            recipients: groupRecipients,
            appraiseeInfo,
          });
          console.log(
            `User Group ${groupIndex + 1}: ${
              groupRecipients.length
            } recipients for ${appraiseeInfo.name}'s evaluation`
          );
        }
      });

      console.log(
        `Total groups: ${recipientGroups.length}, Total emails to send: ${recipientGroups.reduce(
          (sum, group) => sum + group.recipients.length,
          0
        )}`
      );
      return recipientGroups;
    } catch (error) {
      console.error("Error extracting email recipients by group:", error);
      return [];
    }
  }, []);

  // Navigation helper functions
  const handlePrevious = () => {
    if (currentCompetencyIndex > 0) {
      setCurrentCompetencyIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentCompetencyIndex < totalCompetencies - 1) {
      setCurrentCompetencyIndex((prev) => prev + 1);
    }
  };

  // Function to clear all localStorage except token and userData
  const clearSurveyLocalStorage = useCallback(() => {
    const itemsToKeep = ["token", "userData"];
    const itemsToRemove = [
      "Company",
      "CompanyFormData",
      "CompanyUsers",
      "Project",
      "SurveyResponse",
      "SurveyUsers",
      "SurveyUsersResponse",
      "loglevel",
      "savedQuestions",
      "surveyCreationData",
      "createdUsers",
    ];

    // Remove specific survey-related items
    itemsToRemove.forEach((item) => {
      localStorage.removeItem(item);
    });

    // Also remove any other items not in the keep list (except token and userData)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach((key) => {
      if (!itemsToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    console.log("Survey-related localStorage items cleared successfully");
  }, []);

  // Handle creating survey data
  const handleCreateSurveyData = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate that survey is ready for submission
      if (templatePreviews.length === 0) {
        throw new Error(
          "Please add at least one competency with questions before submitting."
        );
      }

      if (!surveyName.trim()) {
        throw new Error("Please enter a survey name before submitting.");
      }

      const surveyData = createSurveyFromLocalStorage();
      if (!surveyData) {
        throw new Error(
          "Failed to create survey data from localStorage. Please ensure all required data is saved."
        );
      }

      console.log("Sending Survey Data to API:", surveyData);
      const response = await createSurveyAll(surveyData);
      console.log("Survey creation response:", response);

      localStorage.setItem("SurveyResponse", JSON.stringify(response));

      // Extract survey ID from response.data field
      const surveyId = response?.data;
      console.log("Extracted survey ID from response.data:", surveyId);

      if (!surveyId) {
        console.error(
          "Survey ID not found in response.data. Full response:",
          response
        );
        throw new Error(
          "Survey was created but survey ID could not be extracted for email notifications."
        );
      }

      // Create Survey Users after successful survey creation
      try {
        // Transform surveyData.users to match MongoDB document structure
        const surveyUserRecords = surveyData.users.map((user) => ({
          surveyId: surveyId, // Use the survey ID from response
          userId: user.userId,
          appraiser: user.appraiser,
          role: user.role,
        }));

        console.log("Creating Survey Users with records:", surveyUserRecords);
        const surveyUsersResponse =
          await createSurveyUserRecords(surveyUserRecords);
        console.log("Survey Users creation response:", surveyUsersResponse);

        // Store the Survey Users response
        localStorage.setItem(
          "SurveyUsersResponse",
          JSON.stringify(surveyUsersResponse)
        );
      } catch (surveyUsersError) {
        console.error("Error creating Survey Users:", surveyUsersError);
        // Don't throw error here - continue with email sending even if Survey Users creation fails
        console.warn(
          "Survey created successfully but Survey Users creation failed"
        );
      }

      // Send emails to participants for each user group separately
      try {
        const recipientGroups = getEmailRecipientsByGroup();
        if (recipientGroups.length > 0) {
          console.log(
            `Sending invitation emails for ${recipientGroups.length} evaluation groups...`
          );
          console.log("Survey ID being passed to email service:", surveyId);

          // Generate base survey link
          const baseSurveyLink = `${window.location.origin}/survey/participate`;
          console.log("Base survey link:", baseSurveyLink);

          let totalEmailsSent = 0;
          const emailPromises = recipientGroups.map(
            async (group, groupIndex) => {
              console.log(
                `Sending emails for Group ${groupIndex + 1}: ${group.appraiseeInfo.name}'s evaluation to ${group.recipients.length} participants`
              );

              await sendBulkEmails(
                group.recipients,
                `${surveyData.survey.surveyName} - ${group.appraiseeInfo.name}'s Evaluation`,
                surveyData.users,
                baseSurveyLink,
                surveyId
              );

              totalEmailsSent += group.recipients.length;
              return group.recipients.length;
            }
          );

          // Wait for all email groups to be sent
          await Promise.all(emailPromises);

          console.log(
            `All invitation emails sent successfully! Total: ${totalEmailsSent} emails for ${recipientGroups.length} evaluation groups`
          );

          alert(
            `🎉 Survey submitted successfully!\n\n` +
              `Survey Name: ${surveyData.survey.surveyName}\n` +
              `Project ID: ${surveyData.survey.projectId}\n` +
              `Questions: ${surveyData.questions.length}\n` +
              `Users: ${surveyData.users.length}\n` +
              `Evaluation Groups: ${recipientGroups.length}\n` +
              `Total invitation emails sent: ${totalEmailsSent}\n\n` +
              `Each user group has received separate emails for their specific evaluation. Users participating in multiple evaluations will receive multiple emails.`
          );
        } else {
          console.warn(
            "No email recipient groups found, skipping email notifications"
          );
          alert(
            `🎉 Survey submitted successfully!\n\n` +
              `Survey Name: ${surveyData.survey.surveyName}\n` +
              `Project ID: ${surveyData.survey.projectId}\n` +
              `Questions: ${surveyData.questions.length}\n` +
              `Users: ${surveyData.users.length}\n\n` +
              `⚠️ Note: No email addresses found for participants. Please notify them manually.`
          );
        }
      } catch (emailError) {
        console.error("Error sending invitation emails:", emailError);
        // Still show success message for survey creation, but warn about email failure
        alert(
          `🎉 Survey submitted successfully!\n\n` +
            `Survey Name: ${surveyData.survey.surveyName}\n` +
            `Project ID: ${surveyData.survey.projectId}\n` +
            `Questions: ${surveyData.questions.length}\n` +
            `Users: ${surveyData.users.length}\n\n` +
            `⚠️ Warning: Survey created but failed to send invitation emails. Please notify participants manually.`
        );
      }

      // Clear all survey-related localStorage items after successful completion
      clearSurveyLocalStorage();

      // Navigate back to surveys or dashboard
      navigate("/");
    } catch (error: any) {
      console.error("Error creating survey:", error);
      setSaveError(
        error.message || "Failed to submit survey. Please try again."
      );
      alert(`❌ Failed to submit survey:\n\n${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    createSurveyFromLocalStorage,
    getEmailRecipientsByGroup,
    templatePreviews.length,
    surveyName,
    navigate,
    clearSurveyLocalStorage,
  ]);

  if (!currentCompetency || templatePreviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">No preview data available.</div>
      </div>
    );
  }

  return (
    <div className=" flex flex-col">
      <PageNav position="HR Manager" title="Preview Survey" />

      {/* Main Content */}
      <div className="py-20 bg-white flex items-center justify-center">
        <div className="">
          {/* Action Buttons at Top */}
          <div className="flex justify-end w-full mb-4 gap-3 px-4">
            <button
              className="bg-gray-400 hover:bg-gray-500 text-white rounded-full px-6 py-2 font-semibold"
              onClick={() => navigate(-1)}
            >
              Back to Edit
            </button>
            <button
              className="bg-[#ed3f41] hover:bg-[#d23539] text-white font-semibold px-4 py-2 rounded-full"
              onClick={handleCreateSurveyData}
              disabled={isSaving || templatePreviews.length === 0}
            >
              {isSaving ? "Submitting..." : "Finish Survey"}
            </button>
          </div>
          <div className="max-w-4xl mx-auto px-4">
            {/* Survey Preview Form */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Competency Header */}
              <div className="bg-green-700 px-10 py-8">
                <h3 className="text-white font-bold text-2xl mb-2">
                  {currentCompetency.competency}
                </h3>
                <p className="text-white text-md opacity-90">
                  {currentCompetency.description || "No description provided."}
                </p>
              </div>

              {/* Questions */}
              <div className="p-8 space-y-8">
                {currentCompetency.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-xl leading-relaxed">
                      {idx + 1}. {q.text}
                    </h4>

                    {q.type === "open-ended" ? (
                      <div className="mt-4">
                        <textarea
                          className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[100px] focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your response here..."
                          rows={4}
                          disabled
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-4 mb-8">
                        {q.options.map((option: string, oidx: number) => (
                          <label
                            key={oidx}
                            className="flex flex-col items-center space-y-2 cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name={`q${q.id}`}
                              className="w-5 h-5 text-green-700 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                              disabled
                            />
                            <span className="text-sm font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 flex justify-between items-center border-t">
                <button
                  onClick={handlePrevious}
                  disabled={currentCompetencyIndex === 0}
                  className={`px-6 py-2 font-semibold rounded-full ${
                    currentCompetencyIndex === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-600">
                  {currentCompetencyIndex + 1} of {totalCompetencies}{" "}
                  Competencies
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentCompetencyIndex === totalCompetencies - 1}
                  className={`px-6 py-2 font-semibold rounded-full ${
                    currentCompetencyIndex === totalCompetencies - 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-700 hover:bg-green-800 text-white"
                  }`}
                >
                  Next
                </button>
              </div>

              {/* Error Display */}
              {saveError && (
                <div className="px-8 pb-4">
                  <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    {saveError}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Info */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Preview • {currentCompetency.competency} •{" "}
              {currentCompetency.questions.length} Questions • Step{" "}
              {currentCompetencyIndex + 1} of {totalCompetencies}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
