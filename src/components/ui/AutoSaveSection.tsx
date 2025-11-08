import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { StatusIndicator, type StatusType } from "./StatusIndicator";
import { AppAPI } from "../../api/autoSavePackage";

interface AutoSaveSectionProps {
  springProject: string;
  reactProject: string;
}

const AutoSaveSection: React.FC<AutoSaveSectionProps> = ({ springProject, reactProject }) => {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<StatusType>("idle");
  const [statusMessage, setStatusMessage] = useState("Idle. Paste your code to auto-save.");
  const debouncedContent = useDebounce(content, 1000);
  const statusRef = useRef<StatusType>("idle");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const saveToBackend = useCallback(
    async (text: string) => {
      if (statusRef.current !== "idle") return;
      setStatus("saving");
      setStatusMessage("Saving...");

      try {
        const result = await AppAPI.saveContent(text, springProject, reactProject);
        setStatus("saved");
        setStatusMessage(`Saved! Path: ${result.path}`);
        timeoutRef.current = window.setTimeout(() => {
          setContent("");
          setStatus("idle");
          setStatusMessage("Idle. Paste your code to auto-save.");
        }, 1500);
      } catch (err: any) {
        setStatus("error");
        setStatusMessage(`Error: ${err.message}`);
        timeoutRef.current = window.setTimeout(() => {
          setStatus("idle");
          setStatusMessage("Idle. Error occurred. You can try again.");
        }, 2000);
      }
    },
    [springProject, reactProject]
  );

  useEffect(() => {
    if (debouncedContent) saveToBackend(debouncedContent);
  }, [debouncedContent, saveToBackend]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (statusRef.current !== "saving") {
      setStatus("idle");
      setStatusMessage("Typing...");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Step 2: Paste AI-Generated Code
        </h3>
        <span className="text-xs text-gray-400">Auto-saves after typing</span>
      </div>

      <div className="p-5">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Paste your AI-generated code here..."
          className="w-full h-80 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-2 h-5">
          <StatusIndicator status={status} message={statusMessage} />
        </div>
      </div>
    </div>
  );
};

export default AutoSaveSection;
