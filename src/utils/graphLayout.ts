import type { Node, Edge } from 'reactflow';

const NODE_WIDTH = 220; // Slightly wider for better readability
const NODE_HEIGHT = 70;
const LAYER_SPACING = 250; // Horizontal gap between layers (Controller -> Service)
const NODE_SPACING = 80;   // Vertical gap between nodes in the same layer

// Strict hierarchy: Left to Right
const TIER_RANK: Record<string, number> = {
  CONTROLLER: 0,
  SERVICE: 1,
  REPOSITORY: 2,
  ENTITY: 3,
  CONFIG: 4,
  OTHER: 5,
};

export const getTieredLayout = (nodes: Node[], edges: Edge[]) => {
  const tiers: Record<number, Node[]> = {};
  
  // 1. Group nodes by tier
  nodes.forEach((node) => {
    // @ts-ignore
    const type = node.data?.originalType || 'OTHER';
    const rank = TIER_RANK[type] ?? 5;
    if (!tiers[rank]) tiers[rank] = [];
    tiers[rank].push(node);
  });

  const layoutedNodes: Node[] = [];
  
  // Calculate max height to center vertically
  const maxNodesInColumn = Math.max(...Object.values(tiers).map(t => t.length));
  const maxHeight = maxNodesInColumn * (NODE_HEIGHT + NODE_SPACING);

  Object.keys(tiers).sort().forEach((tierKey) => {
    const rank = parseInt(tierKey);
    const tierNodes = tiers[rank];
    const columnHeight = tierNodes.length * (NODE_HEIGHT + NODE_SPACING);
    
    // Center the column vertically relative to the tallest column
    const startY = (maxHeight - columnHeight) / 2;

    tierNodes.forEach((node, index) => {
      layoutedNodes.push({
        ...node,
        position: {
          // Rank determines X (Left -> Right)
          x: rank * LAYER_SPACING, 
          // Index determines Y (Top -> Bottom)
          y: startY + index * (NODE_HEIGHT + NODE_SPACING),
        },
        // Set handles for horizontal flow
        sourcePosition: 'right' as any,
        targetPosition: 'left' as any,
      });
    });
  });

  return { nodes: layoutedNodes, edges };
};