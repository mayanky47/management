import React from "react";
import { Link } from "react-router-dom";
import { ListChecks, LayoutDashboard, BookOpenText, ClipboardList } from "lucide-react"; // added BookOpenText icon for Diary

interface NavigationHeaderProps {
  activePath: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ activePath }) => {
  const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors";
  const active = "bg-blue-100 text-blue-700 font-semibold";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="text-2xl font-extrabold text-blue-600">Project Manager</div>

        <nav className="flex space-x-2">
          {/* --- Packages Link --- */}
          <Link
  to="/planner"
  className={`${baseClass} ${
    activePath === "/planner" ? active : "hover:bg-blue-50 text-gray-700"
  }`}
>
  <ClipboardList className="w-5 h-5" /> Planner
</Link>
          <Link
            to="/"
            className={`${baseClass} ${
              activePath === "/" ? active : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <ListChecks className="w-5 h-5" /> Packages
          </Link>

          {/* --- Dashboard Link --- */}
          <Link
            to="/dashboard"
            className={`${baseClass} ${
              activePath === "/dashboard" ? active : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>

          {/* --- Diary Link --- */}
          <Link
            to="/diary"
            className={`${baseClass} ${
              activePath === "/diary" ? active : "hover:bg-blue-50 text-gray-700"
            }`}
          >
            <BookOpenText className="w-5 h-5" /> Diary
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default NavigationHeader;
