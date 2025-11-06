import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MailImg from "../../imgs/mail.png";
import PageNav from "@/components/ui/pageNav";
import { apiGet } from "@/lib/apiService";

interface Template {
  id: string;
  surveyName: string;
  projectId: string | null;
  createdAt?: string;
  questionCount?: number;
}

const Templates = () => {
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
      const response = await apiGet<Template[]>("/survey/template/testtest");
      setTemplates(Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: Template) => {
    // Navigate to template details or use template
    console.log("Selected template:", template);
    // You can add navigation logic here, e.g.:
    // navigate(`/template/${template.id}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav title="View Templates" position="HR Manager" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1C13] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading templates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-red-50 p-6 rounded-lg max-w-md">
              <p className="text-red-600 font-semibold mb-2">
                Error Loading Templates
              </p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchTemplates}
                className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2"
              >
                Retry
              </button>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img
                src={MailImg}
                alt="No templates"
                className="w-24 h-24 mx-auto mb-4 opacity-50"
              />
              <p className="text-gray-600 text-lg mb-2">
                No templates available
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Create your first template to get started
              </p>
              <button
                onClick={() => navigate("/create-template")}
                className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2"
              >
                Create Template
              </button>
            </div>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 py-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center justify-center text-center cursor-pointer"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="mb-4">
                  <img
                    src={MailImg}
                    alt="template-icon"
                    className="w-16 h-16"
                  />
                </div>
                <h3 className="text-gray-800 font-semibold text-lg mb-2">
                  {template.surveyName}
                </h3>
                {template.questionCount && (
                  <p className="text-gray-500 text-sm">
                    {template.questionCount}{" "}
                    {template.questionCount === 1 ? "question" : "questions"}
                  </p>
                )}
                {template.createdAt && (
                  <p className="text-gray-400 text-xs mt-2">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default Templates;
