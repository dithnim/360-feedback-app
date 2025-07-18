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
  onUpdateData?: (data: {
    dataindex: number;
    index: number;
    field: string;
    value: any;
  }) => void;
}

const PieChart: React.FC<PieChartProps> = ({
  datasetIndex = 0,
  data = [],
  title = "",
  radius = 180,
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
    0: { x: 30, y: -30 },
    1: { x: 40, y: 10 },
    2: { x: 5, y: 40 },
    3: { x: -40, y: 15 },
    4: { x: -20, y: -30 },
    // Add more as needed
  };

  // Map slices to assign custom positions if available
  const slicesWithCustom = slices.map((slice, i) => ({
    ...slice,
    circleX: customPositions[i]?.x + slice.labelX,
    circleY: customPositions[i]?.y + slice.labelY,
  }));

  // const toggleMinimize = (index: number) => {
  //   setEditStates((prev) => {
  //     const newStates = [...prev];
  //     newStates[index] = {
  //       ...newStates[index],
  //       minimized: !newStates[index].minimized,
  //     };
  //     return newStates;
  //   });
  // };

  const onValueChange = (
    index: number,
    field: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      field === "value" ? parseFloat(event.target.value) : event.target.value;
    if (onUpdateData) {
      onUpdateData({ dataindex: datasetIndex, index, field, value });
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
              <div style={{ position: "relative" }}>
                <DraggableComp title={slice.category || "N/A"}>
                  <div className="p-4">
                    <div className="drg-wrapper text-sm">
                      <div className="flex flex-col mb-2 font-medium text-gray-700">
                        <label htmlFor="label">Label:</label>
                        <input
                          type="text"
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
                          type="text"
                          value={slice.value}
                          step="0.01"
                          min="0"
                          max="5"
                          onChange={(e) =>
                            onValueChange(slice.index!, "value", e)
                          }
                          placeholder="Rating value"
                        />
                      </div>
                      <div className="flex flex-col mb-2 font-medium text-gray-700">
                        <label htmlFor="label">Description:</label>
                        <textarea
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
                          className="w-full"
                          value={slice.color}
                          onChange={(e) =>
                            onValueChange(slice.index!, "color", e)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </DraggableComp>
              </div>
            )}
          </React.Fragment>
        ))}

        <svg
          width={radius * 2 + 100}
          height={radius * 2 + 100}
          viewBox={`0 0 ${radius * 2 + 100} ${radius * 2 + 100}`}
          className="mx-auto pie-svg w-full"
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
                  r="8"
                  fill={slice.color}
                  stroke={slice.color}
                  strokeWidth="2"
                />

                <circle
                  cx={slice.circleX}
                  cy={slice.circleY}
                  r="20"
                  fill={"#fff"}
                  stroke={slice.color}
                  strokeWidth="2"
                />

                <text
                  textAnchor="middle"
                  className=""
                  alignmentBaseline="middle"
                  fontSize="15 "
                  fontWeight="bold"
                  fill="#000"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  x={polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).x}
                  y={
                    polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).y + 6
                  }
                >
                  {slice.value}
                </text>

                <text
                  textAnchor="middle"
                  className=""
                  alignmentBaseline="middle"
                  fontSize="15 "
                  fontWeight="bold"
                  fill="#000"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  x={polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).x}
                  y={
                    polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).y + 6
                  }
                >
                  {slice.question}
                </text>

                {/* Centered label inside the pie slice */}
                <text
                  x={polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).x}
                  y={
                    polarToCartesian(0, 0, radius * 0.6, slice.midAngle!).y + 6
                  }
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize="15 "
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

        <div className="center-label">{title}</div>
      </div>
    </div>
  );
};

export default PieChart;
