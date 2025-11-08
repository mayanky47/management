export type ProjectType = 'React' | 'Spring' | 'HTML/CSS/JS' | 'Python' | 'Java' | 'Other' | 'Portfolio';
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'High' | 'Medium' | 'Low';

export interface SubProject {
    name: string;
    type: Exclude<ProjectType, 'Portfolio'>;
    status?: ProjectStatus;
    progress?: number;
}

// Full Project interface as returned from backend or stored in state
export interface Project {
    // id: number; // <-- This was incorrect. The backend uses 'name' as the @Id
    name: string; // The 'name' is the primary key
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
    
    subProjects?: SubProject[];
    dependencies?: string[];
    
    // --- NEW FIELDS from model update ---
    apiMetadata?: string; // JSON string for REST endpoints
    componentMetadata?: string; // JSON string for React components
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
    
    dependencies?: string[];
    subProjects?: SubProject[];
};

// UI-specific type for showing messages / notifications
export interface ShowProjectMessage {
    visible: boolean;
    message: string;
}
