// Shared with vite.config.js, which allows this origin in the CSP.
export const resolveApiBaseUrl = (env) =>
  env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
