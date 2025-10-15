export type ProjectType = 'React' | 'Spring' | 'HTML/CSS/JS' | 'Python' | 'Java' | 'Other' | 'Portfolio'; // <-- Added 'Portfolio'
export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';
export type ProjectPriority = 'High' | 'Medium' | 'Low';

// --- NEW TYPE: Represents a simplified project when nested inside a Portfolio ---
export interface SubProject {
    // Note: No 'id' as it might be created with the parent, use name for keying
    name: string;
    type: Exclude<ProjectType, 'Portfolio'>; // Sub-projects cannot be Portfolios themselves
    status?: ProjectStatus;
    progress?: number; // 0-100
    // Additional minimal fields can be added here if needed
}

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
    
    // --- NEW FIELD: Sub-Projects (Only relevant for type 'Portfolio') ---
    subProjects?: SubProject[]; 

    // --- NEW FIELD: Dependencies ---
    // Array of names (or IDs) of other existing projects this project depends on
    dependencies?: string[]; 
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
    
    // --- NEW FIELD for Form Data ---
    // The form will collect a list of dependencies
    dependencies?: string[]; 
    
    // --- NEW FIELD for Portfolio creation ---
    // The form might collect data for sub-projects if type is 'Portfolio'
    subProjects?: SubProject[]; 
};

// UI-specific type for showing messages / notifications (no change needed here)
export interface ShowProjectMessage {
    visible: boolean;
    message: string;
}