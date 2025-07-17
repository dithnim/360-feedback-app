import React from "react";
import "./ProgressBarChart.scss";

interface ProgressBarChartProps {
  label?: string;
  value?: number;
  color?: string;
  max?: number;
  barHeight?: number;
}

const ProgressBarChart: React.FC<ProgressBarChartProps> = ({
  label = "",
  value = 0,
  color = "#2196f3",
  max = 5,
  barHeight = 16,
}) => {
  const width = (value / max) * 100;

  return (
    <div className="progress-bar-chart">
      {label && <label>{label}</label>}
      <div className="bar" style={{ height: `${barHeight}px` }}>
        <div
          className="fill"
          style={{
            width: `${width}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBarChart;
