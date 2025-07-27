import { useLocation, useNavigate } from "react-router-dom";
import PageNav from "../components/ui/pageNav";

const SurveyPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from SurvayScratch via location.state
  const templatePreviews = location.state?.templatePreviews || [];
  // For this preview, show the first competency (can be extended for multi-step)
  const competency = templatePreviews[0];

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
                  Previous
                </button>
                <button
                  className="bg-green-700 hover:bg-green-800 text-white rounded px-6 py-2 font-semibold"
                  disabled
                >
                  NEXT
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SurveyPreview;
