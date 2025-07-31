interface CompletionPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const CompletionPopup = ({ isVisible, onClose }: CompletionPopupProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 ease-out"
        style={{
          animation: isVisible
            ? "popupSlideIn 0.5s ease-out forwards"
            : "popupSlideOut 0.3s ease-in forwards",
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl opacity-5 animate-pulse"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8 text-center">
          {/* Animated success icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white transform transition-all duration-700 ease-out"
                style={{
                  animation: "checkmarkDraw 0.8s ease-out 0.3s forwards",
                  opacity: 0,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: "30",
                    strokeDashoffset: "30",
                    animation: "checkmarkDraw 0.8s ease-out 0.3s forwards",
                  }}
                />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 transform transition-all duration-500 delay-300">
              🎉 Feedback Plan Completed!
            </h2>
            <div className="space-y-2">
              <p className="text-lg text-gray-700 font-medium transform transition-all duration-500 delay-400">
                Your 360° feedback project has been successfully created
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transform transition-all duration-500 delay-500">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800">
                      Automated Email Notifications Sent
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      All participants have been notified automatically. No
                      manual intervention required!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes popupSlideOut {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.9);
          }
        }

        @keyframes checkmarkDraw {
          0% {
            stroke-dashoffset: 30;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CompletionPopup;
