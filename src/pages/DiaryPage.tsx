import React, { useState, useEffect, useRef } from "react";
import { Cloud, Edit3, CheckCircle, ArrowLeft } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface DiaryEntry {
  id?: number;
  title: string;
  content: string;
  entryDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- CONSTANTS ---
const API_URL = "http://localhost:8080/api/entries";
const AUTOSAVE_DELAY = 1500; // ms

// --- API HELPER ---
const makeApiCall = async <T,>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  data: any = null,
  retries: number = 3
): Promise<T | null> => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const config: RequestInit = { method, headers, body: data ? JSON.stringify(data) : undefined };

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, config);
      if (response.ok) {
        if (method === "DELETE" || response.status === 204) return {} as T;
        return (await response.json()) as T;
      }
      throw new Error(`API error: ${response.statusText}`);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) {
        console.error("Max retries reached. API call failed.");
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
};

// --- Helper to create a new entry ---
const createNewEntry = (): DiaryEntry => ({
  title: "",
  content: "",
  createdAt: new Date().toISOString(),
});

// --- UI Component for Save Status ---
const SaveStatus: React.FC<{ status: "idle" | "typing" | "saving" | "saved" | "error" }> = ({
  status,
}) => {
  const statusMap = {
    typing: { Icon: Edit3, text: "Typing...", color: "text-gray-500" },
    saving: { Icon: Cloud, text: "Saving...", color: "text-blue-500 animate-pulse" },
    saved: { Icon: CheckCircle, text: "Saved", color: "text-green-500" },
    error: { Icon: CheckCircle, text: "Error Saving", color: "text-red-500" },
    idle: { Icon: () => null, text: "", color: "" },
  };
  const { Icon, text, color } = statusMap[status] || statusMap.idle;

  if (status === "idle" || (status !== "typing" && status !== "saving" && status !== "error" && status !== "saved"))
    return null;

  return (
    <div
      className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-300 ${color}`}
    >
      <Icon className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
};

// --- MAIN PAGE ---
const DiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "typing" | "saving" | "saved" | "error">(
    "idle"
  );

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // --- Initial fetch ---
  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      const fetchedEntries = await makeApiCall<DiaryEntry[]>(API_URL, "GET");
      if (fetchedEntries) {
        const sorted = fetchedEntries.sort(
          (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        setEntries(sorted);

        const todayTitle = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const todaysEntry = sorted.find((entry) => entry.title === todayTitle);
        if (todaysEntry) {
          setCurrentEntry(todaysEntry);
        } else {
          setCurrentEntry(createNewEntry());
        }
      } else {
        setError("Failed to load journal entries.");
        setCurrentEntry(createNewEntry());
      }
      setIsLoading(false);
    };
    initialLoad();
  }, []);

  // --- Autosave effect ---
  useEffect(() => {
    if (!currentEntry || isLoading) return;
    if (saveStatus !== "typing") return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!currentEntry.content) {
        setSaveStatus("idle");
        return;
      }

      setSaveStatus("saving");

      const entryToSave = { ...currentEntry };
      if (!entryToSave.id) {
        entryToSave.title = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      const method = entryToSave.id ? "PUT" : "POST";
      const url = entryToSave.id ? `${API_URL}/${entryToSave.id}` : API_URL;

      const savedEntry = await makeApiCall<DiaryEntry>(url, method, entryToSave);

      if (savedEntry) {
        setSaveStatus("saved");
        const wasCreation = !currentEntry.id && savedEntry.id;

        const updatedEntries = await makeApiCall<DiaryEntry[]>(API_URL, "GET");
        if (updatedEntries) {
          const sorted = updatedEntries.sort(
            (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
          );
          setEntries(sorted);
        }

        if (wasCreation) {
          setCurrentEntry(savedEntry);
        }
      } else {
        setSaveStatus("error");
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentEntry, saveStatus, isLoading]);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!currentEntry) return;
    setSaveStatus("typing");
    setCurrentEntry({ ...currentEntry, [e.target.name]: e.target.value });
  };

  const handleSelectEntry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entryId = Number(e.target.value);
    const selected = entries.find((entry) => entry.id === entryId);
    if (selected) {
      setCurrentEntry(selected);
      setSaveStatus("idle");
    }
  };

  // --- Render ---
  if (isLoading && !currentEntry) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center text-gray-500">
        Loading Journal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-slate-800 flex flex-col">
      <header className="flex items-center justify-between p-4 sticky top-0 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200 z-10">
        <div className="flex items-center space-x-4">
          <select
            value={currentEntry?.id || ""}
            onChange={handleSelectEntry}
            className="font-sans bg-white border border-stone-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.title || "Untitled Entry"}
              </option>
            ))}
          </select>
        </div>

  <div className="flex items-center gap-3">
  {/* 🔹 Modern Back Button */}
  <a
    href="/"
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 
               hover:bg-blue-100 hover:text-blue-700 font-medium text-sm transition-all 
               border border-blue-100 shadow-sm"
  >
    <ArrowLeft className="w-4 h-4" />
    <span>Back to Packages</span>
  </a>

  {/* 🔹 Save Status */}
  <div className="ml-2">
    <SaveStatus status={saveStatus} />
  </div>
</div>
      </header>

      {currentEntry ? (
        <main className="flex-1 w-full max-w-4xl mx-auto px-8 pt-12 pb-96">
          <textarea
            name="content"
            value={currentEntry.content}
            onChange={handleInputChange}
            placeholder="Start writing..."
            className="text-lg leading-relaxed w-full bg-transparent focus:outline-none resize-none h-full placeholder:text-stone-400"
            style={{ fieldSizing: "content", minHeight: "80vh" }}
          />
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-500">
          <p>Select a page or create a new one to begin.</p>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;
