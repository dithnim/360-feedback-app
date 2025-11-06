import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

const Home = lazy(() => import("./Home.tsx"));
const Project = lazy(() => import("./pages/Project.tsx"));
const CreateSurvay = lazy(() => import("./pages/CreateSurvay.tsx"));
const Templates = lazy(() => import("./pages/Templates.tsx"));
const PreviewTemplates = lazy(() => import("./pages/PreviewTemplates.tsx"));
const CreateTemplate = lazy(() => import("./pages/CreateTemplate.tsx"));
const ViewTeam = lazy(() => import("./pages/ViewTeam.tsx"));
const SurvayScratch = lazy(() => import("./pages/SurvayScratch.tsx"));
const CreateTeam = lazy(() => import("./pages/CreateTeam.tsx"));
const FeedbackReport = lazy(
  () => import("../report/FeedbackReport/FeedbackReport.tsx")
);
// Removed legacy FeedbackReport2 and FeedbackReport3
const Login = lazy(() => import("./pages/login.tsx"));
const CurrentProjects = lazy(() => import("./pages/currentProjects.tsx"));
import { UserProvider, useUser } from "./context/UserContext";
import { SidebarProvider } from "./context/SidebarContext";
import Loader from "./components/ui/loader";
const SurveyPreview = lazy(() => import("./pages/SurveyPreview"));
const CreateFromTemplate = lazy(() => import("./pages/CreateFromTemplate"));
const SurveyParticipation = lazy(() => import("./pages/SurveyParticipation"));
const SurveyThankYou = lazy(() => import("./pages/SurveyThankYou"));
const SurveyDemo = lazy(() => import("./pages/SurveyDemo"));
import ErrorBoundary from "./components/ErrorBoundary";
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const PreviewParticipants = lazy(
  () => import("./pages/previewParticipants.tsx")
);
const ViewSurveys = lazy(() => import("./pages/viewSurveys.tsx"));
const ProjectParticipants = lazy(
  () => import("./pages/ProjectParticipants.tsx")
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader text="Loading..." />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/survey/participate" element={<SurveyParticipation />} />
      <Route path="/survey-thank-you" element={<SurveyThankYou />} />
      <Route path="/survey-demo" element={<SurveyDemo />} />
      <Route path="/feedback-report" element={<FeedbackReport />} />
      {/* Legacy routes removed: /feedback-report2, /feedback-report3 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project"
        element={
          <ProtectedRoute>
            <Project />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-surveys"
        element={
          <ProtectedRoute>
            <ViewSurveys />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateSurvay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-from-scratch"
        element={
          <ProtectedRoute>
            <SurvayScratch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preview-templates"
        element={
          <ProtectedRoute>
            <PreviewTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-template"
        element={
          <ProtectedRoute>
            <CreateTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-team"
        element={
          <ProtectedRoute>
            <ViewTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-team"
        element={
          <ProtectedRoute>
            <CreateTeam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preview-participants"
        element={
          <ProtectedRoute>
            <PreviewParticipants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-participants"
        element={
          <ProtectedRoute>
            <ProjectParticipants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/current-projects"
        element={
          <ProtectedRoute>
            <CurrentProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey-preview"
        element={
          <ProtectedRoute>
            <SurveyPreview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-from-template"
        element={
          <ProtectedRoute>
            <CreateFromTemplate />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <UserProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader text="Loading..." />
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                </div>
              }
            >
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </SidebarProvider>
      </UserProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
