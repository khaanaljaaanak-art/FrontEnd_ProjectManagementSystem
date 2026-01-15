import api from "./api";

export const createAssessment = async ({ projectId, title, deadline }) => {
  const normalizedDeadline =
    deadline instanceof Date
      ? deadline.toISOString()
      : new Date(deadline).toISOString();

  const response = await api.post("/assessments", {
    projectId,
    title,
    deadline: normalizedDeadline,
  });
  return response.data;
};

export const fetchAssessmentsByProject = async (projectId) => {
  const response = await api.get(`/assessments/${projectId}`);
  return response.data;
};
