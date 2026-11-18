import axiosInstance from '../../api/axiosInstance';

export const repliesAPI = {
  createReply: (linkId, replyData) =>
    axiosInstance.post(`/feedback-links/${linkId}/replies`, replyData),

  getReplies: (linkId, skip = 0, limit = 10) =>
    axiosInstance.get(`/feedback-links/${linkId}/replies`, {
      params: { skip, limit },
      suppressToast: true,
    }),
};