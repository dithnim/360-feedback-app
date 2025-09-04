import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import PublicNavbar from "../components/PublicNavbar";
// import { getSurveyByToken, submitSurveyResponse } from "../lib/apiService";
// import type { Survey, SurveyResponse as APISurveyResponse } from "../lib/apiService";

// Dummy survey data matching the design
const dummySurveyData = {
  id: "survey-123",
  title: "360 Degree Feedback Survey",
  employee: "Niro Yin",
  competencies: [
    {
      id: 1,
      name: "Communication",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo fugiat aut dolor voluptate velit eaque ex qui, ullam nec, potentiaque ex, pretium quis, elit.",
      questions: [
        {
          id: 1,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 2,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 3,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Leadership",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo fugiat aut dolor voluptate velit eaque ex qui, ullam nec, potentiaque ex, pretium quis, elit.",
      questions: [
        {
          id: 4,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 5,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 6,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Teamwork",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo fugiat aut dolor voluptate velit eaque ex qui, ullam nec, potentiaque ex, pretium quis, elit.",
      questions: [
        {
          id: 7,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 8,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
        {
          id: 9,
          text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam commodo?",
          options: [
            "Strongly Agree",
            "Agree",
            "Neutral",
            "Strongly Disagree",
            "Disagree",
          ],
        },
      ],
    },
  ],
};

interface SurveyResponse {
  questionId: number;
  answer: string;
}

const SurveyParticipation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get survey token from URL parameters (in real implementation)
  const surveyToken = searchParams.get("token") || "demo-token";

  useEffect(() => {
    // In real implementation, fetch survey data using the token
    // Example:
    // const fetchSurveyData = async () => {
    //   try {
    //     const surveyData = await getSurveyByToken(surveyToken);
    //     setSurveyData(surveyData);
    //   } catch (error) {
    //     console.error('Error fetching survey:', error);
    //   }
    // };
    // fetchSurveyData();
  }, [surveyToken]);

  const currentCompetency = dummySurveyData.competencies[currentStep];
  const totalSteps = dummySurveyData.competencies.length;

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
    return currentCompetency.questions.every((q) =>
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In real implementation, submit responses to API
      // await submitSurveyResponse(surveyToken, responses);
      console.log("Submitting survey responses:", responses);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to thank you page
      navigate("/survey-thank-you");
    } catch (error) {
      console.error("Error submitting survey:", error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar
        title={dummySurveyData.title}
        showProgress={true}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
        employee={dummySurveyData.employee}
      />

      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 bg-[#f8ba57]">
          {/* Survey Form */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Competency Header */}
            <div className="bg-green-700 px-6 py-4">
              <h3 className="text-white font-bold text-xl mb-2">
                {currentCompetency.name}
              </h3>
              <p className="text-white text-sm opacity-90">
                {currentCompetency.description}
              </p>
            </div>

            {/* Questions */}
            <div className="p-6 space-y-8">
              {currentCompetency.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <h4 className="font-semibold text-gray-800 text-lg leading-relaxed">
                    {index + 1}. {question.text}
                  </h4>

                  <div className="grid grid-cols-5 gap-4">
                    {question.options.map((option) => (
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
                            handleResponseChange(question.id, e.target.value)
                          }
                          className="w-5 h-5 text-green-700 border-2 border-gray-300 focus:ring-green-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700 text-center group-hover:text-green-700 transition-colors">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Add comment field for the last question */}
                  {index === currentCompetency.questions.length - 1 && (
                    <div className="mt-4">
                      <textarea
                        placeholder="Add a comment... (optional)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              ))}
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

              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i === currentStep
                        ? "bg-green-700"
                        : i < currentStep
                          ? "bg-green-500"
                          : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

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

          {/* Progress Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps} • {currentCompetency.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyParticipation;
