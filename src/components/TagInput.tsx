// src/components/TagInput.tsx
import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ value, onChange, placeholder = 'Add tag' }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = input.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
        setInput('');
      }
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-400">
      <AnimatePresence>
        {value.map(tag => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium"
          >
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 p-0.5 rounded-full hover:bg-blue-200">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 min-w-[80px] border-none outline-none p-1 text-sm"
      />
    </div>
  );
}
