import React from "react";

interface Rating {
  rater: string;
  rating: number;
  color: string;
}

interface LeadershipQuestionRowProps {
  question: string;
  ratings: Rating[];
}

const LeadershipQuestionRow: React.FC<LeadershipQuestionRowProps> = ({
  question,
  ratings,
}) => (
  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
    <td className="py-4 align-top w-1/3">{question}</td>
    <td className="py-4 align-top w-1/3">
      <div className="flex flex-col gap-2">
        {ratings.map((r, idx) => (
          <span key={idx}>{r.rater}</span>
        ))}
      </div>
    </td>
    <td className="py-4 align-top w-1/3">
      <div className="flex flex-col gap-2">
        {ratings.map((r, idx) => (
          <div className="flex items-center gap-2" key={idx}>
            <div className="h-2 w-full rounded bg-gray-200">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                  maxWidth: "100%",
                  backgroundColor: r.color,
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold">
              {isNaN(Number(r.rating)) ? 0 : r.rating}
            </span>
          </div>
        ))}
      </div>
    </td>
  </tr>
);

export default LeadershipQuestionRow;
