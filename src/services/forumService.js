import api from "./api";

export const fetchDiscussions = async ({ q = "", sort = "latest", page = 1, limit = 12 } = {}) => {
  const response = await api.get("/forum/discussions", {
    params: {
      q: q || undefined,
      sort: sort || undefined,
      page,
      limit,
    },
  });
  return response.data;
};

export const createDiscussion = async ({ title, body }) => {
  const response = await api.post("/forum/discussions", {
    title,
    body,
  });
  return response.data;
};

export const fetchDiscussion = async (discussionId) => {
  const response = await api.get(`/forum/discussions/${discussionId}`);
  return response.data;
};

export const updateDiscussion = async (discussionId, { title, body }) => {
  const response = await api.patch(`/forum/discussions/${discussionId}`, {
    title,
    body,
  });
  return response.data;
};

export const removeDiscussion = async (discussionId) => {
  const response = await api.delete(`/forum/discussions/${discussionId}`);
  return response.data;
};

export const moderateDiscussion = async (discussionId, patch) => {
  const response = await api.patch(`/forum/discussions/${discussionId}/moderation`, patch);
  return response.data;
};

export const fetchReplies = async (discussionId, { page = 1, limit = 20 } = {}) => {
  const response = await api.get(`/forum/discussions/${discussionId}/replies`, {
    params: { page, limit },
  });
  return response.data;
};

export const createReply = async (discussionId, { body }) => {
  const response = await api.post(`/forum/discussions/${discussionId}/replies`, { body });
  return response.data;
};

export const updateReply = async (replyId, { body }) => {
  const response = await api.patch(`/forum/replies/${replyId}`, { body });
  return response.data;
};

export const removeReply = async (replyId) => {
  const response = await api.delete(`/forum/replies/${replyId}`);
  return response.data;
};

