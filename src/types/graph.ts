
export interface GraphNode {
  id: string;
  label: string;
  type: 'CONTROLLER' | 'SERVICE' | 'REPOSITORY' | 'ENTITY' | 'OTHER' | 'CONFIG';
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CustomFlow {
    id?: number;
    name: string;
    description: string;
    projectName: string;
    flowData: string; // JSON string of { nodes, edges }
}