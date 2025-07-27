import { useNavigate } from "react-router-dom";
import PageNav from "../components/ui/pageNav";

// Mock template data (replace with API call if needed)
const templates = [
  {
    id: 1,
    name: "Communication Excellence",
    description: "A template focused on communication skills and feedback.",
    competencies: [
      {
        competency: "Communication",
        description: "Ability to convey information effectively.",
        questions: [
          {
            id: 1,
            text: "Communicates clearly and concisely?",
            options: [
              "Strongly Agree",
              "Agree",
              "Neutral",
              "Disagree",
              "Strongly Disagree",
            ],
          },
          {
            id: 2,
            text: "Listens actively to others?",
            options: [
              "Strongly Agree",
              "Agree",
              "Neutral",
              "Disagree",
              "Strongly Disagree",
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Leadership Essentials",
    description: "A template for evaluating leadership qualities.",
    competencies: [
      {
        competency: "Leadership",
        description: "Ability to lead and inspire others.",
        questions: [
          {
            id: 1,
            text: "Demonstrates strong leadership skills?",
            options: [
              "Strongly Agree",
              "Agree",
              "Neutral",
              "Disagree",
              "Strongly Disagree",
            ],
          },
        ],
      },
    ],
  },
];

const CreateFromTemplate = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (template: any) => {
    // Flatten competencies into templatePreviews format for SurvayScratch
    const templatePreviews = template.competencies.map((c: any) => ({
      templateName: template.name,
      competency: c.competency,
      description: c.description,
      questions: c.questions,
    }));
    navigate("/create-from-scratch", { state: { templatePreviews } });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageNav position="HR Manager" title="Create From Template" />
      <main className="flex-1 flex flex-col items-center py-8 bg-gray-50">
        <div className="w-full max-w-4xl">
          <button
            className="mb-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold mb-6 text-[#8B1C13]">
            Select a Template
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-lg shadow p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xl font-semibold mb-2 text-[#ed3f41]">
                    {tpl.name}
                  </div>
                  <div className="text-gray-700 mb-4">{tpl.description}</div>
                </div>
                <button
                  className="mt-4 bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 font-semibold"
                  onClick={() => handleUseTemplate(tpl)}
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateFromTemplate;
