import React from "react";
import { motion } from "framer-motion";
import StatusBadge from "./StatusBadge";

interface Project {
  name: string;
  type: string;
}

interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projects?: Project[];
}

interface PackageCardProps {
  pkg: ProjectPackage;
  onOpen: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onOpen }) => (
  <motion.div
    layout
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onOpen}
    className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition cursor-pointer flex flex-col justify-between"
  >
    <div>
      <h3 className="text-lg font-semibold text-gray-800 truncate">{pkg.name}</h3>
      <div className="mt-1"><StatusBadge status={pkg.status} /></div>
      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{pkg.purpose || 'No purpose defined.'}</p>
    </div>
    <div className="mt-4 text-sm flex justify-between text-gray-500">
      <span>{pkg.projects?.length || 0} Projects</span>
      {pkg.dueDate && <span>📅 {pkg.dueDate}</span>}
    </div>
  </motion.div>
);

export default PackageCard;
