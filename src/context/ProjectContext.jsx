import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../services/projectService";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load projects.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const value = useMemo(
    () => ({ projects, loading, error, refreshProjects }),
    [projects, loading, error, refreshProjects]
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjects = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return ctx;
};
