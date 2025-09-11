import { useState, useCallback, useMemo } from "react";
import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";
import CompetencySection from "../components/CompetencySection";
import { createQuestion, createSurveyAll } from "../lib/apiService";
import { createCompetency } from "@/lib/surveyService";
import { useNavigate } from "react-router-dom";

// Types
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

type TemplatePreview = {
  SurveyName: string;
  competency: string;
  description: string;
  questions: Question[];
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

// Constants
const DEFAULT_OPTIONS_MAP: Record<QuestionType, string[]> = {
  "multiple-choice": [
    "Strongly Agree",
    "Agree",
    "Neutral",
    "Disagree",
    "Strongly Disagree",
  ],
  "rating-scale": ["1", "2", "3", "4", "5"],
  "yes-no": ["Yes", "No"],
  "open-ended": [],
};

const SurvayScratch = () => {
  const navigate = useNavigate();

  // Form state
  const [surveyName, setSurveyName] = useState("");
  const [competency, setCompetency] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [questionType, setQuestionType] =
    useState<QuestionType>("multiple-choice");

  // Edit states
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptsId, setEditOptsId] = useState<number | null>(null);
  const [editOptsValues, setEditOptsValues] = useState<string[]>([]);
  const [editPreviewIndex, setEditPreviewIndex] = useState<number | null>(null);

  // Template preview state
  const [templatePreviews, setTemplatePreviews] = useState<TemplatePreview[]>(
    []
  );

  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Memoized function to get default options
  const getDefaultOptionsForType = useCallback(
    (type: QuestionType): string[] => {
      return DEFAULT_OPTIONS_MAP[type] || [];
    },
    []
  );

  // Create survey from localStorage
  const createSurveyFromLocalStorage = useCallback((): SurveyData | null => {
    try {
      const projectData = JSON.parse(localStorage.getItem("Project") || "{}");
      const questionsData = JSON.parse(
        localStorage.getItem("savedQuestions") || "[]"
      );
      const userGroupsData = JSON.parse(
        localStorage.getItem("CompanyUsers") || "[]"
      );

      if (
        !projectData.id ||
        questionsData.length === 0 ||
        userGroupsData.length === 0
      ) {
        console.error("Missing required data in localStorage");
        return null;
      }

      const questions = questionsData.map((q: any) => ({
        questionId: q.questionId,
      }));

      const users: SurveyData["users"] = [];

      userGroupsData.forEach((group: any) => {
        if (group.appraisee) {
          users.push({
            userId: group.appraisee.id.toString(),
            appraiser: false,
            role: group.appraisee.role,
          });
        }

        if (group.appraisers && Array.isArray(group.appraisers)) {
          group.appraisers.forEach((appraiser: any) => {
            users.push({
              userId: appraiser.id.toString(),
              appraiser: true,
              role: appraiser.role,
            });
          });
        }
      });

      // Remove duplicates
      const uniqueUsers = users.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.userId === user.userId)
      );

      return {
        survey: {
          surveyName: surveyName || "360 Feedback Survey",
          projectId: projectData.id,
        },
        questions,
        users: uniqueUsers,
      };
    } catch (error) {
      console.error("Error creating survey from localStorage:", error);
      return null;
    }
  }, [surveyName]);

  // Handle creating survey metadata
  const handleCreateSurvey = useCallback(async () => {
    const projectData = JSON.parse(localStorage.getItem("Project") || "{}");

    if (!projectData.id) {
      throw new Error(
        "Project ID not found. Please ensure a project is selected."
      );
    }

    if (!surveyName.trim()) {
      throw new Error("Survey name is required.");
    }

    const surveyMetadata = {
      surveyName: surveyName.trim(),
      projectId: projectData.id,
    };

    console.log("Survey metadata prepared:", surveyMetadata);
    return surveyMetadata;
  }, [surveyName]);

  // Handle adding questions
  const handleQuestionAdd = useCallback(() => {
    if (input.trim() === "") return;

    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input,
        type: questionType,
        options: getDefaultOptionsForType(questionType),
        isRequired: true,
      },
    ]);
    setInput("");
  }, [input, questionType, getDefaultOptionsForType]);

  // Handle competency creation
  const handleCompetencyCreation = useCallback(async (): Promise<
    Map<string, string>
  > => {
    const competencyMap = new Map<string, string>();

    for (const template of templatePreviews) {
      if (template.competency.trim()) {
        const compRes = await createCompetency(template.competency.trim());
        const competencyId = typeof compRes === "string" ? compRes : compRes.id;
        competencyMap.set(template.competency, competencyId);
        console.log(
          `Successfully created competency: ${template.competency} with ID: ${competencyId}`
        );
      }
    }

    console.log("All competencies created successfully");
    return competencyMap;
  }, [templatePreviews]);

  // Handle adding/updating competency
  const handleAdd = useCallback(() => {
    if (!competency.trim()) {
      alert("Please enter a competency name");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    const newCompetency: TemplatePreview = {
      SurveyName: surveyName,
      competency,
      description,
      questions: [...questions],
    };

    if (editPreviewIndex !== null) {
      setTemplatePreviews((prev) =>
        prev.map((item, idx) =>
          idx === editPreviewIndex ? newCompetency : item
        )
      );
      setEditPreviewIndex(null);
    } else {
      console.log("Adding new competency:", newCompetency);
      setTemplatePreviews((prev) => [...prev, newCompetency]);
    }

    // Reset form
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
    setQuestionType("multiple-choice");
  }, [competency, description, questions, surveyName, editPreviewIndex]);

  // Handle question deletion
  const handleDelete = useCallback((id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  // Handle question edit
  const handleEdit = useCallback((id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  }, []);

  // Handle saving edited question
  const handleEditSave = useCallback(
    (id: number) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, text: editText } : q))
      );
      setEditId(null);
      setEditText("");
    },
    [editText]
  );

  // Handle editing options
  const handleEditOpts = useCallback((id: number, opts: string[]) => {
    setEditOptsId(id);
    setEditOptsValues([...opts]);
  }, []);

  // Handle saving edited options
  const handleEditOptsSave = useCallback(
    (id: number) => {
      setQuestions((prev) =>
        prev.map((q) =>
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
    },
    [editOptsValues]
  );

  // Handle canceling option edit
  const handleEditOptsCancel = useCallback(() => {
    setEditOptsId(null);
    setEditOptsValues([]);
  }, []);

  // Clear form
  const handleClear = useCallback(() => {
    setSurveyName("");
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
    setQuestionType("multiple-choice");
  }, []);

  // Save template
  const handleSaveTemplate = useCallback(
    async (competencyMap: Map<string, string>) => {
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
          const competencyId = competencyMap.get(comp.competency);
          if (!competencyId) {
            throw new Error(`Competency ID not found for: ${comp.competency}`);
          }

          for (const q of comp.questions) {
            const questionResponse = await createQuestion({
              competencyId,
              question: q.text,
              optionType: q.type === "open-ended" ? "text" : "string",
              options: q.options,
            });

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

        localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));
        alert("Template saved successfully!");
      } catch (err: any) {
        setSaveError(err.message || "Failed to save template");
      } finally {
        setIsSaving(false);
      }
    },
    [templatePreviews]
  );

  // Handle creating survey data
  const handleCreateSurveyData = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const surveyData = createSurveyFromLocalStorage();
      if (!surveyData) {
        throw new Error("Failed to create survey data from localStorage.");
      }

      console.log("Sending Survey Data to API:", surveyData);
      const response = await createSurveyAll(surveyData);
      console.log("Survey creation response:", response);

      localStorage.setItem("SurveyResponse", JSON.stringify(response));

      alert(
        `Survey created successfully!\n\nSurvey Name: ${surveyData.survey.surveyName}\nProject ID: ${surveyData.survey.projectId}\nQuestions: ${surveyData.questions.length}\nUsers: ${surveyData.users.length}`
      );
    } catch (error: any) {
      console.error("Error creating survey:", error);
      setSaveError(
        error.message || "Failed to create survey. Please try again."
      );
      alert(`Failed to create survey: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [createSurveyFromLocalStorage]);

  // Preview Component
  const PreviewCompetency = useMemo(() => {
    return ({
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
              className="bg-[#ef3e40] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center ml-1 cursor-pointer"
              style={{ width: 32, height: 32 }}
              onClick={onDelete}
              title="Delete"
            >
              <span
                style={{ fontSize: 16 }}
                className="flex justify-center items-center"
              >
                <i className="bxr bx-trash text-xl flex items-center justify-center"></i>
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
  }, []);

  // Handle save button click
  const handleSaveClick = useCallback(async () => {
    try {
      const surveyMetadata = await handleCreateSurvey();
      console.log("Survey metadata validated:", surveyMetadata);

      const competencyMap = await handleCompetencyCreation();
      await handleSaveTemplate(competencyMap);
    } catch (error) {
      console.error("Error in save process:", error);
      setSaveError("Failed to save survey. Please try again.");
    }
  }, [handleCreateSurvey, handleCompetencyCreation, handleSaveTemplate]);

  return (
    <div className="flex flex-col min-h-screen">
      <PageNav position="HR Manager" title="Create From Scratch" />

      <main className="flex flex-col py-6 pt-12 px-2 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-64 overflow-y-auto bg-white w-full">
        <div className="flex flex-col rounded-lg w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mb-6 w-full">
            <div>
              <label
                htmlFor="surveyName"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Survey Name*
              </label>
              <input
                type="text"
                id="surveyName"
                className="border border-gray-300 rounded-lg p-2 w-full"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
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
              Description{" "}
              <span className="text-gray-400 text-sm">(Optional)</span>
            </label>
            <textarea
              id="description"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
                  <i className="bxr bx-plus"></i>
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

                {q.type === "open-ended" && (
                  <div className="ml-2 text-gray-500 text-sm italic">
                    Open-ended text response
                  </div>
                )}

                {editOptsId === q.id && (
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

          <div className="mt-12 border-t border-gray-300/50 pt-8">
            <h3 className="text-lg font-semibold mb-4">
              {surveyName ? `${surveyName} Preview` : "Survey Preview"}
            </h3>
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
                      setSurveyName(item.SurveyName);
                      setCompetency(item.competency);
                      setDescription(item.description);
                      setQuestions(item.questions);
                      setEditPreviewIndex(idx);
                    }}
                    onDelete={() => {
                      setTemplatePreviews((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                      if (editPreviewIndex === idx) {
                        setEditPreviewIndex(null);
                        setSurveyName("");
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
            onClick={handleSaveClick}
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
        </div>
        {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
      </main>
    </div>
  );
};

export default SurvayScratch;
