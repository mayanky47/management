import { useEffect, useCallback, useState } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  type Node,
  type Edge,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Maximize2, Minimize2, RefreshCcw } from 'lucide-react';
import { getTieredLayout } from '../../utils/graphLayout';
import type { ArchitectureGraph } from '../../types/graph';
import { cn } from '../../lib/utils';

const API_BASE_URL = "http://localhost:8080/api";

const getNodeStyle = (type: string, isDimmed: boolean) => {
  const baseColors: Record<string, any> = {
    CONTROLLER: { bg: '#2563eb', border: '#1d4ed8', label: 'Controller' }, 
    SERVICE:    { bg: '#7c3aed', border: '#6d28d9', label: 'Service' },    
    REPOSITORY: { bg: '#ea580c', border: '#c2410c', label: 'Repository' }, 
    ENTITY:     { bg: '#059669', border: '#047857', label: 'Entity' },     
    CONFIG:     { bg: '#475569', border: '#334155', label: 'Config' },     
    OTHER:      { bg: '#52525b', border: '#3f3f46', label: 'Other' },
  };

  const theme = baseColors[type] || baseColors.OTHER;
  
  return {
    background: isDimmed ? '#f8fafc' : '#ffffff',
    border: `1px solid ${isDimmed ? '#e2e8f0' : theme.border}`,
    borderRadius: '12px',
    padding: '12px',
    width: 220,
    color: isDimmed ? '#94a3b8' : '#1e293b',
    fontSize: '13px',
    fontWeight: '500',
    boxShadow: isDimmed ? 'none' : '0 4px 12px -2px rgb(0 0 0 / 0.08)',
    opacity: isDimmed ? 0.4 : 1,
    transition: 'all 0.4s ease',
    borderLeftWidth: '6px',
    borderLeftColor: isDimmed ? '#cbd5e1' : theme.bg,
  };
};

interface Props {
  projectName: string;
}

export default function ArchitectureGraphViewer({ projectName }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Fetch and Layout (Run once per project)
  const fetchGraph = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze/${projectName}/graph`);
      if (!response.ok) throw new Error("Failed");
      const data: ArchitectureGraph = await response.json();

      const initialNodes: Node[] = data.nodes.map((n) => ({
        id: n.id,
        data: { label: n.label, originalType: n.type },
        position: { x: 0, y: 0 },
        type: 'default',
      }));

      const initialEdges: Edge[] = data.edges.map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
      }));

      const { nodes: layoutNodes, edges: layoutEdges } = getTieredLayout(initialNodes, initialEdges);
      
      // Apply styles immediately
      setNodes(layoutNodes.map(n => ({ ...n, style: getNodeStyle(n.data.originalType, false) })));
      setEdges(layoutEdges);
      setSelectedNodeId(null); // Reset selection on new fetch

    } catch (error) {
      console.error(error);
    }
  }, [projectName, setNodes, setEdges]);

  useEffect(() => {
    if (projectName) fetchGraph();
  }, [projectName, fetchGraph]);


  // 2. Handle Highlighting (Run ONLY when selection changes)
  useEffect(() => {
    // If nothing selected, reset to default state
    if (!selectedNodeId) {
      setNodes((nds) => nds.map((n) => ({ 
        ...n, 
        style: getNodeStyle(n.data.originalType, false) 
      })));
      setEdges((eds) => eds.map((e) => ({ 
        ...e, 
        animated: true, 
        style: { stroke: '#cbd5e1', strokeWidth: 1.5, opacity: 1 },
        zIndex: 0
      })));
      return;
    }

    // Helper to find connections based on CURRENT edges state
    // We access 'edges' from the closure. This is safe because this effect
    // re-runs when 'edges' changes, BUT 'setEdges' inside it won't trigger
    // a loop if the values are stable, or we simply exclude 'edges' from deps.
    // Ideally, we calculate this before setting state.

    setNodes((nds) => nds.map((node) => {
      // Check if this node is connected to the selected node
      // We need to look at the edges. To avoid dependency loop, we can look at the
      // edges passed to the setter or use the outer 'edges' but be careful.
      
      // Optimization: Pass the connection check logic into the map
      // But we need the edge list.
      return node; // We update nodes in a separate effect or block to avoid complexity
    }));

    // Let's do it in one go using current state accessors
    setEdges((currentEdges) => {
       const connectedNodeIds = new Set<string>();
       connectedNodeIds.add(selectedNodeId);

       const updatedEdges = currentEdges.map(edge => {
          const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;
          if (isConnected) {
             connectedNodeIds.add(edge.source);
             connectedNodeIds.add(edge.target);
          }
          
          return {
            ...edge,
            animated: isConnected,
            zIndex: isConnected ? 10 : 0,
            style: {
              ...edge.style,
              stroke: isConnected ? '#2563eb' : '#e2e8f0',
              strokeWidth: isConnected ? 3 : 1.5,
              opacity: isConnected ? 1 : 0.3
            },
            markerEnd: {
               type: MarkerType.ArrowClosed,
               color: isConnected ? '#2563eb' : '#e2e8f0',
            }
          };
       });

       // Now update nodes based on the set we just built
       setNodes((currentNodes) => currentNodes.map(node => ({
          ...node,
          style: getNodeStyle(node.data.originalType, !connectedNodeIds.has(node.id))
       })));

       return updatedEdges;
    });

  }, [selectedNodeId, setNodes, setEdges]); // ❌ Removed 'edges' from dependency to fix loop


  return (
    <div 
      className={cn(
        "bg-gray-50/50 border border-gray-200 transition-all duration-300 ease-in-out",
        isFullscreen 
          ? "fixed inset-0 z-50 w-screen h-screen bg-white"
          : "relative w-full h-[550px] rounded-xl shadow-inner"
      )}
    >
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button 
          onClick={() => fetchGraph()}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
          title="Reset Layout"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Controls className="bg-white shadow-md border border-gray-200 rounded-lg" />
        <Background color="#cbd5e1" gap={40} size={1} />
        
        <Panel position="bottom-center" className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Controller</div>
                <span className="text-gray-300">→</span>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-600"></div> Service</div>
                <span className="text-gray-300">→</span>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-600"></div> Repo</div>
                <span className="text-gray-300">→</span>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-600"></div> Entity</div>
            </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}