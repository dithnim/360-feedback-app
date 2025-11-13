import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";
import CompetencySection from "../components/CompetencySection";
import { createQuestion, createSurveyAll, apiGet } from "../lib/apiService";
import { createCompetency } from "@/lib/surveyService";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

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
  survey: { surveyName: string; projectId: string };
  questions: { questionId: string }[];
  users: { userId: string; appraiser: boolean; role: string; group: string }[];
}

interface TemplateQuestion {
  _id: string;
  competencyName: string;
  question: string;
  optionType: string;
}

interface TemplateData {
  surveyId: string;
  surveyName: string;
  questions: TemplateQuestion[];
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

const LOCAL_STORAGE_KEY = "surveyCreationData";

const SurvayScratch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const templateId = searchParams.get("templateId");

  // Core state
  const [surveyName, setSurveyName] = useState("");
  const [competency, setCompetency] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [questionType, setQuestionType] =
    useState<QuestionType>("multiple-choice");
  const [templatePreviews, setTemplatePreviews] = useState<TemplatePreview[]>(
    []
  );

  // Edit states
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editOptsId, setEditOptsId] = useState<number | null>(null);
  const [editOptsValues, setEditOptsValues] = useState<string[]>([]);
  const [editPreviewIndex, setEditPreviewIndex] = useState<number | null>(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  // LocalStorage management
  const saveToLocalStorage = useCallback(() => {
    if (!isDataLoaded) return;
    const data = {
      surveyName,
      competency,
      description,
      questions,
      input,
      questionType,
      templatePreviews,
      editPreviewIndex,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [
    surveyName,
    competency,
    description,
    questions,
    input,
    questionType,
    templatePreviews,
    editPreviewIndex,
    isDataLoaded,
  ]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setSurveyName(data.surveyName || "");
        setCompetency(data.competency || "");
        setDescription(data.description || "");
        setQuestions(data.questions || []);
        setInput(data.input || "");
        setQuestionType(data.questionType || "multiple-choice");
        setTemplatePreviews(data.templatePreviews || []);
        setEditPreviewIndex(data.editPreviewIndex ?? null);
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Fetch template data if templateId is present
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!templateId) {
        setIsDataLoaded(true);
        return;
      }

      try {
        setIsLoadingTemplate(true);
        setTemplateError(null);

        const templateData = await apiGet<TemplateData>(
          `/survey/template/${templateId}`
        );

        if (templateData) {
          // Set survey name
          setSurveyName(templateData.surveyName || "");

          // Group questions by competency
          const competencyGroups = new Map<string, TemplateQuestion[]>();

          templateData.questions.forEach((q) => {
            const compName = q.competencyName || "Uncategorized";
            if (!competencyGroups.has(compName)) {
              competencyGroups.set(compName, []);
            }
            competencyGroups.get(compName)?.push(q);
          });

          // Convert to TemplatePreview format
          const previews: TemplatePreview[] = [];

          competencyGroups.forEach((questions, competencyName) => {
            const mappedQuestions: Question[] = questions.map((q, index) => ({
              id: Date.now() + index + Math.random(),
              text: q.question || "",
              type:
                q.optionType?.toLowerCase() === "likert"
                  ? "multiple-choice"
                  : "open-ended",
              options:
                q.optionType?.toLowerCase() === "likert"
                  ? [
                      "Strongly Agree",
                      "Agree",
                      "Neutral",
                      "Disagree",
                      "Strongly Disagree",
                    ]
                  : [],
              isRequired: true,
            }));

            previews.push({
              SurveyName: templateData.surveyName,
              competency: competencyName,
              description: "",
              questions: mappedQuestions,
            });
          });

          console.log("Setting template previews:", previews);
          setTemplatePreviews(previews);

          // Save to localStorage
          const surveyData = {
            surveyName: templateData.surveyName || "",
            competency: "",
            description: "",
            questions: [],
            input: "",
            questionType: "multiple-choice" as QuestionType,
            templatePreviews: previews,
            editPreviewIndex: null,
            timestamp: new Date().toISOString(),
          };
          console.log("Saving to localStorage:", surveyData);
          localStorage.setItem(
            "surveyCreationData",
            JSON.stringify(surveyData)
          );
        }
      } catch (err: any) {
        console.error("Error fetching template:", err);
        setTemplateError(err.message || "Failed to load template");
      } finally {
        setIsLoadingTemplate(false);
        setIsDataLoaded(true);
      }
    };

    fetchTemplateData();
  }, [templateId]);

  useEffect(() => {
    if (isDataLoaded) saveToLocalStorage();
  }, [saveToLocalStorage, isDataLoaded]);

  // Helper functions
  const getDefaultOptionsForType = useCallback(
    (type: QuestionType) => DEFAULT_OPTIONS_MAP[type] || [],
    []
  );

  const resetForm = useCallback(() => {
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
    setQuestionType("multiple-choice");
    setEditPreviewIndex(null);
  }, []);

  const clearAll = useCallback(() => {
    setSurveyName("");
    resetForm();
    setTemplatePreviews([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [resetForm]);

  // Question management
  const handleQuestionAdd = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newQuestion: Question = {
      id: Date.now() + Math.random(),
      text: trimmed,
      type: questionType,
      options: getDefaultOptionsForType(questionType),
      isRequired: true,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setInput("");
  }, [input, questionType, getDefaultOptionsForType]);

  const handleDelete = useCallback((id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleEdit = useCallback((id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  }, []);

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

  const handleEditOpts = useCallback((id: number, opts: string[]) => {
    setEditOptsId(id);
    setEditOptsValues([...opts]);
  }, []);

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

  // Competency management
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
      competency: competency.trim(),
      description,
      questions: [...questions],
    };

    if (editPreviewIndex !== null) {
      setTemplatePreviews((prev) =>
        prev.map((item, idx) =>
          idx === editPreviewIndex ? newCompetency : item
        )
      );
    } else {
      setTemplatePreviews((prev) => [...prev, newCompetency]);
    }

    resetForm();
  }, [
    competency,
    description,
    questions,
    surveyName,
    editPreviewIndex,
    resetForm,
  ]);

  const handleEditPreview = useCallback(
    (idx: number) => {
      const item = templatePreviews[idx];
      setSurveyName(item.SurveyName);
      setCompetency(item.competency);
      setDescription(item.description);
      setQuestions(item.questions);
      setEditPreviewIndex(idx);
      setInput("");
      setQuestionType("multiple-choice");
    },
    [templatePreviews]
  );

  const handleDeletePreview = useCallback(
    (idx: number) => {
      setTemplatePreviews((prev) => prev.filter((_, i) => i !== idx));
      if (editPreviewIndex === idx) {
        resetForm();
      }
    },
    [editPreviewIndex, resetForm]
  );

  // Survey creation
  const createSurveyFromLocalStorage = useCallback((): SurveyData | null => {
    try {
      const projectData = JSON.parse(localStorage.getItem("Project") || "{}");
      const questionsData = JSON.parse(
        localStorage.getItem("savedQuestions") || "[]"
      );
      const surveyUsersData = JSON.parse(
        localStorage.getItem("SurveyUsers") || "[]"
      );

      // Get backend-generated user IDs from createdUsers or CompanyUsers
      const createdUsers = JSON.parse(
        localStorage.getItem("createdUsers") || "[]"
      );
      const companyUsers = JSON.parse(
        localStorage.getItem("CompanyUsers") || "[]"
      );

      // Create a mapping of user emails to their backend-generated IDs
      const userIdMap = new Map<string, string>();

      // First try createdUsers (most reliable source)
      createdUsers.forEach((user: any) => {
        if (user.email && (user.id || user._id || user.manageUserId)) {
          userIdMap.set(user.email, user.id || user._id || user.manageUserId);
        }
      });

      // Fallback to companyUsers if createdUsers is empty
      if (userIdMap.size === 0 && companyUsers.length > 0) {
        companyUsers.forEach((user: any) => {
          if (user.email && user.id) {
            userIdMap.set(user.email, user.id);
          }
        });
      }

      if (!projectData.id || !questionsData.length || !surveyUsersData.length) {
        console.error("Missing required data");
        console.log("Project data:", projectData);
        console.log("Questions data:", questionsData);
        console.log("Survey Users data:", surveyUsersData);
        console.log("User ID mapping:", Object.fromEntries(userIdMap));
        return null;
      }

      const questions = questionsData.map((q: any) => ({
        questionId: q.questionId,
      }));
      const users: SurveyData["users"] = [];

      surveyUsersData.forEach((group: any) => {
        // Get the group ID from the user group
        const groupId = group.id || "";

        if (group.appraisee) {
          // Use backend-generated ID from mapping, fallback to stored ID
          const backendUserId =
            userIdMap.get(group.appraisee.email) || group.appraisee.id;
          if (backendUserId) {
            users.push({
              userId: backendUserId,
              appraiser: false,
              role:
                group.appraisee.role ||
                group.appraisee.designation ||
                "Employee",
              group: groupId,
            });
          } else {
            console.warn(
              "No backend ID found for appraisee:",
              group.appraisee.email
            );
          }
        }

        if (group.appraisers?.length) {
          group.appraisers.forEach((appraiser: any) => {
            // Use backend-generated ID from mapping, fallback to stored ID
            const backendUserId =
              userIdMap.get(appraiser.email) || appraiser.id;
            if (backendUserId) {
              users.push({
                userId: backendUserId,
                appraiser: true,
                role: appraiser.role || appraiser.designation || "Appraiser",
                group: groupId,
              });
            } else {
              console.warn(
                "No backend ID found for appraiser:",
                appraiser.email
              );
            }
          });
        }
      });

      // Remove duplicates based on userId
      const uniqueUsers = users.filter(
        (user, idx, self) =>
          idx === self.findIndex((u) => u.userId === user.userId)
      );

      console.log("Survey data created with backend user IDs:", {
        survey: {
          surveyName: surveyName || "360 Feedback Survey",
          projectId: projectData.id,
        },
        questions: questions.length,
        users: uniqueUsers.length,
        userIdMapping: Object.fromEntries(userIdMap),
        finalUsers: uniqueUsers,
      });

      return {
        survey: {
          surveyName: surveyName || "360 Feedback Survey",
          projectId: projectData.id,
        },
        questions,
        users: uniqueUsers,
      };
    } catch (error) {
      console.error("Error creating survey:", error);
      return null;
    }
  }, [surveyName]);

  // Extract email recipients from localStorage

  const handleSaveClick = useCallback(async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      console.log("=== SAVE PROCESS STARTED ===");
      console.log("Survey Name:", surveyName);
      console.log("Template Previews Count:", templatePreviews.length);
      console.log(
        "Template Previews Full Data:",
        JSON.stringify(templatePreviews, null, 2)
      );

      // Also check localStorage
      const storedData = localStorage.getItem("surveyCreationData");
      console.log(
        "Data in surveyCreationData:",
        storedData ? JSON.parse(storedData) : "null"
      );

      if (!surveyName.trim()) throw new Error("Survey name is required.");
      if (!templatePreviews.length)
        throw new Error("Add at least one competency.");

      const projectData = JSON.parse(localStorage.getItem("Project") || "{}");
      if (!projectData.id) throw new Error("Project ID not found.");

      console.log("Project ID:", projectData.id);

      // Create competencies
      const competencyMap = new Map<string, string>();
      console.log("Creating competencies...");

      for (const template of templatePreviews) {
        if (template.competency.trim()) {
          try {
            // Provide default description if empty (API requires description)
            const description =
              template.description?.trim() ||
              `${template.competency} competency assessment`;

            const res = await createCompetency(
              template.competency.trim(),
              description
            );
            const competencyId = typeof res === "string" ? res : res.id;
            competencyMap.set(template.competency, competencyId);
            console.log(
              `Created competency "${template.competency}" with ID: ${competencyId}`
            );
          } catch (error) {
            console.error(
              `Failed to create competency "${template.competency}":`,
              error
            );
            throw new Error(
              `Failed to create competency "${template.competency}"`
            );
          }
        }
      }

      console.log("Competency Map:", Object.fromEntries(competencyMap));

      // Create questions
      const savedQuestions: any[] = [];
      console.log("Creating questions...");

      for (const comp of templatePreviews) {
        const competencyId = competencyMap.get(comp.competency);
        if (!competencyId) {
          console.warn(`No competency ID found for "${comp.competency}"`);
          continue;
        }

        console.log(
          `Processing ${comp.questions.length} questions for competency "${comp.competency}"`
        );

        for (const q of comp.questions) {
          try {
            const questionData = {
              competencyId,
              question: q.text,
              optionType: q.type === "open-ended" ? "text" : "string",
              options: q.options,
            };

            console.log("Creating question:", questionData);
            const res = await createQuestion(questionData);

            const questionId = typeof res === "string" ? res : res.id;
            const savedQuestion = {
              questionId,
              competencyId,
              questionText: q.text,
              competencyName: comp.competency,
            };

            savedQuestions.push(savedQuestion);
            console.log("Created question:", savedQuestion);
          } catch (error) {
            console.error(`Failed to create question "${q.text}":`, error);
            throw new Error(`Failed to create question: ${q.text}`);
          }
        }
      }

      console.log("All questions created:", savedQuestions);
      localStorage.setItem("savedQuestions", JSON.stringify(savedQuestions));
      console.log("Saved to localStorage");

      setSaveError(null);
      alert(
        `Survey saved successfully! Created ${savedQuestions.length} questions.`
      );
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message || "Failed to save");
      // Save empty array for debugging
      localStorage.setItem("savedQuestions", JSON.stringify([]));
    } finally {
      setIsSaving(false);
    }
  }, [surveyName, templatePreviews]);

  // Preview Component
  const PreviewItem = ({
    item,
    idx,
  }: {
    item: TemplatePreview;
    idx: number;
  }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-semibold">{item.competency}</span>
        <div className="flex items-center gap-1">
          <button
            className="bg-[#EE3E41] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center cursor-pointer"
            style={{ width: 32, height: 32 }}
            onClick={() => handleEditPreview(idx)}
            title="Edit"
          >
            ✎
          </button>
          <button
            className="bg-[#ef3e40] hover:bg-[#A10000] text-white rounded p-1 flex items-center justify-center ml-1 cursor-pointer"
            style={{ width: 32, height: 32 }}
            onClick={() => handleDeletePreview(idx)}
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>
      <div className="mb-3 text-sm text-gray-700 leading-relaxed">
        {item.description || (
          <span className="text-gray-400 italic">No description</span>
        )}
      </div>
      <ul className="list-disc ml-6">
        {item.questions.map((q) => (
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
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <PageNav
        title={templateId ? "Create From Template" : "Create From Scratch"}
      />

      <main className="flex flex-col py-6 pt-12 px-2 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-64 overflow-y-auto bg-white w-full">
        {isLoadingTemplate ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1C13] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading template...</p>
            </div>
          </div>
        ) : templateError ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
              <p className="text-red-600 font-semibold mb-2 text-lg">
                Error Loading Template
              </p>
              <p className="text-red-500 text-sm mb-6">{templateError}</p>
              <button
                onClick={() => navigate("/preview-templates")}
                className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded-lg px-6 py-2 transition-colors"
              >
                Back to Templates
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-lg w-full">
            {/* Survey Name & Competency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 mb-6 w-full">
              <div>
                <label className="mb-2 block text-md font-medium text-gray-700">
                  Survey Name*
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-md font-medium text-gray-700">
                  Competency*
                </label>
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-md font-medium text-gray-700">
                Description{" "}
              </label>
              <textarea
                className="border border-gray-300 rounded-lg p-2 w-full mb-4"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Question Type */}
            <div className="mb-4">
              <label className="mb-2 block text-md font-medium text-gray-700">
                Question Type*
              </label>
              <select
                className="border border-gray-300 rounded-lg p-2 w-full mb-4"
                value={questionType}
                onChange={(e) =>
                  setQuestionType(e.target.value as QuestionType)
                }
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

            {/* Question Input */}
            <div className="mb-4">
              <label className="mb-2 block text-md font-medium text-gray-700">
                Questions*
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 rounded-lg p-2 w-full"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleQuestionAdd()}
                    placeholder="Enter question..."
                  />
                  <button
                    type="button"
                    className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-2 flex items-center justify-center cursor-pointer w-full sm:w-auto"
                    onClick={handleQuestionAdd}
                  >
                    +
                  </button>
                </div>
                {questionType !== "open-ended" && (
                  <div className="text-sm text-gray-600 ml-1">
                    Preview: {getDefaultOptionsForType(questionType).join(", ")}
                  </div>
                )}
              </div>
            </div>

            {/* Questions List */}
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
                        className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-2 cursor-pointer"
                        onClick={() => handleEditSave(q.id)}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center sm:flex-row sm:items-start gap-4 mb-1">
                      <div className="flex w-full items-center justify-center">
                        <div className="flex flex-col w-full">
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
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center cursor-pointer"
                          style={{ width: 40, height: 40 }}
                          onClick={() => handleDelete(q.id)}
                        >
                          –
                        </button>
                        <button
                          className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center cursor-pointer"
                          style={{ width: 40, height: 40 }}
                          onClick={() => handleEdit(q.id, q.text)}
                        >
                          ✎
                        </button>
                      </div>
                    </div>
                  )}

                  {q.type !== "open-ended" && (
                    <div className="flex flex-wrap gap-4 ml-2 text-gray-700 text-md items-center">
                      {q.options.map((opt) => (
                        <span key={opt}>• {opt}</span>
                      ))}
                      <button
                        className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center ml-2 cursor-pointer"
                        style={{ width: 32, height: 32 }}
                        onClick={() => handleEditOpts(q.id, q.options)}
                      >
                        ✎
                      </button>
                    </div>
                  )}

                  {/* Options Edit Modal */}
                  {editOptsId === q.id && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                      onClick={() => setEditOptsId(null)}
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
                            className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 mt-2 cursor-pointer"
                            onClick={() => handleEditOptsSave(editOptsId)}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 mt-2 cursor-pointer"
                            onClick={() => setEditOptsId(null)}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row mt-6 gap-2">
              <button
                type="button"
                className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 text-lg font-semibold cursor-pointer w-full sm:w-auto"
                onClick={handleAdd}
                style={{ minWidth: 80 }}
              >
                {editPreviewIndex !== null ? "Update" : "Add"}
              </button>
              <button
                type="button"
                className="bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 text-lg font-semibold cursor-pointer w-full sm:w-auto"
                onClick={clearAll}
                style={{ minWidth: 80 }}
              >
                Clear All
              </button>
            </div>

            {/* Preview Section */}
            <div className="mt-12 border-t border-gray-300/50 pt-8">
              <h3 className="text-lg font-semibold mb-4">
                {surveyName ? `${surveyName} Preview` : "Survey Preview"}
              </h3>
              {!templatePreviews.length ? (
                <p className="text-gray-500 italic">
                  No competencies added yet.
                </p>
              ) : (
                <div>
                  {templatePreviews.map((item, idx) => (
                    <PreviewItem key={idx} item={item} idx={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Competency Sections */}
            {templatePreviews.map((item, idx) => (
              <CompetencySection
                key={idx}
                title={item.competency}
                description={item.description}
                questions={item.questions.map((q) => ({
                  id: q.id.toString(),
                  text: q.text,
                  type: q.type,
                  options: q.options,
                }))}
                commentLabel="Additional Comments"
              />
            ))}

            {/* Final Actions */}
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
                onClick={() => {
                  if (isDataLoaded) saveToLocalStorage();
                  navigate("/survey-preview", {
                    state: { templatePreviews, surveyName },
                  });
                }}
              >
                Preview
              </Button>
            </div>
            {saveError && <div className="text-red-600 mt-2">{saveError}</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default SurvayScratch;
