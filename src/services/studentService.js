import api from "./api";

export const fetchStudentOverview = async () => {
  const response = await api.get("/student/overview");
  return response.data;
};

export const assignProjectAsStudent = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/assign`);
  return response.data;
};

export const fetchAssessmentStatus = async () => {
  const response = await api.get("/student/status");
  return response.data;
};

export const fetchMarksWithRubrics = async () => {
  const response = await api.get("/student/marks");
  return response.data;
};

export const fetchStudentHistory = async () => {
  const response = await api.get("/student/history");
  return response.data;
};

export const fetchStudentNotifications = async () => {
  const response = await api.get("/student/notifications");
  return response.data;
};

export const fetchStudentUnreadSummary = async () => {
  const response = await api.get("/student/notifications/unread-summary");
  return response.data;
};

export const markStudentNotificationRead = async (notificationId) => {
  const response = await api.put(`/student/notifications/${notificationId}/read`);
  return response.data;
};

export const fetchStudentContacts = async () => {
  const response = await api.get("/student/contacts");
  return response.data;
};

export const fetchStudentConversation = async (withUserId) => {
  const response = await api.get("/student/messages", { params: { withUserId } });
  return response.data;
};

export const sendStudentMessage = async ({ recipientId, text, projectId, assessmentId }) => {
  const response = await api.post("/student/messages", {
    recipientId,
    text,
    projectId: projectId || null,
    assessmentId: assessmentId || null,
  });
  return response.data;
};
