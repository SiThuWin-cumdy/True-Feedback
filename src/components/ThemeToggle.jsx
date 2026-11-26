import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { storage, THEME_KEY } from '../lib/storage';

export const ThemeToggle = () => {
  // The inline script in index.html already applied the saved or system theme.
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = () => {
    setIsDark(!isDark);
    storage.set(THEME_KEY, isDark ? 'light' : 'dark');
  };

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-ghost w-10 px-0"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </button>
  );
};
