import api from "./api";

export const fetchUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post("/admin/users", payload);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.put(`/admin/users/${userId}`, payload);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const fetchSettings = async () => {
  const response = await api.get("/admin/settings");
  return response.data;
};

export const updateSettings = async (payload) => {
  const response = await api.put("/admin/settings", payload);
  return response.data;
};

export const fetchOverview = async () => {
  const response = await api.get("/admin/reports/overview");
  return response.data;
};

export const fetchActivity = async () => {
  const response = await api.get("/admin/activity");
  return response.data;
};

export const fetchDisputes = async () => {
  const response = await api.get("/admin/disputes");
  return response.data;
};

export const resolveDispute = async (disputeId, resolutionNote) => {
  const response = await api.put(`/admin/disputes/${disputeId}/resolve`, {
    resolutionNote,
  });
  return response.data;
};
