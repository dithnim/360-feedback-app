import React from "react";

interface LikertQuestion {
  id: string;
  text: string;
}

interface CompetencySectionProps {
  title: string;
  questions: LikertQuestion[];
  commentLabel?: string;
}

const options = [
  { value: "strongly_agree", label: "Strongly Agree" },
  { value: "agree", label: "Agree" },
  { value: "neutral", label: "Neutral" },
  { value: "strongly_disagree", label: "Strongly Disagree" },
  { value: "disagree", label: "Disagree" },
];

const CompetencySection: React.FC<CompetencySectionProps> = ({
  title,
  questions,
  commentLabel = "",
}) => {
  return (
    <div className="bg-white rounded-lg pb-6 w-full mx-auto border border-gray-200 mt-6">
      <div className="bg-green-700 text-white rounded-t-lg px-6 py-5 mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-8 p-6 rounded-lg">
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p className="mb-4 text-gray-800 font-medium">
              {idx + 1}. {q.text}
            </p>
            <div className="flex flex-wrap gap-6 mb-2">
              {options.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt.value}
                    className="accent-green-700"
                  />
                  <span className="font-semibold text-gray-700 text-sm">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="mb-2 text-gray-800 font-medium">
            {questions.length + 1}. {commentLabel || "Comments"}
          </p>
          <input
            type="text"
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Add your comments here..."
          />
        </div>
        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="bg-green-700 text-white px-8 py-2 rounded font-semibold hover:bg-green-800"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompetencySection;
