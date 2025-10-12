import React from "react";
import Footer from "../../../report/footer/Footer";

interface FeedbackItem {
  id: string;
  iconColor: string;
  feedbackText: string;
}

interface OpenEndedFeedbackSectionProps {
  question: string;
  feedbackItems: FeedbackItem[];
  organizationName: string;
  pageNumber: number;
  isEditing?: boolean;
}

export default function OpenEndedFeedbackSection({
  question,
  feedbackItems,
  organizationName,
  pageNumber,
  isEditing = false,
}: OpenEndedFeedbackSectionProps) {
  return (
    <>
      <div className="mb-6">
        <p className="font-semibold text-lg mb-4">{question}</p>
        <ul className="space-y-10">
          {feedbackItems.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="inline-block mt-1">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="6" r="4" fill={item.iconColor} />
                  <path d="M4 20 A8 8 0 0 1 20 20" fill={item.iconColor} />
                </svg>
              </span>
              <span className="font-medium text-base">{item.feedbackText}</span>
            </li>
          ))}
        </ul>
      </div>
      
    </>
  );
}

// Dummy data for component usage
export const dummyOpenEndedFeedbackData: OpenEndedFeedbackSectionProps = {
  question:
    "What are this individual's greatest strengths in their current role?",
  feedbackItems: [
    {
      id: "feedback-1",
      iconColor: "#2563eb",
      feedbackText:
        "I believe I bring strategic thinking and consistency to my work, which helps the team stay focused.",
    },
    {
      id: "feedback-2",
      iconColor: "#65a30d",
      feedbackText:
        "They consistently show initiative and take ownership of key deliverables without needing close supervision.",
    },
    {
      id: "feedback-3",
      iconColor: "#eab308",
      feedbackText:
        "Strong collaborator—always willing to support the team and jump in when help is needed.",
    },
    {
      id: "feedback-4",
      iconColor: "#b91c1c",
      feedbackText:
        "They provide clear direction and make time to coach and develop team members.",
    },
  ],
  organizationName: "Talent Boozt",
  pageNumber: 12,
  isEditing: false,
};
