import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import * as Papa from "papaparse";
import "./FeedbackReport.scss";
import Draggable from "react-draggable";
import DraggableComp from "../Draggable/DraggableComp";

import Footer from "../footer/Footer";
import ReportHeader from "../shared/ReportHeader";

import CircularProgressChart from "../shared/charts/CircularProgressChart/CircularProgressChart";
import PieChart from "../shared/charts/PieChart/PieChart";
import BarChart from "../shared/charts/BarChart/BarChart";
import CollapsiblePanel from "../shared/elements/CollapsiblePanel/CollapsiblePanel";

// Import data stores
import { sumOfComRateDataStore } from "../utils/data/store/sumOfComRateDataStore";
import { openEndedFeedbackDataStore } from "../utils/data/store/openEndedFeedbackDataStore";

import coverLogo from "../imgs/templates/Dash.png";
import CompanyImage from "../imgs/templates/cover_1.png";

// Types and interfaces
interface EditState {
  minimized: boolean;
  position: { x: number; y: number };
  dragging: boolean;
  offset: { x: number; y: number };
}

interface Rating {
  rater: string;
  rating: number;
  color: string;
}

interface Question {
  question: string;
  ratings: Rating[];
}

interface ChartItem {
  label: string;
  value: number;
  max: number;
  color: string;
}

type FeedbackEntry = {
  CATEGORY: string;
  ROLE: string;
  VALUE: number;
  QUESTION: string;
};

const categoryDescriptions: Record<string, string> = {
  "1. Working Relationship with Your Supervisors":
    "Demonstrates effective collaboration and communication with supervisors.",
  "2. Communication Skills":
    "Communicates clearly and effectively in verbal and written formats.",
  Leadership:
    "Inspires and guides others toward a shared vision. Leads by example and promotes accountability.",
};

const roleColors: Record<string, string> = {
  Self: "#ffbc42",
  Manager: "#8e2c57",
  Peer: "#1f8380",
  Peer1: "#0000FF",
  "Direct Report": "#d72928",
  Subordinate: "#FFD166",
};

import { pieChartsDataStore } from "../utils/data/store/pieChartsDataStore";

const FeedbackReport: React.FC = () => {
  // State for new TOC entry
  const [newToc, setNewToc] = useState({ title: "", page: "" });
  const pdfSectionRef = useRef<HTMLDivElement>(null);

  // State management
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [reportedBy, setReportedBy] = useState("talentboozt.com");
  const [inTitle, setInTitle] = useState("Introduction");
  const [dfpbColor, setDfpbColor] = useState("#e53935");
  const [pieChartData, setPieChartData] = useState<any[]>([]);

  //!Piechart states
  const [chart1, Setchart1] = useState([
    {
      category: "Leadership",
      desc: "Leads by example, inspires confidence, motivates team members",
      value: 4.05,
      color: "#4b4ac8",
    },
    {
      category: "Decision Making",
      desc: "Analyzes information effectively, makes timely and sound decisions",
      value: 4.05,
      color: "#367973",
    },
    {
      category: "Drive for Results",
      desc: "Sets clear goals, takes ownership, consistently meets objectives",
      value: 4.18,
      color: "#1b6331",
    },
    {
      category: "Communication",
      desc: "Clear and concise messaging, active listening, persuasive skills",
      value: 4.28,
      color: "#bc8001",
    },
    {
      category: "Teamwork",
      desc: "Collaborates well with peers, fosters a positive team environment, open to feedback",
      value: 4.3,
      color: "#ee3f40",
    },
  ]);

  const [userName, setUserName] = useState("John Doe");
  const [reportedDate, setReportedDate] = useState("2025-01-01");
  const [developmentPlanContent, setDevelopmentPlanContent] = useState(
    "<div>Type your development plan here...</div>"
  );
  const [respondentData, setRespondentData] = useState([
    { relationship: "Self", nominated: 0, completed: 0 },
    { relationship: "Managers", nominated: 0, completed: 0 },
    { relationship: "Peers", nominated: 0, completed: 0 },
    {
      relationship: "Direct Reports",
      nominated: 0,
      completed: 0,
    },
  ]);

  // Edit states for draggable/minimizable panels
  const [editStates, setEditStates] = useState<{ [key: string]: EditState }>({
    title: {
      minimized: false,
      position: { x: 40, y: 100 },
      dragging: false,
      offset: { x: 0, y: 0 },
    },
    description: {
      minimized: false,
      position: { x: 40, y: 160 },
      dragging: false,
      offset: { x: 0, y: 0 },
    },
    conclusion: {
      minimized: false,
      position: { x: 40, y: 500 },
      dragging: false,
      offset: { x: 0, y: 0 },
    },
    reporter: {
      minimized: false,
      position: { x: 40, y: 570 },
      dragging: false,
      offset: { x: 0, y: 0 },
    },
    page: {
      minimized: false,
      position: { x: 450, y: 570 },
      dragging: false,
      offset: { x: 0, y: 0 },
    },
  });

  const [editDynamicStates, setEditDynamicStates] = useState<EditState[]>([]);

  // Data states
  const [sumOfComRating, setSumOfComRating] = useState<any[]>(
    sumOfComRateDataStore
  );
  const [paginatedRatings, setPaginatedRatings] = useState<any[][]>([]);
  const [openEndedFeedback, setOpenEndedFeedback] = useState<any[]>(
    openEndedFeedbackDataStore
  );
  const [paginatedOpenEndedFeedback, setPaginatedOpenEndedFeedback] = useState<
    any[]
  >([]);
  const [paginatedDevPlanContent, setPaginatedDevPlanContent] = useState<
    string[]
  >([]);

  // Constants
  const MAX_SOCR_BLOCKS_PER_PAGE = 3;
  const MAX_OEF_PER_PAGE = 8;
  const MAX_DEV_PLAN_PAGE_HEIGHT_PX = 2950;

  // TOC and categories
  const [TOC, setTOC] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  // Drag and drop refs
  const dragAnimationFrameRef = useRef<number>(0);
  const boundMouseMoveRef = useRef<any>(null);
  const boundMouseUpRef = useRef<any>(null);
  const boundTouchMoveRef = useRef<any>(null);
  const boundTouchEndRef = useRef<any>(null);
  const boundTouchCancelRef = useRef<any>(null);

  //! States for questions
  const [leadershipQ1, setLeadershipQ1] = useState({
    question: "Inspires others with a clear and compelling vision",
    ratings: [
      { rater: "Self", rating: 5.0, color: "#095601" },
      { rater: "Manager", rating: 4.5, color: "#089401" },
      { rater: "Peers", rating: 4.2, color: "#08d801" },
      { rater: "Direct Reports", rating: 3.9, color: "#ffbe01" },
    ],
  });

  const [leadershipQ2, setLeadershipQ2] = useState({
    question: "Leads by example and models core values",
    ratings: [
      { rater: "Self", rating: 3, color: "#095601" },
      { rater: "Manager", rating: 4, color: "#089401" },
      { rater: "Peers", rating: 4.2, color: "#08d801" },
      { rater: "Direct Reports", rating: 3.5, color: "#ffbe01" },
    ],
  });

  const [leadershipQ3, setLeadershipQ3] = useState({
    question: "Comes up with innovative solutions to work-related problems",
    ratings: [
      { rater: "Self", rating: 3, color: "#036630" },
      { rater: "Manager", rating: 4, color: "#d08600" },
      { rater: "Peers", rating: 4.2, color: "#01a73d" },
      { rater: "Direct Reports", rating: 3.5, color: "#03df73" },
    ],
  });

  const [leadershipQ4, setLeadershipQ4] = useState({
    question: "Executes decisions aligned with business strategy",
    ratings: [
      { rater: "Self", rating: 3, color: "#036630" },
      { rater: "Manager", rating: 4, color: "#d08600" },
      { rater: "Peers", rating: 4.2, color: "#01a73d" },
      { rater: "Direct Reports", rating: 3.5, color: "#03df73" },
    ],
  });

  const [leadershipQ5, setLeadershipQ5] = useState({
    question: "Focuses on outcomes and meets deadlines",
    ratings: [
      { rater: "Self", rating: 3, color: "#036630" },
      { rater: "Manager", rating: 4, color: "#01a73d" },
      { rater: "Peers", rating: 4.2, color: "#01c950" },
      { rater: "Direct Reports", rating: 3.5, color: "#03df73" },
    ],
  });

  const [leadershipQ6, setLeadershipQ6] = useState({
    question: "Demonstrates ownership of tasks and goals",
    ratings: [
      { rater: "Self", rating: 3, color: "#036630" },
      { rater: "Manager", rating: 4, color: "#d08600" },
      { rater: "Peers", rating: 4.2, color: "#01c950" },
      { rater: "Direct Reports", rating: 3.5, color: "#ffc801" },
    ],
  });

  const [leadershipQ7, setLeadershipQ7] = useState({
    question: "Clearly articulates ideas",
    ratings: [
      { rater: "Self", rating: 3, color: "#036630" },
      { rater: "Manager", rating: 4, color: "#03df73" },
      { rater: "Peers", rating: 4.2, color: "#fee11e" },
      { rater: "Direct Reports", rating: 3.5, color: "#ffc801" },
    ],
  });

  const [leadershipQ8, setLeadershipQ8] = useState({
    question: "Listens and responds empathetically",
    ratings: [
      { rater: "Self", rating: 3, color: "#fafeff" },
      { rater: "Manager", rating: 4, color: "#fef184" },
      { rater: "Peers", rating: 4.2, color: "#fee11e" },
      { rater: "Direct Reports", rating: 3.5, color: "#ffc801" },
    ],
  });

  const [leadershipQ9, setLeadershipQ9] = useState({
    question: "Supports and encourages team collaboration.",
    ratings: [
      { rater: "Self", rating: 3, color: "#01c950" },
      { rater: "Manager", rating: 4, color: "#03df73" },
      { rater: "Peers", rating: 4.2, color: "#01a73d" },
      { rater: "Direct Reports", rating: 3.5, color: "#018335" },
    ],
  });

  const [leadershipQ10, setLeadershipQ10] = useState({
    question: "Values team contributions and acknowledges efforts of others.",
    ratings: [
      { rater: "Self", rating: 3, color: "#01c950" },
      { rater: "Manager", rating: 4, color: "#03df73" },
      { rater: "Peers", rating: 4.2, color: "#01c950" },
      { rater: "Direct Reports", rating: 3.5, color: "#036630" },
    ],
  });

  // Initialize component
  useEffect(() => {
    initDynamicEditStates();
    paginateRatings();
    paginateOpenEndedFeedbackRate();
    paginateDevPlan();
    prepareChartData();
  }, [sumOfComRating, openEndedFeedback, developmentPlanContent]);

  // Initialize dynamic edit states
  const initDynamicEditStates = () => {
    const dynamicStates: EditState[] = [];
    for (let i = 0; i < 50; i++) {
      dynamicStates.push({
        minimized: false,
        position: { x: 40 + i * 10, y: 100 + i * 10 },
        dragging: false,
        offset: { x: 0, y: 0 },
      });
    }
    setEditDynamicStates(dynamicStates);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Pagination functions
  const paginateRatings = () => {
    const pages: any[][] = [];
    for (let i = 0; i < sumOfComRating.length; i += MAX_SOCR_BLOCKS_PER_PAGE) {
      pages.push(sumOfComRating.slice(i, i + MAX_SOCR_BLOCKS_PER_PAGE));
    }
    setPaginatedRatings(pages);
  };

  const paginateOpenEndedFeedbackRate = () => {
    const pages: any[] = [];
    for (let i = 0; i < openEndedFeedback.length; i += MAX_OEF_PER_PAGE) {
      pages.push(openEndedFeedback.slice(i, i + MAX_OEF_PER_PAGE));
    }
    setPaginatedOpenEndedFeedback(pages);
  };

  const paginateDevPlan = () => {
    const content = developmentPlanContent;
    const pages: string[] = [];
    const words = content.split(" ");
    let currentPage = "";
    let currentHeight = 0;

    for (const word of words) {
      const testPage = currentPage + (currentPage ? " " : "") + word;
      const testHeight = testPage.length * 0.5; // Rough estimation

      if (testHeight > MAX_DEV_PLAN_PAGE_HEIGHT_PX) {
        pages.push(currentPage);
        currentPage = word;
        currentHeight = word.length * 0.5;
      } else {
        currentPage = testPage;
        currentHeight = testHeight;
      }
    }

    if (currentPage) {
      pages.push(currentPage);
    }

    setPaginatedDevPlanContent(pages);
  };

  const prepareChartData = (feedbacks: any[] = sumOfComRating) => {
    const categories = Array.from(new Set(feedbacks.map((f) => f.category)));
    const series = categories.map((category) => ({
      name: category,
      data: feedbacks
        .filter((f) => f.category === category)
        .map((f) => f.rating),
    }));

    setCategories(categories);
    setSeries(series);
  };

  //! PDF Export functionality

  // Existing exportPdf function stays the same
  const exportPdf = async () => {
    if (!pdfSectionRef.current) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      const idle = () => new Promise((res) => requestIdleCallback(res));

      const pdf = new jsPDF("p", "mm", "a4");
      const pages =
        pdfSectionRef.current.querySelectorAll(":scope > .pdf-page");

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        await delay(100);
        await idle();

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

        setExportProgress(((i + 1) / pages.length) * 100);
      }

      pdf.save("360-feedback-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // CSV Upload functionality
  const onCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const data = results.data as FeedbackEntry[];
        generateCompetencyData(data);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  // Generate competency data from CSV
  const generateCompetencyData = (data: FeedbackEntry[]) => {
    const avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const processedData = data.map((entry) => ({
      category: entry.CATEGORY,
      rating: entry.VALUE,
      out_of: 5,
      description:
        categoryDescriptions[entry.CATEGORY] || "No description available.",
      charts: [
        {
          label: entry.QUESTION,
          value: entry.VALUE,
          max: 5,
          color: roleColors[entry.ROLE] || "#000000",
        },
      ],
    }));

    setSumOfComRating(processedData);
    prepareChartData(processedData);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragAnimationFrameRef.current) {
        cancelAnimationFrame(dragAnimationFrameRef.current);
      }

      const cleanupListener = (
        element: Document | Window,
        event: string,
        handler: any
      ) => {
        if (handler) {
          element.removeEventListener(event, handler);
        }
      };

      cleanupListener(document, "mousemove", boundMouseMoveRef.current);
      cleanupListener(document, "mouseup", boundMouseUpRef.current);
      cleanupListener(document, "touchmove", boundTouchMoveRef.current);
      cleanupListener(document, "touchend", boundTouchEndRef.current);
      cleanupListener(document, "touchcancel", boundTouchCancelRef.current);
    };
  }, []);

  function removeTocItem(index: number): void {
    const newToc = [...TOC];
    newToc.splice(index, 1);
    setTOC(newToc);
  }

  return (
    <div className="content-wrapper">
      {/* Progress Overley */}
      {isExporting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 50 50"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#d50001"
                strokeWidth="5"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#fff" }}>
            Exporting PDF...
          </div>
          <div style={{ marginTop: 12, fontSize: 18, color: "#fff" }}>
            {Math.round(exportProgress)}%
          </div>
          <style>
            {`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}
          </style>
        </div>
      )}
      {/* Tailwind CSS Test Block - Remove after confirming Tailwind works */}
      <div className="warning-overlay">
        <div className="warning">
          <p>⚠️ Oops! Your screen is too small to view this report.</p>
        </div>
      </div>

      <div className="buttons-wrapper">
        <div className="controls">
          <button className="edit-toggle" onClick={toggleEditMode}>
            {isEditMode ? "Preview Mode" : "Enable Edit"}
          </button>
          <button
            className="export-pdf"
            onClick={() => {
              if (isEditMode) {
                alert("Please switch to Preview Mode before exporting.");
                return;
              }
              exportPdf();
            }}
            disabled={isExporting}
          >
            {isExporting ? "Generating PDF..." : "Export PDF"}
          </button>
          <input
            type="file"
            className="print"
            onChange={onCSVUpload}
            disabled={isExporting}
            accept=".csv"
          />
        </div>
      </div>

      {/* PDF Section: Wrap all .pdf-page elements in a single ref */}
      <div ref={pdfSectionRef}>
        <div className="pdf-page text-left">
          {/* Cover Page */}
          <div className="header__lg">
            <img src={coverLogo} alt="Logo" className="logo" />
          </div>
          <h1 className="title">360-Degree Feedback Report</h1>
          <p className="para__light">Confidential Report</p>

          <div className="cover-container">
            <div className="cover-image">
              <div className="t-up-row">
                {Array.from({ length: 13 }).map((_, i) => (
                  <div key={i} className="svg-wrapper">
                    <svg
                      className={i % 2 === 0 ? "svg-down" : "svg-up"}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points={
                          i % 2 === 0
                            ? "0,0 100,0 50,100"
                            : "50,0 100,100 0,100"
                        }
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <img src={CompanyImage} alt="Cover" />
              <div className="t-down-row">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="svg-wrapper">
                    <svg
                      className={i % 2 === 0 ? "svg-up" : "svg-down"}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points={
                          i % 2 === 0
                            ? "0,0 100,0 50,100"
                            : "50,0 100,100 0,100"
                        }
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!isEditMode ? (
            <p className="para" style={{ marginBottom: "15mm" }}>
              {userName} | {new Date(reportedDate).toLocaleDateString()}
            </p>
          ) : (
            <div className="banner-name-tag">
              <input
                type="text"
                placeholder="User Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <input
                type="date"
                placeholder="Date"
                value={reportedDate}
                onChange={(e) => setReportedDate(e.target.value)}
              />
            </div>
          )}

          <p className="para__sm">
            This report is confidential and should not be distributed without
            permission.
          </p>
          <p className="para__dark">
            DAASH Consultancy & Training Online Assessments © 2025
          </p>
        </div>

        {/* Table of Contents */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Table of Contents">
            <div className="toc-wrapper w-full">
              {/* TOC Form - Styled to match provided screenshot */}
              {isEditMode ? (
                <div className="w-full flex flex-col">
                  {TOC.map((item, index) => (
                    <div
                      key={index}
                      className="toc-item w-full grid grid-cols-3 items-center justify-between mt-3"
                    >
                      <span className="toc-title">{item.title}</span>
                      <span className="toc-page">{item.page}</span>
                      <button
                        onClick={() => removeTocItem(index)}
                        className="bg-red-500 text-white rounded-md py-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <form
                    className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-8"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newToc.title.trim() && newToc.page.trim()) {
                        setTOC((prev) => [...prev, { ...newToc }]);
                        setNewToc({ title: "", page: "" });
                      }
                    }}
                  >
                    <div className="flex flex-col w-64">
                      <label
                        htmlFor="TOC_title"
                        className="mb-1 text-base font-medium text-gray-700"
                      >
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="TOC_title"
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                        placeholder=""
                        value={newToc.title}
                        onChange={(e) =>
                          setNewToc((nt) => ({ ...nt, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-col w-64">
                      <label
                        htmlFor="TOC_page"
                        className="mb-1 text-base font-medium text-gray-700"
                      >
                        Page Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="TOC_page"
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                        placeholder="0"
                        value={newToc.page}
                        onChange={(e) =>
                          setNewToc((nt) => ({ ...nt, page: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex flex-col justify-end h-full">
                      <label className="mb-1 invisible">Add TOC</label>
                      <button
                        type="submit"
                        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-2 rounded transition-colors duration-150"
                      >
                        Add TOC
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="toc-content w-full">
                  {TOC.map((item, index) => (
                    <div key={index} className="toc-item">
                      <span className="toc-title">{item.title}</span>
                      <span className="toc-page">{item.page}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Introduction Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Introduction">
            <div className="intro-wrapper">
              <p className="text-justify mt-4">
                This 360-degree feedback report compiles feedback from multiple
                sources, including managers, peers, and direct reports, to
                provide a comprehensive assessment of Employee's competencies,
                strengths, and areas for development.
              </p>
              <h1 className="mt-6 text-start font-semibold text-2xl">
                What is 360-Degree Feedback?
              </h1>
              <p className="mt-6 text-justify">
                360-degree feedback is a multi-source assessment approach used
                to provide individuals with a well-rounded view of their
                performance, behaviors, and skills. Unlike traditional top-down
                performance reviews, this method gathers perspectives from
                different stakeholders to enhance self-awareness and
                professional growth.
              </p>
              <h1 className="mt-6 text-start font-semibold text-2xl">
                Purpose of this Report
              </h1>
              <p className="mt-6 text-justify">
                The goal of this report is to highlight Employee's key
                strengths, development areas, and blind spots while providing
                actionable recommendations for improvement. This insight will
                support leadership development and career progression.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Respondent Summary Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Respondent Summary">
            <div className="w-full flex flex-col items-center mt-8">
              <table
                className="w-full mt-10 text-center border-collapse respondent-summary-table"
                style={{ minWidth: 500 }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th className="font-semibold">Relationship</th>
                    <th className="font-semibold">Nominated</th>
                    <th className="font-semibold">Completed</th>
                    <th className="font-semibold">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {isEditMode
                    ? (() => {
                        return respondentData.map((row, idx) => {
                          let completionRate =
                            row.nominated > 0
                              ? Math.round(
                                  (row.completed / row.nominated) * 100
                                )
                              : null;
                          return (
                            <tr key={row.relationship}>
                              <td className="py-4 text-lg">
                                {row.relationship}
                              </td>
                              <td className="px-2 py-4 text-lg">
                                <input
                                  type="text"
                                  id="number-input"
                                  aria-describedby="helper-text-explanation"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-1"
                                  required
                                  value={row.nominated}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setRespondentData((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, nominated: value }
                                          : item
                                      )
                                    );
                                  }}
                                />
                              </td>
                              <td className="px-2 py-4 text-lg">
                                <input
                                  type="text"
                                  id="number-input"
                                  aria-describedby="helper-text-explanation"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2 py-1"
                                  required
                                  value={row.completed}
                                  onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setRespondentData((prev) =>
                                      prev.map((item, i) =>
                                        i === idx
                                          ? { ...item, completed: value }
                                          : item
                                      )
                                    );
                                  }}
                                />
                              </td>
                              <td className="py-4 text-lg">
                                {row.nominated > 0
                                  ? `${completionRate}%`
                                  : "0%"}
                              </td>
                            </tr>
                          );
                        });
                      })()
                    : (() => {
                        return respondentData.map((row, idx) => {
                          let completionRate =
                            row.nominated > 0
                              ? Math.round(
                                  (row.completed / row.nominated) * 100
                                )
                              : null;
                          return (
                            <tr key={row.relationship}>
                              <td className="py-4 text-lg">
                                {row.relationship}
                              </td>
                              <td className="py-4 text-lg">{row.nominated}</td>
                              <td className="py-4 text-lg">{row.completed}</td>
                              <td className="py-4 text-lg">
                                {row.nominated > 0
                                  ? `${completionRate}%`
                                  : "0%"}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                </tbody>
              </table>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Summary of Competency Ratings */}
        {paginatedRatings.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="pdf-page p flex flex-col min-h-[100vh]"
          >
            <ReportHeader title="Summary of Competency Ratings">
              <div className="content flex-grow">
                <p className="text-left mb-4">
                  Below is a summary of competency ratings from different rater
                  groups
                </p>
                {page.map((item, index) => (
                  <div key={index} className="competency-item">
                    <div className="competency-header">
                      <h3 className="competency-title">{item.category}</h3>
                      <div className="competency-rating">
                        <span className="rating-value">
                          {item.rating.toFixed(2)}
                        </span>
                        <span className="rating-max">/ {item.out_of}</span>
                      </div>
                    </div>
                    <p className="competency-description text-left">
                      {item.description}
                    </p>

                    <div className="charts-container grid grid-cols-4 gap-4">
                      {item.charts.map(
                        (chart: ChartItem, chartIndex: number) => (
                          <div key={chartIndex} className="chart-item">
                            <CircularProgressChart
                              label={chart.label}
                              value={chart.value}
                              max={chart.max}
                              color={chart.color}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ReportHeader>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </div>
        ))}

        {/* Bar Chart for Competency Ratings Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Bar Chart for Competency Ratings">
            {/* Legend */}
            <div className="flex flex-row gap-8 mt-6 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ background: "#e573b4" }}
                ></span>
                <span className="text-sm">Self</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ background: "#8e2c57" }}
                ></span>
                <span className="text-sm">Manager</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ background: "#f08080" }}
                ></span>
                <span className="text-sm">Peers</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ background: "#ffe066" }}
                ></span>
                <span className="text-sm">Direct Reports</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded"
                  style={{ background: "#fff9c4", border: "1px solid #e5e7eb" }}
                ></span>
                <span className="text-sm">Overall Average</span>
              </div>
            </div>
            {/* Bar Chart */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <BarChart />
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Strengths Section (Pie Chart) */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Strengths">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                The diagram below highlights key strengths for each competency,
                based on high ratings and positive feedback from respondents.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Pie Chart and Annotations */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                <div style={{ width: 350, height: 350 }}>
                  <PieChart
                    data={chart1}
                    isEditMode
                    title=" Strengths for Each Competency"
                    datasetIndex={5}
                  />
                </div>
                {/* Example annotation positions, replace with dynamic if needed */}
                {/* <div className="absolute left-0 top-8 flex flex-col items-center">
                  <div className="bg-[#c94a4a] text-white rounded-full px-2 py-3 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-32 text-xs text-center">
                    Leads by example, inspires confidence, motivates team
                    members
                  </div>
                </div>
                <div className="absolute right-0 top-8 flex flex-col items-center">
                  <div className="bg-[#4a4ac9] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-32 text-xs text-center">
                    Analyzes information effectively, makes timely and sound
                    decisions
                  </div>
                </div>
                <div className="absolute right-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#4ac9a6] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.18
                  </div>
                  <div className="w-32 text-xs text-center">
                    Sets clear goals, takes ownership, consistently meets
                    objectives
                  </div>
                </div>
                <div className="absolute left-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#c9b14a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.08
                  </div>
                  <div className="w-32 text-xs text-center">
                    Collaborates well with peers, fosters a positive team
                    environment, open to feedback
                  </div>
                </div>
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-[#4ac94a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.28
                  </div>
                  <div className="w-40 text-xs text-center">
                    Clear and concise messaging, active listening, persuasive
                    skills
                  </div>
                </div> */}
              </div>
            </div>
            <div className="mt-8">
              <p className="text-base">
                These strengths indicate areas of excellence that can be
                leveraged to enhance leadership effectiveness and team
                performance.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Areas of Improvement Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Areas of Improvement">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                The diagram below highlights key development areas based on
                feedback from respondents. These areas represent opportunities
                for further growth and enhancement.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Areas of Improvement Chart and Annotations */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                {/* Replace with your PieChart or custom chart component if available */}
                <div style={{ width: 350, height: 350 }}>
                  {/* <PieChart data={areasOfImprovementData} /> */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full shadow-inner">
                    <span className="text-gray-400">
                      [Areas of Improvement Chart Here]
                    </span>
                  </div>
                  {/* Center label */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white text-black rounded-full px-4 py-2 text-sm font-bold shadow">
                      Areas of Improvement
                      <br />
                      for Each
                      <br />
                      Competency
                    </div>
                  </div>
                </div>
                {/* Annotation positions, matching the provided screenshot */}
                {/* Leadership */}
                <div className="absolute left-0 top-8 flex flex-col items-center">
                  <div className="bg-[#c94a4a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Enhancing delegation skills, providing more constructive
                    feedback
                  </div>
                </div>
                {/* Decision-Making */}
                <div className="absolute right-0 top-8 flex flex-col items-center">
                  <div className="bg-[#4a4ac9] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Balancing speed with accuracy, involving others in
                    decision-making
                  </div>
                </div>
                {/* Drive for Results */}
                <div className="absolute right-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#4ac9a6] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.18
                  </div>
                  <div className="w-40 text-xs text-center">
                    Setting clearer priorities, improving time management for
                    high-impact tasks
                  </div>
                </div>
                {/* Teamwork */}
                <div className="absolute left-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#c9b14a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.08
                  </div>
                  <div className="w-40 text-xs text-center">
                    Strengthening conflict resolution skills, fostering
                    cross-functional collaboration
                  </div>
                </div>
                {/* Communication */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-[#4ac94a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.28
                  </div>
                  <div className="w-48 text-xs text-center">
                    Engaging in more active listening, ensuring clarity in
                    complex discussions
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-base">
                By addressing these areas, the individual can further enhance
                leadership effectiveness and team collaboration.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Hidden Strengths Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Hidden Strengths">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                The following diagram highlights competencies where the
                individual may underestimate their own abilities, as identified
                through feedback from others.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Hidden Strengths Chart and Annotations */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                {/* Replace with your PieChart or custom chart component if available */}
                <div style={{ width: 350, height: 350 }}>
                  {/* <PieChart data={hiddenStrengthsData} /> */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full shadow-inner">
                    <span className="text-gray-400">
                      [Hidden Strengths Chart Here]
                    </span>
                  </div>
                  {/* Center label */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white text-black rounded-full px-4 py-2 text-sm font-bold shadow text-center">
                      Hidden Strengths
                      <br />
                      for Each
                      <br />
                      Competency
                    </div>
                  </div>
                </div>
                {/* Annotation positions, matching the provided screenshot */}
                {/* Leadership */}
                <div className="absolute left-0 top-8 flex flex-col items-center">
                  <div className="bg-[#4a4ac9] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Strong ability to mentor and develop others.
                    <br />
                    <span className="text-[#c94a4a] font-semibold">
                      Recognized by peers for inspiring leadership
                    </span>
                  </div>
                </div>
                {/* Decision-Making */}
                <div className="absolute right-0 top-8 flex flex-col items-center">
                  <div className="bg-[#4a4ac9] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Confidence in handling uncertainty.
                    <br />
                    <span className="text-[#c94a4a] font-semibold">
                      Others see decisiveness as a key strength
                    </span>
                  </div>
                </div>
                {/* Drive for Results */}
                <div className="absolute right-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#4ac9a6] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.18
                  </div>
                  <div className="w-40 text-xs text-center">
                    Ability to motivate the team towards success.
                    <br />
                    <span className="text-[#c94a4a] font-semibold">
                      Often sets ambitious but achievable goals
                    </span>
                  </div>
                </div>
                {/* Teamwork */}
                <div className="absolute left-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#c9b14a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.08
                  </div>
                  <div className="w-40 text-xs text-center">
                    Facilitates collaboration across departments.
                    <br />
                    <span className="text-[#c94a4a] font-semibold">
                      Highly valued for bringing teams together
                    </span>
                  </div>
                </div>
                {/* Communication */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-[#4ac94a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.28
                  </div>
                  <div className="w-48 text-xs text-center">
                    Persuasive speaking and influence skills.
                    <br />
                    <span className="text-[#c94a4a] font-semibold">
                      Others appreciate clarity and confidence
                    </span>
                  </div>
                </div>
                {/* Legend */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-row gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-black"></span>
                    <span className="text-xs">Hidden Strengths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-full bg-[#c94a4a]"></span>
                    <span className="text-xs">Key Insight</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-base">
                These hidden strengths can be leveraged for greater impact by
                recognizing and intentionally utilizing them in leadership and
                teamwork efforts.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Blind Spots Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Blind Spots">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                Blind spots occur when there is a misalignment between
                self-perception and others' perceptions. The diagram below
                outlines key blind spots identified for each competency:
              </p>
            </div>
            <div className="flex flex-col items-center justify-center flex-1">
              {/* Blind Spots Chart and Annotations */}
              <div
                className="relative flex items-center justify-center"
                style={{ minHeight: 400 }}
              >
                {/* Replace with your PieChart or custom chart component if available */}
                <div style={{ width: 350, height: 350 }}>
                  {/* <PieChart data={blindSpotsData} /> */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full shadow-inner">
                    <span className="text-gray-400">
                      [Blind Spots Chart Here]
                    </span>
                  </div>
                  {/* Center label */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white text-black rounded-full px-4 py-2 text-sm font-bold shadow text-center">
                      Blind Spots
                      <br />
                      for Each
                      <br />
                      Competency
                    </div>
                  </div>
                </div>
                {/* Annotation positions, matching the provided screenshot */}
                {/* Leadership */}
                <div className="absolute left-0 top-8 flex flex-col items-center">
                  <div className="bg-[#a084a0] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Overestimates team motivation and empowerment skills
                  </div>
                </div>
                {/* Decision-Making */}
                <div className="absolute right-0 top-8 flex flex-col items-center">
                  <div className="bg-[#a084a0] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.05
                  </div>
                  <div className="w-40 text-xs text-center">
                    Perceives decisiveness; others note limited collaboration in
                    decisions
                  </div>
                </div>
                {/* Drive for Results */}
                <div className="absolute right-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#4ac9a6] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.18
                  </div>
                  <div className="w-40 text-xs text-center">
                    Believes goals are consistently met; others see delays in
                    execution
                  </div>
                </div>
                {/* Teamwork */}
                <div className="absolute left-0 bottom-24 flex flex-col items-center">
                  <div className="bg-[#a084a0] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.08
                  </div>
                  <div className="w-40 text-xs text-center">
                    Views self as collaborative; some perceive lack of
                    responsiveness or shared input
                  </div>
                </div>
                {/* Communication */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex flex-col items-center">
                  <div className="bg-[#4ac94a] text-white rounded-full px-3 py-1 text-sm font-bold mb-2">
                    4.28
                  </div>
                  <div className="w-48 text-xs text-center">
                    Sees self as clear communicator; feedback indicates message
                    clarity issues
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-base">
                Addressing these areas can help reduce performance misalignments
                and improve team dynamics.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Open Ended Feedback Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Open Ended Feedback">
            <div className="border-b-2 border-blue-400 pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                This section captures qualitative insights shared by respondents
                in their own words. These comments provide valuable context to
                the numerical ratings, offering specific examples, suggestions,
                and observations that highlight strengths, opportunities for
                growth, and overall perceptions of the individual's performance
                and leadership impact.
              </p>
            </div>
            <div className="mb-6">
              <p className="font-semibold text-lg mb-4">
                What are this individual's greatest strengths in their current
                role?
              </p>
              <ul className="space-y-10">
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Blue user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#2563eb" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#2563eb" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    I believe I bring strategic thinking and consistency to my
                    work, which helps the team stay focused.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Green user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#65a30d" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#65a30d" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    They consistently show initiative and take ownership of key
                    deliverables without needing close supervision.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Yellow user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#eab308" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#eab308" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    Strong collaborator—always willing to support the team and
                    jump in when help is needed.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Red user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#b91c1c" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#b91c1c" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    They provide clear direction and make time to coach and
                    develop team members.
                  </span>
                </li>
              </ul>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Open Ended Feedback Continued Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Open Ended Feedback (Continued)">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="font-semibold text-lg mb-4">
                In what areas could this individual improve or grow further?
              </p>
              <ul className="space-y-10">
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Light purple user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#bfa5c9" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#bfa5c9" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    I recognize I could be more intentional about cross-team
                    collaboration.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Dark purple user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#6d28d9" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#6d28d9" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    I would encourage them to delegate more and trust others to
                    take the lead at times.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Teal user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#38bdf8" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#38bdf8" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    They could involve others earlier in the decision-making
                    process to increase buy-in.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Blue user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#2563eb" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#2563eb" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    Sometimes, communication can be too fast-paced—more clarity
                    would help the team.
                  </span>
                </li>
              </ul>
            </div>
            <div className="mb-6">
              <p className="font-semibold text-lg mb-4">
                What advice would you offer this individual to enhance their
                leadership impact?
              </p>
              <ul className="space-y-10">
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Yellow user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#eab308" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#eab308" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    I should focus on creating space for feedback and reflection
                    with the team.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Pink user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#f43f5e" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#f43f5e" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    Consider carving out more time for strategic thinking and
                    longer-term visioning.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Orange user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#f97316" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#f97316" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    Your leadership could benefit from slowing down and
                    listening more in high-stress moments.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block mt-1">
                    {/* Gray user icon */}
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="6" r="4" fill="#52525b" />
                      <path d="M4 20 A8 8 0 0 1 20 20" fill="#52525b" />
                    </svg>
                  </span>
                  <span className="font-medium text-base">
                    Lead more frequent check-ins to keep the team aligned and
                    motivated.
                  </span>
                </li>
              </ul>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Detailed Feedback Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Detailed Feedback">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="mb-6">
              <p className="text-base">
                This section provides a detailed breakdown of feedback for each
                competency area as rated by different respondent groups. It
                includes specific behavioral items assessed across competencies,
                along with comparative ratings from the individual, manager,
                peers, direct reports, and others. The purpose is to highlight
                alignment, gaps, and opportunities for development.
              </p>
            </div>
            {/* Example for Leadership only, can be made dynamic later */}
            <div className="flex flex-row justify-between items-center mb-2">
              <span className="font-semibold text-lg">Leadership</span>
              <span className="font-semibold text-lg">
                Average Rating: <span className="text-red-600">4.2</span>
              </span>
            </div>
            <table
              className="w-full mt-2 text-left border-separate"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="py-2 font-semibold">Questions</th>
                  <th className="py-2 font-semibold">Raters</th>
                  <th className="py-2 font-semibold">Rating</th>
                </tr>
              </thead>

              <tbody>
                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ1.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ1.question}
                              onChange={(e) =>
                                setLeadershipQ1((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ1.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ1.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ1((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ1.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ1((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 1 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ1.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ1.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ1.ratings.map((r, idx) => (
                        <div className="flex items-center gap-2" key={idx}>
                          <div className="h-2 w-full rounded bg-gray-200">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                maxWidth: "100%",
                                backgroundColor: r.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">
                            {isNaN(Number(r.rating)) ? 0 : r.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ2.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ2.question}
                              onChange={(e) =>
                                setLeadershipQ2((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ2.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ2.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ2((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ2.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ2((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 2 */}
                <tr>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ2.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ2.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ2.ratings.map((r, idx) => (
                        <div className="flex items-center gap-2" key={idx}>
                          <div className="h-2 w-full rounded bg-gray-200">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                maxWidth: "100%",
                                backgroundColor: r.color,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">
                            {isNaN(Number(r.rating)) ? 0 : r.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Detailed Feedback Continued Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Detailed Feedback (Continued)">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            {/* Example for Decision Making only, can be made dynamic later */}
            <div className="flex flex-row justify-between items-center mb-2">
              <span className="font-semibold text-lg">Decision Making</span>
              <span className="font-semibold text-lg">
                Average Rating: <span className="text-red-600">4.0</span>
              </span>
            </div>
            <table
              className="w-full mt-2 text-left border-separate"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="py-2 font-semibold">Questions</th>
                  <th className="py-2 font-semibold">Raters</th>
                  <th className="py-2 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ3.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ3.question}
                              onChange={(e) =>
                                setLeadershipQ3((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ3.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ3.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ3((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ3.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ3((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 1 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ3.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ3.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ3.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ4.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ4.question}
                              onChange={(e) =>
                                setLeadershipQ4((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ4.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ4.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ4((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ4.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ4((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ4.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ4.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ4.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Detailed Feedback Continued Section - Drive for Results */}
        <div className="pdf-page p flex flex-col min-h-[100vh]">
          <ReportHeader title="Detailed Feedback (Continued)">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            {/* Example for Drive for Results only, can be made dynamic later */}
            <div className="flex flex-row justify-between items-center mb-2">
              <span className="font-semibold text-lg">Drive for Results</span>
              <span className="font-semibold text-lg">
                Average Rating: <span className="text-red-600">4.1</span>
              </span>
            </div>
            <table
              className="w-full mt-2 text-left border-separate"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="py-2 font-semibold">Questions</th>
                  <th className="py-2 font-semibold">Raters</th>
                  <th className="py-2 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ5.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ5.question}
                              onChange={(e) =>
                                setLeadershipQ5((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ5.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ5.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ5((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ5.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ5((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ5.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ5.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ5.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ6.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ6.question}
                              onChange={(e) =>
                                setLeadershipQ6((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ6.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ6.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ6((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ6.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ6((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ6.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ6.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ6.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        <div className="pdf-page p flex flex-col min-h-[100vh]">
          <ReportHeader title="Detailed Feedback (Continued)">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="flex flex-row justify-between items-center mb-2">
              <span className="font-semibold text-lg">Communication</span>
              <span className="font-semibold text-lg">
                Average Rating: <span className="text-red-600">4.0</span>
              </span>
            </div>
            <table
              className="w-full mt-2 text-left border-separate"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="py-2 font-semibold">Questions</th>
                  <th className="py-2 font-semibold">Raters</th>
                  <th className="py-2 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ7.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ7.question}
                              onChange={(e) =>
                                setLeadershipQ7((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ7.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ7.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ7((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ7.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ7((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ7.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ7.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ7.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ8.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ8.question}
                              onChange={(e) =>
                                setLeadershipQ8((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ8.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ8.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ8((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ8.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ8((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ8.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ8.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ8.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Detailed Feedback Continued Section - Teamwork */}
        <div className="pdf-page p flex flex-col min-h-[100vh]">
          <ReportHeader title="Detailed Feedback (Continued)">
            <div className="border-b pb-2 flex items-center mb-6"></div>
            <div className="flex flex-row justify-between items-center mb-2">
              <span className="font-semibold text-lg">Teamwork</span>
              <span className="font-semibold text-lg">
                Average Rating: <span className="text-red-600">4.4</span>
              </span>
            </div>
            <table
              className="w-full mt-2 text-left border-separate"
              style={{ borderSpacing: 0 }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th className="py-2 font-semibold">Questions</th>
                  <th className="py-2 font-semibold">Raters</th>
                  <th className="py-2 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ9.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ9.question}
                              onChange={(e) =>
                                setLeadershipQ7((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ9.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ9.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ9((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ9.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ9((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ9.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ9.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ9.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQ10.question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQ10.question}
                              onChange={(e) =>
                                setLeadershipQ8((q) => ({
                                  ...q,
                                  question: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {leadershipQ10.ratings.map((r, idx) => (
                            <div
                              className="flex items-center justify-between"
                              key={idx}
                            >
                              <div className="me-4 flex flex-col">
                                <label>Rater:</label>
                                <input
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rater}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ10.ratings,
                                    ];
                                    newRatings[idx].rater = e.target.value;
                                    setLeadershipQ10((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                              <div className="me-4 flex flex-col">
                                <label>Rating:</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  className="border border-gray-300 rounded-md mb-2 w-32 px-1.5"
                                  value={r.rating}
                                  max={5}
                                  onChange={(e) => {
                                    const newRatings = [
                                      ...leadershipQ10.ratings,
                                    ];
                                    newRatings[idx].rating = parseFloat(
                                      e.target.value
                                    );
                                    setLeadershipQ10((q) => ({
                                      ...q,
                                      ratings: newRatings,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td className="py-4 align-top w-1/3">
                    {leadershipQ10.question}
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      {leadershipQ10.ratings.map((r, idx) => (
                        <span key={idx}>{r.rater}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 align-top w-1/3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {leadershipQ10.ratings.map((r, idx) => (
                          <div className="flex items-center gap-2" key={idx}>
                            <div className="h-2 w-full rounded bg-gray-200">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${(Math.max(0, r.rating) / 5) * 100}%`,
                                  maxWidth: "100%",
                                  backgroundColor: r.color,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">
                              {isNaN(Number(r.rating)) ? 0 : r.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Development Plan Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Development Plan">
            <h1
              className="text-2xl font-serif font-semibold mb-4 border-b-2 inline-block"
              style={{
                color: "#222",
                borderBottomWidth: 3,
                borderColor: "#3b82f6",
              }}
            >
              Development Plan
            </h1>
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-2">
                Development Plan Overview
              </h2>
              <p className="mb-6 text-base text-justify">
                Based on the feedback received through the 360-degree
                assessment, the individual demonstrates strong execution, a
                collaborative approach, and a reliable presence in team
                environments. The feedback also highlighted growth opportunities
                in strategic leadership, proactive communication, and broader
                stakeholder engagement. This development plan outlines focused
                steps to help the individual evolve from an effective
                contributor to a more influential and visionary leader.
              </p>
              <h2 className="text-lg font-bold mb-2">Key Development Areas</h2>
              <ol className="list-decimal ml-6 mb-6">
                <li className="mb-2">
                  <span className="font-semibold">
                    Strategic Decision-Making
                  </span>
                  <br />
                  <span className="font-normal">
                    Strengthen the ability to zoom out and connect day-to-day
                    execution with long-term organizational goals.
                  </span>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">
                    Influence & Communication
                  </span>
                  <br />
                  <span className="font-normal">
                    Enhance the clarity and resonance of communication across
                    different stakeholders and settings.
                  </span>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">
                    Cross-Functional Collaboration
                  </span>
                  <br />
                  <span className="font-normal">
                    Build relationships across teams to broaden perspective and
                    increase influence beyond immediate responsibilities.
                  </span>
                </li>
              </ol>
              <h2 className="text-lg font-bold mb-2">Developmental Tips</h2>
              <ul className="list-disc ml-6">
                <li className="mb-2">
                  Set monthly reflection time to review decisions made and
                  evaluate them against strategic objectives.
                </li>
                <li>
                  Regularly ask trusted colleagues for feedback on how clearly
                  you communicate expectations and intent.
                </li>
              </ul>
            </div>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>

        {/* Development Plan Continued Section (Plain, No Links) */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Development Plan (Continued)">
            <ul className="list-disc ml-6 mb-6">
              <li className="mb-4">
                Identify key influencers or departments you rarely interact with
                — schedule informal check-ins or shadowing opportunities.
              </li>
            </ul>
            <h2 className="text-base font-bold mb-2">Suggested Activities</h2>
            <ul className="list-disc ml-6 mb-6">
              <li className="mb-2">
                Lead a cross-functional project where you must coordinate with
                at least two departments outside your own.
              </li>
              <li className="mb-2">
                Participate in a leadership roundtable or peer coaching group to
                exchange experiences on influencing and decision-making.
              </li>
              <li>
                Practice stakeholder mapping before major communications to
                better align tone, content, and approach.
              </li>
            </ul>
            <h2 className="text-base font-bold mb-2">Review Milestones</h2>
            <ul className="list-disc ml-6">
              <li className="mb-2">
                <span className="font-bold">30 Days:</span> Establish
                relationships and feedback channels
              </li>
              <li className="mb-2">
                <span className="font-bold">60 Days:</span> Lead or support a
                cross-team initiative
              </li>
              <li>
                <span className="font-bold">90 Days:</span> Present a summary of
                lessons learned and development reflections to manager or coach
              </li>
            </ul>
            <div className="w-full mt-auto">
              <Footer />
            </div>
          </ReportHeader>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
