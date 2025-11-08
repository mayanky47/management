export interface Project {
  name: string;
  type: string;
  path?: string;
  apiMetadata?: string;
  componentMetadata?: string;
}

export interface ProjectPackage {
  name: string;
  purpose?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projects?: Project[];
}
