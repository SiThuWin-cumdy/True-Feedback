import axiosInstance from '../../api/axiosInstance';

export const repliesAPI = {
  createReply: (linkId, replyData) =>
    axiosInstance.post(`/feedback-links/${linkId}/replies`, replyData),

  getReplies: (linkId, page = 1, limit = 10) =>
    axiosInstance.get(`/feedback-links/${linkId}/replies`, {
      params: { page, limit },
      suppressToast: true,
    }),
};