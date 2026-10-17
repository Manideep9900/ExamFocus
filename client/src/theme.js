const KEY = 'ef-theme';

// Saved choice first, then the device setting.
export function currentTheme() {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch { /* storage unavailable */ }
  return matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
}

export function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch { /* storage unavailable */ }
}
