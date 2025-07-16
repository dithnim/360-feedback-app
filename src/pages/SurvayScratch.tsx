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

const SurvayScratch = () => {
  type Question = { id: number; text: string; options: string[] };
  const [competency, setCompetency] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [templatePreview, setTemplatePreview] = useState({
    templateName: "",
    competency: "",
    description: "",
    questions: [] as Question[],
  });

  const handleQuestionAdd = () => {
    if (input.trim() === "") return;
    setQuestions([
      ...questions,
      { id: Date.now(), text: input, options: [...defaultOptions] },
    ]);
    setInput("");
  };

  const handleAdd = () => {
    if (!competency.trim()) return;
    // If no questions, don't add
    if (questions.length === 0) return;

    setTemplatePreview((prev) => ({
      ...prev,
      templateName,
      competency,
      description,
      questions: [...prev.questions, ...questions],
    }));

    setTemplateName("");
    setCompetency("");
    setDescription("");
    setQuestions([]);
    setInput("");
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
  };

  const PreviewCompetency = ({
    competency,
    description,
    questions,
  }: {
    competency: string;
    description: string;
    questions: Question[];
  }) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">{competency || "Competency"}</span>
        <button
          className="bg-[#EE3E41] text-white rounded p-1 flex items-center justify-center"
          style={{ width: 32, height: 32 }}
          onClick={() => {
            setTemplateName(templatePreview.templateName);
            setCompetency(competency);
            setDescription(description);
            setQuestions(questions);
          }}
          title="Edit"
        >
          <span style={{ fontSize: 16 }}>✎</span>
        </button>
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav name="John Doe" position="HR Manager" title="Create Template" />

      {/* Main Content Area */}
      <main className="flex flex-col py-6 px-2 sm:px-6 md:px-12 lg:px-24 xl:px-36 2xl:px-64 overflow-y-auto bg-white w-full">
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
              htmlFor="questions"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Questions*
            </label>
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
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg p-2 w-full"
                      value={q.text}
                      readOnly
                    />
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
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            {templatePreview.questions.length > 0 && (
              <div>
                {templatePreview.questions.map((q) => (
                  <PreviewCompetency
                    key={q.id}
                    competency={templatePreview.competency}
                    description={templatePreview.description}
                    questions={[q]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Example CompetencySection below, not changed */}
        <CompetencySection
          title={templatePreview.competency || "Competency"}
          questions={templatePreview.questions.map((q) => ({
            id: q.id.toString(),
            text: q.text,
          }))}
          commentLabel="Additional Comments"
        />

        <div className="flex flex-col sm:flex-row items-center mt-8 gap-2">
          <Button
            variant="edit"
            className="bg-[#8B1C13] font-medium text-md w-full sm:w-auto"
          >
            Save Template
          </Button>
          <Button
            className="bg-transparent border border-[#ed3f41] text-[#ed3f41] font-semibold px-2 py-1 rounded-lg text-md w-full sm:w-auto"
            variant="next"
          >
            Preview
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SurvayScratch;
