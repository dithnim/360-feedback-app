import { useState } from "react";
import BarChart from "../../report/shared/charts/BarChart/BarChart";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";

// Import template images
import template1 from "../../imgs/Report 1.png";
import template2 from "../../imgs/Report 2.png";
import template3 from "../../imgs/Report 3.png";

const barChartData = {
  categories: [
    "Leadership",
    "Decision Making",
    "Drive for Results",
    "Communication",
    "Teamwork",
  ],
  series: [
    {
      name: "Self",
      color: "#e573b4",
      values: [3.0, 2.0, 4.5, 2.9, 2.5],
    },
    {
      name: "Manager",
      color: "#8e2c57",
      values: [2.5, 3.5, 2, 3.5, 3.5],
    },
    {
      name: "Peers",
      color: "#f08080",
      values: [4.3, 2.7, 3.0, 2.5, 2],
    },
    {
      name: "Direct Reports",
      color: "#ffe066",
      values: [1.6, 3.5, 4.5, 1.5, 2.5],
    },
    {
      name: "Overall Average",
      color: "#fff9c4",
      values: [2.85, 2.925, 3.5, 2.6, 2.625],
    },
  ],
};

const templates = [
  {
    label: "Template 1",
    img: template1,
  },
  {
    label: "Template 2",
    img: template2,
  },
  {
    label: "Template 3",
    img: template3,
  },
];

export default function PreviewCurrentProject() {
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const handleDownloadPDF = () => {
    alert("Download PDF functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageNav position="HR Manager" title="Current Projects" />
      <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-semibold mb-2">Nestle</h2>
        <h3 className="text-lg font-medium mb-2">Preview Report</h3>
        <div className=" rounded-lg p-4 mb-10 bg-white flex justify-center">
          <div className="w-full flex justify-center">
            <BarChart
              height={400}
              width={700}
              categories={barChartData.categories}
              series={barChartData.series}
              max={5}
            />
          </div>
        </div>
        <div className="mb-8">
          <h4 className="font-semibold mb-4">Select Template</h4>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
            {templates.map((tpl, idx) => (
              <div key={tpl.label} className="flex flex-col items-center">
                <div
                  className={`border-2 rounded-lg p-2 mb-2 cursor-pointer transition-all duration-200 ${
                    selectedTemplate === idx
                      ? "border-red-500 shadow-lg"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedTemplate(idx)}
                  style={{ width: 200, height: 280, background: "#fff" }}
                >
                  <img
                    src={tpl.img}
                    alt={tpl.label}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="radio"
                    name="template"
                    checked={selectedTemplate === idx}
                    onChange={() => setSelectedTemplate(idx)}
                    disabled={idx === 1 || idx === 2}
                  />
                  <span className="text-sm">{tpl.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-start mt-8">
          <Button
            variant="save"
            size="lg"
            className="flex items-center gap-2 px-6 py-3 text-lg accent-[#A10000]"
            onClick={handleDownloadPDF}
          >
            Download PDF
            <span role="img" aria-label="download">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5m-4.5 4.5V3"
                />
              </svg>
            </span>
          </Button>
        </div>
      </main>
    </div>
  );
}
