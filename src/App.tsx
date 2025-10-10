import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BoardPage from './pages/BoardPage';
import ProjectPage from './pages/ProjectPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/project/:name" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}
