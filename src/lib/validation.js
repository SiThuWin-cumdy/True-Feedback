export const MAX_REPLY_LENGTH = 2000; // enforced by the API

export const emailRules = {
  required: 'Enter your email address.',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Enter an email like name@example.com.',
  },
};

export const replyMessageRules = {
  validate: (value) => value.trim() !== '' || 'Write something before sending.',
  maxLength: {
    value: MAX_REPLY_LENGTH,
    message: `Keep it under ${MAX_REPLY_LENGTH} characters.`,
  },
};
