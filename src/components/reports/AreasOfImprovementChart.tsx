import React from "react";

interface ImprovementArea {
  id: string;
  title: string;
  rating: number;
  description: string;
  isHighlighted?: boolean;
}

interface AreasOfImprovementChartProps {
  data: ImprovementArea[];
  userName?: string;
  isEditMode?: boolean;
  onUpdateData?: (args: { index: number; field: string; value: any }) => void;
  color?: string;
}

export default function AreasOfImprovementChart({
  data,
  userName = "John Doe",
  isEditMode = false,
  onUpdateData,
  color = "#dc3545",
}: AreasOfImprovementChartProps) {
  const handleDataUpdate = (index: number, field: string, value: any) => {
    if (onUpdateData) {
      onUpdateData({ index, field, value });
    }
  };

  return (
    <div className="w-full">
      {/* Introduction */}
      <div className="mb-10">
        <p className="text-gray-800 text-[15px] leading-relaxed">
          Below are the statements where you received relatively lower ratings,
          indicating opportunities for growth and development.
        </p>
      </div>

      {/* Timeline Chart */}
      <div className="relative pl-6 pr-4">
        {/* Top end of timeline */}
        <div
          className="absolute left-10 top-0 w-[5px] h-8"
          style={{
            background: `linear-gradient(to bottom, transparent, ${color})`,
          }}
        ></div>
        {/* Main vertical line */}
        <div
          className="absolute left-10 top-8 bottom-8 w-[5px]"
          style={{ backgroundColor: color }}
        ></div>

        {/* Improvement areas */}
        <div className="space-y-12">
          {data.map((area, index) => {
            // Calculate line length based on priority (first item = highest priority = longest line)
            const baseLength = 130; // Base length for highest priority (first item)
            const minLength = 70; // Minimum length for lowest priority (last item)
            const lengthDecrement =
              (baseLength - minLength) / Math.max(data.length - 1, 1);
            const lineLength = baseLength - index * lengthDecrement;

            return (
              <div
                key={area.id}
                className="relative flex items-start min-h-[60px]"
              >
                {/* Timeline node (dot) */}
                <div
                  className="absolute left-[33px] top-[22px] w-[14px] h-[14px] rounded-full z-20 border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                ></div>

                {/* Horizontal line connecting to circle */}
                <div
                  className="absolute left-10 top-[28px] h-[2px]"
                  style={{ width: `${lineLength}px`, backgroundColor: color }}
                ></div>

                {/* Rating circle */}
                <div
                  className="absolute top-[6px] w-[45px] h-[45px] border-[2.5px] rounded-full bg-white flex items-center justify-center z-20 shadow-sm"
                  style={{
                    left: `${40 + lineLength - 5}px`,
                    borderColor: color,
                  }}
                >
                  <span className="font-bold text-[15px]" style={{ color }}>
                    {area.rating}
                  </span>
                </div>

                {/* Content */}
                <div
                  className="flex-1 pt-1"
                  style={{ marginLeft: `${40 + lineLength + 55}px` }}
                >
                  <h3
                    className={`text-[16px] font-bold mb-1.5 ${
                      area.isHighlighted ? "text-[#4169e1]" : "text-gray-900"
                    }`}
                  >
                    {area.title}
                  </h3>
                  <p className="text-gray-700 text-[13px] leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom end of timeline */}
        <div
          className="absolute left-10 bottom-0 w-[5px] h-8"
          style={{
            background: `linear-gradient(to bottom, ${color}, transparent)`,
          }}
        ></div>
      </div>
    </div>
  );
}

