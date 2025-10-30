import React, { useMemo } from "react";

import DraggableComp from "../../../Draggable/DraggableComp";

// Helper functions for pie chart arc calculations
const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    x,
    y,
    "Z",
  ].join(" ");
};
import "./PieChart.scss";

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
  circleX?: number; // custom X position for circle
  circleY?: number; // custom Y position for circle
}

interface PieChartProps {
  datasetIndex?: number;
  data?: CompetencyData[];
  desc?: string;
  title?: string;
  radius?: number;
  isEditMode?: boolean;
  pageId?: string;
  onUpdateData?: (data: { index: number; field: string; value: any }) => void;
}

// Helper to wrap SVG text
const wrapSvgText = (text: string, maxChars: number = 18): string[] => {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxChars) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

const PieChart: React.FC<PieChartProps> = ({
  datasetIndex = 0,
  data = [],
  title = "",
  radius = 130,
  isEditMode = false,
  onUpdateData,
}) => {
  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + d.value, 0);
  }, [data]);

  const slices = useMemo(() => {
    let angle = 0;
    return data.map((d, index) => {
      const startAngle = angle;
      const angleSize = (d.value / total) * 360;
      const midAngle = startAngle + angleSize / 2;
      angle += angleSize;
      const labelPos = polarToCartesian(0, 0, radius + 40, midAngle);
      const anchor = midAngle > 160 && midAngle < 359 ? "end" : "start";

      return {
        ...d,
        index,
        startAngle,
        endAngle: startAngle + angleSize,
        midAngle,
        labelX: labelPos.x,
        labelY: labelPos.y,
        anchor,
      };
    });
  }, [data, total, radius]);

  // Custom positions for each circle (by index)
  const customPositions: Record<number, { x: number; y: number }> = {
    0: { x: 30, y: -22 },
    1: { x: 20, y: -30 },
    2: { x: 35, y: -14 },
    3: { x: 10, y: 40 },
    4: { x: -30, y: 5 },
    // Add more as needed
  };

  // Map slices to assign custom positions if available
  const slicesWithCustom = slices.map((slice, i) => ({
    ...slice,
    circleX: customPositions[i]?.x + slice.labelX,
    circleY: customPositions[i]?.y + slice.labelY,
  }));

  const onValueChange = (
    index: number,
    field: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      field === "value" ? parseFloat(event.target.value) : event.target.value;
    if (onUpdateData) {
      onUpdateData({ index, field, value });
    }
  };

  return (
    <div className="pie-chart-wrapper w-full h-full flex items-center">
      <div className="pie-chart w-full h-full">
        {slicesWithCustom.map((slice, i) => (
          <React.Fragment key={i}>
            {/* Display data in view mode */}
            {/* Edit mode controls */}

            {isEditMode && (
              <DraggableComp
                title={slice.category || "N/A"}
                initialPosition={{
                  x: slice.circleX ? slice.circleX + 200 : 200 + i * 50,
                  y: slice.circleY ? slice.circleY + 100 : 100 + i * 50,
                }}
              >
                <div className="p-4">
                  <div className="drg-wrapper text-sm">
                    <div className="flex flex-col mb-2 font-medium text-gray-700">
                      <label htmlFor="label">Label:</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1"
                        value={slice.category}
                        onChange={(e) =>
                          onValueChange(slice.index!, "category", e)
                        }
                        placeholder="Competency name"
                      />
                    </div>
                    <div className="flex flex-col mb-2 font-medium text-gray-700">
                      <label htmlFor="label">Value:</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="5"
                        className="border border-gray-300 rounded px-2 py-1"
                        value={slice.value}
                        onChange={(e) =>
                          onValueChange(slice.index!, "value", e)
                        }
                        placeholder="Rating value"
                      />
                    </div>
                    <div className="flex flex-col mb-2 font-medium text-gray-700">
                      <label htmlFor="label">Description:</label>
                      <textarea
                        className="border border-gray-300 rounded px-2 py-1"
                        value={slice.question}
                        onChange={(e) =>
                          onValueChange(slice.index!, "question", e)
                        }
                        placeholder="Competency description"
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="flex flex-col mb-2 font-medium text-gray-700">
                      <label htmlFor="label">Color:</label>
                      <input
                        type="color"
                        className="w-full h-8 border border-gray-300 rounded"
                        value={slice.color}
                        onChange={(e) =>
                          onValueChange(slice.index!, "color", e)
                        }
                      />
                    </div>
                  </div>
                </div>
              </DraggableComp>
            )}
          </React.Fragment>
        ))}

        <div className="mx-auto pie-svg w-full h-full flex justify-center items-center">
          <svg
            width={radius * 2 + 100}
            height={radius * 2 + 100}
            viewBox={`0 0 ${radius * 2 + 100} ${radius * 2 + 100}`}
            className="w-full"
          >
            <g
              transform={`translate(${(radius * 2 + 100) / 2}, ${(radius * 2 + 100) / 2})`}
            >
              {slicesWithCustom.map((slice, index) => (
                <React.Fragment key={index}>
                  <path
                    d={describeArc(
                      0,
                      0,
                      radius,
                      slice.startAngle!,
                      slice.endAngle!
                    )}
                    fill={slice.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <line
                    x1={polarToCartesian(0, 0, radius, slice.midAngle!).x}
                    y1={polarToCartesian(0, 0, radius, slice.midAngle!).y}
                    x2={slice.labelX}
                    y2={slice.labelY}
                    stroke={slice.color}
                    strokeWidth="3"
                  />
                  <circle
                    cx={slice.labelX}
                    cy={slice.labelY}
                    r="6"
                    fill={slice.color}
                    stroke={slice.color}
                    strokeWidth="2"
                  />

                  <circle
                    cx={slice.circleX}
                    cy={slice.circleY}
                    r="16"
                    fill={"#fff"}
                    stroke={slice.color}
                    strokeWidth="4"
                  />

                  {/* Score inside colored circle */}
                  <circle
                    cx={slice.circleX}
                    cy={slice.circleY}
                    r="15"
                    fill={"#fff"}
                    stroke={slice.color}
                    strokeWidth="0"
                  />
                  <text
                    x={slice.circleX}
                    y={slice.circleY}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#000"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {slice.value.toFixed(2)}
                  </text>
                  {/* Description next to score circle */}
                  <text
                    x={slice.circleX + (slice.circleX > 0 ? 35 : -35)}
                    y={slice.circleY + 5}
                    textAnchor={slice.circleX > 0 ? "start" : "end"}
                    alignmentBaseline="middle"
                    fontSize="12"
                    fill="#222"
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                    className="font-medium"
                  >
                    {wrapSvgText(slice.question || "").map((line, idx) => (
                      <tspan
                        key={idx}
                        x={slice.circleX + (slice.circleX > 0 ? 35 : -35)}
                        dy={idx === 0 ? 0 : 18}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>

                  {/* Category name inside the pie slice */}
                  <text
                    x={polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).x}
                    y={
                      polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).y +
                      6
                    }
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#fff"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                  >
                    {slice.category}
                  </text>
                </React.Fragment>
              ))}
            </g>
          </svg>
        </div>
        <div className="center-label w-24 h-24">{title}</div>
      </div>
    </div>
  );
};

export default PieChart;
