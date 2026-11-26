import axiosInstance from '../../api/axiosInstance';

const repliesPath = (linkId) => `/feedback-links/${encodeURIComponent(linkId)}/replies`;

export const repliesAPI = {
  // Replies are anonymous, so a signed-in writer's token must not go with them.
  createReply: (linkId, message) =>
    axiosInstance.post(repliesPath(linkId), { message }, { anonymous: true }),

  getReplies: (linkId, { skip, limit }) =>
    axiosInstance.get(repliesPath(linkId), {
      params: { skip, limit },
      suppressToast: true,
    }),
};
