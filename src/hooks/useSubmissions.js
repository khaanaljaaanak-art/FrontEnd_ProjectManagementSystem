import { useCallback, useEffect, useState } from "react";
import { fetchSubmissionsByAssessment } from "../services/submissionService";

export const useSubmissions = (assessmentId) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!assessmentId) {
      setSubmissions([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchSubmissionsByAssessment(assessmentId);
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Failed to load submissions.");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { submissions, loading, error, refresh, setSubmissions };
};
