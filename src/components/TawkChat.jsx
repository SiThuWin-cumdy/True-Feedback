import { useEffect } from 'react';

const PROPERTY_ID = import.meta.env.VITE_TAWK_PROPERTY_ID;
const WIDGET_ID = import.meta.env.VITE_TAWK_WIDGET_ID;

export default function TawkChat({ visible, user }) {
  useEffect(() => {
    window.__tawkShouldShow = visible;
    const api = window.Tawk_API;

    // Script already loaded → just show or hide the bubble
    if (document.getElementById('tawk-script')) {
      if (typeof api?.showWidget === 'function') {
        visible ? api.showWidget() : api.hideWidget();
      }
      return;
    }

    // Not logged in and not loaded yet → do nothing
    if (!visible) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Pre-fill visitor info (change field names to match your user object)
    if (user) {
      window.Tawk_API.visitor = {
        name: user.name || user.username || '',
        email: user.email || '',
      };
    }

    // If the user logs out while the script is still loading
    window.Tawk_API.onLoad = () => {
      if (!window.__tawkShouldShow) window.Tawk_API.hideWidget();
    };

    const s = document.createElement('script');
    s.id = 'tawk-script';
    s.async = true;
    s.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.body.appendChild(s);
  }, [visible, user]);

  return null;
}