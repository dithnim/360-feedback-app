import { useState } from "react";
import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";
import CompetencySection from "../components/CompetencySection";
import { createQuestion, createSurveyAll } from "../lib/apiService";
import { createCompetency } from "@/lib/surveyService";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";

const defaultOptions = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Strongly Disagree",
  "Disagree",
];

const SurvayScratch = () => {
  type QuestionType =
    | "multiple-choice"
    | "rating-scale"
    | "open-ended"
    | "yes-no";
  type Question = {
    id: number;
    text: string;
    type: QuestionType;
    options: string[];
    isRequired?: boolean;
  };

  interface SurveyData {
    survey: {
      surveyName: string;
      projectId: string;
    };
    questions: {
      questionId: string;
    }[];
    users: {
      userId: string;
      appraiser: boolean;
      role: string;
    }[];
  }

  // Function to create survey data from localStorage
  const createSurveyFromLocalStorage = (): SurveyData | null => {
    try {
      // Get project data from localStorage
      const projectData = JSON.parse(localStorage.getItem("Project") || "{}");
      
      // Get questions data from localStorage
      const questionsData = JSON.parse(localStorage.getItem("savedQuestions") || "[]");
      
      // Get user groups data from localStorage
      const userGroupsData = JSON.parse(localStorage.getItem("CompanyUsers") || "[]");
      
      if (!projectData.id || questionsData.length === 0 || userGroupsData.length === 0) {
        console.error("Missing required data in localStorage");
        return null;
      }

      // Transform questions data
      const questions = questionsData.map((q: any) => ({
        questionId: q.questionId
      }));

      // Transform users data - flatten all users from groups
      const users: { userId: string; appraiser: boolean; role: string; }[] = [];
      
      userGroupsData.forEach((group: any) => {
        // Add appraisee
        if (group.appraisee) {
          users.push({
            userId: group.appraisee.id.toString(),
            appraiser: false, // appraisee is not an appraiser
            role: group.appraisee.role
          });
        }
        
        // Add appraisers
        if (group.appraisers && Array.isArray(group.appraisers)) {
          group.appraisers.forEach((appraiser: any) => {
            users.push({
              userId: appraiser.id.toString(),
              appraiser: true, // these are appraisers
              role: appraiser.role
            });
          });
        }
      });

      // Remove duplicate users (same userId)
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.userId === user.userId)
      );

      const surveyData: SurveyData = {
        survey: {
          surveyName: projectData.project_name || "360 Feedback Survey",
          projectId: projectData.id
        },
        questions,
        users: uniqueUsers
      };

      return surveyData;
    } catch (error) {
      console.error("Error creating survey from localStorage:", error);
      return null;
    }
  };

  const [competency, setCompetency] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [questionType, setQuestionType] =
    useState<QuestionType>("multiple-choice");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // New state to track if editing preview
  const [isEditingPreview, setIsEditingPreview] = useState(false);

  // New: array of competencies
  const [templatePreviews, setTemplatePreviews] = useState<
    {
      templateName: string;
      competency: string;
      description: string;
      questions: Question[];
    }[]
  >([]);
  // Track which competency is being edited (index), or null
  const [editPreviewIndex, setEditPreviewIndex] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { setItem } = useLocalStorage();

  const getDefaultOptionsForType = (type: QuestionType): string[] => {
    switch (type) {
      case "multiple-choice":
        return [
          "Strongly Agree",
          "Agree",
          "Neutral",
          "Disagree",
          "Strongly Disagree",
        ];
      case "rating-scale":
        return ["1", "2", "3", "4", "5"];
      case "yes-no":
        return ["Yes", "No"];
      case "open-ended":
        return [];
      default:
        return defaultOptions;
    }
  };

  const handleQuestionAdd = () => {
    if (input.trim() === "") return;
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: input,
        type: questionType,
        options: getDefaultOptionsForType(questionType),
        isRequired: true,
      },
    ]);
    setInput("");
  };

  const handleCompetencyCreation = async () => {
    try {
      // Loop through all competencies in templatePreviews and create them
      for (const template of templatePreviews) {
        if (template.competency.trim()) {
          await createCompetency(template.competency.trim());
          console.log(
            `Successfully created competency: ${template.competency}`
          );
        }
      }
      console.log("All competencies created successfully");
    } catch (error) {
      console.error("Error creating competencies:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const handleAdd = () => {
    if (!competency.trim()) {
      alert("Please enter a competency name");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const newCompetency = {
      templateName,
      competency,
      description,
      questions: [...questions],
    };

    if (editPreviewIndex !== null) {
      // Update existing
      setTemplatePreviews((prev) =>
        prev.map((item, idx) =>
          idx === editPreviewIndex ? newCompetency : item
        )
      );
      setEditPreviewIndex(null);
    } else {
      // Add new
      console.log("Adding new competency:", newCompetency);
      setTemplatePreviews((prev) => [...prev, newCompetency]);
    }
    setIsEditingPreview(false);
    setTemplateName("");
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
    setQuestionType("multiple-choice"); // Reset question type to default
  };

  const handleDelete = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleEdit = (id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  // Option editing state
  const [editOptsId, setEditOptsId] = useState<number | null>(null);
  const [editOptsValues, setEditOptsValues] = useState<string[]>([]);

  const handleEditSave = (id: number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, text: editText } : q))
    );
    setEditId(null);
    setEditText("");
  };

  const handleEditOpts = (id: number, opts: string[]) => {
    setEditOptsId(id);
    setEditOptsValues([...opts]);
  };

  const handleEditOptsSave = (id: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === id
          ? {
              ...q,
              options: editOptsValues.map((s) => s.trim()).filter(Boolean),
            }
          : q
      )
    );
    setEditOptsId(null);
    setEditOptsValues([]);
  };

  const handleEditOptsCancel = () => {
    setEditOptsId(null);
    setEditOptsValues([]);
  };

  const handleClear = () => {
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
    setQuestionType("multiple-choice"); // Reset question type to default
  };

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
            className="bg-[#EE3E41] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center cursor-pointer"
            style={{ width: 32, height: 32 }}
            onClick={onEdit}
            title="Edit"
          >
            <span style={{ fontSize: 16 }}>✎</span>
          </button>
          <button
            className="bg-[#ef3e40] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center ml-1  cursor-pointer"
            style={{ width: 32, height: 32 }}
            onClick={onDelete}
            title="Delete"
          >
            <span
              style={{ fontSize: 16 }}
              className="flex justify-center items-center"
            >
              <i className="bxr  bx-trash text-xl flex items-center justify-center"></i>{" "}
            </span>
          </button>
        </div>
      </div>
      <div className="mb-2 text-sm font-medium text-black">
        {description || <span className="text-gray-400">No description</span>}
      </div>
      <ul className="list-disc ml-6">
        {questions.map((q) => (
          <li key={q.id} className="mb-2">
            <div className="font-medium">{q.text}</div>
            <div className="text-xs text-gray-500 mt-1">
              Type:{" "}
              {q.type.charAt(0).toUpperCase() +
                q.type.slice(1).replace("-", " ")}
              {q.isRequired && " • Required"}
            </div>
            {q.type !== "open-ended" && q.options.length > 0 && (
              <div className="text-sm text-gray-600 ml-4 mt-1">
                Options: {q.options.join(", ")}
              </div>
            )}
            {q.type === "open-ended" && (
              <div className="text-sm text-gray-500 ml-4 mt-1 italic">
                Open-ended text response
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const savedQuestions: Array<{
        questionId: string;
        competencyId: string;
        questionText: string;
        competencyName: string;
      }> = [];

      for (const comp of templatePreviews) {
        // 1. Create competency
        const compRes = await createCompetency(comp.competency);
        const competencyId = typeof compRes === "string" ? compRes : compRes.id;

        // 2. Create questions
        for (const q of comp.questions) {
          const questionResponse = await createQuestion({
            competencyId,
            question: q.text,
            optionType: q.type === "open-ended" ? "text" : "string", // Adjust based on your API
            options: q.options,
          });

          // Store question details
          const questionId =
            typeof questionResponse === "string"
              ? questionResponse
              : questionResponse.id;
          savedQuestions.push({
            questionId,
            competencyId,
            questionText: q.text,
            competencyName: comp.competency,
          });
        }
      }

      // Store all question IDs in local storage
      localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));

      alert("Template saved successfully!");
    } catch (err: any) {
      setSaveError(err.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to create and send survey data to API
  const handleCreateSurveyData = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const surveyData = createSurveyFromLocalStorage();
      if (!surveyData) {
        throw new Error("Failed to create survey data from localStorage. Please ensure all required data is available.");
      }

      console.log("Sending Survey Data to API:", surveyData);
      
      // Send data to /survey/all endpoint
      const response = await createSurveyAll(surveyData);
      
      console.log("Survey creation response:", response);
      
      // Store the survey data and response in localStorage for later use
      localStorage.setItem("SurveyData", JSON.stringify(surveyData));
      localStorage.setItem("SurveyResponse", JSON.stringify(response));
      
      alert(`Survey created successfully!\n\nSurvey Name: ${surveyData.survey.surveyName}\nProject ID: ${surveyData.survey.projectId}\nQuestions: ${surveyData.questions.length}\nUsers: ${surveyData.users.length}`);
      
      // You can also navigate to another page or perform other actions here
      // navigate("/survey-created", { state: { surveyData, response } });
      
    } catch (error: any) {
      console.error("Error creating survey:", error);
      setSaveError(error.message || "Failed to create survey. Please try again.");
      alert(`Failed to create survey: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <PageNav position="HR Manager" title="Create From Scratch" />

      {/* Main Content Area */}
      <main className="flex flex-col py-6 pt-12 px-2 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-64 overflow-y-auto bg-white w-full">
        <div className=" flex flex-col rounded-lg w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mb-6 w-full">
            <div className="w-full">
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
              Description{" "}
              <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              id="description"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="questionType"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Question Type*
            </label>
            <select
              id="questionType"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="open-ended">Open Ended</option>
              <option value="rating-scale" disabled>
                Rating Scale (1-5)
              </option>
              <option value="yes-no" disabled>
                Yes/No
              </option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="questions"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Questions*
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  id="questions"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter question..."
                />
                <button
                  type="button"
                  className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-3 flex items-center justify-center cursor-pointer w-full sm:w-auto"
                  onClick={handleQuestionAdd}
                  aria-label="Add question"
                >
                  <i className="bxr  bx-plus"></i>
                </button>
              </div>
              {questionType !== "open-ended" && (
                <div className="text-sm text-gray-600 ml-1">
                  Preview options:{" "}
                  {getDefaultOptionsForType(questionType).join(", ")}
                </div>
              )}
            </div>
          </div>

          {/* Render questions list */}
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="mb-2">
                {editId === q.id ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-1">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg p-2 w-full"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1 cursor-pointer w-full sm:w-auto"
                      onClick={() => handleEditSave(q.id)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-1">
                    <div className="flex-1">
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg p-2 w-full"
                        value={q.text}
                        readOnly
                      />
                      <div className="text-xs text-gray-500 mt-1 ml-2">
                        Type:{" "}
                        {q.type.charAt(0).toUpperCase() +
                          q.type.slice(1).replace("-", " ")}
                        {q.isRequired && " • Required"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center cursor-pointer"
                        style={{ width: 40, height: 40 }}
                        onClick={() => handleDelete(q.id)}
                        aria-label="Delete question"
                      >
                        <span style={{ fontSize: 24 }}>–</span>
                      </button>
                      <button
                        className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center cursor-pointer"
                        style={{ width: 40, height: 40 }}
                        onClick={() => handleEdit(q.id, q.text)}
                        aria-label="Edit question"
                      >
                        <span style={{ fontSize: 18 }}>✎</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Show options only for non-open-ended questions */}
                {q.type !== "open-ended" && (
                  <div className="flex flex-wrap gap-4 ml-2 text-gray-700 text-md items-center">
                    {q.options.map((opt: string) => (
                      <span key={opt}>• {opt}</span>
                    ))}
                    <button
                      className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center ml-2 cursor-pointer"
                      style={{ width: 32, height: 32 }}
                      onClick={() => handleEditOpts(q.id, q.options)}
                      aria-label="Edit options"
                    >
                      <span style={{ fontSize: 16 }}>✎</span>
                    </button>
                  </div>
                )}

                {/* Show placeholder for open-ended questions */}
                {q.type === "open-ended" && (
                  <div className="ml-2 text-gray-500 text-sm italic">
                    Open-ended text response
                  </div>
                )}
                {/* Modal for editing options */}
                {editOptsId !== null && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                    onClick={handleEditOptsCancel}
                  >
                    <div
                      className="bg-white rounded-lg p-8 min-w-[90vw] max-w-xs w-full flex flex-col items-center sm:min-w-[350px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {editOptsValues.map((val, idx) => (
                        <div key={idx} className="flex w-full mb-4 gap-2">
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-2 flex-1"
                            value={val}
                            onChange={(e) => {
                              const newVals = [...editOptsValues];
                              newVals[idx] = e.target.value;
                              setEditOptsValues(newVals);
                            }}
                          />
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg p-2 w-12 text-center"
                            value={idx + 1}
                            readOnly
                          />
                        </div>
                      ))}

                      <div className="flex w-full flex-col sm:flex-row justify-start gap-2">
                        <button
                          className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 mt-2 cursor-pointer w-full sm:w-auto"
                          onClick={() => handleEditOptsSave(editOptsId)}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 mt-2 cursor-pointer w-full sm:w-auto"
                          onClick={handleEditOptsCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add button after questions list */}
          <div className="flex flex-col sm:flex-row mt-6 gap-2">
            <button
              type="button"
              className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 text-lg font-semibold cursor-pointer w-full sm:w-auto"
              onClick={handleAdd}
              style={{ minWidth: 80 }}
            >
              Add
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 text-lg font-semibold cursor-pointer w-full sm:w-auto"
              onClick={handleClear}
              aria-label="Clear form"
              style={{ minWidth: 80 }}
            >
              Clear
            </button>
          </div>

          {/* Preview Section */}
          <div className="mt-12 border-t border-gray-300/50 pt-8">
            <h3 className="text-lg font-semibold mb-4">Competency Preview</h3>
            {templatePreviews.length === 0 && (
              <p className="text-gray-500 italic">
                No competencies added yet. Add a competency and questions to see
                the preview.
              </p>
            )}
            {templatePreviews.length > 0 && (
              <div>
                {templatePreviews.map((item, idx) => (
                  <PreviewCompetency
                    key={idx}
                    competency={item.competency}
                    description={item.description}
                    questions={item.questions}
                    onEdit={() => {
                      setTemplateName(item.templateName);
                      setCompetency(item.competency);
                      setDescription(item.description);
                      setQuestions(item.questions);
                      setIsEditingPreview(true);
                      setEditPreviewIndex(idx);
                    }}
                    onDelete={() => {
                      setTemplatePreviews((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                      // If deleting the one being edited, reset edit state
                      if (editPreviewIndex === idx) {
                        setEditPreviewIndex(null);
                        setIsEditingPreview(false);
                        setTemplateName("");
                        setCompetency("");
                        setDescription("");
                        setQuestions([]);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Example CompetencySection below, updated for new question types */}
        {templatePreviews.map((item, idx) => (
          <div key={idx}>
            <CompetencySection
              title={item.competency}
              questions={item.questions.map((q) => ({
                id: q.id.toString(),
                text: q.text,
                type: q.type,
                options: q.options,
              }))}
              commentLabel="Additional Comments"
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row items-center mt-8 gap-2">
          <Button
            variant="edit"
            className="bg-[#8B1C13] font-medium text-md w-full sm:w-auto"
            onClick={async () => {
              try {
                await handleCompetencyCreation();
                await handleSaveTemplate();
              } catch (error) {
                console.error("Error in save process:", error);
                setSaveError("Failed to save survey. Please try again.");
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Survey"}
          </Button>
          <Button
            className="bg-transparent border border-[#ed3f41] text-[#ed3f41] font-semibold px-2 py-1 rounded-lg text-md w-full sm:w-auto"
            variant="next"
            onClick={() =>
              navigate("/survey-preview", { state: { templatePreviews } })
            }
          >
            Preview
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-md w-full sm:w-auto"
            variant="next"
            onClick={handleCreateSurveyData}
            disabled={isSaving}
          >
            {isSaving ? "Creating Survey..." : "Create & Send Survey"}
          </Button>
        </div>
        {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
      </main>
    </div>
  );
};

export default SurvayScratch;
