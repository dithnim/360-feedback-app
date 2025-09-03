import React, { useState, useEffect, useRef } from "react";
// Heavy libraries are imported lazily to cut initial bundle size
// import html2canvas from "html2canvas-pro";
// import jsPDF from "jspdf";
// import * as Papa from "papaparse";
import "./FeedbackReport2.scss";
import DraggableComp from "../Draggable/DraggableComp";

import Footer from "../footer/Footer";
import ReportHeader from "../shared/ReportHeader";

import PieChart from "../shared/charts/PieChart/PieChart";
import BarChart from "../shared/charts/BarChart/BarChart";

// Import data stores
import { sumOfComRateDataStore } from "../utils/data/store/sumOfComRateDataStore";
import { openEndedFeedbackDataStore } from "../utils/data/store/openEndedFeedbackDataStore";

import coverLogo from "../imgs/templates/Dash.png";

// Types and interfaces
interface EditState {
  minimized: boolean;
  position: { x: number; y: number };
  dragging: boolean;
  offset: { x: number; y: number };
}

interface ChartItem {
  category: string;
  value: number;
  color: string;
  question: string;
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
  Self: "#1f8380",
  Manager: "#d72928",
  Peer: "#1D2180",
  DirectReport: "#ffbc42",
  Subordinate: "#FFD166",
};

// Add the type for the argument

const PIE_CHARTS_LOCAL_STORAGE_KEY = "feedback_pie_charts_data";
const RESPONDENT_DATA_LOCAL_STORAGE_KEY = "feedback_respondent_data";
const USER_NAME_LOCAL_STORAGE_KEY = "feedback_user_name";
const REPORTED_DATE_LOCAL_STORAGE_KEY = "feedback_reported_date";
const DEV_PLAN_CONTENT_LOCAL_STORAGE_KEY = "feedback_dev_plan_content";
const TOC_LOCAL_STORAGE_KEY = "feedback_report_toc";
const NEW_TOC_LOCAL_STORAGE_KEY = "feedback_report_new_toc";
const CUSTOM_COVER_IMAGE_LOCAL_STORAGE_KEY = "feedback_custom_cover_image";

const LEADERSHIP_QUESTIONS_LOCAL_STORAGE_KEY = "feedback_leadership_questions";
import LeadershipQuestionRow from "../../src/components/ui/LeadershipQuestionRow";

// Utility to format date as '31st March 2025' with ordinal suffix
function formatDateWithSuffix(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  // Ordinal suffix logic
  const j = day % 10,
    k = day % 100;
  let suffix = "th";
  if (j === 1 && k !== 11) suffix = "st";
  else if (j === 2 && k !== 12) suffix = "nd";
  else if (j === 3 && k !== 13) suffix = "rd";
  return `${day}${suffix} ${month} ${year}`;
}

const FeedbackReport: React.FC = () => {
  // State for new TOC entry
  const [newToc, setNewToc] = useState({ title: "", page: "" });
  const pdfSectionRef = useRef<HTMLDivElement>(null);

  // State management
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Custom cover image state
  const [customCoverImage, setCustomCoverImage] = useState<string | null>(null);

  //!Piechart states
  const [pieCharts, setPieCharts] = useState({
    strengths: [
      {
        category: "Leadership",
        value: 4.05,
        color: "#4b4ac8",
        question:
          "Leads by example, inspires confidence, motivates team members",
      },
      {
        category: "Decision Making",
        value: 4.05,
        color: "#367973",
        question:
          "Analyzes information effectively, makes timely and sound decisions",
      },
      {
        category: "Drive for Results",
        value: 4.18,
        color: "#1b6331",
        question:
          "Sets clear goals, takes ownership, consistently meets objectives",
      },
      {
        category: "Communication",
        value: 4.28,
        color: "#bc8001",
        question:
          "Clear and concise messaging, active listening, persuasive skills",
      },
      {
        category: "Teamwork",
        value: 4.3,
        color: "#ee3f40",
        question:
          "Collaborates well with peers, fosters a positive team environment, open to feedback",
      },
    ],
    improvements: [
      {
        category: "Leadership",
        value: 4.05,
        color: "#f5501d",
        question:
          "Enhancing delegation skills, providing more constructive feedback",
      },
      {
        category: "Decision Making",
        value: 4.05,
        color: "#246e48",
        question:
          "Balancing speed with accuracy, involving others in decision-making",
      },
      {
        category: "Drive for Results",
        value: 4.18,
        color: "#00a6ed",
        question:
          "Setting clearer priorities, improving time management for high-impact tasks",
      },
      {
        category: "Communication",
        value: 4.28,
        color: "#7eb900",
        question:
          "Engaging in more active listening, ensuring clarity in complex discussions",
      },
      {
        category: "Teamwork",
        value: 4.3,
        color: "#0d2d64",
        question:
          "Strengthening conflict resolution skills, fostering cross-functional collaboration",
      },
    ],
    hiddenStrengths: [
      {
        category: "Leadership",
        value: 4.05,
        color: "#56b8fe",
        question: "Confidence in handling uncertaint",
      },
      {
        category: "Decision Making",
        value: 4.05,
        color: "#241250",
        question: "Ability to motivate the team towards success",
      },
      {
        category: "Drive for Results",
        value: 4.18,
        color: "#b4879f",
        question: "Persuasive speaking and influence skills",
      },
      {
        category: "Communication",
        value: 4.28,
        color: "#ff6f59",
        question: "Facilitates collaboration across departments",
      },
      {
        category: "Teamwork",
        value: 4.3,
        color: "#2076af",
        question: "Strong ability to mentor and develop others",
      },
    ],
    blindSpots: [
      {
        category: "Leadership",
        value: 4.05,
        color: "#380036",
        question:
          "Perceives decisiveness; others note limited collaboration in decisions",
      },
      {
        category: "Decision Making",
        value: 4.05,
        color: "#77a6b6",
        question:
          "Believes goals are consistently met; others see delays in execution",
      },
      {
        category: "Drive for Results",
        value: 4.18,
        color: "#4f7199",
        question:
          "Sees self as clear communicator; feedback indicates message clarity issues",
      },
      {
        category: "Communication",
        value: 4.28,
        color: "#69395d",
        question:
          "Views self as collaborative; some perceive lack of responsiveness or shared input",
      },
      {
        category: "Teamwork",
        value: 4.3,
        color: "#b38c96",
        question: "Overestimates team motivation and empowerment skills",
      },
    ],
  });

  const [userName, setUserName] = useState("John Doe");
  const [reportedDate, setReportedDate] = useState("2025-01-01");
  const [developmentPlanContent] = useState(
    "<div>Type your development plan here...</div>"
  );
  const [respondentData, setRespondentData] = useState([
    { relationship: "Self", nominated: 0, completed: 0 },
    { relationship: "Managers", nominated: 0, completed: 0 },
    { relationship: "Peers", nominated: 0, completed: 0 },
    { relationship: "Direct Reports", nominated: 0, completed: 0 },
  ]);

  // Edit states for draggable/minimizable panels
  useState<{ [key: string]: EditState }>({
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

  const [_editDynamicStates, setEditDynamicStates] = useState<EditState[]>([]);

  // Data states
  const [sumOfComRating, setSumOfComRating] = useState<any[]>(
    sumOfComRateDataStore
  );
  const [paginatedRatings, setPaginatedRatings] = useState<any[][]>([]);
  const [openEndedFeedback] = useState<any[]>(openEndedFeedbackDataStore);
  const [_paginatedOpenEndedFeedback, setPaginatedOpenEndedFeedback] = useState<
    any[]
  >([]);
  const [_paginatedDevPlanContent, setPaginatedDevPlanContent] = useState<
    string[]
  >([]);

  // Constants
  const MAX_SOCR_BLOCKS_PER_PAGE = 3;
  const MAX_OEF_PER_PAGE = 8;
  const MAX_DEV_PLAN_PAGE_HEIGHT_PX = 2950;

  // TOC and categories
  const [TOC, setTOC] = useState<any[]>(() => {
    const saved = localStorage.getItem(TOC_LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const [_categories, setCategories] = useState<string[]>([]);
  const [_series, setSeries] = useState<any[]>([]);

  // Drag and drop refs
  const dragAnimationFrameRef = useRef<number>(0);
  const boundMouseMoveRef = useRef<any>(null);
  const boundMouseUpRef = useRef<any>(null);
  const boundTouchMoveRef = useRef<any>(null);
  const boundTouchEndRef = useRef<any>(null);
  const boundTouchCancelRef = useRef<any>(null);

  const [summaryOfRatings] = useState<any[]>([
    {
      category: "Leadership",
      ratings: [
        { rater: "Self", rating: 5.0, color: roleColors.Self },
        { rater: "Manager", rating: 4.5, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.9,
          color: roleColors.DirectReport,
        },
      ],
    },
  ]);
  // Refactored: Leadership questions as an array of objects
  const [leadershipQuestions, setLeadershipQuestions] = useState([
    {
      question: "Inspires others with a clear and compelling vision",
      ratings: [
        { rater: "Self", rating: 5.0, color: roleColors.Self },
        { rater: "Manager", rating: 4.5, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.9,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Leads by example and models core values",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Comes up with innovative solutions to work-related problems",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Executes decisions aligned with business strategy",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Focuses on outcomes and meets deadlines",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Demonstrates ownership of tasks and goals",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Clearly articulates ideas",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Listens and responds empathetically",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Supports and encourages team collaboration.",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
    {
      question: "Values team contributions and acknowledges efforts of others.",
      ratings: [
        { rater: "Self", rating: 3, color: roleColors.Self },
        { rater: "Manager", rating: 4, color: roleColors.Manager },
        { rater: "Peers", rating: 4.2, color: roleColors.Peer },
        {
          rater: "Direct Reports",
          rating: 3.5,
          color: roleColors.DirectReport,
        },
      ],
    },
  ]);

  const handlePieChartUpdate = (
    chartKey: "strengths" | "improvements" | "hiddenStrengths" | "blindSpots",
    { index, field, value }: { index: number; field: string; value: any }
  ) => {
    setPieCharts(
      (prev: {
        strengths: ChartItem[];
        improvements: ChartItem[];
        hiddenStrengths: ChartItem[];
        blindSpots: ChartItem[];
      }) => ({
        ...prev,
        [chartKey]: (prev[chartKey] as ChartItem[]).map(
          (item: ChartItem, i: number) =>
            i === index ? { ...item, [field]: value } : item
        ),
      })
    );
  };

  // Persist chart1 to localStorage on change
  useEffect(() => {
    localStorage.setItem(
      PIE_CHARTS_LOCAL_STORAGE_KEY,
      JSON.stringify(pieCharts)
    );
  }, [pieCharts]);

  // Initialize component (lightweight)
  useEffect(() => {
    paginateRatings();
    paginateOpenEndedFeedbackRate();
    paginateDevPlan();
    prepareChartData();
  }, [sumOfComRating, openEndedFeedback, developmentPlanContent]);

  // Defer heavy edit state setup until edit mode is enabled
  useEffect(() => {
    if (isEditMode && _editDynamicStates.length === 0) {
      initDynamicEditStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

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
    void currentHeight;

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

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ]);
      const pdf = new jsPDF("p", "mm", "a4");
      const pages =
        pdfSectionRef.current.querySelectorAll(":scope > .pdf-page");

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;

        await delay(100);
        await idle();

        const canvas = await html2canvas(page, {
          scale: Math.min(window.devicePixelRatio || 1, 1.5),
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
        });
        const imgData = canvas.toDataURL("image/jpeg", 0.85);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 0;

        if (i > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );

        try {
          canvas.width = 0;
          canvas.height = 0;
        } catch {}

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
  const _onCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const Papa = await import("papaparse");
    Papa.parse(file, {
      header: true,
      worker: true,
      complete: (results) => {
        const data = results.data as FeedbackEntry[];
        generateCompetencyData(data);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };
  void _onCSVUpload;

  // Cover image upload functionality
  const onCoverImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomCoverImage(result);
      localStorage.setItem(CUSTOM_COVER_IMAGE_LOCAL_STORAGE_KEY, result);
    };
    reader.readAsDataURL(file);
  };

  // Remove custom cover image
  const removeCustomCoverImage = () => {
    setCustomCoverImage(null);
    localStorage.removeItem(CUSTOM_COVER_IMAGE_LOCAL_STORAGE_KEY);
  };

  // Generate competency data from CSV
  const generateCompetencyData = (data: FeedbackEntry[]) => {
    const _avg = (arr: number[]) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    void _avg;

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

  useEffect(() => {
    localStorage.setItem(USER_NAME_LOCAL_STORAGE_KEY, userName);
  }, [userName]);
  useEffect(() => {
    localStorage.setItem(REPORTED_DATE_LOCAL_STORAGE_KEY, reportedDate);
  }, [reportedDate]);
  useEffect(() => {
    localStorage.setItem(
      DEV_PLAN_CONTENT_LOCAL_STORAGE_KEY,
      developmentPlanContent
    );
  }, [developmentPlanContent]);
  useEffect(() => {
    localStorage.setItem(
      RESPONDENT_DATA_LOCAL_STORAGE_KEY,
      JSON.stringify(respondentData)
    );
  }, [respondentData]);
  useEffect(() => {
    localStorage.setItem(TOC_LOCAL_STORAGE_KEY, JSON.stringify(TOC));
  }, [TOC]);
  useEffect(() => {
    localStorage.setItem(NEW_TOC_LOCAL_STORAGE_KEY, JSON.stringify(newToc));
  }, [newToc]);

  useEffect(() => {
    localStorage.setItem(
      LEADERSHIP_QUESTIONS_LOCAL_STORAGE_KEY,
      JSON.stringify(leadershipQuestions)
    );
  }, [leadershipQuestions]);

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
          <div className="cover-image-controls">
            <input
              type="file"
              id="cover-image-upload"
              onChange={onCoverImageUpload}
              disabled={isExporting}
              accept="image/*"
              style={{ display: "none" }}
            />
            <label htmlFor="cover-image-upload" className="cover-upload-btn">
              Upload Cover Image
            </label>
            {customCoverImage && (
              <button
                className="remove-cover-btn"
                onClick={removeCustomCoverImage}
                disabled={isExporting}
              >
                Remove Cover
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Section: Wrap all .pdf-page elements in a single ref */}
      <div ref={pdfSectionRef}>
        <div className="pdf-page text-left">
          {/* Cover Page */}
          <div className="px-10 flex justify-end w-full mb-4">
            <img src={coverLogo} alt="Logo" className="logo" />
          </div>

          <div className="flex justify-end w-full ">
            {!isEditMode ? (
              <p
                className="paa px-10 mt-20 text-[#656464]"
                style={{ marginBottom: "15mm" }}
              >
                {userName} | {formatDateWithSuffix(reportedDate)}
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
          </div>

          <div className="flex px-20">
            <div className="flex flex-col">
              <h1 className="title mb-2">
                360-Degree <br /> Feedback <br /> Report
              </h1>
              <p className="para__light">Confidential Report</p>
            </div>
          </div>

          <div className="flex flex-col  w-full justify-end">
            <div className="flex flex-col bg-red-500">
              <p className="para__sm">
                This report is confidential and should not be distributed
                without permission.
              </p>
              <p className="para__dark">
                DAASH Consultancy & Training Online Assessments © 2025
              </p>
            </div>
          </div>
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
                          setNewToc((nt: { title: string; page: string }) => ({
                            ...nt,
                            title: e.target.value,
                          }))
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
                          setNewToc((nt: { title: string; page: string }) => ({
                            ...nt,
                            page: e.target.value,
                          }))
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
              <Footer org="TalentBoozt" pageNo={2} isEditing={isEditMode} />
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
              <Footer org="TalentBoozt" pageNo={3} isEditing={isEditMode} />
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
                        return respondentData.map((row: any, idx: number) => {
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
                                    setRespondentData((prev: any[]) =>
                                      prev.map((item: any, i: number) =>
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
                                    setRespondentData((prev: any[]) =>
                                      prev.map((item: any, i: number) =>
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
                        return respondentData.map((row: any, _idx: number) => {
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
              <Footer org="TalentBoozt" pageNo={4} isEditing={isEditMode} />
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
                  <div key={index} className="competency-item ">
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

                    <div className="charts-container w-full ">
                      {summaryOfRatings.map(
                        (chart: any, chartIndex: number) => (
                          <div
                            key={chartIndex}
                            className="chart-item w-full px-4"
                          >
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              <td className="py-4 align-top w-1/3">
                                <div className="flex flex-col gap-2 pe-20">
                                  {chart.ratings.map((r: any, idx: number) => (
                                    <span key={idx}>{r.rater}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 align-top w-1/3">
                                <div className="flex flex-col gap-2">
                                  {chart.ratings.map((r: any, idx: number) => (
                                    <div
                                      className="flex items-center gap-2"
                                      key={idx}
                                    >
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
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ReportHeader>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={5} isEditing={isEditMode} />
            </div>
          </div>
        ))}

        {/* Bar Chart for Competency Ratings Section */}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Bar Chart for Competency Ratings">
            {/* Legend */}
            {/* <div className="flex flex-row gap-8 mt-6 mb-2">
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
            </div> */}
            {/* Bar Chart */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <BarChart
                height={700}
                categories={[
                  "Leaderhip",
                  "Decision Making",
                  "Drive for Results",
                  "Communication",
                  "Teamwork",
                ]}
                series={[
                  {
                    name: "Self",
                    color: roleColors.Self,
                    values: [3.0, 2.0, 4.5, 2.9, 2.5],
                  },
                  {
                    name: "Manager",
                    color: roleColors.Manager,
                    values: [2.5, 3.5, 2, 3.5, 3.5],
                  },
                  {
                    name: "Peers",
                    color: roleColors.Peer,
                    values: [4.3, 2.7, 3.0, 2.5, 2],
                  },
                  {
                    name: "Direct Reports",
                    color: roleColors.DirectReport,
                    values: [1.6, 3.5, 4.5, 1.5, 2.5],
                  },
                ]}
              />
            </div>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={6} isEditing={isEditMode} />
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
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              {/* Pie Chart and Annotations */}
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="w-full h-full flex items-center justify-center">
                  {/* //?Piechart 1 */}
                  <PieChart
                    data={pieCharts.strengths}
                    isEditMode={isEditMode}
                    title="Strengths for Each Competency"
                    onUpdateData={(args) =>
                      handlePieChartUpdate("strengths", args)
                    }
                  />
                </div>
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
              <Footer org="TalentBoozt" pageNo={7} isEditing={isEditMode} />
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
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
              {/* Areas of Improvement Chart and Annotations */}
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="w-full h-full flex items-center justify-center">
                  {/* //?Piechart 2 */}
                  <PieChart
                    data={pieCharts.improvements}
                    isEditMode={isEditMode}
                    title="Areas of improvement for Each Competency"
                    onUpdateData={(args) =>
                      handlePieChartUpdate("improvements", args)
                    }
                  />
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
              <Footer org="TalentBoozt" pageNo={8} isEditing={isEditMode} />
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
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
              {/* Hidden Strengths Chart and Annotations */}
              <div className="relative flex items-center justify-center w-full h-full">
                {/* //?Piechart 3 */}
                <PieChart
                  data={pieCharts.hiddenStrengths}
                  isEditMode={isEditMode}
                  title="Hidden Strengths for Each Competency"
                  onUpdateData={(args) =>
                    handlePieChartUpdate("hiddenStrengths", args)
                  }
                />
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
              <Footer org="TalentBoozt" pageNo={9} isEditing={isEditMode} />
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
            <div className="flex flex-col items-center justify-center flex-1 w-full h-full">
              {/* Blind Spots Chart and Annotations */}
              <div
                className="relative flex items-center justify-center w-full h-full"
                style={{ minHeight: 400 }}
              >
                {/* //?Piechart 4 */}
                <PieChart
                  data={pieCharts.blindSpots}
                  isEditMode={isEditMode}
                  title="Blind Spots for Each Competency"
                  onUpdateData={(args) =>
                    handlePieChartUpdate("blindSpots", args)
                  }
                />
              </div>
            </div>
            <div className="mt-8">
              <p className="text-base">
                Addressing these areas can help reduce performance misalignments
                and improve team dynamics.
              </p>
            </div>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={10} isEditing={isEditMode} />
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
              <Footer org="TalentBoozt" pageNo={11} isEditing={isEditMode} />
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
              <Footer org="TalentBoozt" pageNo={12} isEditing={isEditMode} />
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
                    <DraggableComp title={leadershipQuestions[0].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[0].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 0
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[0].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[0].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 0
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[0].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 0
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 1 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[0].question}
                  ratings={leadershipQuestions[0].ratings}
                />

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQuestions[1].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[1].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 1
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[1].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[1].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 1
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[1].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 1
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 2 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[1].question}
                  ratings={leadershipQuestions[1].ratings}
                />
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={13} isEditing={isEditMode} />
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
                    <DraggableComp title={leadershipQuestions[2].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[2].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 2
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[2].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[2].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 2
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[2].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 2
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 1 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[2].question}
                  ratings={leadershipQuestions[2].ratings}
                />

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQuestions[3].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[3].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 3
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[3].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[3].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 3
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[3].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 3
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}
                {/* Row 2 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[3].question}
                  ratings={leadershipQuestions[3].ratings}
                />
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={14} isEditing={isEditMode} />
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
                    <DraggableComp title={leadershipQuestions[4].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[4].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 4
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[4].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[4].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 4
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[4].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 4
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[4].question}
                  ratings={leadershipQuestions[4].ratings}
                />

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQuestions[5].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[5].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 5
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[5].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[5].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 5
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[5].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 5
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[5].question}
                  ratings={leadershipQuestions[5].ratings}
                />
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={15} isEditing={isEditMode} />
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
                    <DraggableComp title={leadershipQuestions[6].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[6].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 6
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[6].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[6].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 6
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[6].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 6
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[6].question}
                  ratings={leadershipQuestions[6].ratings}
                />

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQuestions[7].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[7].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 7
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[7].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[7].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 7
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[7].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 7
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[7].question}
                  ratings={leadershipQuestions[7].ratings}
                />
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={16} isEditing={isEditMode} />
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
                    <DraggableComp title={leadershipQuestions[8].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[8].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 8
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[8].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[8].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 8
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[8].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 8
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 1 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[8].question}
                  ratings={leadershipQuestions[8].ratings}
                />

                {isEditMode && (
                  <div style={{ position: "relative" }}>
                    <DraggableComp title={leadershipQuestions[9].question}>
                      <div className="p-4">
                        <div className="drg-wrapper">
                          <div className="flex flex-col mb-2">
                            <label htmlFor="edit-question">Question:</label>
                            <input
                              id="edit-question"
                              type="text"
                              className="border border-gray-300 rounded-md mb-2 px-1.5"
                              value={leadershipQuestions[9].question}
                              onChange={(e) =>
                                setLeadershipQuestions((prev: any[]) =>
                                  prev.map((q: any, idx: number) =>
                                    idx === 9
                                      ? { ...q, question: e.target.value }
                                      : q
                                  )
                                )
                              }
                            />
                          </div>
                          {leadershipQuestions[9].ratings.map(
                            (
                              r: {
                                rater: string;
                                rating: number;
                                color: string;
                              },
                              idx: number
                            ) => (
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
                                        ...leadershipQuestions[9].ratings,
                                      ];
                                      newRatings[idx].rater = e.target.value;
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 9
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
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
                                        ...leadershipQuestions[9].ratings,
                                      ];
                                      newRatings[idx].rating = parseFloat(
                                        e.target.value
                                      );
                                      setLeadershipQuestions((prev: any[]) =>
                                        prev.map((q: any, idx: number) =>
                                          idx === 9
                                            ? { ...q, ratings: newRatings }
                                            : q
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </DraggableComp>
                  </div>
                )}

                {/* Row 2 */}
                <LeadershipQuestionRow
                  question={leadershipQuestions[9].question}
                  ratings={leadershipQuestions[9].ratings}
                />
              </tbody>
            </table>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={17} isEditing={isEditMode} />
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
              <Footer org="TalentBoozt" pageNo={18} isEditing={isEditMode} />
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
              <Footer org="TalentBoozt" pageNo={19} isEditing={isEditMode} />
            </div>
          </ReportHeader>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
