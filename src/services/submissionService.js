import api from "./api";

export const submitAssessment = async ({ assessmentId, fileUrl }) => {
  const response = await api.post("/submissions", { assessmentId, fileUrl });
  return response.data;
};

export const submitAssessmentWithFiles = async ({ assessmentId, fileUrls }) => {
  const response = await api.post("/submissions", { assessmentId, fileUrls });
  return response.data;
};

export const uploadSubmissionFiles = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("files", file));
  const response = await api.post("/submissions/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const fetchMySubmissionForAssessment = async (assessmentId) => {
  const response = await api.get(`/submissions/mine/${assessmentId}`);
  return response.data;
};

export const fetchSubmissionsByAssessment = async (assessmentId) => {
  const response = await api.get(`/submissions/${assessmentId}`);
  return response.data;
};

export const gradeSubmission = async (submissionId, { marks, feedback }) => {
  const response = await api.put(`/submissions/grade/${submissionId}`, {
    marks,
    feedback,
  });
  return response.data;
};
