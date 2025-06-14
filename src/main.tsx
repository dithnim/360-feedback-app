import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./Home.tsx";
import Company from "./pages/Company.tsx";
import Project from "./pages/Project.tsx";
import Info from "./pages/info.tsx";
import Users from "./pages/Users.tsx";
import Review from "./pages/Review.tsx";
import CreateSurvay from "./pages/CreateSurvay.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-company" element={<Company />} />
        <Route path="/project" element={<Project />} />
        <Route path="/info" element={<Info />} />
        <Route path="/users" element={<Users />} />
        <Route path="/review" element={<Review />} />
        <Route path="/create-survay" element={<CreateSurvay />} />
        {/* Add more routes here as needed */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
