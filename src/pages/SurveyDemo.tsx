import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";

const SurveyDemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get data from query parameters with defaults
  const title = searchParams.get("title") || "360° Feedback Survey";
  const employee = searchParams.get("employee") || "Anonymous";
  const surveyId = searchParams.get("surveyId") || "SURVEY-001";
  const estimatedTime = searchParams.get("estimatedTime") || "10-15 minutes";

  const handleStartSurvey = () => {
    // Simulate accessing survey with a token
    navigate("/survey/participate?token=demo-survey-token-123");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">

      <div className="flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Logo */}
            <div className="mb-6">
              <img
                src="/imgs/dash-logo.png"
                alt="DAASH Global"
                className="w-60 mx-auto mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Survey Invitation */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {title}
              </h2>
              <p className="text-gray-600 mb-4">
                You have been invited to participate in a 360-degree feedback
                survey. Your feedback is valuable and will remain confidential.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Employee:</strong> {employee}
                  <br />
                  <strong>Survey ID:</strong> {surveyId}
                  <br />
                  <strong>Estimated Time:</strong> {estimatedTime}
                </p>
              </div>
            </div>

            {/* Start Survey Button */}
            <Button
              onClick={handleStartSurvey}
              variant="success"
              className="w-full py-3 mb-4"
            >
              Start Survey
            </Button>

            {/* Info */}
            <p className="text-xs text-gray-500">
              This survey is confidential and your responses will be used to
              provide constructive feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDemo;
