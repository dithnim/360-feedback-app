import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageNav from "../components/ui/pageNav";
import { createSurveyAll } from "../lib/apiService";

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

  // Data passed from SurvayScratch via location.state
  const templatePreviews = location.state?.templatePreviews || [];
  const surveyName = location.state?.surveyName || "";

  // For this preview, show the first competency (can be extended for multi-step)
  const competency = templatePreviews[0];

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

      alert(
        `🎉 Survey submitted successfully!\n\n` +
          `Survey Name: ${surveyData.survey.surveyName}\n` +
          `Project ID: ${surveyData.survey.projectId}\n` +
          `Questions: ${surveyData.questions.length}\n` +
          `Users: ${surveyData.users.length}\n\n` +
          `The survey has been created and is ready for participants.`
      );

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
    templatePreviews.length,
    surveyName,
    navigate,
  ]);

  if (!competency) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">No preview data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row">
      <div className="flex-1 flex flex-col min-h-screen">
        <PageNav position="HR Manager" title="Preview Survey" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center py-8">
          <div className="w-full  bg-white rounded-xl  p-8">
            {/* Competency Header */}
            <div className="rounded-t-lg bg-green-700 px-6 py-4">
              <div className="text-white font-bold text-lg">
                {competency.competency}
              </div>
              <div className="text-white text-sm mt-1">
                {competency.description || "No description provided."}
              </div>
            </div>
            <div className="bg-white px-6 py-8 rounded-b-lg border border-t-0">
              {competency.questions.map((q: any, idx: number) => (
                <div key={q.id} className="mb-8">
                  <div className="font-medium mb-2">
                    {idx + 1}. {q.text}
                  </div>
                  <div className="flex flex-wrap gap-6 mb-2">
                    {q.options.map((opt: string, oidx: number) => (
                      <label key={oidx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q${q.id}`}
                          className="accent-green-700"
                          disabled
                        />
                        <span className="font-semibold text-gray-700">
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  {/* Last question gets a comment box */}
                  {idx === competency.questions.length - 1 && (
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg p-2 w-full mt-2"
                      placeholder="Add a comment..."
                      disabled
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-between mt-8">
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 font-semibold"
                  onClick={() => navigate(-1)}
                >
                  Back to Edit
                </button>
                <button
                  className="bg-[#ed3f41] hover:bg-[#d23539] text-white font-semibold px-4 py-2 rounded-lg"
                  onClick={handleCreateSurveyData}
                  disabled={isSaving || templatePreviews.length === 0}
                >
                  {isSaving ? "Submitting..." : "Submit Survey"}
                </button>
              </div>
              {saveError && (
                <div className="text-red-600 mt-2">{saveError}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SurveyPreview;
