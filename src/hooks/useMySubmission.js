import { useCallback, useEffect, useState } from "react";
import { fetchMySubmissionForAssessment } from "../services/submissionService";

export const useMySubmission = (assessmentId) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!assessmentId) {
      setSubmission(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchMySubmissionForAssessment(assessmentId);
      setSubmission(data);
    } catch (e) {
      // Treat "not found" as "no submission yet".
      const status = e?.response?.status;
      if (status === 404) {
        setSubmission(null);
      } else {
        setError("Failed to load your submission.");
      }
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { submission, loading, error, refresh, setSubmission };
};
