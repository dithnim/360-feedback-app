import { useState } from "react";
import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";
import CompetencySection from "../components/CompetencySection";

const defaultOptions = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Strongly Disagree",
  "Disagree",
];

const CreateTemplate = () => {
  type Question = { id: number; text: string; options: string[] };
  const [competency, setCompetency] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // For preview edit
  const [isEditingPreview, setIsEditingPreview] = useState(true);

  // Store the last submitted data for preview
  const [previewData, setPreviewData] = useState<{
    competency: string;
    templateName: string;
    description: string;
    questions: Question[];
  } | null>(null);

  const handleAdd = () => {
    if (input.trim() === "") return;
    const newQuestions = [
      ...questions,
      { id: Date.now(), text: input, options: [...defaultOptions] },
    ];
    setQuestions(newQuestions);
    setInput("");
    // Update preview data after add
    setPreviewData({
      competency,
      templateName,
      description,
      questions: newQuestions,
    });
    setIsEditingPreview(false);
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav name="John Doe" position="HR Manager" title="Create Template" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="mx-auto rounded-lg">
          <div className="flex justify-end mb-6">
            <Button variant="next">Next</Button>
          </div>
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
                disabled={isEditingPreview}
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
                disabled={isEditingPreview}
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
              disabled={isEditingPreview}
            ></textarea>
          </div>

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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter question..."
                disabled={isEditingPreview}
              />
              <button
                type="button"
                className="bg-red-700 hover:bg-red-800 text-white rounded px-3 py-2"
                onClick={handleAdd}
                aria-label="Add question"
                disabled={isEditingPreview}
              >
                Add
              </button>
            </div>
          </div>

          {/* Render questions list */}
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="mb-2">
                {editId === q.id ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg p-2 w-full"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white rounded px-2 py-1"
                      onClick={() => handleEditSave(q.id)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg p-2 w-full"
                      value={q.text}
                      readOnly
                    />
                    <button
                      className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center"
                      style={{ width: 40, height: 40 }}
                      onClick={() => handleDelete(q.id)}
                      aria-label="Delete question"
                    >
                      <span style={{ fontSize: 24 }}>–</span>
                    </button>
                    <button
                      className="bg-[#EE3E41] text-white rounded p-2 flex items-center justify-center"
                      style={{ width: 40, height: 40 }}
                      onClick={() => handleEdit(q.id, q.text)}
                      aria-label="Edit question"
                    >
                      <span style={{ fontSize: 18 }}>✎</span>
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 ml-2 text-gray-700 text-md items-center">
                  {q.options.map((opt: string) => (
                    <span key={opt}>• {opt}</span>
                  ))}
                  <button
                    className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center ml-2"
                    style={{ width: 32, height: 32 }}
                    onClick={() => handleEditOpts(q.id, q.options)}
                    aria-label="Edit options"
                  >
                    <span style={{ fontSize: 16 }}>✎</span>
                  </button>
                </div>
                {/* Modal for editing options */}
                {editOptsId !== null && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
                    onClick={handleEditOptsCancel}
                  >
                    <div
                      className="bg-white rounded-lg p-8 min-w-[350px] w-full max-w-xs flex flex-col items-center"
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

                      <div className="flex w-full justify-start">
                        <button
                          className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 mt-2"
                          onClick={() => handleEditOptsSave(editOptsId)}
                        >
                          Save
                        </button>
                        <button
                          className="ml-4 bg-gray-400 hover:bg-gray-500 text-white rounded px-6 py-2 mt-2"
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
          <div className="flex mt-6">
            <button
              type="button"
              className="bg-[#8B1C13] hover:bg-[#a12a22] text-white rounded px-6 py-2 text-lg font-semibold"
              onClick={handleAdd}
              disabled={isEditingPreview || input.trim() === ""}
              style={{ minWidth: 80 }}
            >
              Add
            </button>
          </div>

          {/* Preview Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            {previewData && previewData.templateName && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {previewData.competency || "Competency"}
                  </span>
                  <button
                    className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center"
                    style={{ width: 32, height: 32 }}
                    onClick={() => {
                      setCompetency(previewData.competency);
                      setTemplateName(previewData.templateName);
                      setDescription(previewData.description);
                      setQuestions(
                        previewData.questions.map((q) => ({ ...q }))
                      );
                      setIsEditingPreview(true);
                    }}
                    title="Edit"
                  >
                    <span style={{ fontSize: 16 }}>✎</span>
                  </button>
                </div>
                <div className="mb-2 text-sm font-medium text-black">
                  {previewData.description || (
                    <span className="text-gray-400">No description</span>
                  )}
                </div>
                <ul className="list-disc ml-6">
                  {previewData.questions.map((q) => (
                    <li key={q.id} className="mb-1">
                      {q.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Example CompetencySection below, not changed */}
        <CompetencySection
          title="Communication"
          questions={[
            {
              id: "1",
              text: "What is your opinion on the candidate's performance?",
            },
            { id: "2", text: "How well does the candidate communicate?" },
            { id: "3", text: "What are the candidate's strengths?" },
          ]}
          commentLabel="Additional Comments"
        />
      </main>
    </div>
  );
};

export default CreateTemplate;
