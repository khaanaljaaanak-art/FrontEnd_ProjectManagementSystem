import { useCallback, useEffect, useState } from "react";
import { fetchAssessmentsByProject } from "../services/assessmentService";

export const useAssessments = (projectId) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!projectId) {
      setAssessments([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchAssessmentsByProject(projectId);
      setAssessments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load assessments.");
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assessments, loading, error, refresh };
};
