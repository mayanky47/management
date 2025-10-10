import type { Project, ProjectFormData } from '../types/project';

const VITE_API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080/api';

const ENDPOINTS = {
  projects: `${VITE_API_BASE}/projects`,
  open: `${VITE_API_BASE}/open/projects`,
  create: `${VITE_API_BASE}/create/projects`,
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

export async function updateProject(id: number, data: ProjectFormData): Promise<Project> {
  const res = await fetch(`${ENDPOINTS.projects}/${id}`, {
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

export async function deleteProject(id: number): Promise<string> {
  const res = await fetch(`${ENDPOINTS.projects}/${id}`, { method: 'DELETE' });
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
