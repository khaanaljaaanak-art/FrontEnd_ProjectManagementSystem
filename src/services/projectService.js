import api from "./api";

export const fetchProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const createProject = async ({ title, description }) => {
  const response = await api.post("/projects", { title, description });
  return response.data;
};
