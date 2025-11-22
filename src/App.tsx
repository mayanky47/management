import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import ProjectPage from "./pages/ProjectPage";
import DashboardPage from "./pages/DashboardPage";
import PackagePage from "./pages/PackagePage";
import PackageDetailsPage from "./pages/PackageDetailsPage";
import DiaryPage from "./pages/DiaryPage"; // 🆕 Import your Diary Page
import ProjectPlannerPage from "./pages/ProjectPlannerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<PackagePage />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/board" element={<BoardPage />} />
  <Route path="/project/:name" element={<ProjectPage />} />
  <Route path="/package/:name" element={<PackageDetailsPage />} />
  <Route path="/diary" element={<DiaryPage />} />
  <Route path="/planner" element={<ProjectPlannerPage />} /> {/* 🆕 */}
</Routes>
    </BrowserRouter>
  );
}
