import api from "./api";

export const fetchAssignedStudentsProgress = async () => {
  const response = await api.get("/supervisor/students/progress");
  return response.data;
};

export const fetchRubricByAssessment = async (assessmentId) => {
  const response = await api.get(`/supervisor/rubrics/${assessmentId}`);
  return response.data;
};

export const fetchSubmissionHistory = async (assessmentId, studentId) => {
  const response = await api.get(`/supervisor/history/${assessmentId}`, {
    params: studentId ? { studentId } : {},
  });
  return response.data;
};

export const fetchSupervisorNotifications = async () => {
  const response = await api.get("/supervisor/notifications");
  return response.data;
};

export const fetchSupervisorUnreadSummary = async () => {
  const response = await api.get("/supervisor/notifications/unread-summary");
  return response.data;
};

export const markSupervisorNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/supervisor/notifications/${notificationId}/read`);
  return response.data;
};

export const fetchConversation = async (studentId, projectId) => {
  const response = await api.get("/supervisor/messages", {
    params: { studentId, ...(projectId ? { projectId } : {}) },
  });
  return response.data;
};

export const sendMessageToStudent = async ({ studentId, text, projectId, assessmentId }) => {
  const response = await api.post("/supervisor/messages", {
    studentId,
    text,
    projectId: projectId || null,
    assessmentId: assessmentId || null,
  });
  return response.data;
};
