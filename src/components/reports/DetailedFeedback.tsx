import React from "react";
import ReportHeader from "../../../report/shared/ReportHeader";
import LeadershipQuestionRow from "../ui/LeadershipQuestionRow";
import DraggableComp from "../../../report/Draggable/DraggableComp";
import Footer from "../../../report/footer/Footer";

interface QuestionRating {
  rater: string;
  rating: number;
  color: string;
}

interface Question {
  question: string;
  ratings: QuestionRating[];
}

interface DetailedFeedbackProps {
  competency: string;
  averageRating: number;
  questions: Question[];
  isEditMode: boolean;
  org: string;
  pageNo: number;
  onQuestionsChange?: (questions: Question[]) => void;
}

export default function DetailedFeedback(props: DetailedFeedbackProps) {
  return (
    <>
      {/* Detailed Feedback Section */}

      {/* Example for Leadership only, can be made dynamic later */}
      <div className="flex flex-row justify-between items-center mb-2 w-full">
        <span className="font-semibold text-xl">{props.competency}</span>
        <span className="font-semibold text-xl">
          Average Rating:{" "}
          <span className="text-red-600">{props.averageRating}</span>
        </span>
      </div>
      <table
        className="w-full mt-2 text-left border-separate"
        style={{ borderSpacing: 0 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <th className="py-2 font-semibold">Questions</th>
            <th className="py-2 font-semibold">Raters</th>
            <th className="py-2 font-semibold">Rating</th>
          </tr>
        </thead>

        <tbody>
          {props.questions.map((question, qIndex) => (
            <React.Fragment key={qIndex}>
              {props.isEditMode && (
                <div style={{ position: "relative" }}>
                  <DraggableComp title={question.question}>
                    <div className="p-4">
                      <div className="drg-wrapper">
                        <div className="flex flex-col mb-2">
                          <label htmlFor={`edit-question-${qIndex}`}>
                            Question:
                          </label>
                          <input
                            id={`edit-question-${qIndex}`}
                            type="text"
                            className="border border-gray-300 rounded-md mb-2 px-1.5"
                            value={question.question}
                            onChange={(e) => {
                              const newQuestions = [...props.questions];
                              newQuestions[qIndex].question = e.target.value;
                              props.onQuestionsChange?.(newQuestions);
                            }}
                          />
                        </div>
                        {question.ratings.map((r, rIndex) => (
                          <div
                            className="flex items-center justify-between"
                            key={rIndex}
                          >
                            <div className="me-4 flex flex-col">
                              <label>Rater:</label>
                              <input
                                type="text"
                                className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                value={r.rater}
                                onChange={(e) => {
                                  const newQuestions = [...props.questions];
                                  newQuestions[qIndex].ratings[rIndex].rater =
                                    e.target.value;
                                  props.onQuestionsChange?.(newQuestions);
                                }}
                              />
                            </div>
                            <div className="me-4 flex flex-col">
                              <label>Rating:</label>
                              <input
                                type="number"
                                step="0.1"
                                className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                value={r.rating}
                                max={5}
                                onChange={(e) => {
                                  const newQuestions = [...props.questions];
                                  newQuestions[qIndex].ratings[rIndex].rating =
                                    parseFloat(e.target.value);
                                  props.onQuestionsChange?.(newQuestions);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DraggableComp>
                </div>
              )}
              <LeadershipQuestionRow
                question={question.question}
                ratings={question.ratings}
              />
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );
}
