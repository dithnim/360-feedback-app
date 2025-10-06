import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import PublicNavbar from "../components/PublicNavbar";
import { apiGet, apiPost, apiClient } from "@/lib/apiService";
import { useUser } from "../context/UserContext";
// import { getSurveyByToken, submitSurveyResponse } from "../lib/apiService";
// import type { Survey, SurveyResponse as APISurveyResponse } from "../lib/apiService";

interface SurveyResponse {
  questionId: number;
  answer: string;
}

const SurveyParticipation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyData, setSurveyData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get survey token and userId from URL parameters
  const surveyToken = searchParams.get("token") || "demo-token";
  const userIdFromUrl = searchParams.get("userId");

  useEffect(() => {
    const fetchSurveyData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const surveyQuestions = await getSurveyByToken(surveyToken);
        setSurveyData(surveyQuestions);
      } catch (error) {
        console.error("Error fetching survey:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load survey"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurveyData();
  }, [surveyToken]);

  const getSurveyByToken = async (token: string) => {
    try {
      // Use the token from URL as the surveyId
      const surveyId = token;

      // Step 1: Get all question IDs for the survey
      const surveyQuestions = await apiClient.getPublic<
        Array<{
          _id: string;
          surveyId: string;
          questionId: string;
        }>
      >(`/survey/${surveyId}/question`);

      // Step 2: Fetch individual question details for each questionId
      const questionDetailsPromises = surveyQuestions.map((sq) =>
        apiClient.getPublic<{
          id: string;
          competencyId: string;
          question: string;
          optionType: string;
          options: string[] | null;
        }>(`/question/${sq.questionId}`)
      );

      const questionDetails = await Promise.all(questionDetailsPromises);

      // Step 3: Fetch competency names for unique competencyIds
      const uniqueCompetencyIds = Array.from(
        new Set(questionDetails.map((q) => q.competencyId))
      );

      // Fetch all competency objects in parallel. If any fails, continue with fallback naming.
      const competencyEntries = await Promise.all(
        uniqueCompetencyIds.map(async (id) => {
          try {
            const comp = await apiClient.getPublic<{
              id: string;
              competency: string;
            }>(`/competency/${id}`);
            return [id, comp.competency] as const;
          } catch (e) {
            console.warn(`Failed to fetch competency ${id}:`, e);
            return [id, `${id.slice(-6)}`] as const; // fallback
          }
        })
      );

      const competencyNameMap = Object.fromEntries(competencyEntries) as Record<
        string,
        string
      >;

      // Transform the combined data to match the expected format
      const transformedData = transformApiDataToSurveyFormat(
        questionDetails,
        competencyNameMap
      );
      return transformedData;
    } catch (error) {
      throw new Error(
        `The survey you are trying to access is not available..!`
      );
    }
  };

  // Helper function to transform API data to the expected survey format
  const transformApiDataToSurveyFormat = (
    questionDetails: Array<{
      id: string;
      competencyId: string;
      question: string;
      optionType: string;
      options: string[] | null;
    }>,
    competencyNameMap: Record<string, string>
  ) => {
    // Group questions by competency
    const competencyMap = new Map();

    questionDetails.forEach((questionDetail) => {
      const competencyId = questionDetail.competencyId;

      if (!competencyMap.has(competencyId)) {
        competencyMap.set(competencyId, {
          id: competencyId,
          name:
            competencyNameMap[competencyId] ||
            `${competencyId.slice(-6)}` ||
            "Competency",
          description: `Assessment for competency ${competencyNameMap[competencyId] || competencyId.slice(-6)}`,
          questions: [],
        });
      }

      // Determine options based on optionType
      let options: string[];
      if (questionDetail.options && questionDetail.options.length > 0) {
        options = questionDetail.options;
      } else if (questionDetail.optionType === "single") {
        options = [
          "Strongly Agree",
          "Agree",
          "Neutral",
          "Disagree",
          "Strongly Disagree",
        ];
      } else {
        // Default fallback options
        options = ["Excellent", "Good", "Average", "Below Average", "Poor"];
      }

      competencyMap.get(competencyId).questions.push({
        id: questionDetail.id,
        text: questionDetail.question,
        options: options,
        optionType: questionDetail.optionType,
      });
    });

    return {
      id: "survey-123", // You might want to use the actual surveyId here
      title: "360 Degree Feedback Survey",
      employee: "Survey Participant", // This should be fetched from user data
      competencies: Array.from(competencyMap.values()),
    };
  };

  const currentCompetency = surveyData?.competencies[currentStep];
  const totalSteps = surveyData?.competencies.length || 0;

  const handleResponseChange = (questionId: number, answer: string) => {
    setResponses((prev) => {
      const existingIndex = prev.findIndex((r) => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, answer };
        return updated;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const getResponse = (questionId: number): string => {
    const response = responses.find((r) => r.questionId === questionId);
    return response?.answer || "";
  };

  const isCurrentStepComplete = () => {
    if (!currentCompetency) return false;
    return currentCompetency.questions.every((q: any) =>
      responses.some((r) => r.questionId === q.id && r.answer)
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getProjectId = async (surveyId: string): Promise<string> => {
    try {
      const surveyProject = await apiClient.getPublic<{
        id: string;
        surveyName: string;
        projectId: string;
        createdDate: string;
      }>(`/project/survey/${surveyId}`);
      return surveyProject.projectId;
    } catch (error) {
      console.error("Error fetching project ID:", error);
      throw new Error(
        `Failed to fetch project ID: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const createAnswerSheet = async (projectId: string) => {
    // Get userId from URL parameter, fallback to authenticated user, or throw error
    const userId = userIdFromUrl || user?.id;

    if (!userId) {
      throw new Error(
        "User ID is required to create answer sheet. Please ensure you are logged in or the userId is provided in the URL."
      );
    }

    return apiClient.postPublic<{ id: string }>("/survey/answer/sheet", {
      surveyId: surveyToken,
      projectId,
      userId,
    });
  };

  // Function to convert text answers to numerical values (1-5)
  const convertAnswerToNumerical = (answer: string): number => {
    // Map common Likert scale responses to numbers
    const answerMap: { [key: string]: number } = {
      "Strongly Agree": 5,
      Agree: 4,
      Neutral: 3,
      Disagree: 2,
      "Strongly Disagree": 1,
      Excellent: 5,
      Good: 4,
      Average: 3,
      "Below Average": 2,
      Poor: 1,
    };

    return answerMap[answer] || 3; // Default to 3 (neutral) if not found
  };

  const createAnswers = async (answerSheetId: string) => {
    if (!surveyData) return;

    // Build a lookup for questionId -> optionType
    const optionTypeByQuestionId = new Map<string, string>();
    surveyData.competencies.forEach((comp: any) => {
      comp.questions.forEach((q: any) => {
        optionTypeByQuestionId.set(String(q.id), q.optionType || "single");
      });
    });

    const answerPromises = responses.map((response) => {
      const questionIdStr = String(response.questionId);
      const optionType = optionTypeByQuestionId.get(questionIdStr) || "single";

      // Shape payload according to backend contract
      const payload: any =
        optionType === "multiple"
          ? {
              answerSheetId,
              questionId: questionIdStr,
              answerType: "multiple",
              multiple: Array.isArray((response as any).multiple)
                ? (response as any).multiple
                : response.answer
                  ? [response.answer]
                  : [],
              answer: null,
            }
          : {
              answerSheetId,
              questionId: questionIdStr,
              answerType: "likert",
              multiple: null,
              answer: convertAnswerToNumerical(response.answer),
            };

      return apiClient.postPublic("/survey/answer", payload);
    });

    await Promise.all(answerPromises);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First get the project ID
      const projectId = await getProjectId(surveyToken);

      // Then create the answer sheet with project ID
      const answerSheet = await createAnswerSheet(projectId);

      const createdId =
        typeof answerSheet === "string"
          ? answerSheet
          : (answerSheet as { id: string }).id;

      console.log("Created answer sheet:", answerSheet);

      await createAnswers(createdId);

      navigate("/survey-thank-you");
    } catch (error) {
      console.error("Error submitting survey:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PublicNavbar
        title={surveyData?.title || "360 Degree Feedback Survey"}
        showProgress={true}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        employee={surveyData?.employee}
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="">
          <div className="max-w-4xl mx-auto px-4">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading survey...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Error Loading Survey
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2"
                >
                  Retry
                </Button>
              </div>
            ) : !surveyData || !currentCompetency ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-600">No survey data available.</p>
              </div>
            ) : (
              /* Survey Form */
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Competency Header */}
                <div className="bg-green-700 px-10 py-8">
                  <h3 className="text-white font-bold text-2xl mb-2">
                    {currentCompetency.name}
                  </h3>
                  <p className="text-white text-md opacity-90">
                    {currentCompetency.description}
                  </p>
                </div>

                {/* Questions */}
                <div className="p-8 space-y-8">
                  {currentCompetency.questions.map(
                    (question: any, index: number) => (
                      <div key={question.id} className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-xl leading-relaxed">
                          {index + 1}. {question.text}
                        </h4>

                        <div className="grid grid-cols-5 gap-4 mb-8">
                          {question.options.map((option: string) => (
                            <label
                              key={option}
                              className="flex flex-col items-center space-y-2 cursor-pointer group"
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={getResponse(question.id) === option}
                                onChange={(e) =>
                                  handleResponseChange(
                                    question.id,
                                    e.target.value
                                  )
                                }
                                className="w-5 h-5 text-green-700 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                              />
                              <span className="text-mc font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Navigation */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                  <Button
                    variant="previous"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 ${
                      currentStep === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-500 hover:bg-gray-600 text-white"
                    }`}
                  >
                    PREVIOUS
                  </Button>

                  {currentStep < totalSteps - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isCurrentStepComplete()}
                      className={`px-6 py-2 ${
                        isCurrentStepComplete()
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      NEXT
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isCurrentStepComplete() || isSubmitting}
                      className={`px-6 py-2 ${
                        isCurrentStepComplete() && !isSubmitting
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Progress Info */}
            {surveyData && currentCompetency && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Step {currentStep + 1} of {totalSteps} •{" "}
                {currentCompetency.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SurveyParticipation;
