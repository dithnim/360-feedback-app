import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<Project />} />
        <Route path="/create" element={<CreateSurvay />} />
        <Route path="/create-from-scratch" element={<SurvayScratch />} />
        <Route path="/view-templates" element={<Templates />} />
        <Route path="/create-template" element={<CreateTemplate />} />
        <Route path="/view-team" element={<ViewTeam />} />
        <Route path="/create-team" element={<CreateTeam />} />
        {/* Add more routes here as needed */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
