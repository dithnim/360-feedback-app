import React from "react";
import "./BarChart.scss";

interface Series {
  name: string;
  color: string;
  values: number[];
}

interface BarChartProps {
  categories?: string[];
  series?: Series[];
  max?: number;
  height?: number;
  width?: number;
}

const BarChart: React.FC<BarChartProps> = ({
  categories = [],
  series = [],
  max = 5,
  height = 300,
  width = 600,
}) => {
  const yAxisValues = (() => {
    const values = [];
    for (let i = max; i >= 0; i -= 0.5) {
      values.push(i);
    }
    return values;
  })();

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  return (
    <div
      className="bar-chart-wrapper"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="bar-chart">
        <div className="bar-chart__y-axis">
          {yAxisValues.map((value, index) => (
            <div key={index} className="bar-chart__y-label">
              {value}
            </div>
          ))}
        </div>
        <div className="bar-chart__content">
          {/* Grid lines */}
          <div className="bar-chart__grid-lines">
            {yAxisValues.map((value, index) => (
              <div
                key={index}
                className={`bar-chart__grid-line ${
                  value % 1 === 0 ? "bar-chart__grid-line--full" : ""
                }`}
              />
            ))}
          </div>

          {/* Bar groups */}
          <div className="bar-chart__bars-container">
            {categories.map((category, i) => (
              <div key={i} className="bar-chart__bars">
                <div className="bar-chart__bar-group">
                  {series.map((s, seriesIndex) => (
                    <div
                      key={seriesIndex}
                      className="bar-chart__bar"
                      style={{
                        height: `${(s.values[i] / max) * 100}%`,
                        backgroundColor: s.color,
                      }}
                      title={`${s.name}: ${s.values[i]}`}
                    >
                      <div className="bar-chart__bar-value">
                        {s.values[i].toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bar-chart__x-label">
                  {truncate(category, 10)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bar-chart__legend">
        {series.map((s, index) => (
          <div key={index} className="bar-chart__legend-item">
            <div
              className="bar-chart__legend-color"
              style={{ backgroundColor: s.color }}
            />
            <div className="bar-chart__legend-name">{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
