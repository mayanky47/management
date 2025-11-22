import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { toast } from "sonner";
import {
  RefreshCw,
  Database,
  FolderOpen,
  Trash2,
  LayoutGrid,
  BookOpen,
  Settings,
  Copy,
  Check,
  Package,
  Search,
  Network,
  ExternalLink,
  Workflow, // Icon for Flows
  Plus,
  Edit
} from "lucide-react";
import { cn } from "../../lib/utils";
import FlowBuilder from "./FlowBuilder"; // Ensure this import is correct

// --- API BASE URL ---
const API_BASE_URL = "http://localhost:8080/api";

// --- Types ---
type InsightTab = "architecture" | "flows" | "dependencies" | "api" | "config";

interface ProjectInsightsProps {
  analysisData: any;
  isAnalyzing: boolean;
  isAddingSQLite: boolean;
  architectureGraph?: React.ReactNode;
  onAnalyze: () => void;
  onAddSQLite: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

// --- Helper Components ---
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <button onClick={handleCopy} className="text-gray-400 hover:text-gray-700 transition-colors">
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
};

// --- Main Component ---
const ProjectInsights: React.FC<ProjectInsightsProps> = ({
  analysisData,
  isAnalyzing,
  isAddingSQLite,
  architectureGraph,
  onAnalyze,
  onAddSQLite,
  onOpen,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<InsightTab>("architecture");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Flow State ---
  const [flows, setFlows] = useState<any[]>([]);
  const [isFlowReadOnly, setIsFlowReadOnly] = useState(true);
  const [isEditingFlow, setIsEditingFlow] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [isLoadingFlows, setIsLoadingFlows] = useState(false);

  const projectName = analysisData?.projectName;

  // --- 1. Fetch Flows API ---
  const fetchFlows = useCallback(async () => {
    if (!projectName) return;
    setIsLoadingFlows(true);
    try {
      const res = await fetch(`${API_BASE_URL}/flows/${projectName}`);
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
      }
    } catch (e) {
      console.error("Failed to fetch flows", e);
    } finally {
      setIsLoadingFlows(false);
    }
  }, [projectName]);

  // Fetch when tab is active
  useEffect(() => {
    if (activeTab === 'flows') {
        fetchFlows();
    }
  }, [activeTab, fetchFlows]);

  // --- 2. Save Flow API ---
  const handleSaveFlow = async (flowData: any) => {
    try {
        const method = selectedFlow?.id ? 'PUT' : 'POST';
        const url = selectedFlow?.id 
            ? `${API_BASE_URL}/flows/${selectedFlow.id}` 
            : `${API_BASE_URL}/flows`;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flowData)
        });

        if (!res.ok) throw new Error("Failed to save");

        toast.success(`Flow "${flowData.name}" saved successfully!`);
        setIsEditingFlow(false);
        fetchFlows(); // Refresh list
    } catch (e) {
        console.error(e);
        toast.error("Failed to save flow to server.");
    }
  };

  // --- 3. Delete Flow API ---
  const handleDeleteFlow = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      if(!window.confirm("Delete this flow?")) return;

      try {
          await fetch(`${API_BASE_URL}/flows/${id}`, { method: 'DELETE' });
          toast.success("Flow deleted");
          fetchFlows();
      } catch(e) {
          toast.error("Failed to delete flow");
      }
  };

  // --- Render Helpers ---
  const filteredDependencies = analysisData?.dependencies?.filter((d: any) => 
    d.artifactId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.groupId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TabTrigger = ({ id, label, icon: Icon, disabled }: any) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
        activeTab === id 
          ? "text-gray-900 bg-white shadow-sm ring-1 ring-gray-200" 
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  // Mini Action Button
  const ActionButton = ({ onClick, disabled, icon: Icon, label, variant = "default" }: any) => {
    const variants: any = {
      default: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900",
      primary: "bg-gray-900 text-white border-transparent hover:bg-gray-800",
      danger: "text-red-600 hover:bg-red-50 border-transparent",
    };
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-md transition-all shadow-sm active:scale-95",
          variants[variant],
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={label}
      >
        <Icon className={cn("w-3.5 h-3.5", (disabled && variant !== 'primary') && "animate-spin")} />
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Navigation Tabs */}
      <div className="bg-gray-100/50 p-1 rounded-xl flex flex-wrap gap-1 border border-gray-200/60">
        <TabTrigger id="architecture" label="Architecture" icon={Network} />
        <TabTrigger id="flows" label="Custom Flows" icon={Workflow} disabled={!analysisData} />
        <TabTrigger id="dependencies" label="Dependencies" icon={Package} disabled={!analysisData} />
        <TabTrigger id="api" label="Swagger API" icon={BookOpen} disabled={!analysisData?.projectUrl} />
        <TabTrigger id="config" label="Config" icon={Settings} disabled={!analysisData?.configuration} />
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          {/* --- ARCHITECTURE TAB --- */}
          {activeTab === "architecture" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <ActionButton onClick={onOpen} icon={FolderOpen} label="Open IDE" variant="primary" />
                  <div className="w-px h-5 bg-gray-200 mx-1" />
                  <ActionButton onClick={onAnalyze} disabled={isAnalyzing} icon={RefreshCw} label={isAnalyzing ? "Analyzing..." : "Analyze"} />
                </div>
                <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Project">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1 min-h-[500px] relative overflow-hidden">
                 {architectureGraph ? architectureGraph : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                     <LayoutGrid className="w-12 h-12 mb-3 opacity-20" />
                     <p className="text-sm font-medium">Graph not available</p>
                     <p className="text-xs text-gray-500 mt-1">Run "Analyze" to generate architecture map.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* --- CUSTOM FLOWS TAB --- */}
          {activeTab === "flows" && (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {isEditingFlow ? (
            // Render Builder
            <FlowBuilder 
                projectName={analysisData?.projectName || "demo"}
                initialFlow={selectedFlow}
                readOnly={isFlowReadOnly} // <--- PASS STATE
                onSave={handleSaveFlow}
                onCancel={() => setIsEditingFlow(false)}
                onEditRequest={() => setIsFlowReadOnly(false)} // <--- SWITCH TO EDIT
            />
        ) : (
            // Render List
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    {/* ... Header ... */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-purple-600" />
                            Custom Architectures
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Design and document logic flows using actual project components.</p>
                    </div>
                    <button 
                        onClick={() => { 
                            setSelectedFlow(null); 
                            setIsFlowReadOnly(false); // <--- Create = Edit Mode
                            setIsEditingFlow(true); 
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Create Flow
                    </button>
                </div>

                {isLoadingFlows ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Loading flows...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                        {flows.length === 0 ? (
                            // ... Empty State ...
                             <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                <Workflow className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No flows created yet.</p>
                                <p className="text-sm text-gray-400">Click "Create Flow" to start designing.</p>
                            </div>
                        ) : (
                            flows.map(flow => (
                                <div 
                                    key={flow.id} 
                                    onClick={() => { 
                                        const parsed = flow.flowData ? JSON.parse(flow.flowData) : null;
                                        setSelectedFlow({ ...flow, ...parsed }); 
                                        setIsFlowReadOnly(true); // <--- Open = View Mode
                                        setIsEditingFlow(true); 
                                    }}
                                    className="group p-5 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer bg-white relative"
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">{flow.name}</h4>
                                        <button 
                                            onClick={(e) => handleDeleteFlow(e, flow.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5em]">
                                        {flow.description || "No description provided."}
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-purple-600 bg-purple-50 w-fit px-2 py-1 rounded border border-purple-100">
                                        {/* Changed Icon to Eye/View */}
                                        <div className="flex items-center gap-1">
                                            <ExternalLink className="w-3 h-3" /> View Flow
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        )}
    </div>
  )}

          {/* --- DEPENDENCIES TAB --- */}
          {activeTab === "dependencies" && analysisData && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-5">
                <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shadow-sm"><Package className="w-6 h-6" /></div>
                    <div>
                       <h3 className="font-bold text-gray-900 text-lg leading-tight">External Libraries</h3>
                       <p className="text-xs text-gray-500 mt-0.5">Managed via Maven (pom.xml)</p>
                    </div>
                  </div>
                  <button onClick={onAddSQLite} disabled={isAddingSQLite} className={cn("flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md text-sm font-medium", isAddingSQLite && "opacity-75 cursor-not-allowed")}>
                    <Database className={cn("w-4 h-4", isAddingSQLite && "animate-bounce")} />
                    {isAddingSQLite ? "Installing Driver..." : "Add SQLite Support"}
                  </button>
                </div>
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <input type="text" placeholder="Search dependencies..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-50 focus:border-purple-200 outline-none transition-all bg-white" onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50/30">
                 {filteredDependencies?.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400"><Package className="w-12 h-12 mb-3 opacity-20" /><p className="text-sm">No dependencies found.</p></div>}
                 {filteredDependencies?.map((dep: any, i: number) => (
                   <div key={i} className="group p-3 bg-white border border-gray-100 hover:border-purple-200 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center font-mono text-xs group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">{dep.artifactId.substring(0, 2).toUpperCase()}</div>
                        <div>
                           <div className="font-bold text-gray-800 text-sm flex items-center gap-2">{dep.artifactId}
                              <a href={`https://central.sonatype.com/artifact/${dep.groupId}/${dep.artifactId}`} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-600 transition-opacity"><ExternalLink className="w-3 h-3" /></a>
                           </div>
                           <div className="text-xs text-gray-500 font-mono mt-0.5">{dep.groupId}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                       {dep.version ? <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-mono font-medium">{dep.version}</span> : <span className="px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-md text-[10px] uppercase tracking-wide font-medium">Managed</span>}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* --- SWAGGER TAB --- */}
          {activeTab === "api" && analysisData?.projectUrl && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
                <span className="text-xs font-mono text-gray-500 ml-2">{analysisData.projectUrl}/v3/api-docs</span>
                <a href={`${analysisData.projectUrl}/swagger-ui.html`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mr-2">Open in New Tab</a>
              </div>
              <div className="p-2 [&_.swagger-ui]:!font-sans"><SwaggerUI url={`${analysisData.projectUrl}/v3/api-docs`} /></div>
            </div>
          )}

          {/* --- CONFIG TAB --- */}
          {activeTab === "config" && analysisData?.configuration && (
            <div className="bg-[#1e1e1e] rounded-xl shadow-lg overflow-hidden text-gray-300 font-mono text-sm border border-gray-700">
              <div className="bg-[#252526] px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><div className="w-2.5 h-2.5 rounded-full bg-green-500" /></div>
                <span className="ml-2 text-xs text-gray-400">application.properties</span>
              </div>
              <div className="p-4 space-y-1 overflow-x-auto max-h-[500px]">
                {Object.entries(analysisData.configuration).map(([key, val]: [string, any], i) => (
                  <div key={i} className="flex group hover:bg-white/5 p-0.5 -mx-2 px-2 rounded">
                    <span className="text-blue-400 mr-2">{key}</span><span className="text-gray-500 mr-2">=</span><span className="text-orange-300 break-all flex-1">{val}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={`${key}=${val}`} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProjectInsights;