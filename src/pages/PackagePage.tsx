import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Plus, Search } from "lucide-react";
import NavigationHeader from "../components/layout/NavigationHeader";
import PackageCard from "../components/packages/PackageCard";
import CreatePackageModal from "../components/packages/CreatePackageModal";
import { API_BASE } from "../constants/packageConstants";

interface Project {
  name: string;
  type: string;
}

interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string;
  priority?: string;
  projects?: Project[];
}

const PackagePage: React.FC = () => {
  const [packages, setPackages] = useState<ProjectPackage[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE}/packages`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPackages(data);
    } catch {
      toast.error("Failed to load packages.");
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const filteredPackages = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return packages.filter(pkg =>
      pkg.name.toLowerCase().includes(query) ||
      pkg.purpose?.toLowerCase().includes(query) ||
      pkg.projects?.some(p => p.name.toLowerCase().includes(query))
    );
  }, [packages, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader activePath={location.pathname} />
      <Toaster position="top-right" richColors />

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Project Packages 📦</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5 mr-1" /> Create Package
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search packages..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Packages Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredPackages.map(pkg => (
              <PackageCard key={pkg.name} pkg={pkg} onOpen={() => navigate(`/package/${pkg.name}`)} />
            ))}
          </AnimatePresence>
          {filteredPackages.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-10">
              No packages found. Try adjusting your search or create a new one!
            </div>
          )}
        </motion.div>
      </div>

      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newPkg) => setPackages((prev) => [...prev, newPkg])}
      />
    </div>
  );
};

export default PackagePage;
