import React from "react";

type QuestionType =
  | "multiple-choice"
  | "rating-scale"
  | "open-ended"
  | "yes-no";

interface LikertQuestion {
  id: string;
  text: string;
  type?: QuestionType;
  options?: string[];
}

interface CompetencySectionProps {
  title: string;
  questions: LikertQuestion[];
  commentLabel?: string;
}

const defaultOptions = [
  { value: "strongly_agree", label: "Strongly Agree" },
  { value: "agree", label: "Agree" },
  { value: "neutral", label: "Neutral" },
  { value: "disagree", label: "Disagree" },
  { value: "strongly_disagree", label: "Strongly Disagree" },
];

const ratingOptions = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const CompetencySection: React.FC<CompetencySectionProps> = ({
  title,
  questions,
  commentLabel = "",
}) => {
  const renderQuestionInput = (
    question: LikertQuestion,
    questionIndex: number
  ) => {
    const questionType = question.type || "multiple-choice";
    const questionOptions = question.options || [];

    switch (questionType) {
      case "open-ended":
        return (
          <div className="mt-4">
            <textarea
              name={`q_${question.id}`}
              className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[100px] focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your response here..."
              rows={4}
            />
          </div>
        );

      case "rating-scale":
        const options =
          questionOptions.length > 0
            ? questionOptions.map((opt) => ({
                value: opt.toLowerCase(),
                label: opt,
              }))
            : ratingOptions;
        return (
          <div className="flex flex-wrap gap-6 mb-2">
            {options.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q_${question.id}`}
                  value={opt.value}
                  className="accent-green-700"
                />
                <span className="font-semibold text-gray-700 text-sm">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        );

      case "yes-no":
        const yesNoOpts =
          questionOptions.length > 0
            ? questionOptions.map((opt) => ({
                value: opt.toLowerCase(),
                label: opt,
              }))
            : yesNoOptions;
        return (
          <div className="flex flex-wrap gap-6 mb-2">
            {yesNoOpts.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q_${question.id}`}
                  value={opt.value}
                  className="accent-green-700"
                />
                <span className="font-semibold text-gray-700 text-sm">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        );

      case "multiple-choice":
      default:
        const multipleChoiceOptions =
          questionOptions.length > 0
            ? questionOptions.map((opt) => ({
                value: opt.toLowerCase().replace(/\s+/g, "_"),
                label: opt,
              }))
            : defaultOptions;
        return (
          <div className="flex flex-wrap gap-6 mb-2">
            {multipleChoiceOptions.map((opt) => (
              <label key={opt.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`q_${question.id}`}
                  value={opt.value}
                  className="accent-green-700"
                />
                <span className="font-semibold text-gray-700 text-sm">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        );
    }
  };
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

            {renderQuestionInput(q, idx)}
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default CompetencySection;
