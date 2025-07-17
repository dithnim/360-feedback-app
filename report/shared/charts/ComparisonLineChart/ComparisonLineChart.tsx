import React, { useMemo } from "react";
import "./ComparisonLineChart.scss";

interface Series {
  name: string;
  color: string;
  values: number[];
}

interface ComparisonLineChartProps {
  categories?: string[];
  series?: Series[];
  width?: number;
  height?: number;
  selfLabel?: string;
  otherLabel?: string;
}

const ComparisonLineChart: React.FC<ComparisonLineChartProps> = ({
  categories = [],
  series = [],
  width = 600,
  height = 300,
  selfLabel = "Self",
  otherLabel = "Overall Avg",
}) => {
  const chartData = useMemo(() => {
    if (!categories.length || !series.length) return null;

    // Find the two series to display
    const selfSeries = series.find((s) => s.name === selfLabel);
    const otherSeries = series.find((s) => s.name === otherLabel);

    if (!selfSeries || !otherSeries) return null;

    const yMin = 0;
    const yMax = 5;
    const padding = 40;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / (categories.length - 1);

    // Map points for self series
    const pointsSelf = selfSeries.values.map((value, index) => ({
      x: padding + index * stepX * 1.06,
      y: padding + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight,
    }));

    // Map points for other series
    const pointsOther = otherSeries.values.map((value, index) => ({
      x: padding + index * stepX * 1.06,
      y: padding + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight,
    }));

    // Prepare points string for SVG polylines
    const selfPointsString = pointsSelf.map((p) => `${p.x},${p.y}`).join(" ");
    const otherPointsString = pointsOther.map((p) => `${p.x},${p.y}`).join(" ");

    return {
      pointsSelf,
      pointsOther,
      selfPointsString,
      otherPointsString,
      yMin,
      yMax,
      padding,
    };
  }, [categories, series, selfLabel, otherLabel, width, height]);

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const getLegendText = (label: string) => {
    if (label === "Overall Avg") return "Other";
    if (label === "Direct Report" || label === "Subordinate")
      return "Subordinates";
    return label;
  };

  if (!chartData) {
    return <div>No data available</div>;
  }

  const {
    pointsSelf,
    pointsOther,
    selfPointsString,
    otherPointsString,
    yMin,
    yMax,
    padding,
  } = chartData;

  return (
    <div className="chart-container">
      <svg width={width} height={height} className="comparison-line-chart">
        {/* Y-axis lines */}
        {[0, 1, 2, 3, 4, 5].map((y) => (
          <g key={y} style={{ width: "100%" }}>
            <line
              x1={padding}
              x2={width - padding * 0.06}
              y1={
                padding +
                (height - padding * 2) -
                ((y - yMin) / (yMax - yMin)) * (height - padding * 2)
              }
              y2={
                padding +
                (height - padding * 2) -
                ((y - yMin) / (yMax - yMin)) * (height - padding * 2)
              }
              stroke="#ddd"
              strokeDasharray="4"
            />
            <text
              x={padding - 10}
              y={
                padding +
                (height - padding * 2) -
                ((y - yMin) / (yMax - yMin)) * (height - padding * 2) +
                4
              }
              textAnchor="end"
              fontSize="10"
              fill="#555"
            >
              {y}
            </text>
          </g>
        ))}

        {/* Self Line */}
        <polyline
          points={selfPointsString}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Other Line */}
        <polyline
          points={otherPointsString}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* Self Dots */}
        {pointsSelf.map((p, index) => (
          <circle
            key={`self-${index}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#3b82f6"
          />
        ))}

        {/* Other Dots */}
        {pointsOther.map((p, index) => (
          <circle
            key={`other-${index}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#ef4444"
          />
        ))}

        {/* Legend */}
        <g className="legend" transform={`translate(${width - 150}, 10)`}>
          {/* Self */}
          <circle cx="20" cy="20" r="6" fill="#3b82f6" />
          <text x="30" y="24" fontSize="12" fill="#333">
            Self
          </text>

          {/* Other */}
          <circle cx="80" cy="20" r="6" fill="#ef4444" />
          <text x="90" y="24" fontSize="12" fill="#333">
            {getLegendText(otherLabel)}
          </text>
        </g>
      </svg>

      {/* HTML-based labels */}
      <div className="x-axis-labels">
        {categories.map((label, index) => (
          <div key={index} className="label">
            {truncate(label, 10)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonLineChart;
