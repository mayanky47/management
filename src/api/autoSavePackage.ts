import { API_BASE } from "../constants/packageConstants";

export const AppAPI = {
  /** 🔹 Fetch project list for a given type ("spring" or "react") */
  async fetchProjects(type: "spring" | "react"): Promise<string[]> {
    const res = await fetch(`${API_BASE}/projects/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch ${type} projects.`);
    return await res.json();
  },

  /** 🔹 Fetch Spring Boot main class */
  async fetchMainClass(projectName: string): Promise<string> {
    const res = await fetch(`${API_BASE}/main-class?project=${encodeURIComponent(projectName)}`);
    if (!res.ok) throw new Error("Failed to fetch main class.");
    return await res.text();
  },

  /** 🔹 Generate full context prompt */
  async fetchFullContext(springProject: string, reactProject: string): Promise<string> {
    const res = await fetch(
      `${API_BASE}/api/full-context?springProject=${encodeURIComponent(springProject)}&reactProject=${encodeURIComponent(reactProject)}`
    );
    if (!res.ok) throw new Error(await res.text());
    return await res.text();
  },

  /** 🔹 Save generated code to backend */
  async saveContent(
    content: string,
    springProject: string,
    reactProject: string
  ): Promise<{ path: string }> {
    const res = await fetch(`${API_BASE}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, springProject, reactProject }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save file.");
    return data;
  },

};
