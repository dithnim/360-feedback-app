import React, { useState, useEffect, useRef } from "react";
import "./FeedbackReport.scss";
import DraggableComp from "../Draggable/DraggableComp";

import Footer from "../footer/Footer";
import ReportHeader from "../shared/ReportHeader";

import PieChart from "../shared/charts/PieChart/PieChart";
import BarChart from "../shared/charts/BarChart/BarChart";
import ComparisonLineChart from "../shared/charts/ComparisonLineChart/ComparisonLineChart";

// Import data stores
import { sumOfComRateDataStore } from "../utils/data/store/sumOfComRateDataStore";
import { openEndedFeedbackDataStore } from "../utils/data/store/openEndedFeedbackDataStore";

const coverLogo = new URL("../imgs/templates/Dash.png", import.meta.url).href;
const CompanyImage = new URL("../imgs/templates/cover_1.png", import.meta.url)
  .href;
import { apiGet } from "../../src/lib/apiService";

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
import DetailedFeedback from "../../src/components/reports/DetailedFeedback";
import OpenEndedFeedbackSection, {
  dummyOpenEndedFeedbackData,
} from "../../src/components/reports/OpenEndedFeedbackSection";
import BlindSpotsSection, {
  dummyBlindSpotsData,
} from "../../src/components/reports/BlindSpotsSection";
import ReportPageWrapper from "../../src/components/reports/ReportPageWrapper";
import CompetencyRatingSection from "../shared/elements/CompetencyRatingSection";

const FeedbackReport: React.FC = () => {
  // Fetch report data on initial load, using id from query string
  const [reportData, setReportData] = useState<any | null>(null);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const surveyId = params.get("surveyId");
        const appraiseeId = params.get("appraiseeId");

        if (!surveyId || !appraiseeId) return;

        const data = await apiGet<any>(
          `/look/survey/answer/${surveyId}/report?appraiseeId=${appraiseeId}`,
          { signal: controller.signal }
        );
        if (cancelled) return;
        setReportData(data);
        // keep an in-memory copy for fast access in the UI
        setAnswerData(data);

        // Store the API response data in localStorage as AnswerData
        try {
          localStorage.setItem("AnswerData", JSON.stringify(data));
        } catch (e) {
          console.error("Failed to persist AnswerData in localStorage", e);
        }

        // Map competency summary notation { C1: { averageLikert, likertQuestions }, ... }
        const candidateMaps = [
          data?.summaryOfCompetencyRatings,
          data?.competencySummary,
          data?.competenciesSummary,
          data,
        ];
        const compMap = candidateMaps.find(
          (m: any) => m && typeof m === "object" && !Array.isArray(m)
        );

        if (compMap) {
          const entries = Object.entries(compMap).filter(
            ([, v]: any) => v && typeof v === "object" && "averageLikert" in v
          ) as [
            string,
            { averageLikert?: number; likertQuestions?: string[] },
          ][];

          if (entries.length) {
            const items = entries.map(([key, val]) => ({
              category: key,
              rating: Number(val.averageLikert ?? 0),
              out_of: 5,
              description: "",
              charts: [],
            }));
            setSumOfComRating(items as any[]);
          }
        }
      } catch (err: any) {
        if (!cancelled && String(err?.message || err).match(/abort|cancel/i)) {
          return;
        }
        console.error("Failed to load report data:", err);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Clean up localStorage keys on page load
  useEffect(() => {
    // Remove specific localStorage keys when page loads
    localStorage.removeItem("Company");
    localStorage.removeItem("ProjectDetails");
    localStorage.removeItem("Participants");
    localStorage.removeItem("SurveyDetails");
  }, []);

  // State for new TOC entry
  const [newToc, setNewToc] = useState({ title: "", page: "" });
  const pdfSectionRef = useRef<HTMLDivElement>(null);

  // State management
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [answerData, setAnswerData] = useState<any>(null);

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
  const [autoGeneratedTOC, setAutoGeneratedTOC] = useState<any[]>([]);
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
  // State for dynamic competency questions
  const [competencyQuestions, setCompetencyQuestions] = useState<
    Record<string, any[]>
  >({});

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

  // Hydrate answerData from localStorage on mount (in case user refreshes or navigates directly)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("AnswerData");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setAnswerData(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read AnswerData from localStorage", e);
    }
  }, []);

  // Initialize component (lightweight)
  useEffect(() => {
    paginateRatings();
    paginateOpenEndedFeedbackRate();
    paginateDevPlan();
    prepareChartData();
  }, [reportData, sumOfComRating, openEndedFeedback, developmentPlanContent]);

  // When answerData changes, try to map it into UI state (respondent summary, header metadata)
  useEffect(() => {
    if (!answerData) return;

    try {
      // 1) User metadata
      const maybeName =
        answerData?.appraisee?.name ||
        answerData?.user?.name ||
        answerData?.appraiseeName ||
        answerData?.name;
      if (maybeName) setUserName(String(maybeName));

      const maybeDate =
        answerData?.generatedAt ||
        answerData?.createdAt ||
        answerData?.reportDate ||
        null;
      if (maybeDate)
        setReportedDate(new Date(maybeDate).toISOString().slice(0, 10));

      // 2) Respondent summary mapping with multiple fallbacks
      let nextSummary = {
        Self: { nominated: 0, completed: 0 },
        Managers: { nominated: 0, completed: 0 },
        Peers: { nominated: 0, completed: 0 },
        "Direct Reports": { nominated: 0, completed: 0 },
      } as Record<string, { nominated: number; completed: number }>;

      // Common shapes we might receive
      const candidateSummary =
        answerData?.respondentSummary ||
        answerData?.respondentsSummary ||
        answerData?.respondents ||
        null;

      if (candidateSummary && typeof candidateSummary === "object") {
        // Try by well-known keys first
        const pick = (obj: any, keys: string[]) => {
          for (const k of keys) {
            if (obj?.[k]) return obj[k];
          }
          return null;
        };

        const self = pick(candidateSummary, ["self", "Self"]);
        const manager = pick(candidateSummary, [
          "manager",
          "managers",
          "Manager",
          "Managers",
        ]);
        const peer = pick(candidateSummary, ["peer", "peers", "Peer", "Peers"]);
        const dr = pick(candidateSummary, [
          "directReport",
          "directReports",
          "DirectReport",
          "DirectReports",
        ]);

        const toCounts = (x: any) => ({
          nominated: Number(x?.nominated ?? x?.total ?? x?.count ?? 0),
          completed: Number(
            x?.completed ?? x?.done ?? x?.finished ?? x?.responded ?? 0
          ),
        });

        if (self) nextSummary["Self"] = toCounts(self);
        if (manager) nextSummary["Managers"] = toCounts(manager);
        if (peer) nextSummary["Peers"] = toCounts(peer);
        if (dr) nextSummary["Direct Reports"] = toCounts(dr);
      } else if (Array.isArray(answerData?.responsesByRole)) {
        // Shape: [{ role: 'Self'|'Manager'|'Peer'|'DirectReport', nominated, completed }, ...]
        for (const row of answerData.responsesByRole) {
          const roleLabel =
            row.role === "DirectReport"
              ? "Direct Reports"
              : row.role === "Manager"
                ? "Managers"
                : row.role === "Peer"
                  ? "Peers"
                  : row.role === "Self"
                    ? "Self"
                    : String(row.role || "");
          if (nextSummary[roleLabel]) {
            nextSummary[roleLabel] = {
              nominated: Number(row.nominated ?? row.total ?? 0),
              completed: Number(row.completed ?? row.responded ?? 0),
            };
          }
        }
      } else if (Array.isArray(answerData?.responses)) {
        // Last resort: infer from raw responses
        // nominated = total responses of that role
        // completed = responses where hasResponded/completed === true
        const buckets: Record<
          string,
          { nominated: number; completed: number }
        > = {
          Self: { nominated: 0, completed: 0 },
          Managers: { nominated: 0, completed: 0 },
          Peers: { nominated: 0, completed: 0 },
          "Direct Reports": { nominated: 0, completed: 0 },
        };
        for (const r of answerData.responses) {
          const role =
            r.role === "DirectReport"
              ? "Direct Reports"
              : r.role === "Manager"
                ? "Managers"
                : r.role === "Peer"
                  ? "Peers"
                  : r.role === "Self"
                    ? "Self"
                    : null;
          if (!role) continue;
          buckets[role].nominated += 1;
          if (r.completed === true || r.hasResponded === true) {
            buckets[role].completed += 1;
          }
        }
        nextSummary = buckets;
      }

      setRespondentData([
        { relationship: "Self", ...nextSummary["Self"] },
        { relationship: "Managers", ...nextSummary["Managers"] },
        { relationship: "Peers", ...nextSummary["Peers"] },
        { relationship: "Direct Reports", ...nextSummary["Direct Reports"] },
      ]);
    } catch (e) {
      console.error("Failed to map AnswerData into UI state", e);
    }
  }, [answerData]);

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

  // Helper function to process reportData into competency rating format
  const processCompetencyRatings = () => {
    if (!reportData) return [];

    // Define role mappings
    const roleMappings = [
      { key: "Self", display: "Self", color: roleColors.Self },
      { key: "Boss", display: "Manager", color: roleColors.Manager },
      { key: "Peer", display: "Peers", color: roleColors.Peer },
      {
        key: "Subordinate",
        display: "Direct Reports",
        color: roleColors.DirectReport,
      },
    ];

    // Process each competency from reportData
    const processedRatings = Object.entries(reportData)
      .filter(([key]) => key !== "appraiseeId")
      .map(([competencyName, competencyData]: [string, any]) => {
        // Calculate ratings for each role group
        const ratings = roleMappings.map((role) => {
          const roleData = competencyData[role.key];
          const averageRating = roleData?.averageLikert || 0;
          return {
            rater: role.display,
            rating: parseFloat(averageRating.toFixed(2)),
            color: role.color,
          };
        });

        // Calculate overall average
        const totalAverage = parseFloat(
          (
            ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          ).toFixed(2)
        );

        // Get description from competency data or use default
        const description =
          competencyData?.description ||
          "Competency performance across different rater groups.";

        return {
          category: competencyName,
          rating: totalAverage,
          out_of: 5.0,
          description: description,
          ratings: ratings,
        };
      });

    return processedRatings;
  };

  // Pagination functions
  const paginateRatings = () => {
    const processedData = processCompetencyRatings();
    // Use processed data if available, otherwise fall back to sumOfComRating
    const dataToPaginate =
      processedData.length > 0 ? processedData : sumOfComRating;
    const pages: any[][] = [];
    for (let i = 0; i < dataToPaginate.length; i += MAX_SOCR_BLOCKS_PER_PAGE) {
      pages.push(dataToPaginate.slice(i, i + MAX_SOCR_BLOCKS_PER_PAGE));
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
          // balance quality and memory footprint
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

        // Help GC: release large canvas memory
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
      description: "",
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

  // Auto-generate TOC from sections
  useEffect(() => {
    const generateAutoTOC = () => {
      // Wait for DOM to be ready
      setTimeout(() => {
        if (!pdfSectionRef.current) return;

        const pages = pdfSectionRef.current.querySelectorAll(".pdf-page");
        const sections: { title: string; page: number }[] = [];
        let currentPage = 0;

        pages.forEach((page, index) => {
          const header = page.querySelector(".report-header-title, h1.title");
          if (header) {
            const titleText = header.textContent?.trim();

            // Skip cover page and TOC page from being added
            if (
              titleText &&
              titleText !== "360-Degree Feedback Report" &&
              titleText !== "Table of Contents"
            ) {
              currentPage = index; // Page number (0-indexed, will display as 1-indexed)
              sections.push({
                title: titleText,
                page: currentPage,
              });
            }
          }
        });

        setAutoGeneratedTOC(sections);

        // If TOC is empty, populate it with auto-generated content
        if (TOC.length === 0) {
          setTOC(sections);
        }
      }, 500);
    };

    generateAutoTOC();
  }, [sumOfComRating, paginatedRatings]);

  useEffect(() => {
    localStorage.setItem(
      LEADERSHIP_QUESTIONS_LOCAL_STORAGE_KEY,
      JSON.stringify(leadershipQuestions)
    );
  }, [leadershipQuestions]);

  const questionsData = [
    {
      question: "Demonstrates strong leadership skills",
      ratings: [
        { rater: "Self", rating: 4.5, color: "#ff0000" },
        { rater: "Manager", rating: 4.2, color: "#00ff00" },
        { rater: "Peers", rating: 4.0, color: "#0000ff" },
      ],
    },
    {
      question: "Communicates effectively with the team",
      ratings: [
        { rater: "Self", rating: 4.0, color: "#ff0000" },
        { rater: "Manager", rating: 4.3, color: "#00ff00" },
        { rater: "Peers", rating: 4.1, color: "#0000ff" },
      ],
    },
  ];

  enum Role {
    Self = "Self",
    Manager = "Manager",
    DirectReport = "Direct Report",
    Peers = "Peers",
  }

  // Helper function to get all ratings for a question across all roles
  const getRatingsForQuestion = (competencyData: any, questionText: string) => {
    const allRoles = [
      { key: "Self", display: "Self", color: roleColors.Self },
      { key: "Boss", display: "Manager", color: roleColors.Manager },
      { key: "Peer", display: "Peers", color: roleColors.Peer },
      {
        key: "Subordinate",
        display: "Direct Reports",
        color: roleColors.DirectReport,
      },
    ];

    return allRoles.map((role) => {
      // Find the question in this role's likertQuestions
      const roleData = competencyData[role.key];
      const questionData = roleData?.likertQuestions?.find(
        (q: any) => q.question === questionText
      );

      return {
        rater: role.display,
        rating: questionData?.value || 0,
        color: role.color,
      };
    });
  };

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
          <div className="header__lg">
            <img src={coverLogo} alt="Logo" className="logo" />
          </div>
          <h1 className="title">360-Degree Feedback Report</h1>
          <p className="para__light">Confidential Report</p>

          <div className="cover-container">
            {customCoverImage ? (
              <div className="custom-cover-image">
                <img
                  src={customCoverImage}
                  alt="Custom Cover"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "400px",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
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
            )}
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
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <button
                      onClick={() => {
                        if (!pdfSectionRef.current) return;

                        const pages =
                          pdfSectionRef.current.querySelectorAll(".pdf-page");
                        const sections: { title: string; page: number }[] = [];

                        pages.forEach((page, index) => {
                          const header = page.querySelector(
                            ".report-header-title, h1.title"
                          );
                          if (header) {
                            const titleText = header.textContent?.trim();

                            if (
                              titleText &&
                              titleText !== "360-Degree Feedback Report" &&
                              titleText !== "Table of Contents"
                            ) {
                              sections.push({
                                title: titleText,
                                page: index,
                              });
                            }
                          }
                        });

                        setAutoGeneratedTOC(sections);
                        setTOC(sections);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded transition-colors duration-150"
                    >
                      🔄 Refresh Page Numbers
                    </button>
                  </div>
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
                  <button
                    onClick={() => setTOC([...autoGeneratedTOC])}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded transition-colors duration-150 mt-4"
                  >
                    Reset to Auto-Generated TOC
                  </button>
                </div>
              ) : (
                <div className="toc-content w-full mt-8">
                  {TOC.map((item, index) => (
                    <div key={index} className="toc-item">
                      <span className="toc-title">{item.title}</span>
                      <span className="toc-dots"></span>
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
            <div className="w-full flex flex-col gap-4 mt-6">
              {respondentData.map((row: any, idx: number) => {
                const completionRate =
                  row.nominated > 0
                    ? Math.round((row.completed / row.nominated) * 100)
                    : 0;

                // Map relationship to role colors
                const getRoleColor = (relationship: string) => {
                  const roleMap: Record<string, string> = {
                    Self: roleColors.Self,
                    Manager: roleColors.Manager,
                    Managers: roleColors.Manager,
                    Peers: roleColors.Peer,
                    Peer: roleColors.Peer,
                    "Direct Reports": roleColors.DirectReport,
                    Subordinate: roleColors.DirectReport,
                  };
                  return roleMap[relationship] || "#6b7280";
                };

                const roleColor = getRoleColor(row.relationship);

                return (
                  <div
                    key={row.relationship}
                    className="respondent-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-800">
                        {row.relationship}
                      </h3>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {isEditMode ? (
                            <>
                              <input
                                type="number"
                                className="w-12 text-center border-b-2 focus:outline-none font-bold text-xl"
                                style={{ borderColor: roleColor }}
                                value={row.completed}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  setRespondentData((prev: any[]) =>
                                    prev.map((item: any, i: number) =>
                                      i === idx
                                        ? { ...item, completed: value }
                                        : item
                                    )
                                  );
                                }}
                              />{" "}
                              /{" "}
                              <input
                                type="number"
                                className="w-12 text-center border-b-2 focus:outline-none font-bold text-xl"
                                style={{ borderColor: roleColor }}
                                value={row.nominated}
                                onChange={(e) => {
                                  const value = Number(e.target.value) || 0;
                                  setRespondentData((prev: any[]) =>
                                    prev.map((item: any, i: number) =>
                                      i === idx
                                        ? { ...item, nominated: value }
                                        : item
                                    )
                                  );
                                }}
                              />
                            </>
                          ) : (
                            <>
                              {row.completed} / {row.nominated}
                            </>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-gray-500">
                          Respondents
                        </div>
                        <div className="text-xs font-semibold text-gray-500 mt-0.5">
                          {completionRate}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar with two segments */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Completion Rate
                      </div>
                      <div className="relative w-full h-8 rounded-lg overflow-hidden flex">
                        {/* Completed segment (darker) */}
                        <div
                          className="flex items-center justify-center font-bold text-sm text-white transition-all duration-500"
                          style={{
                            width: `${completionRate}%`,
                            backgroundColor: roleColor,
                          }}
                        >
                          {isEditMode && completionRate > 10 ? (
                            <input
                              type="number"
                              className="w-full h-full text-center bg-transparent text-white font-bold text-lg focus:outline-none"
                              value={row.completed}
                              onChange={(e) => {
                                const value = Number(e.target.value) || 0;
                                setRespondentData((prev: any[]) =>
                                  prev.map((item: any, i: number) =>
                                    i === idx
                                      ? { ...item, completed: value }
                                      : item
                                  )
                                );
                              }}
                              style={{ minWidth: "20px" }}
                            />
                          ) : (
                            completionRate > 10 && row.completed
                          )}
                        </div>

                        {/* Uncompleted segment (lighter) */}
                        <div
                          className="flex items-center justify-center font-bold text-sm transition-all duration-500"
                          style={{
                            width: `${100 - completionRate}%`,
                            backgroundColor: roleColor,
                            opacity: 0.2,
                          }}
                        >
                          {completionRate < 90 && (
                            <span
                              className="text-xs"
                              style={{ color: roleColor }}
                            >
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="mt-1 text-xs font-medium"
                        style={{ color: roleColor }}
                      >
                        COMPLETED
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={4} isEditing={isEditMode} />
            </div>
          </ReportHeader>
        </div>

        {/* ------------------- Competency Comparison Overview Section ------------------ */}
        {(() => {
          // Prepare competency comparison data from reportData
          if (!reportData) return null;

          const competencies = Object.entries(reportData)
            .filter(([key]) => key !== "appraiseeId")
            .map(([key]) => key);

          if (competencies.length === 0) return null;

          const prepareComparisonData = (roleKey: string, label: string) => {
            const selfValues: number[] = [];
            const roleValues: number[] = [];

            competencies.forEach((competencyName) => {
              const competencyData = reportData[competencyName];
              const selfAvg = competencyData?.Self?.averageLikert || 0;
              const roleAvg = competencyData?.[roleKey]?.averageLikert || 0;

              selfValues.push(selfAvg);
              roleValues.push(roleAvg);
            });

            return {
              categories: competencies.map((_, idx) => `${idx + 1}`),
              competenciesNames: competencies,
              series: [
                {
                  name: "Self",
                  color: "#3b82f6",
                  values: selfValues,
                },
                {
                  name: label,
                  color: "#ef4444",
                  values: roleValues,
                },
              ],
            };
          };

          const otherData = (() => {
            const selfValues: number[] = [];
            const otherValues: number[] = [];

            competencies.forEach((competencyName) => {
              const competencyData = reportData[competencyName];
              const selfAvg = competencyData?.Self?.averageLikert || 0;
              const overallAvg = competencyData?.overallAverageLikert || 0;

              selfValues.push(selfAvg);
              otherValues.push(overallAvg);
            });

            return {
              categories: competencies.map((_, idx) => `${idx + 1}`),
              competencyNames: competencies,
              series: [
                {
                  name: "Self",
                  color: "#3b82f6",
                  values: selfValues,
                },
                {
                  name: "Overall Avg",
                  color: "#ef4444",
                  values: otherValues,
                },
              ],
            };
          })();

          return (
            <>
              {/* Page 1: Self vs Other, Self vs Manager */}
              <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
                <ReportHeader title="Competency Comparison Overview">
                  <div className="flex flex-col gap-8 mt-6">
                    {/* Self vs Other */}
                    <div className="flex flex-col items-center gap-2">
                      <h3 className="text-lg font-semibold">Self vs Other</h3>
                      <ComparisonLineChart
                        categories={otherData.categories}
                        series={otherData.series}
                        width={600}
                        selfLabel="Self"
                        otherLabel="Overall Avg"
                        competencyNames={otherData.competencyNames}
                      />
                    </div>

                    {/* Self vs Manager */}
                    {(() => {
                      const managerData = prepareComparisonData(
                        "Boss",
                        "Manager"
                      );
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            Self vs Manager
                          </h3>
                          <ComparisonLineChart
                            categories={managerData.categories}
                            series={managerData.series}
                            width={600}
                            selfLabel="Self"
                            otherLabel="Manager"
                            competencyNames={managerData.competenciesNames}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="w-full mt-auto">
                    <Footer
                      org="TalentBoozt"
                      pageNo={7}
                      isEditing={isEditMode}
                    />
                  </div>
                </ReportHeader>
              </div>

              {/* Page 2: Self vs Subordinates, Self vs Peer */}
              <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
                <ReportHeader title="Competency Comparison Overview (Continued)">
                  <div className="flex flex-col gap-8 mt-6">
                    {/* Self vs Subordinates */}
                    {(() => {
                      const subordinateData = prepareComparisonData(
                        "Subordinate",
                        "Subordinates"
                      );
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            Self vs Subordinates
                          </h3>
                          <ComparisonLineChart
                            categories={subordinateData.categories}
                            series={subordinateData.series}
                            width={600}
                            selfLabel="Self"
                            otherLabel="Subordinates"
                            competencyNames={subordinateData.competenciesNames}
                          />
                        </div>
                      );
                    })()}

                    {/* Self vs Peer */}
                    {(() => {
                      const peerData = prepareComparisonData("Peer", "Peer");
                      return (
                        <div className="flex flex-col items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            Self vs Peer
                          </h3>
                          <ComparisonLineChart
                            categories={peerData.categories}
                            series={peerData.series}
                            width={600}
                            selfLabel="Self"
                            otherLabel="Peer"
                            competencyNames={peerData.competenciesNames}
                          />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="w-full mt-auto">
                    <Footer
                      org="TalentBoozt"
                      pageNo={8}
                      isEditing={isEditMode}
                    />
                  </div>
                </ReportHeader>
              </div>
            </>
          );
        })()}

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
                {page.map((item, index) => {
                  // Handle both data formats: new format has 'ratings', old has 'charts'
                  const ratings = item.ratings
                    ? item.ratings
                    : item.charts?.map((chart: any) => ({
                        rater: chart.label,
                        rating: chart.value,
                        color: chart.color,
                      })) || [];

                  return (
                    <CompetencyRatingSection
                      key={index}
                      category={item.category}
                      rating={item.rating}
                      outOf={item.out_of}
                      description={item.description}
                      ratings={ratings}
                    />
                  );
                })}
              </div>
            </ReportHeader>
            <div className="w-full mt-auto">
              <Footer org="TalentBoozt" pageNo={5} isEditing={isEditMode} />
            </div>
          </div>
        ))}

        {/* ------------------- Strengths Section (Pie Chart) ------------------ */}
        <ReportPageWrapper
          title="Strengths"
          description="The diagram below highlights key strengths for each competency, based on high ratings and positive feedback from respondents."
          organizationName="TalentBoozt"
          pageNumber={9}
          isEditing={isEditMode}
        >
          <BlindSpotsSection
            {...dummyBlindSpotsData}
            onUpdateData={(args: {
              index: number;
              field: string;
              value: any;
            }) => handlePieChartUpdate("strengths", args)}
            chartData={pieCharts.strengths}
          />
        </ReportPageWrapper>

        {/* ----------------- Areas of Improvement Section ---------------- */}
        <ReportPageWrapper
          title="Areas of Improvement"
          description="The diagram below highlights key development areas based on feedback from respondents. These areas represent opportunities for further growth and enhancement."
          organizationName="TalentBoozt"
          pageNumber={10}
          isEditing={isEditMode}
        >
          <BlindSpotsSection
            {...dummyBlindSpotsData}
            onUpdateData={(args: {
              index: number;
              field: string;
              value: any;
            }) => handlePieChartUpdate("improvements", args)}
            chartData={pieCharts.improvements}
          />
        </ReportPageWrapper>

        {/*--------------------- Hidden Strengths Section  -------------------------------*/}
        <ReportPageWrapper
          title="Hidden Strengths"
          description="The following diagram highlights competencies where the individual may underestimate their own abilities, as identified through feedback from others."
          organizationName="TalentBoozt"
          pageNumber={11}
          isEditing={isEditMode}
        >
          <BlindSpotsSection
            {...dummyBlindSpotsData}
            onUpdateData={(args: {
              index: number;
              field: string;
              value: any;
            }) => handlePieChartUpdate("hiddenStrengths", args)}
            chartData={pieCharts.hiddenStrengths}
          />
        </ReportPageWrapper>

        {/* ---------------------------Blind Spots Section ----------------------------*/}
        <ReportPageWrapper
          title="Blind Spots"
          description="Blind spots occur when there is a misalignment between self-perception and others' perceptions. The diagram below outlines key blind spots identified for each competency:"
          organizationName="TalentBoozt"
          pageNumber={12}
          isEditing={isEditMode}
        >
          <BlindSpotsSection
            {...dummyBlindSpotsData}
            chartData={pieCharts.blindSpots}
            onUpdateData={(args: {
              index: number;
              field: string;
              value: any;
            }) => handlePieChartUpdate("blindSpots", args)}
          />
        </ReportPageWrapper>

        {/* -----------------------------  Open Ended Feedback Section --------------------------------*/}

        <ReportPageWrapper
          title="Open Ended Feedback"
          description="This section captures qualitative insights shared by respondents in their own words. These comments provide valuable context to the numerical ratings, offering specific examples, suggestions, and observations that highlight strengths, opportunities for growth, and overall perceptions of the individual's performance and leadership impact."
          organizationName="TalentBoozt"
          pageNumber={11}
          isEditing={isEditMode}
          borderColor="border-blue-400"
        >
          <OpenEndedFeedbackSection {...dummyOpenEndedFeedbackData} />
        </ReportPageWrapper>
        {/* ----------------------------- Open Ended Feedback Continued Section --------------------- */}
        <ReportPageWrapper
          title="Open Ended Feedback (Continued)"
          description=""
          organizationName="TalentBoozt"
          pageNumber={11}
          isEditing={isEditMode}
          borderColor="border-blue-400"
        >
          <OpenEndedFeedbackSection {...dummyOpenEndedFeedbackData} />
        </ReportPageWrapper>
        {/* ----------------------------- Open Ended Feedback Continued Section --------------------- */}
        <ReportPageWrapper
          title="Open Ended Feedback (Continued)"
          description=""
          organizationName="TalentBoozt"
          pageNumber={12}
          isEditing={isEditMode}
          borderColor="border-blue-400"
        >
          <OpenEndedFeedbackSection {...dummyOpenEndedFeedbackData} />

          <OpenEndedFeedbackSection {...dummyOpenEndedFeedbackData} />
        </ReportPageWrapper>

        {/*--------------------------- Dynamic Detailed Feedback Sections for Each Competency ----------------------------------- */}
        {Object.entries(reportData || {})
          .filter(([key]) => key !== "appraiseeId")
          .map(
            (
              [competencyName, competencyData]: [string, any],
              index: number
            ) => {
              // Calculate average rating across all rater groups
              const allRoleKeys = ["Self", "Boss", "Peer", "Subordinate"];
              const totalAverage =
                allRoleKeys.reduce((sum, raterGroup) => {
                  return sum + (competencyData[raterGroup]?.averageLikert || 0);
                }, 0) / allRoleKeys.length;

              // Get all unique questions from all roles
              const allQuestionsMap = new Map<string, any>();

              // Collect questions from all roles
              ["Self", "Boss", "Peer", "Subordinate"].forEach((roleKey) => {
                const roleQuestions =
                  competencyData[roleKey]?.likertQuestions || [];
                roleQuestions.forEach((q: any) => {
                  if (!allQuestionsMap.has(q.question)) {
                    allQuestionsMap.set(q.question, q);
                  }
                });
              });

              // Convert to array and sort by question name
              const allQuestions = Array.from(allQuestionsMap.values()).sort(
                (a, b) => a.question.localeCompare(b.question)
              );

              // Transform data into questions format
              const questions = allQuestions.map((question: any) => ({
                question: question.question,
                ratings: getRatingsForQuestion(
                  competencyData,
                  question.question
                ),
              }));

              return (
                <ReportPageWrapper
                  key={competencyName}
                  title={`Detailed Feedback - ${competencyName}`}
                  description="This section captures qualitative insights shared by respondents in their own words. These comments provide valuable context to the numerical ratings, offering specific examples, suggestions, and observations that highlight strengths, opportunities for growth, and overall perceptions of the individual's performance and leadership impact."
                  organizationName="TalentBoozt"
                  pageNumber={13 + index}
                  isEditing={isEditMode}
                  borderColor="border-blue-400"
                >
                  <DetailedFeedback
                    competency={competencyName}
                    averageRating={Number(totalAverage.toFixed(1))}
                    questions={competencyQuestions[competencyName] || questions}
                    isEditMode={isEditMode}
                    org="TalentBoozt"
                    pageNo={13 + index}
                    onQuestionsChange={(updatedQuestions) => {
                      setCompetencyQuestions((prev) => ({
                        ...prev,
                        [competencyName]: updatedQuestions,
                      }));
                    }}
                  />
                </ReportPageWrapper>
              );
            }
          )}
      </div>
    </div>
  );
};

export default FeedbackReport;
