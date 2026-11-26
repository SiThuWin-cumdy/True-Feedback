// localStorage throws when the browser blocks it (privacy settings, sandboxed
// frames). Losing persistence is fine; crashing the app is not.
const attempt = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export const storage = {
  get: (key) => attempt(() => localStorage.getItem(key)),
  set: (key, value) => attempt(() => localStorage.setItem(key, value)),
  remove: (key) => attempt(() => localStorage.removeItem(key)),
};

export const TOKEN_KEY = 'token';
export const THEME_KEY = 'theme';
