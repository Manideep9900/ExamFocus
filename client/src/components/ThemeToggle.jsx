import { useState } from 'react';
import { currentTheme, setTheme } from '../theme.js';

export default function ThemeToggle() {
  const [theme, setT] = useState(currentTheme);
  const next = theme === 'dark' ? 'light' : 'dark';
  const flip = () => { setTheme(next); setT(next); };
  return (
    <button className="icon-btn" onClick={flip} aria-label={`Switch to ${next} theme`}>
      {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
