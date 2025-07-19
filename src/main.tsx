import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Home from "./Home.tsx";
// import Company from "./pages/Company.tsx";
import Project from "./pages/Project.tsx";
// import Info from "./pages/info.tsx";
// import Users from "./pages/Users.tsx";
// import Review from "./pages/Review.tsx";
import CreateSurvay from "./pages/CreateSurvay.tsx";
// import CreateCompetencies from "./pages/CreateCompetencies.tsx";
import Templates from "./pages/Templates.tsx";
import CreateTemplate from "./pages/CreateTemplate.tsx";
import ViewTeam from "./pages/ViewTeam.tsx";
import SurvayScratch from "./pages/SurvayScratch.tsx";
import CreateTeam from "./pages/CreateTeam.tsx";
import FeedbackReport from "../report/FeedbackReport/FeedbackReport.tsx";
import Login from "./pages/login.tsx";
import CurrentProjects from "./pages/currentProjects.tsx";
import { UserProvider } from "./context/UserContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
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
              path="/feedback-report"
              element={
                <ProtectedRoute>
                  <FeedbackReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="current-projects"
              element={
                <ProtectedRoute>
                  <CurrentProjects />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
