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

export const updateAssessment = async (assessmentId, payload) => {
  const response = await api.put(`/assessments/item/${assessmentId}`, payload);
  return response.data;
};

export const deleteAssessment = async (assessmentId) => {
  const response = await api.delete(`/assessments/item/${assessmentId}`);
  return response.data;
};
