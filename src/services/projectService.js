import api from "./api";

export const fetchProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const createProject = async ({ title, description, supervisors = [] }) => {
  const response = await api.post("/projects", { title, description, supervisors });
  return response.data;
};

export const updateProject = async (projectId, payload) => {
  const response = await api.put(`/projects/${projectId}`, payload);
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

export const approveProject = async (projectId) => {
  const response = await api.patch(`/projects/${projectId}/approve`);
  return response.data;
};

export const fetchPendingProjects = async () => {
  const response = await api.get("/projects/pending");
  return response.data;
};
