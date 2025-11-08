import type { Project, ProjectFormData } from '../types/project';

// Use VITE_API_BASE for consistency, falling back to localhost
const VITE_API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080/api';

const ENDPOINTS = {
  projects: `${VITE_API_BASE}/projects`,
  open: `${VITE_API_BASE}/open/projects`,
  create: `${VITE_API_BASE}/create/projects`,
  analyze: `${VITE_API_BASE}/analyze/projects`, // <-- NEW ANALYSIS ENDPOINT
};

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(ENDPOINTS.projects);
  return handle(res);
}

// --- FIX: Changed 'id: number' to 'name: string' ---
export async function updateProject(name: string, data: ProjectFormData): Promise<Project> {
  // Use 'name' in the URL, not 'id'
  const res = await fetch(`${ENDPOINTS.projects}/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const res = await fetch(ENDPOINTS.create, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handle(res);
}

// --- FIX: Changed 'id: number' to 'name: string' ---
export async function deleteProject(name: string): Promise<string> {
  // Use 'name' in the URL, not 'id'
  const res = await fetch(`${ENDPOINTS.projects}/${encodeURIComponent(name)}`, { method: 'DELETE' });
  return handle(res);
}

export async function openProject(project: Project): Promise<string> {
  const res = await fetch(ENDPOINTS.open, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  return handle(res);
}

// --- NEW: Function to trigger backend analysis ---
export async function analyzeProject(name: string): Promise<Project> {
  const res = await fetch(`${ENDPOINTS.analyze}/${encodeURIComponent(name)}`, {
    method: 'POST',
  });
  return handle(res);
}
