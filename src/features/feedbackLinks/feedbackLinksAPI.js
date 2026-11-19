import axiosInstance from '../../api/axiosInstance';

export const feedbackLinksAPI = {
  create: (linkData) => axiosInstance.post('/feedback-links', linkData),

  getActive: () => axiosInstance.get('/feedback-links/active', { suppressToast: true }),

  getInactive: () => axiosInstance.get('/feedback-links/inactive', { suppressToast: true }),

  getById: (id) => axiosInstance.get(`/feedback-links/${id}`, { suppressToast: true }),

  getBySlug: (slug) => axiosInstance.get(`/feedback-links/slug/${slug}`, { suppressToast: true }),

  activate: (id) => axiosInstance.patch(`/feedback-links/${id}/activate`),

  deactivate: (id) => axiosInstance.patch(`/feedback-links/${id}/deactivate`),

  getFeedbackSuggestions: (topicTitle, topicDescription) =>
    axiosInstance.post('/feedback-suggestions', {
      topicTitle,
      topicDescription,
    }),
};
