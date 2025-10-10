// src/components/Header.tsx
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onSearch: (q: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  return (
    <header className="mb-6">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Project Hub
        </span>
      </motion.h1>
      <p className="text-gray-600 mb-4">Manage and track your dev projects</p>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, tags, purpose..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </header>
  );
}
