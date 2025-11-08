// src/components/ui/CollapsiblePrompt.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clipboard,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CollapsiblePromptProps {
  prompt: string;
  isLoading: boolean;
  onGenerateContext: () => void;
  onCopy: () => void;
  disabled: boolean;
}

const CollapsiblePrompt: React.FC<CollapsiblePromptProps> = ({
  prompt,
  isLoading,
  onGenerateContext,
  onCopy,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopyExample = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedPath(text);
        toast.success(`Copied: ${text}`);
        setTimeout(() => setCopiedPath(null), 1500);
      })
      .catch(() => toast.error("Failed to copy."));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 text-left rounded-t-xl"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            Step 1: Get Your AI Prompt
          </h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50 p-5 space-y-5"
          >
            {/* --- Ready-to-Copy Format (moved to top) --- */}
            <div className="border border-gray-200 bg-white rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                💡 Ready-to-Copy Location Format
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                Click a format below to copy. Paste it as the first line of your code so the system
                knows where to save the file.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCopyExample("// src/components/ui/Button.tsx")}
                  className={`cursor-pointer select-none bg-gray-50 rounded-md p-3 border flex flex-col gap-2 hover:bg-indigo-50 transition ${
                    copiedPath === "// src/components/ui/Button.tsx"
                      ? "border-indigo-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-indigo-700 font-semibold">
                    <span>React (Frontend)</span>
                    {copiedPath === "// src/components/ui/Button.tsx" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clipboard className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <pre className="bg-white rounded p-2 text-gray-700 overflow-x-auto">
                    // src/components/ui/Button.tsx
                  </pre>
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    handleCopyExample("// src/main/java/com/example/demo/service/UserService.java")
                  }
                  className={`cursor-pointer select-none bg-gray-50 rounded-md p-3 border flex flex-col gap-2 hover:bg-emerald-50 transition ${
                    copiedPath ===
                    "// src/main/java/com/example/demo/service/UserService.java"
                      ? "border-emerald-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Spring Boot (Backend)</span>
                    {copiedPath ===
                    "// src/main/java/com/example/demo/service/UserService.java" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clipboard className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <pre className="bg-white rounded p-2 text-gray-700 overflow-x-auto">
                    // src/main/java/com/example/demo/service/UserService.java
                  </pre>
                </motion.div>
              </div>

              <p className="text-xs text-gray-500 mt-3 italic">
                The backend automatically detects whether it belongs to frontend or backend.
              </p>
            </div>

            {/* --- Prompt Textarea --- */}
            <div className="relative">
              <textarea
                readOnly
                value={isLoading ? "Generating full project context..." : prompt}
                className="w-full h-56 p-4 font-mono text-sm bg-white border border-gray-300 rounded-lg resize-none text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              )}
            </div>

            {/* --- Buttons --- */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onCopy}
                disabled={isLoading || disabled}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200 ${
                  isLoading || disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                <Clipboard className="w-4 h-4" />
                Copy Basic Prompt
              </button>

              <button
                onClick={onGenerateContext}
                disabled={isLoading || disabled}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200 ${
                  isLoading || disabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  "Generate Full Context"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsiblePrompt;
