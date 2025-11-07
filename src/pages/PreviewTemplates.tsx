import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MailImg from "../../imgs/mail.png";
import PageNav from "@/components/ui/pageNav";
import { apiGet } from "@/lib/apiService";

interface TemplateQuestion {
  _id: string | null;
  competencyName: string | null;
  question: string | null;
  optionType: string | null;
}

interface Template {
  surveyId: string;
  surveyName: string;
  questions: TemplateQuestion[];
  createdAt?: string;
}

const PreviewTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGet<Template[]>("/survey/template/all");
      setTemplates(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: Template) => {
    // Navigate to create-from-scratch with the template's survey ID in the URL
    navigate(`/create-from-scratch?templateId=${template.surveyId}`, {
      state: { template },
    });
  };

  const handleUseTemplate = (template: Template, event: React.MouseEvent) => {
    event.stopPropagation();
    // Navigate to create-from-scratch with the template's survey ID in the URL
    navigate(`/create-from-scratch?templateId=${template.surveyId}`, {
      state: { template },
    });
  };

  const handleBackToCreate = () => {
    navigate("/create-survey");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav title="Select Template" position="HR Manager" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToCreate}
            className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            <span>Back to Create Survey</span>
          </button>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Choose a Template
          </h2>
          <p className="text-gray-600 mb-8">
            Select a pre-designed template to quickly create your survey
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1C13] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
                <p className="text-red-600 font-semibold mb-2 text-lg">
                  Error Loading Templates
                </p>
                <p className="text-red-500 text-sm mb-6">{error}</p>
                <button
                  onClick={fetchTemplates}
                  className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded-lg px-6 py-2 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
                <img
                  src={MailImg}
                  alt="No templates"
                  className="w-24 h-24 mx-auto mb-4 opacity-50"
                />
                <p className="text-gray-700 text-xl font-semibold mb-2">
                  No templates available
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  There are no templates available at the moment. You can create
                  a survey from scratch or create a template first.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/create-from-scratch")}
                    className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded-lg px-6 py-2 transition-colors"
                  >
                    Create from Scratch
                  </button>
                  <button
                    onClick={() => navigate("/create-template")}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-6 py-2 transition-colors"
                  >
                    Create Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <div
                  key={template.surveyId}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center justify-between cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex flex-col items-center flex-1 justify-center">
                    <div className="mb-4 p-4 bg-gray-50 rounded-full">
                      <img
                        src={MailImg}
                        alt="template-icon"
                        className="w-16 h-16"
                      />
                    </div>
                    <h3 className="text-gray-800 font-semibold text-lg mb-2 text-center">
                      {template.surveyName}
                    </h3>
                    {template.questions && template.questions.length > 0 && (
                      <p className="text-gray-500 text-sm mb-2">
                        {template.questions.length}{" "}
                        {template.questions.length === 1
                          ? "question"
                          : "questions"}
                      </p>
                    )}
                  </div>
                  {template.createdAt && (
                    <p className="text-gray-400 text-xs mt-4 pt-4 border-t border-gray-100 w-full text-center">
                      Created:{" "}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  )}
                  <button
                    className="mt-4 w-full bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded-lg py-2 transition-colors"
                    onClick={(e) => handleUseTemplate(template, e)}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default PreviewTemplates;
