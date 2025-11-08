import { API_BASE } from "../constants/packageConstants";
import type { ProjectPackage } from "../types/packageTypes";

export const PackageAPI = {
  /** 🔹 Fetch details of a specific package by name */
  async fetchPackageDetails(packageName: string): Promise<ProjectPackage> {
    const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(packageName)}`);
    if (!res.ok) throw new Error(`Package "${packageName}" not found.`);
    return await res.json();
  },

  /** 🔹 Re-fetch package after project analysis */
  async refreshPackage(packageName: string): Promise<ProjectPackage> {
    const res = await fetch(`${API_BASE}/packages/${encodeURIComponent(packageName)}`);
    if (!res.ok) throw new Error(`Failed to refresh package "${packageName}".`);
    return await res.json();
  },
};
