import React, { useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Draggable from "react-draggable";

const templateStyles = [
  "bg-white p-8 rounded-xl shadow-md w-full h-[500px]",
  "bg-blue-50 p-8 rounded-xl shadow-md w-full h-[500px]",
  "bg-green-50 p-8 rounded-xl shadow-md w-full h-[500px]",
];

const initialData = {
  name: "John Doe",
  feedback: "Great communication and leadership skills.",
  score: "9.2",
};

const Pdf: React.FC = () => {
  const [jsonData, setJsonData] = useState(initialData);
  const [templateIndex, setTemplateIndex] = useState(0);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Use HTMLElement as the generic type for refs
  const nameRef = useRef<HTMLElement>(null);
  const feedbackRef = useRef<HTMLElement>(null);
  const scoreRef = useRef<HTMLElement>(null);

  const generatePDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297); // A4 size
    pdf.save("feedback.pdf");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setTemplateIndex((templateIndex + 1) % 3)}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Switch Template
        </button>
        <button
          onClick={generatePDF}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>

      <div ref={pdfRef} className={templateStyles[templateIndex]}>
        <Draggable nodeRef={nameRef}>
          <div ref={nameRef} className="text-xl font-bold cursor-move">
            {jsonData.name}
          </div>
        </Draggable>
        <Draggable nodeRef={feedbackRef}>
          <p ref={feedbackRef} className="mt-4 cursor-move">
            {jsonData.feedback}
          </p>
        </Draggable>
        <Draggable nodeRef={scoreRef}>
          <div ref={scoreRef} className="mt-6 font-semibold cursor-move">
            Score: {jsonData.score}
          </div>
        </Draggable>
      </div>
    </div>
  );
};

export default Pdf;
