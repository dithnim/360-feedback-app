import React, { useState, useEffect, useRef } from "react";
import "./FeedbackReport.scss";
import DraggableComp from "../Draggable/DraggableComp";

import Footer from "../footer/Footer";
import ReportHeader from "../shared/ReportHeader";

import ComparisonLineChart from "../shared/charts/ComparisonLineChart/ComparisonLineChart";

// Import data stores
import { sumOfComRateDataStore } from "../utils/data/store/sumOfComRateDataStore";

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
// removed unused DEV_PLAN_CONTENT_LOCAL_STORAGE_KEY
const TOC_LOCAL_STORAGE_KEY = "feedback_report_toc";
const CUSTOM_COVER_IMAGE_LOCAL_STORAGE_KEY = "feedback_custom_cover_image";
const DEVELOPMENT_PLAN_ITEMS_LOCAL_STORAGE_KEY =
  "feedback_development_plan_items";
const ORGANIZATION_NAME_LOCAL_STORAGE_KEY = "feedback_organization_name";
const PAGE_NUMBERS_LOCAL_STORAGE_KEY = "feedback_page_numbers";

// Removed unused LEADERSHIP_QUESTIONS_LOCAL_STORAGE_KEY constant
// Removed unused LeadershipQuestionRow import
import DetailedFeedback from "../../src/components/reports/DetailedFeedback";
import OpenEndedFeedbackSection from "../../src/components/reports/OpenEndedFeedbackSection";
import AreasOfImprovementChart from "../../src/components/reports/AreasOfImprovementChart";
import PerceptionGapChart, {
  transformToPerceptionGapFormat,
} from "../../src/components/reports/PerceptionGapChart";
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
  const [pieCharts, setPieCharts] = useState<{
    strengths: ChartItem[];
    improvements: ChartItem[];
    hiddenStrengths: ChartItem[];
    blindSpots: ChartItem[];
  }>({
    strengths: [],
    improvements: [],
    hiddenStrengths: [],
    blindSpots: [],
  });

  // Generate strengths from backend data (highest overall ratings)
  const generateStrengthsFromBackend = (data: any) => {
    if (!data) return [];

    const competencies = Object.entries(data)
      .filter(([key]) => key !== "appraiseeId")
      .map(([competencyName, competencyData]: [string, any]) => {
        const roleKeys = ["Self", "Boss", "Peer", "Subordinate"];
        const averages = roleKeys
          .map((key) => competencyData[key]?.averageLikert || 0)
          .filter((avg) => avg > 0);

        const overallAverage =
          averages.length > 0
            ? averages.reduce((sum, val) => sum + val, 0) / averages.length
            : 0;

        const description =
          competencyData?.description ||
          `Shows strong performance in ${competencyName.toLowerCase()} with consistent high ratings across multiple evaluators.`;

        return {
          id: competencyName.toLowerCase().replace(/\s+/g, "-"),
          title: competencyName,
          rating: parseFloat(overallAverage.toFixed(2)),
          description,
          isHighlighted: false,
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    return competencies;
  };

  // Generate areas of improvement from backend data (lowest overall ratings)
  const generateImprovementsFromBackend = (data: any) => {
    if (!data) return [];

    const competencies = Object.entries(data)
      .filter(([key]) => key !== "appraiseeId")
      .map(([competencyName, competencyData]: [string, any]) => {
        const roleKeys = ["Self", "Boss", "Peer", "Subordinate"];
        const averages = roleKeys
          .map((key) => competencyData[key]?.averageLikert || 0)
          .filter((avg) => avg > 0);

        const overallAverage =
          averages.length > 0
            ? averages.reduce((sum, val) => sum + val, 0) / averages.length
            : 0;

        const description =
          competencyData?.improvementDescription ||
          competencyData?.description ||
          `Opportunity to enhance ${competencyName.toLowerCase()} skills through focused development and practice.`;

        return {
          id: competencyName.toLowerCase().replace(/\s+/g, "-"),
          title: competencyName,
          rating: parseFloat(overallAverage.toFixed(2)),
          description,
          isHighlighted: false,
        };
      })
      .sort((a, b) => a.rating - b.rating)
      .slice(0, 4);

    return competencies;
  };

  // Helper: get all competencies with self/others difference
  const getCompetencyDifferences = (data: any) => {
    return Object.entries(data)
      .filter(([key]) => key !== "appraiseeId")
      .map(([competencyName, competencyData]: [string, any]) => {
        const selfRating = competencyData["Self"]?.averageLikert || 0;
        const otherRoleKeys = [
          "Boss",
          "Peer",
          "Subordinate",
          "Manager",
          "DirectReport",
          "Direct Report",
        ];
        const otherAverages: number[] = otherRoleKeys
          .map((roleKey) => competencyData[roleKey]?.averageLikert)
          .filter((val) => typeof val === "number" && !isNaN(val));
        const othersAverage =
          otherAverages.length > 0
            ? otherAverages.reduce((s, v) => s + v, 0) / otherAverages.length
            : 0;
        const difference = selfRating - othersAverage;
        return {
          key: competencyName.toLowerCase().replace(/\s+/g, "-"),
          title: competencyName,
          selfRating: parseFloat(selfRating.toFixed(2)),
          othersRating: parseFloat(othersAverage.toFixed(2)),
          othersAverage: parseFloat(othersAverage.toFixed(2)),
          difference: parseFloat(difference.toFixed(2)),
          description: competencyData?.description || "",
        };
      });
  };

  // Generate blind spots — exclude competencies present in hidden strengths
  const generateBlindSpotsFromBackend = (
    data: any,
    hiddenStrengthsKeys: Set<string> = new Set()
  ) => {
    const allDiffs = getCompetencyDifferences(data);
    // Only include where self - others >= 1 and not present in hiddenStrengths
    return allDiffs
      .filter((d) => d.difference >= 1 && !hiddenStrengthsKeys.has(d.key))
      .map((d) => ({
        ...d,
        id: d.key,
        description: `Blind spot: Self overall rating is higher than others for ${d.title}.`,
        isHighlighted: false,
      }))
      .sort((a, b) => b.difference - a.difference)
      .slice(0, 8);
  };

  // Generate hidden strengths — exclude competencies present in blind spots
  const generateHiddenStrengthsFromBackend = (
    data: any,
    blindSpotsKeys: Set<string> = new Set()
  ) => {
    const allDiffs = getCompetencyDifferences(data);
    // Only include where others - self >= 1 and not present in blindSpots
    return allDiffs
      .filter((d) => d.difference <= -1 && !blindSpotsKeys.has(d.key))
      .map((d) => ({
        ...d,
        id: d.key,
        description: `Hidden strength: Others' overall rating is higher than self for ${d.title}.`,
        isHighlighted: false,
      }))
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
      .slice(0, 8);
  };

  // States for all sections - initialize with empty arrays
  const [improvementAreas, setImprovementAreas] = useState<any[]>([]);
  const [strengthsData, setStrengthsData] = useState<any[]>([]);
  const [hiddenStrengthsData, setHiddenStrengthsData] = useState<any[]>([]);
  const [blindSpotsData, setBlindSpotsData] = useState<any[]>([]);

  const [userName, setUserName] = useState("John Doe");
  const [reportedDate, setReportedDate] = useState("2025-01-01");
  // removed unused developmentPlanContent state
  const [respondentData, setRespondentData] = useState([
    { relationship: "Self", nominated: 0, completed: 0 },
    { relationship: "Managers", nominated: 0, completed: 0 },
    { relationship: "Peers", nominated: 0, completed: 0 },
    { relationship: "Direct Reports", nominated: 0, completed: 0 },
  ]);

  // Development Plan Items State
  const [developmentPlanItems, setDevelopmentPlanItems] = useState<
    Array<{ areaOfImprovement: string; actionToBeTaken: string }>
  >(() => {
    try {
      const saved = localStorage.getItem(
        DEVELOPMENT_PLAN_ITEMS_LOCAL_STORAGE_KEY
      );
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(
        "Failed to load development plan items from localStorage",
        e
      );
    }
    return [
      { areaOfImprovement: "", actionToBeTaken: "" },
      { areaOfImprovement: "", actionToBeTaken: "" },
      { areaOfImprovement: "", actionToBeTaken: "" },
      { areaOfImprovement: "", actionToBeTaken: "" },
      { areaOfImprovement: "", actionToBeTaken: "" },
    ];
  });

  // Footer organization and page numbers state
  const [organizationName, setOrganizationName] = useState(() => {
    try {
      const saved = localStorage.getItem(ORGANIZATION_NAME_LOCAL_STORAGE_KEY);
      return saved || "TalentBoozt";
    } catch (e) {
      return "TalentBoozt";
    }
  });
  const [pageNumbers, setPageNumbers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(PAGE_NUMBERS_LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load page numbers from localStorage", e);
    }
    return {
      toc: 2,
      introduction: 3,
      respondentSummary: 4,
      competencyRatings: 5,
      competencyComparison1: 7,
      competencyComparison2: 8,
      strengths: 9,
      improvements: 10,
      hiddenStrengths: 11,
      blindSpots: 12,
      openEndedFeedback: 13,
      developmentPlan: 20,
    };
  });

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
  const [openEndedFeedback, setOpenEndedFeedback] = useState<any[]>([]);
  const [_paginatedOpenEndedFeedback, setPaginatedOpenEndedFeedback] = useState<
    any[]
  >([]);

  // Constants
  const MAX_SOCR_BLOCKS_PER_PAGE = 3;
  const MAX_OEF_PER_PAGE = 8;
  // removed legacy dev plan pagination constant

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

  const handleImprovementAreasUpdate = ({
    index,
    field,
    value,
  }: {
    index: number;
    field: string;
    value: any;
  }) => {
    setImprovementAreas((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleStrengthsUpdate = ({
    index,
    field,
    value,
  }: {
    index: number;
    field: string;
    value: any;
  }) => {
    setStrengthsData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleHiddenStrengthsUpdate = ({
    index,
    field,
    value,
  }: {
    index: number;
    field: string;
    value: any;
  }) => {
    setHiddenStrengthsData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleBlindSpotsUpdate = ({
    index,
    field,
    value,
  }: {
    index: number;
    field: string;
    value: any;
  }) => {
    setBlindSpotsData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
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
    prepareChartData();
  }, [reportData, sumOfComRating, openEndedFeedback]);

  // Update all sections from backend data when reportData changes
  useEffect(() => {
    if (reportData) {
      // Compute blind spots and hidden strengths with mutual exclusion
      // Generate hidden strengths first (so blind spots take priority if a comp is both)
      const tempHiddenStrengths =
        generateHiddenStrengthsFromBackend(reportData);
      const hiddenKeys = new Set(tempHiddenStrengths.map((d) => d.key));
      const tempBlindSpots = generateBlindSpotsFromBackend(
        reportData,
        hiddenKeys
      );
      const blindKeys = new Set(tempBlindSpots.map((d) => d.key));
      // Re-filter hidden strengths to remove any overlaps
      const hiddenStrengths = tempHiddenStrengths.filter(
        (d) => !blindKeys.has(d.key)
      );
      setHiddenStrengthsData(hiddenStrengths);
      setBlindSpotsData(tempBlindSpots);

      const newStrengths = generateStrengthsFromBackend(reportData);
      if (newStrengths.length > 0) {
        setStrengthsData(newStrengths);
      }

      const newImprovements = generateImprovementsFromBackend(reportData);
      if (newImprovements.length > 0) {
        setImprovementAreas(newImprovements);
      }
    }
  }, [reportData]);

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

  // removed legacy dev plan pagination

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

  // High-quality PDF export function
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

        await delay(150);
        await idle();

        // High-quality canvas rendering
        const canvas = await html2canvas(page, {
          scale: 3, // High quality scale for crisp text and images
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
          imageTimeout: 0,
          removeContainer: true,
          // Optimize rendering for quality
          foreignObjectRendering: false,
        });

        // Use PNG for lossless quality
        const imgData = canvas.toDataURL("image/png", 1.0);
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let position = 0;

        if (i > 0) pdf.addPage();

        // Use SLOW compression for better quality
        pdf.addImage(
          imgData,
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "SLOW"
        );

        // Help GC: release large canvas memory
        try {
          canvas.width = 0;
          canvas.height = 0;
        } catch {}

        setExportProgress(((i + 1) / pages.length) * 100);
      }

      // Save with descriptive filename
      const timestamp = new Date().toISOString().split("T")[0];
      pdf.save(`360-feedback-report-${userName}-${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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
  // removed legacy dev plan content persistence
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
    localStorage.setItem(
      DEVELOPMENT_PLAN_ITEMS_LOCAL_STORAGE_KEY,
      JSON.stringify(developmentPlanItems)
    );
  }, [developmentPlanItems]);
  useEffect(() => {
    localStorage.setItem(ORGANIZATION_NAME_LOCAL_STORAGE_KEY, organizationName);
  }, [organizationName]);
  useEffect(() => {
    localStorage.setItem(
      PAGE_NUMBERS_LOCAL_STORAGE_KEY,
      JSON.stringify(pageNumbers)
    );
  }, [pageNumbers]);

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

  // removed sample questions data and unused enum

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

  // (debug logs removed)

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
      {/* warning overlay removed */}

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
          {customCoverImage ? (
            /* Custom Cover Page - Complete Replacement */
            <div
              className="custom-cover-page"
              style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <img
                src={customCoverImage}
                alt="Custom Cover"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
            </div>
          ) : (
            /* Default Cover Page */
            <>
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
                This report is confidential and should not be distributed
                without permission.
              </p>
              <p className="para__dark">
                DAASH Consultancy & Training Online Assessments © 2025
              </p>
            </>
          )}
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
              <Footer
                org={organizationName}
                pageNo={pageNumbers.toc}
                isEditing={isEditMode}
                onOrgChange={setOrganizationName}
                onPageNoChange={(newPageNo) =>
                  setPageNumbers({ ...pageNumbers, toc: newPageNo })
                }
              />
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
              <Footer
                org={organizationName}
                pageNo={pageNumbers.introduction}
                isEditing={isEditMode}
                onOrgChange={setOrganizationName}
                onPageNoChange={(newPageNo) =>
                  setPageNumbers({ ...pageNumbers, introduction: newPageNo })
                }
              />
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
              <Footer
                org={organizationName}
                pageNo={pageNumbers.respondentSummary}
                isEditing={isEditMode}
                onOrgChange={setOrganizationName}
                onPageNoChange={(newPageNo) =>
                  setPageNumbers({
                    ...pageNumbers,
                    respondentSummary: newPageNo,
                  })
                }
              />
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
                      org={organizationName}
                      pageNo={pageNumbers.competencyComparison1}
                      isEditing={isEditMode}
                      onOrgChange={setOrganizationName}
                      onPageNoChange={(newPageNo) =>
                        setPageNumbers({
                          ...pageNumbers,
                          competencyComparison1: newPageNo,
                        })
                      }
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
                      org={organizationName}
                      pageNo={pageNumbers.competencyComparison2}
                      isEditing={isEditMode}
                      onOrgChange={setOrganizationName}
                      onPageNoChange={(newPageNo) =>
                        setPageNumbers({
                          ...pageNumbers,
                          competencyComparison2: newPageNo,
                        })
                      }
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

                {/* Edit Mode Draggable Components */}
                {isEditMode && (
                  <div style={{ position: "relative", marginBottom: "1rem" }}>
                    {page.map((item, index) => {
                      const ratings = item.ratings
                        ? item.ratings
                        : item.charts?.map((chart: any) => ({
                            rater: chart.label,
                            rating: chart.value,
                            color: chart.color,
                          })) || [];

                      return (
                        <DraggableComp
                          key={`edit-${index}`}
                          title={`Edit: ${item.category}`}
                        >
                          <div className="p-4">
                            <div className="drg-wrapper">
                              <div className="flex flex-col mb-2">
                                <label htmlFor={`edit-category-${index}`}>
                                  Category:
                                </label>
                                <input
                                  id={`edit-category-${index}`}
                                  type="text"
                                  className="border border-gray-300 rounded-md mb-2 px-1.5"
                                  value={item.category}
                                  onChange={(e) => {
                                    const newPage = [...page];
                                    newPage[index].category = e.target.value;
                                    setPaginatedRatings((prev) => {
                                      const newRatings = [...prev];
                                      newRatings[pageIndex] = newPage;
                                      return newRatings;
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor={`edit-rating-${index}`}>
                                  Overall Rating:
                                </label>
                                <input
                                  id={`edit-rating-${index}`}
                                  type="number"
                                  step="0.01"
                                  className="border border-gray-300 rounded-md mb-2 px-1.5"
                                  value={item.rating}
                                  onChange={(e) => {
                                    const newPage = [...page];
                                    newPage[index].rating =
                                      parseFloat(e.target.value) || 0;
                                    setPaginatedRatings((prev) => {
                                      const newRatings = [...prev];
                                      newRatings[pageIndex] = newPage;
                                      return newRatings;
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex flex-col mb-2">
                                <label htmlFor={`edit-description-${index}`}>
                                  Description:
                                </label>
                                <textarea
                                  id={`edit-description-${index}`}
                                  className="border border-gray-300 rounded-md mb-2 px-1.5"
                                  value={item.description}
                                  onChange={(e) => {
                                    const newPage = [...page];
                                    newPage[index].description = e.target.value;
                                    setPaginatedRatings((prev) => {
                                      const newRatings = [...prev];
                                      newRatings[pageIndex] = newPage;
                                      return newRatings;
                                    });
                                  }}
                                  rows={2}
                                />
                              </div>
                              {ratings.map((r: any, rIndex: number) => (
                                <div
                                  className="flex items-center justify-between mb-2"
                                  key={rIndex}
                                >
                                  <div className="me-4 flex flex-col">
                                    <label>Rater:</label>
                                    <input
                                      type="text"
                                      className="border border-gray-300 rounded-md w-32 px-1.5"
                                      value={r.rater}
                                      onChange={(e) => {
                                        const newPage = [...page];
                                        newPage[index].ratings[rIndex].rater =
                                          e.target.value;
                                        setPaginatedRatings((prev) => {
                                          const newRatings = [...prev];
                                          newRatings[pageIndex] = newPage;
                                          return newRatings;
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="me-4 flex flex-col">
                                    <label>Rating:</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      max={5}
                                      className="border border-gray-300 rounded-md w-32 px-1.5"
                                      value={r.rating}
                                      onChange={(e) => {
                                        const newPage = [...page];
                                        newPage[index].ratings[rIndex].rating =
                                          parseFloat(e.target.value) || 0;
                                        setPaginatedRatings((prev) => {
                                          const newRatings = [...prev];
                                          newRatings[pageIndex] = newPage;
                                          return newRatings;
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DraggableComp>
                      );
                    })}
                  </div>
                )}

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
              <Footer
                org={organizationName}
                pageNo={pageNumbers.competencyRatings}
                isEditing={isEditMode}
                onOrgChange={setOrganizationName}
                onPageNoChange={(newPageNo) =>
                  setPageNumbers({
                    ...pageNumbers,
                    competencyRatings: newPageNo,
                  })
                }
              />
            </div>
          </div>
        ))}

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
                  organizationName={organizationName}
                  pageNumber={13 + index}
                  isEditing={isEditMode}
                  borderColor="border-blue-400"
                  onOrgChange={setOrganizationName}
                  onPageNoChange={(newPageNo) =>
                    setPageNumbers({
                      ...pageNumbers,
                      [`detailedFeedback${index}`]: newPageNo,
                    })
                  }
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

        {/* ------------------- Strengths Section ------------------ */}
        <ReportPageWrapper
          title="Strengths"
          description="The diagram below highlights key strengths for each competency, based on high ratings and positive feedback from respondents."
          organizationName={organizationName}
          pageNumber={pageNumbers.strengths}
          isEditing={isEditMode}
          onOrgChange={setOrganizationName}
          onPageNoChange={(newPageNo) =>
            setPageNumbers({ ...pageNumbers, strengths: newPageNo })
          }
        >
          {isEditMode && (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              {strengthsData.map((item, index) => (
                <DraggableComp
                  key={`strength-${index}`}
                  title={`Edit Strength: ${item.title || index + 1}`}
                >
                  <div className="p-4">
                    <div className="drg-wrapper">
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-strength-title-${index}`}>
                          Title:
                        </label>
                        <input
                          id={`edit-strength-title-${index}`}
                          type="text"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.title}
                          onChange={(e) =>
                            handleStrengthsUpdate({
                              index,
                              field: "title",
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-strength-rating-${index}`}>
                          Rating:
                        </label>
                        <input
                          id={`edit-strength-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.rating}
                          onChange={(e) =>
                            handleStrengthsUpdate({
                              index,
                              field: "rating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-strength-desc-${index}`}>
                          Description:
                        </label>
                        <textarea
                          id={`edit-strength-desc-${index}`}
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.description}
                          onChange={(e) =>
                            handleStrengthsUpdate({
                              index,
                              field: "description",
                              value: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </DraggableComp>
              ))}
            </div>
          )}
          <AreasOfImprovementChart
            data={strengthsData}
            userName={userName}
            isEditMode={isEditMode}
            onUpdateData={handleStrengthsUpdate}
            color="#1f8380"
          />
        </ReportPageWrapper>

        {/* ----------------- Areas of Improvement Section ---------------- */}
        <ReportPageWrapper
          title="Areas of Improvement"
          description="The diagram below highlights key development areas based on feedback from respondents. These areas represent opportunities for further growth and enhancement."
          organizationName={organizationName}
          pageNumber={pageNumbers.improvements}
          isEditing={isEditMode}
          onOrgChange={setOrganizationName}
          onPageNoChange={(newPageNo) =>
            setPageNumbers({ ...pageNumbers, improvements: newPageNo })
          }
        >
          {isEditMode && (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              {improvementAreas.map((item, index) => (
                <DraggableComp
                  key={`improvement-${index}`}
                  title={`Edit Improvement: ${item.title || index + 1}`}
                >
                  <div className="p-4">
                    <div className="drg-wrapper">
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-improvement-title-${index}`}>
                          Title:
                        </label>
                        <input
                          id={`edit-improvement-title-${index}`}
                          type="text"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.title}
                          onChange={(e) =>
                            handleImprovementAreasUpdate({
                              index,
                              field: "title",
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-improvement-rating-${index}`}>
                          Rating:
                        </label>
                        <input
                          id={`edit-improvement-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.rating}
                          onChange={(e) =>
                            handleImprovementAreasUpdate({
                              index,
                              field: "rating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-improvement-desc-${index}`}>
                          Description:
                        </label>
                        <textarea
                          id={`edit-improvement-desc-${index}`}
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.description}
                          onChange={(e) =>
                            handleImprovementAreasUpdate({
                              index,
                              field: "description",
                              value: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </DraggableComp>
              ))}
            </div>
          )}
          <AreasOfImprovementChart
            data={improvementAreas}
            userName={userName}
            isEditMode={isEditMode}
            onUpdateData={handleImprovementAreasUpdate}
            color="#d72928"
          />
        </ReportPageWrapper>

        {/*--------------------- Hidden Strengths Section  -------------------------------*/}
        <ReportPageWrapper
          title="Hidden Strengths"
          description="The following diagram highlights competencies where the individual may underestimate their own abilities, as identified through feedback from others."
          organizationName={organizationName}
          pageNumber={pageNumbers.hiddenStrengths}
          isEditing={isEditMode}
          onOrgChange={setOrganizationName}
          onPageNoChange={(newPageNo) =>
            setPageNumbers({ ...pageNumbers, hiddenStrengths: newPageNo })
          }
        >
          {isEditMode && (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              {hiddenStrengthsData.map((item, index) => (
                <DraggableComp
                  key={`hidden-strength-${index}`}
                  title={`Edit Hidden Strength: ${item.title || index + 1}`}
                >
                  <div className="p-4">
                    <div className="drg-wrapper">
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-hidden-strength-title-${index}`}>
                          Title:
                        </label>
                        <input
                          id={`edit-hidden-strength-title-${index}`}
                          type="text"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.title}
                          onChange={(e) =>
                            handleHiddenStrengthsUpdate({
                              index,
                              field: "title",
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label
                          htmlFor={`edit-hidden-strength-self-rating-${index}`}
                        >
                          Self Rating:
                        </label>
                        <input
                          id={`edit-hidden-strength-self-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.selfRating}
                          onChange={(e) =>
                            handleHiddenStrengthsUpdate({
                              index,
                              field: "selfRating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label
                          htmlFor={`edit-hidden-strength-others-rating-${index}`}
                        >
                          Others Rating:
                        </label>
                        <input
                          id={`edit-hidden-strength-others-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.othersRating}
                          onChange={(e) =>
                            handleHiddenStrengthsUpdate({
                              index,
                              field: "othersRating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-hidden-strength-desc-${index}`}>
                          Description:
                        </label>
                        <textarea
                          id={`edit-hidden-strength-desc-${index}`}
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.description}
                          onChange={(e) =>
                            handleHiddenStrengthsUpdate({
                              index,
                              field: "description",
                              value: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </DraggableComp>
              ))}
            </div>
          )}
          <PerceptionGapChart
            data={transformToPerceptionGapFormat(hiddenStrengthsData)}
            title="Hidden Strengths Overall"
            isEditMode={isEditMode}
            onUpdateData={handleHiddenStrengthsUpdate}
            selfColor="#4ade80"
            othersColor="#fb923c"
          />
        </ReportPageWrapper>

        {/* ---------------------------Blind Spots Section ----------------------------*/}
        <ReportPageWrapper
          title="Blind Spots"
          description="Blind spots occur when there is a misalignment between self-perception and others' perceptions. The diagram below outlines key blind spots identified for each competency:"
          organizationName={organizationName}
          pageNumber={pageNumbers.blindSpots}
          isEditing={isEditMode}
          onOrgChange={setOrganizationName}
          onPageNoChange={(newPageNo) =>
            setPageNumbers({ ...pageNumbers, blindSpots: newPageNo })
          }
        >
          {isEditMode && (
            <div style={{ position: "relative", marginBottom: "1rem" }}>
              {blindSpotsData.map((item, index) => (
                <DraggableComp
                  key={`blind-spot-${index}`}
                  title={`Edit Blind Spot: ${item.title || index + 1}`}
                >
                  <div className="p-4">
                    <div className="drg-wrapper">
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-blind-spot-title-${index}`}>
                          Title:
                        </label>
                        <input
                          id={`edit-blind-spot-title-${index}`}
                          type="text"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.title}
                          onChange={(e) =>
                            handleBlindSpotsUpdate({
                              index,
                              field: "title",
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-blind-spot-self-rating-${index}`}>
                          Self Rating:
                        </label>
                        <input
                          id={`edit-blind-spot-self-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.selfRating}
                          onChange={(e) =>
                            handleBlindSpotsUpdate({
                              index,
                              field: "selfRating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label
                          htmlFor={`edit-blind-spot-others-rating-${index}`}
                        >
                          Others Rating:
                        </label>
                        <input
                          id={`edit-blind-spot-others-rating-${index}`}
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.othersRating}
                          onChange={(e) =>
                            handleBlindSpotsUpdate({
                              index,
                              field: "othersRating",
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col mb-2">
                        <label htmlFor={`edit-blind-spot-desc-${index}`}>
                          Description:
                        </label>
                        <textarea
                          id={`edit-blind-spot-desc-${index}`}
                          className="border border-gray-300 rounded-md mb-2 px-1.5"
                          value={item.description}
                          onChange={(e) =>
                            handleBlindSpotsUpdate({
                              index,
                              field: "description",
                              value: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </DraggableComp>
              ))}
            </div>
          )}
          <PerceptionGapChart
            data={transformToPerceptionGapFormat(blindSpotsData)}
            title="Blind Spots Overall"
            isEditMode={isEditMode}
            onUpdateData={handleBlindSpotsUpdate}
            selfColor="#4ade80"
            othersColor="#fb923c"
          />
        </ReportPageWrapper>

        {/* -----------------------------  Open Ended Feedback Section --------------------------------*/}
        {openEndedFeedback.length > 0 &&
          openEndedFeedback.map((entry: any, idx: number) => (
            <ReportPageWrapper
              key={`open-ended-feedback-${idx}`}
              title={
                idx === 0
                  ? "Open Ended Feedback"
                  : `Open Ended Feedback (Continued)`
              }
              description={
                idx === 0
                  ? `This section captures qualitative insights shared by respondents in their own words. These comments provide valuable context to the numerical ratings, offering specific examples, suggestions, and observations that highlight strengths, opportunities for growth, and overall perceptions of the individual's performance and leadership impact.`
                  : ""
              }
              organizationName={organizationName}
              pageNumber={pageNumbers.openEndedFeedback + idx}
              isEditing={isEditMode}
              borderColor="border-blue-400"
              onOrgChange={setOrganizationName}
              onPageNoChange={(newPageNo) =>
                setPageNumbers({
                  ...pageNumbers,
                  openEndedFeedback: newPageNo - idx,
                })
              }
            >
              <OpenEndedFeedbackSection
                question={entry.question || ""}
                feedbackItems={
                  Array.isArray(entry.feedbacks)
                    ? entry.feedbacks.map((f: string, i: number) => ({
                        id: `feedback-${i}`,
                        iconColor: "#2563eb",
                        feedbackText: f,
                      }))
                    : []
                }
                organizationName="TalentBoozt"
                pageNumber={11 + idx}
                isEditing={isEditMode}
              />
            </ReportPageWrapper>
          ))}

        {/* ----------------------------- Development Plan Section --------------------------------*/}
        <div className="pdf-page p flex flex-col min-h-[100vh] text-left">
          <ReportHeader title="Development Plan">
            <div className="w-full mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-white p-4 text-center font-bold text-base">
                      Area of Improvement
                    </th>
                    <th className="border border-gray-400 bg-white p-4 text-center font-bold text-base">
                      Action to be taken
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {developmentPlanItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-400 p-4 align-top">
                        {isEditMode ? (
                          <textarea
                            className="w-full h-32 p-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            value={item.areaOfImprovement}
                            onChange={(e) => {
                              const newItems = [...developmentPlanItems];
                              newItems[index].areaOfImprovement =
                                e.target.value;
                              setDevelopmentPlanItems(newItems);
                            }}
                            placeholder="Enter area of improvement..."
                          />
                        ) : (
                          <div className="min-h-[8rem] whitespace-pre-wrap">
                            {item.areaOfImprovement}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-400 p-4 align-top">
                        {isEditMode ? (
                          <textarea
                            className="w-full h-32 p-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            value={item.actionToBeTaken}
                            onChange={(e) => {
                              const newItems = [...developmentPlanItems];
                              newItems[index].actionToBeTaken = e.target.value;
                              setDevelopmentPlanItems(newItems);
                            }}
                            placeholder="Enter action to be taken..."
                          />
                        ) : (
                          <div className="min-h-[8rem] whitespace-pre-wrap">
                            {item.actionToBeTaken}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isEditMode && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setDevelopmentPlanItems([
                        ...developmentPlanItems,
                        { areaOfImprovement: "", actionToBeTaken: "" },
                      ]);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-colors"
                  >
                    Add Row
                  </button>
                  {developmentPlanItems.length > 1 && (
                    <button
                      onClick={() => {
                        const newItems = [...developmentPlanItems];
                        newItems.pop();
                        setDevelopmentPlanItems(newItems);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition-colors"
                    >
                      Remove Last Row
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="w-full mt-auto">
              <Footer
                org={organizationName}
                pageNo={pageNumbers.developmentPlan}
                isEditing={isEditMode}
                onOrgChange={setOrganizationName}
                onPageNoChange={(newPageNo) =>
                  setPageNumbers({ ...pageNumbers, developmentPlan: newPageNo })
                }
              />
            </div>
          </ReportHeader>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
