export type ProjectType = 'React' | 'Spring' | 'HTML/CSS/JS' | 'Python' | 'Java' | 'Other';
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'High' | 'Medium' | 'Low';
// Full Project interface as returned from backend or stored in state
export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  path: string;
  purpose: string;
  pastActivities: string;
  futurePlans: string;
  status?: ProjectStatus;
  tags?: string[];
  progress?: number; // 0-100
  priority?: ProjectPriority;
  dueDate?: string; // ISO string
}
// Form data used for creating or updating projects
export type ProjectFormData = {
  name: string;
  type: ProjectType;
  path?: string;
  purpose?: string;
  pastActivities?: string;
  futurePlans?: string;
  status?: ProjectStatus;
  tags?: string[];
  progress?: number;
  owner?: string;
};

// UI-specific type for showing messages / notifications
export interface ShowProjectMessage {
  visible: boolean;
  message: string;
}
