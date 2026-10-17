import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import AuthPage from './components/AuthPage.jsx';
import Upload from './components/Upload.jsx';
import Results from './components/Results.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [history, setHistory] = useState([]);
  const [left, setLeft] = useState(null);
  const [current, setCurrent] = useState(null);
  const wide = window.matchMedia('(min-width:801px)').matches;

  const refresh = useCallback(async () => {
    const d = await api.analyses();
    setHistory(d.analyses);
    setLeft(d.remainingToday);
  }, []);

  useEffect(() => {
    api.me().then((d) => setUser(d.user)).catch(() => setUser(null));
  }, []);
  useEffect(() => {
    if (user) refresh().catch(() => {});
  }, [user, refresh]);

  if (user === undefined) return <div className="center">Loading…</div>;
  if (!user) return <AuthPage onAuth={setUser} />;

  const reset = () => { setUser(null); setCurrent(null); setHistory([]); };
  const open = async (id) => setCurrent(await api.analysis(id));
  const del = async (id) => { await api.remove(id); if (current?.id === id) setCurrent(null); refresh(); };
  const logout = async () => { await api.logout(); reset(); };
  const wipe = async () => {
    if (window.confirm('Delete your account and all saved analyses? This cannot be undone.')) {
      await api.deleteAccount();
      reset();
    }
  };

  return (
    <div className="wrap">
      <div className="blob b1" /><div className="blob b2" />
      <header className="top">
        <div className="logo">Exam<span>Focus</span></div>
        <div className="who">
          <span>{user.email}</span>
          <ThemeToggle />
          <button className="icon-btn" onClick={logout}>Log out</button>
          <button className="icon-btn" onClick={wipe}>Delete account</button>
        </div>
      </header>
      <div className="layout">
        <aside className="glass side">
          <div className="side-top">
            <button className="btn" onClick={() => setCurrent(null)}>New analysis</button>
            <p className="sub">{left === null ? '' : `${left} analyses left today`}</p>
          </div>
          <details className="saved" open={wide}>
            <summary>Saved ({history.length})</summary>
            {history.length === 0 && <p className="sub">Nothing saved yet.</p>}
            {history.map((h) => (
              <div key={h.id} className={'hist' + (current?.id === h.id ? ' sel' : '')}>
                <button onClick={() => open(h.id)}>
                  {h.subject || 'Analysis'}<small>{String(h.createdAt).slice(0, 10)}</small>
                </button>
                <button aria-label="Delete analysis" onClick={() => del(h.id)}>×</button>
              </div>
            ))}
          </details>
        </aside>
        <main>
          {current
            ? <Results key={current.id} id={current.id} result={current.result} />
            : <Upload left={left} onDone={(d) => { setCurrent(d); refresh(); }} />}
        </main>
      </div>
    </div>
  );
}
