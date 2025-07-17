import React, { useState, useMemo } from "react";
import { polarToCartesian, describeArc } from "../../../../utils/func/pieChartArc";
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
}

interface PieChartProps {
  datasetIndex?: number;
  data?: CompetencyData[];
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
  radius = 100,
  isEditMode = false,
  pageId = "",
  onUpdateData,
}) => {
  const [isEditActive, setIsEditActive] = useState(false);
  const [editStates, setEditStates] = useState<
    Array<{
      minimized: boolean;
      position: { x: number; y: number };
    }>
  >([]);

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

  const toggleEdit = () => {
    setIsEditActive(!isEditActive);
  };

  const toggleMinimize = (index: number) => {
    setEditStates((prev) => {
      const newStates = [...prev];
      newStates[index] = {
        ...newStates[index],
        minimized: !newStates[index].minimized,
      };
      return newStates;
    });
  };

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

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <div className="pie-chart-wrapper">
      {isEditMode && (
        <button onClick={toggleEdit} className="chart-edit">
          {isEditActive ? "Exit Edit Mode" : "Edit Chart"}
        </button>
      )}

      <div
        className="pie-chart"
        style={{
          width: `${radius * 2 + 100}px`,
          height: `${radius * 2 + 100}px`,
        }}
      >
        <svg width={radius * 2 + 100} height={radius * 2 + 150}>
          <g transform={`translate(${radius + 50},${radius + 50})`}>
            {slices.map((slice, index) => (
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
                  x1={polarToCartesian(0, 0, radius + 10, slice.midAngle!).x}
                  y1={polarToCartesian(0, 0, radius + 10, slice.midAngle!).y}
                  x2={slice.labelX}
                  y2={slice.labelY}
                  stroke="#999"
                  strokeWidth="1"
                />
                <circle
                  cx={slice.labelX}
                  cy={slice.labelY}
                  r="14"
                  fill="#fff"
                  stroke={slice.color}
                  strokeWidth="2"
                />
                <text
                  x={slice.labelX}
                  y={slice.labelY + 4}
                  textAnchor="middle"
                  fill="#333"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {slice.value.toFixed(2)}
                </text>
              </React.Fragment>
            ))}
          </g>
        </svg>

        <div className="center-label">{title}</div>

        {slices.map((slice, i) => (
          <React.Fragment key={i}>
            {/* Display data in view mode */}
            {!isEditActive && (
              <div
                className="label-text"
                style={{
                  left: `${
                    slice.labelX +
                    radius +
                    50 +
                    (slice.anchor === "start" ? 20 : -220)
                  }px`,
                  top: `${slice.labelY + radius + 50 - 24}px`,
                  textAlign: slice.anchor === "start" ? "left" : "right",
                }}
              >
                <div className="label-title">{slice.category}</div>
                <div className="label-desc">{slice.question}</div>
              </div>
            )}

            {/* Edit mode controls */}
            {isEditActive && (
              <div
                className={`label-edit ${
                  editStates[i]?.minimized ? "minimized" : ""
                }`}
                style={{
                  left: `${editStates[i]?.position.x || 0}px`,
                  top: `${editStates[i]?.position.y || 0}px`,
                }}
              >
                <div className="edit-header">
                  <span className="competency-name">
                    {truncate(slice.category, 16) || "N/A"}
                  </span>
                  <div className="edit-controls">
                    <button
                      type="button"
                      className="minimize-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMinimize(i);
                      }}
                    >
                      <i
                        className="material-icons"
                        title={editStates[i]?.minimized ? "Expand" : "Collapse"}
                      >
                        {editStates[i]?.minimized ? "add" : "horizontal_rule"}
                      </i>
                    </button>
                    <div className="drag-btn">
                      <i className="material-icons" title="Drag">
                        drag_indicator
                      </i>
                    </div>
                  </div>
                </div>

                {!editStates[i]?.minimized && (
                  <div className="edit-body">
                    <div className="edit-row">
                      <label>Label:</label>
                      <input
                        type="text"
                        defaultValue={slice.category}
                        onChange={(e) =>
                          onValueChange(slice.index!, "category", e)
                        }
                        placeholder="Competency name"
                      />
                    </div>
                    <div className="edit-row">
                      <label>Value:</label>
                      <input
                        type="number"
                        defaultValue={slice.value}
                        step="0.01"
                        min="0"
                        max="5"
                        onChange={(e) =>
                          onValueChange(slice.index!, "value", e)
                        }
                        placeholder="Rating value"
                      />
                    </div>
                    <div className="edit-row">
                      <label>Description:</label>
                      <textarea
                        defaultValue={slice.question}
                        onChange={(e) =>
                          onValueChange(slice.index!, "question", e)
                        }
                        placeholder="Competency description"
                      />
                    </div>
                    <div className="edit-row">
                      <label>Color:</label>
                      <input
                        type="color"
                        defaultValue={slice.color}
                        onChange={(e) =>
                          onValueChange(slice.index!, "color", e)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
