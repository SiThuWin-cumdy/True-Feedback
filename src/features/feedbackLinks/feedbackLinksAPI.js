import axiosInstance from '../../api/axiosInstance';

// Ids and slugs come from the address bar with %2F already decoded. Unencoded,
// "../auth/me" would send the request to a different endpoint.
const linkPath = (id) => `/feedback-links/${encodeURIComponent(id)}`;

export const feedbackLinksAPI = {
  create: (linkData) => axiosInstance.post('/feedback-links', linkData),

  getActive: () => axiosInstance.get('/feedback-links/active', { suppressToast: true }),

  getInactive: () => axiosInstance.get('/feedback-links/inactive', { suppressToast: true }),

  getById: (id) => axiosInstance.get(linkPath(id), { suppressToast: true }),

  getBySlug: (slug) =>
    axiosInstance.get(`/feedback-links/slug/${encodeURIComponent(slug)}`, {
      suppressToast: true,
      anonymous: true,
    }),

  activate: (id) => axiosInstance.patch(`${linkPath(id)}/activate`),

  deactivate: (id) => axiosInstance.patch(`${linkPath(id)}/deactivate`),

  getFeedbackSuggestions: (topicTitle, topicDescription) =>
    axiosInstance.post(
      '/feedback-suggestions',
      { topicTitle, topicDescription },
      { suppressToast: true, anonymous: true }
    ),
};
