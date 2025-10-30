import React from "react";

interface CompetencyGap {
  id: string;
  number: number;
  title: string;
  description: string;
  selfRating: number;
  othersRating: number;
  maxRating?: number;
}

interface PerceptionGapChartProps {
  data: CompetencyGap[];
  title?: string;
  isEditMode?: boolean;
  onUpdateData?: (args: { index: number; field: string; value: any }) => void;
  selfColor?: string;
  othersColor?: string;
}

export default function PerceptionGapChart({
  data,
  title = "Hidden Strengths Overall",
  isEditMode = false,
  onUpdateData,
  selfColor = "#4ade80",
  othersColor = "#fb923c",
}: PerceptionGapChartProps) {
  const handleDataUpdate = (index: number, field: string, value: any) => {
    if (onUpdateData) {
      onUpdateData({ index, field, value });
    }
  };

  const calculatePercentage = (rating: number, maxRating: number = 5) => {
    return (rating / maxRating) * 100;
  };

  return (
    <div className="w-full">

      {/* Competency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((item, index) => (
          <div key={item.id} className="space-y-3">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900">
              {item.number}.{" "}
              {isEditMode ? (
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleDataUpdate(index, "title", e.target.value)
                  }
                  className="border-b border-gray-300 outline-none bg-transparent w-full"
                />
              ) : (
                item.title
              )}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {isEditMode ? (
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    handleDataUpdate(index, "description", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded p-2 outline-none text-sm"
                  rows={2}
                />
              ) : (
                item.description
              )}
            </p>

            {/* Self Rating */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Your Rating -{" "}
                  {isEditMode ? (
                    <input
                      type="number"
                      value={item.selfRating}
                      onChange={(e) =>
                        handleDataUpdate(
                          index,
                          "selfRating",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 border-b border-gray-300 outline-none text-center"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  ) : (
                    item.selfRating.toFixed(1)
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${calculatePercentage(item.selfRating)}%`,
                    backgroundColor: selfColor,
                  }}
                ></div>
              </div>
            </div>

            {/* Others Rating */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Others -{" "}
                  {isEditMode ? (
                    <input
                      type="number"
                      value={item.othersRating}
                      onChange={(e) =>
                        handleDataUpdate(
                          index,
                          "othersRating",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-16 border-b border-gray-300 outline-none text-center"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  ) : (
                    item.othersRating.toFixed(1)
                  )}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${calculatePercentage(item.othersRating)}%`,
                    backgroundColor: othersColor,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No data available to display</p>
        </div>
      )}
    </div>
  );
}

// Transform function for backend data
export const transformToPerceptionGapFormat = (
  competencies: any[]
): CompetencyGap[] => {
  return competencies.map((item, index) => ({
    id: item.id || `gap-${index}`,
    number: index + 1,
    title: item.title,
    description: item.description,
    selfRating: item.selfRating || 0,
    othersRating: item.othersRating || item.othersAverage || item.rating || 0,
    maxRating: 5,
  }));
};
