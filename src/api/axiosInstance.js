import axios from 'axios';
import toast from 'react-hot-toast';
import { storage, TOKEN_KEY } from '../lib/storage';
import { resolveApiBaseUrl } from './apiBaseUrl';

const DEFAULT_ERROR = 'An unexpected error occurred';

// Custom request options:
// - suppressToast: don't toast the result.
// - anonymous: don't attach the session token, for public endpoints that must
//   not reveal who is calling.
const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(import.meta.env),
  // An absolute request URL would otherwise send the token to another host.
  allowAbsoluteUrls: false,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = () => {};

// Called with the token the API rejected. Set by the store, which can't be
// imported here without a cycle.
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const fail = (message, config, status) => {
  if (!config?.suppressToast) toast.error(message);
  const error = new Error(message);
  error.status = status;
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use((config) => {
  const token = config.anonymous ? null : storage.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.sentToken = token;
  }
  return config;
});

// Unwraps the API's `{ status, message, data }` envelope.
axiosInstance.interceptors.response.use(
  (response) => {
    const { status, message, data } = response.data || {};

    if (status === 'error') {
      return fail(message || DEFAULT_ERROR, response.config, response.status);
    }
    if (status !== 'success') return response.data;

    if (message && !response.config.suppressToast) toast.success(message);
    return data;
  },
  (error) => {
    const { config, response } = error;
    if (response?.status === 401 && config?.sentToken) {
      onUnauthorized(config.sentToken);
    }
    return fail(
      response?.data?.message || error.message || DEFAULT_ERROR,
      config,
      response?.status
    );
  }
);

export default axiosInstance;
