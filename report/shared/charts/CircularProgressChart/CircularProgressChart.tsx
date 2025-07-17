import React, { useState, useMemo } from "react";
import { polarToCartesian } from "../../../utils/func/pieChartArc";
import "./CircularProgressChart.scss";

interface CircularProgressChartProps {
  value?: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  subLabel?: string;
  description?: string;
  isEditMode?: boolean;
  datasetIndex?: number;
  pageId?: string;
  onUpdateData?: (data: {
    dataindex: number;
    index: number;
    field: string;
    value: any;
  }) => void;
}

const CircularProgressChart: React.FC<CircularProgressChartProps> = ({
  value = 0,
  max = 5,
  size = 120,
  color = "#FFBC42",
  label = "",
  subLabel = "",
  description = "",
  isEditMode = false,
  datasetIndex = 0,
  pageId = "",
  onUpdateData,
}) => {
  const [isEditActive, setIsEditActive] = useState(false);
  const [editStates, setEditStates] = useState<
    Array<{
      minimized: boolean;
      position: { x: number; y: number };
    }>
  >([
    {
      minimized: false,
      position: { x: 0, y: 0 },
    },
  ]);

  const radius = 40;

  const { strokeDasharray, strokeDashoffset } = useMemo(() => {
    const normalizedValue = (value / max) * 100;
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    const dashOffset = circumference * (1 - normalizedValue / 100);
    return { strokeDasharray: dashArray, strokeDashoffset: dashOffset };
  }, [value, max, radius]);

  const slice = useMemo(() => {
    const startAngle = 0;
    const angleSize = (value / max) * 360;
    const midAngle = startAngle + angleSize / 2;
    const labelPos = polarToCartesian(0, 0, radius + 40, midAngle);
    const anchor = midAngle > 160 && midAngle < 359 ? "end" : "start";

    return {
      label,
      value,
      color,
      description,
      index: 0,
      startAngle,
      endAngle: startAngle + angleSize,
      midAngle,
      labelX: labelPos.x,
      labelY: labelPos.y,
      anchor,
    };
  }, [value, max, radius, label, color, description]);

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

  return (
    <div
      className="circular-chart"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {isEditMode && (
        <button onClick={toggleEdit}>
          {isEditActive ? "Exit Edit Mode" : "Edit Chart"}
        </button>
      )}

      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#ddd"
          strokeWidth="13"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          strokeLinecap="round"
        />
        <text x="50" y="52" textAnchor="middle" fontSize="14" fontWeight="bold">
          {value.toFixed(1)}
        </text>
        <text x="50" y="65" textAnchor="middle" fontSize="10">
          {label}
        </text>
        {subLabel && (
          <text x="50" y="75" textAnchor="middle" fontSize="8">
            {subLabel}
          </text>
        )}
      </svg>

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
        ></div>
      )}

      {/* Edit mode controls */}
      {isEditActive && (
        <div
          className={`label-edit ${
            editStates[0]?.minimized ? "minimized" : ""
          }`}
          style={{
            left: `${editStates[0]?.position.x || 0}px`,
            top: `${editStates[0]?.position.y || 0}px`,
          }}
        >
          <div className="edit-header">
            <span className="competency-name">{slice.label}</span>
            <div className="edit-controls">
              <button
                type="button"
                className="minimize-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMinimize(0);
                }}
              >
                <i
                  className="material-icons"
                  title={editStates[0]?.minimized ? "Expand" : "Collapse"}
                >
                  {editStates[0]?.minimized ? "add" : "horizontal_rule"}
                </i>
              </button>
              <div className="drag-btn">
                <i className="material-icons" title="Drag">
                  drag_indicator
                </i>
              </div>
            </div>
          </div>

          {!editStates[0]?.minimized && (
            <div className="edit-body">
              <div className="edit-row">
                <label>Label:</label>
                <input
                  type="text"
                  defaultValue={slice.label}
                  onChange={(e) => onValueChange(slice.index, "label", e)}
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
                  onChange={(e) => onValueChange(slice.index, "value", e)}
                  placeholder="Rating value"
                />
              </div>
              <div className="edit-row">
                <label>Description:</label>
                <textarea
                  defaultValue={slice.description}
                  onChange={(e) => onValueChange(slice.index, "description", e)}
                  placeholder="Competency description"
                />
              </div>
              <div className="edit-row">
                <label>Color:</label>
                <input
                  type="color"
                  defaultValue={slice.color}
                  onChange={(e) => onValueChange(slice.index, "color", e)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CircularProgressChart;
