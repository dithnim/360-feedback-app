import { Button } from "../components/ui/Button";
import PublicNavbar from "../components/PublicNavbar";
import { useNavigate } from "react-router-dom";

const SurveyThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar title="Survey Complete" />

      <div className="flex items-center justify-center py-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Thank You!
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your feedback has been successfully submitted. We appreciate your
              time and valuable input in helping us improve our 360-degree
              feedback process.
            </p>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Your responses are confidential and will be used to generate
                comprehensive feedback reports.
              </p>
            </div>

            {/* Action Button */}
            <Button variant="success" className="w-full py-3">
              Close Survey
            </Button>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6">
              If you have any questions about this survey, please contact your
              HR department. You can close this window now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyThankYou;
