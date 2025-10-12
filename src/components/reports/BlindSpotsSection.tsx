import React from "react";
import PieChart from "../../../report/shared/charts/PieChart/PieChart";

interface CompetencyData {
  category: string;
  value: number;
  color: string;
  question?: string;
  index?: number;
  startAngle?: number;
  endAngle?: number;
  midAngle?: number;
  labelX?: number;
  labelY?: number;
  anchor?: string;
  circleX?: number;
  circleY?: number;
}

interface BlindSpotsSectionProps {
  chartData: CompetencyData[];
  chartTitle: string;
  descriptionText: string;
  isEditMode?: boolean;
  minHeight?: number;
  onUpdateData?: (args: any) => void;
}

export default function BlindSpotsSection({
  chartData,
  chartTitle,
  descriptionText,
  isEditMode = false,
  minHeight = 400,
  onUpdateData,
}: BlindSpotsSectionProps) {
  return (
    <>
      {/* Blind Spots Section */}

      <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
        {/* Blind Spots Chart and Annotations */}
        <div
          className="relative flex items-center justify-center w-full h-full"
          style={{ minHeight }}
        >
          {/* //?Piechart 4 */}
          <PieChart
            data={chartData}
            isEditMode={isEditMode}
            title={chartTitle}
            onUpdateData={onUpdateData}
          />
        </div>
      </div>
      <div className="mt-8">
        <p className="text-base">{descriptionText}</p>
      </div>
    </>
  );
}

// Dummy data for component usage
export const dummyBlindSpotsData: BlindSpotsSectionProps = {
  chartData: [
    {
      category: "Strategic Thinking",
      value: 25,
      color: "#3b82f6",
    },
    {
      category: "Communication",
      value: 20,
      color: "#8b5cf6",
    },
    {
      category: "Leadership",
      value: 18,
      color: "#ec4899",
    },
    {
      category: "Problem Solving",
      value: 15,
      color: "#f59e0b",
    },
    {
      category: "Team Collaboration",
      value: 12,
      color: "#10b981",
    },
    {
      category: "Innovation",
      value: 10,
      color: "#06b6d4",
    },
  ],
  chartTitle: "Blind Spots for Each Competency",
  descriptionText:
    "Addressing these areas can help reduce performance misalignments and improve team dynamics.",
  isEditMode: false,
  minHeight: 400,
};
