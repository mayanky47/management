import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Search, Box, Database, Server, Layers, StickyNote, X, Edit3, Lock } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = "http://localhost:8080/api";

const nodeTypes = {};

const getNodeStyle = (type: string) => {
  const base = { 
    padding: '10px', 
    borderRadius: '8px', 
    borderWidth: '1px',
    width: 180, 
    textAlign: 'center' as const, 
    fontSize: '12px',
    fontWeight: 'bold' as const 
  };

  switch (type) {
    case 'CONTROLLER': return { ...base, background: '#eff6ff', borderColor: '#2563eb', color: '#1e40af' };
    case 'SERVICE':    return { ...base, background: '#f5f3ff', borderColor: '#7c3aed', color: '#5b21b6' };
    case 'REPOSITORY': return { ...base, background: '#fff7ed', borderColor: '#ea580c', color: '#9a3412' };
    case 'ENTITY':     return { ...base, background: '#ecfdf5', borderColor: '#059669', color: '#065f46' };
    case 'NOTE':       return { ...base, background: '#fef3c7', borderColor: '#d97706', color: '#92400e', width: 200, height: 100, textAlign: 'left' as const, fontWeight: 'normal' as const };
    default:           return { ...base, background: 'white', borderColor: '#777', color: '#333' };
  }
};

const SidebarItem = ({ type, label, icon: Icon }: { type: string, label: string, icon: any }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeLabel: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', nodeLabel);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="p-2.5 rounded-md border border-gray-200 cursor-grab bg-white hover:border-blue-400 hover:shadow-sm transition-all text-xs font-medium flex items-center gap-2 active:cursor-grabbing"
      onDragStart={(event) => onDragStart(event, type, label)}
      draggable
    >
      <Icon className="w-3.5 h-3.5 opacity-70" />
      <span className="truncate" title={label}>{label}</span>
    </div>
  );
};

interface FlowBuilderProps {
  initialFlow?: any;
  projectName: string;
  readOnly?: boolean; // <--- NEW PROP
  onSave: (flowData: any) => void;
  onCancel: () => void;
  onEditRequest?: () => void; // <--- NEW PROP
}

const FlowBuilderContent = ({ initialFlow, projectName, readOnly = false, onSave, onCancel, onEditRequest }: FlowBuilderProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialFlow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const [flowName, setFlowName] = useState(initialFlow?.name || "New Flow");
  const [description, setDescription] = useState(initialFlow?.description || "");
  const [components, setComponents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/analyze/${projectName}/graph`);
        if(res.ok) {
           const data = await res.json();
           setComponents(data.nodes || []);
        }
      } catch (e) {
        console.error("Failed to load project components", e);
      }
    };
    fetchComponents();
  }, [projectName]);

  const filteredComponents = useMemo(() => components.filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase())
  ), [components, searchTerm]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (readOnly) return; // Disable Drop in ReadOnly
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (!type || !reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { label: label },
        style: getNodeStyle(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, readOnly]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
        if (readOnly) return; // Disable Connect in ReadOnly
        setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed } }, eds));
    }, 
    [setEdges, readOnly]
  );

  const handleSave = () => {
    if (!nodes.length) return toast.error("Canvas is empty");
    onSave({
        name: flowName,
        description,
        projectName,
        flowData: JSON.stringify(reactFlowInstance.toObject())
    });
  };

  const renderGroup = (type: string, title: string, icon: any) => {
    const items = filteredComponents.filter(c => c.type === type);
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase mb-2 px-1">
          {icon} {title}
        </div>
        <div className="space-y-1.5">
          {items.map((c: any) => (
            <SidebarItem key={c.id} type={c.type} label={c.label} icon={Layers} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white w-full border border-gray-200 rounded-xl overflow-hidden">
        
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start gap-6 bg-white shrink-0">
            <div className="flex-1 space-y-1">
                {readOnly ? (
                    // READ ONLY HEADER
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {flowName} <Lock className="w-4 h-4 text-gray-400" />
                        </h2>
                        <p className="text-sm text-gray-500">{description || "No description."}</p>
                    </div>
                ) : (
                    // EDITABLE HEADER
                    <>
                        <input 
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="text-lg font-bold text-gray-800 border-none focus:ring-0 p-0 w-full placeholder-gray-300 bg-transparent outline-none"
                            placeholder="Flow Name"
                        />
                        <input 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="text-sm text-gray-500 border-none focus:ring-0 p-0 w-full placeholder-gray-300 bg-transparent outline-none"
                            placeholder="Describe this logic flow..."
                        />
                    </>
                )}
            </div>
            <div className="flex gap-2">
                <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium flex items-center gap-2">
                    <X className="w-4 h-4" /> Close
                </button>
                
                {readOnly ? (
                    <button onClick={onEditRequest} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium shadow-sm">
                        <Edit3 className="w-4 h-4" /> Edit Flow
                    </button>
                ) : (
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg text-sm font-medium shadow-sm">
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                )}
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            {/* Sidebar - HIDDEN in ReadOnly Mode */}
            {!readOnly && (
                <div className="w-64 bg-gray-50/50 border-r border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search components..." 
                                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">Tools</p>
                            <SidebarItem type="NOTE" label="📝 Sticky Note" icon={StickyNote} />
                        </div>
                        {renderGroup('CONTROLLER', 'Controllers', <Server className="w-3 h-3" />)}
                        {renderGroup('SERVICE', 'Services', <Box className="w-3 h-3" />)}
                        {renderGroup('REPOSITORY', 'Repositories', <Database className="w-3 h-3" />)}
                        {renderGroup('ENTITY', 'Entities', <Database className="w-3 h-3" />)}
                    </div>
                </div>
            )}

            {/* Canvas Wrapper */}
            <div 
                className="flex-1 h-full w-full relative bg-gray-100" 
                ref={reactFlowWrapper}
                onDrop={onDrop}
                onDragOver={onDragOver}
                style={{ height: '100%', width: '100%' }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={!readOnly ? onNodesChange : undefined} // Disable move
                    onEdgesChange={!readOnly ? onEdgesChange : undefined} // Disable delete
                    onConnect={!readOnly ? onConnect : undefined} // Disable connect
                    onInit={setReactFlowInstance}
                    nodeTypes={nodeTypes}
                    fitView
                    nodesDraggable={!readOnly}
                    nodesConnectable={!readOnly}
                    elementsSelectable={!readOnly}
                    attributionPosition="bottom-right"
                >
                    <Controls className="bg-white shadow-md border border-gray-200 rounded-lg" />
                    <Background color="#cbd5e1" gap={20} size={1} />
                    {!readOnly && (
                        <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg text-xs text-gray-400 border border-gray-200 shadow-sm">
                            Drag items from sidebar • Backspace to delete
                        </Panel>
                    )}
                </ReactFlow>
            </div>
        </div>
    </div>
  );
};

export default function FlowBuilder(props: FlowBuilderProps) {
    return (
        <ReactFlowProvider>
            <FlowBuilderContent {...props} />
        </ReactFlowProvider>
    );
}