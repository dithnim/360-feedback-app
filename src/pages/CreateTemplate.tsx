import { useState } from "react";
import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";
import CompetencySection from "../components/CompetencySection";
import { createQuestion, createTemplateAll } from "@/lib/apiService";
import { createCompetency } from "@/lib/surveyService";

// Constants
const DEFAULT_OPTIONS = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Strongly Disagree",
  "Disagree",
];

const PROJECT_ID = "68e90d5f190026051b78b15d";

// Types
type Question = {
  id: number;
  text: string;
  options: string[];
};

type TemplatePreview = {
  templateName: string;
  competency: string;
  description: string;
  questions: Question[];
};

type CompetencyData = {
  competency: string;
  competencyId: string;
};

// Sub-components
const PreviewCompetency = ({
  competency,
  description,
  questions,
  onEdit,
  onDelete,
}: {
  competency: string;
  description: string;
  questions: Question[];
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="mb-4">
    <div className="flex items-center justify-between gap-2 mb-2">
      <span className="font-semibold">{competency || "Competency"}</span>
      <div className="flex items-center gap-1">
        <button
          className="bg-[#EE3E41] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center"
          style={{ width: 32, height: 32 }}
          onClick={onEdit}
          title="Edit"
        >
          <span style={{ fontSize: 16 }}>✎</span>
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white rounded p-1 flex items-center justify-center"
          style={{ width: 32, height: 32 }}
          onClick={onDelete}
          title="Delete"
        >
          <span style={{ fontSize: 16 }}>🗑️</span>
        </button>
      </div>
    </div>
    <div className="mb-2 text-sm font-medium text-black">
      {description || <span className="text-gray-400">No description</span>}
    </div>
    <ul className="list-disc ml-6">
      {questions.map((q) => (
        <li key={q.id} className="mb-1">
          {q.text}
        </li>
      ))}
    </ul>
  </div>
);

const OptionsEditModal = ({
  options,
  onSave,
  onCancel,
}: {
  options: string[];
  onSave: (options: string[]) => void;
  onCancel: () => void;
}) => {
  const [editedOptions, setEditedOptions] = useState([...options]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = value;
    setEditedOptions(newOptions);
  };

  const handleSave = () => {
    const cleanedOptions = editedOptions
      .map((opt) => opt.trim())
      .filter(Boolean);
    onSave(cleanedOptions);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg p-8 min-w-[350px] w-full max-w-xs flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {editedOptions.map((option, idx) => (
          <div key={idx} className="flex w-full mb-4 gap-2">
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 flex-1"
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2 w-12 text-center"
              value={idx + 1}
              readOnly
            />
          </div>
        ))}
        <div className="flex w-full justify-start">
          <button
            className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 mt-2"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="ml-4 bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 mt-2"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionItem = ({
  question,
  onEdit,
  onDelete,
  onEditOptions,
}: {
  question: Question;
  onEdit: (text: string) => void;
  onDelete: () => void;
  onEditOptions: (options: string[]) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question.text);

  const handleSave = () => {
    onEdit(editText);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditText(question.text);
    setIsEditing(true);
  };

  return (
    <div className="mb-2">
      {isEditing ? (
        <div className="flex items-center gap-2 mb-1">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-1">
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full"
            value={question.text}
            readOnly
          />
          <button
            className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center"
            style={{ width: 40, height: 40 }}
            onClick={onDelete}
            aria-label="Delete question"
          >
            <span style={{ fontSize: 24 }}>–</span>
          </button>
          <button
            className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center"
            style={{ width: 40, height: 40 }}
            onClick={handleStartEdit}
            aria-label="Edit question"
          >
            <span style={{ fontSize: 18 }}>✎</span>
          </button>
        </div>
      )}
      <div className="flex flex-wrap gap-4 ml-2 text-gray-700 text-md items-center">
        {question.options.map((opt) => (
          <span key={opt}>• {opt}</span>
        ))}
        <button
          className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center ml-2"
          style={{ width: 32, height: 32 }}
          onClick={() => onEditOptions(question.options)}
          aria-label="Edit options"
        >
          <span style={{ fontSize: 16 }}>✎</span>
        </button>
      </div>
    </div>
  );
};

// Main Component
const CreateTemplate = () => {
  // Template state
  const [templateName, setTemplateName] = useState("");
  const [templatePreviews, setTemplatePreviews] = useState<TemplatePreview[]>(
    []
  );

  // Current competency state
  const [competency, setCompetency] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionInput, setQuestionInput] = useState("");

  // Edit states
  const [editPreviewIndex, setEditPreviewIndex] = useState<number | null>(null);
  const [editingOptionsId, setEditingOptionsId] = useState<number | null>(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Helper functions
  const resetCompetencyForm = () => {
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setQuestionInput("");
  };

  const validateForm = (): string | null => {
    if (!templateName.trim()) return "Template name is required";
    if (!templatePreviews.length) return "Add at least one competency";
    return null;
  };

  // Question management
  const handleAddQuestion = () => {
    const trimmedInput = questionInput.trim();
    if (!trimmedInput) return;

    const newQuestion: Question = {
      id: Date.now(),
      text: trimmedInput,
      options: [...DEFAULT_OPTIONS],
    };

    setQuestions([...questions, newQuestion]);
    setQuestionInput("");
  };

  const handleEditQuestion = (id: number, newText: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, text: newText } : q))
    );
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleEditQuestionOptions = (id: number, newOptions: string[]) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, options: newOptions } : q))
    );
    setEditingOptionsId(null);
  };

  // Competency management
  const handleAddCompetency = () => {
    if (!templateName.trim() || !competency.trim()) {
      alert("Please fill in template name and competency");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const newTemplate: TemplatePreview = {
      templateName,
      competency,
      description,
      questions: [...questions],
    };

    if (editPreviewIndex !== null) {
      setTemplatePreviews((prev) =>
        prev.map((item, idx) => (idx === editPreviewIndex ? newTemplate : item))
      );
      setEditPreviewIndex(null);
    } else {
      setTemplatePreviews((prev) => [...prev, newTemplate]);
    }

    resetCompetencyForm();
  };

  const handleEditCompetency = (index: number) => {
    const template = templatePreviews[index];
    setTemplateName(template.templateName);
    setCompetency(template.competency);
    setDescription(template.description);
    setQuestions(template.questions);
    setEditPreviewIndex(index);
  };

  const handleDeleteCompetency = (index: number) => {
    setTemplatePreviews((prev) => prev.filter((_, i) => i !== index));

    if (editPreviewIndex === index) {
      setEditPreviewIndex(null);
      setTemplateName("");
      resetCompetencyForm();
    }
  };

  // Save functionality
  const saveCompetencies = async (): Promise<Map<string, string>> => {
    const competencyMap = new Map<string, string>();
    const savedCompetencies: CompetencyData[] = [];

    for (const template of templatePreviews) {
      if (!template.competency.trim()) continue;

      const competencyName = template.competency.trim();
      const response = await createCompetency(
        competencyName,
        template.description || ""
      );

      const competencyId =
        typeof response === "string" ? response : response.id;

      if (!competencyId) {
        throw new Error(`Failed to create competency: ${competencyName}`);
      }

      savedCompetencies.push({ competency: competencyName, competencyId });
      competencyMap.set(competencyName, competencyId);
    }

    localStorage.setItem(
      "templateCompetencies",
      JSON.stringify(savedCompetencies)
    );
    return competencyMap;
  };

  const saveQuestions = async (competencyMap: Map<string, string>) => {
    const savedQuestions = [];

    for (const template of templatePreviews) {
      const competencyId = competencyMap.get(template.competency);
      if (!competencyId) continue;

      for (const question of template.questions) {
        const questionData = {
          competencyId,
          question: question.text,
          optionType: "Likert",
          options: question.options,
        };

        const response = await createQuestion(questionData);
        const questionId =
          typeof response === "string" ? response : response.id;

        if (questionId) {
          savedQuestions.push({
            questionId,
            competencyName: template.competency,
            ...questionData,
          });
        }
      }
    }

    localStorage.setItem("templateQuestions", JSON.stringify(savedQuestions));
    return savedQuestions;
  };

  const handleSaveTemplate = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // Save competencies
      const competencyMap = await saveCompetencies();

      // Save questions
      const savedQuestions = await saveQuestions(competencyMap);

      // Create template with the exact data structure required by the API
      const templateData: {
        survey: {
          surveyName: string;
          projectId: null;
        };
        questions: {
          questionId: string;
        }[];
      } = {
        survey: {
          surveyName: templateName,
          projectId: null,
        },
        questions: savedQuestions.map((q) => ({ questionId: q.questionId })),
      };

      const templateResponse = await createTemplateAll(templateData);
      localStorage.setItem(
        "TemplateResponse",
        JSON.stringify(templateResponse)
      );

      alert(
        `✅ Template saved successfully!\n\n` +
          `Template: ${templateName}\n` +
          `Competencies: ${competencyMap.size}\n` +
          `Questions: ${savedQuestions.length}`
      );
    } catch (error: any) {
      const errorMessage = error.message || "Failed to save template";
      setSaveError(errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Find the question being edited for options
  const editingQuestion = questions.find((q) => q.id === editingOptionsId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <PageNav position="HR Manager" title="Create Template" />

      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="mx-auto rounded-lg">
          {/* Save Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="edit"
              className="bg-[#8B1C13] font-medium text-md"
              onClick={handleSaveTemplate}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>

          {/* Error Display */}
          {saveError && (
            <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">
              {saveError}
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-16 mb-6">
            <div>
              <label
                htmlFor="templateName"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Template Name*
              </label>
              <input
                type="text"
                id="templateName"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="competency"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Competency*
              </label>
              <input
                type="text"
                id="competency"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Question Input */}
          <div className="mb-4">
            <label
              htmlFor="questions"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Questions*
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="questions"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Enter question..."
              />
              <button
                type="button"
                className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-2"
                onClick={handleAddQuestion}
                aria-label="Add question"
              >
                Add
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {questions.map((q) => (
              <QuestionItem
                key={q.id}
                question={q}
                onEdit={(text) => handleEditQuestion(q.id, text)}
                onDelete={() => handleDeleteQuestion(q.id)}
                onEditOptions={() => setEditingOptionsId(q.id)}
              />
            ))}
          </div>

          {/* Options Edit Modal */}
          {editingOptionsId && editingQuestion && (
            <OptionsEditModal
              options={editingQuestion.options}
              onSave={(options) =>
                handleEditQuestionOptions(editingOptionsId, options)
              }
              onCancel={() => setEditingOptionsId(null)}
            />
          )}

          {/* Action Buttons */}
          <div className="flex mt-6">
            <button
              type="button"
              className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 text-lg font-semibold"
              onClick={handleAddCompetency}
              style={{ minWidth: 80 }}
            >
              Add
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 ml-4 text-lg font-semibold"
              onClick={resetCompetencyForm}
              aria-label="Clear form"
              style={{ minWidth: 80 }}
            >
              Clear
            </button>
          </div>

          {/* Preview Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">{templateName} Preview</h2>

            {templatePreviews.length === 0 ? (
              <p className="text-gray-500 italic">
                No competencies added yet. Add a competency and questions to see
                the preview.
              </p>
            ) : (
              <div>
                {templatePreviews.map((item, idx) => (
                  <PreviewCompetency
                    key={idx}
                    competency={item.competency}
                    description={item.description}
                    questions={item.questions}
                    onEdit={() => handleEditCompetency(idx)}
                    onDelete={() => handleDeleteCompetency(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Competency Sections */}
        {templatePreviews.map((item, idx) => (
          <div key={idx}>
            <CompetencySection
              title={item.competency}
              questions={item.questions.map((q) => ({
                id: q.id.toString(),
                text: q.text,
              }))}
              commentLabel="Additional Comments"
            />
          </div>
        ))}
      </main>
    </div>
  );
};

export default CreateTemplate;
