import { API_BASE } from "../constants/packageConstants";

/**
 * Centralized API calls related to Projects
 */
export const ProjectAPI = {
  /** 🔹 Fetch project analysis data */
  async fetchAnalysis(projectName: string) {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectName)}/analysis`);
    if (!res.ok) throw new Error("Failed to fetch project analysis data");
    return await res.json();
  },

  /** 🔹 Run backend analysis for a Spring project */
  async analyzeProject(projectName: string) {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectName)}/analyze/spring`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  /** 🔹 Add SQLite dependency */
  async addSQLite(projectName: string) {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectName)}/dependencies/add-sqlite`, {
      method: "POST",
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.text();
  },

  /** 🔹 Delete a project */
  async deleteProject(projectName: string) {
    const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectName)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete project");
    return await res.text();
  },
};
