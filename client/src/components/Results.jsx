import { useMemo, useState } from 'react';

const CIRC = 175.9;

export default function Results({ id, result }) {
  const P = Math.max(1, Number(result.papers) || 1);
  const mods = result.modules || [];
  const [mod, setMod] = useState('All');
  const [days, setDays] = useState(3);
  const key = 'ef-done-' + id;
  const [done, setDone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); } catch { return new Set(); }
  });

  const all = useMemo(
    () => mods.flatMap((m, i) => (m.topics || []).map((t, j) => ({
      id: i + '-' + j, name: t.name, c: Math.min(Number(t.count) || 1, P), mod: m.id, label: m.name, note: t.note,
    }))),
    [mods, P]
  );
  const shown = all.filter((t) => mod === 'All' || t.mod === mod);
  const plan = useMemo(() => {
    const s = [...all].sort((a, b) => b.c - a.c);
    const per = Math.ceil(s.length / days) || 1;
    return Array.from({ length: days }, (_, d) => s.slice(d * per, (d + 1) * per)).filter((x) => x.length);
  }, [all, days]);
  const pct = all.length ? Math.round((all.filter((t) => done.has(t.id)).length / all.length) * 100) : 0;
  // Topics that appear in at least three quarters of the papers (needs 2+ papers to mean anything).
  const frequent = P < 2 ? '–' : all.filter((t) => t.c >= Math.ceil(P * 0.75)).length;

  const toggle = (tid) => {
    const n = new Set(done);
    n.has(tid) ? n.delete(tid) : n.add(tid);
    setDone(n);
    try { localStorage.setItem(key, JSON.stringify([...n])); } catch { /* storage unavailable */ }
  };

  return (
    <>
      <div className="stats">
        <div className="glass stat"><b>{P}</b><span>{P === 1 ? 'paper' : 'papers'} read</span></div>
        <div className="glass stat"><b>{mods.length}</b><span>{mods.length === 1 ? 'module' : 'modules'}</span></div>
        <div className="glass stat"><b>{all.length}</b><span>topics found</span></div>
        <div className="glass stat"><b>{frequent}</b><span>in most papers</span></div>
      </div>
      <div className="res">
        <div className="res-main">
          <section className="glass card">
            <h2>{result.subject || 'Your subject'}: topics by module</h2>
            <p className="sub">Bars show in how many of your {P} {P === 1 ? 'paper' : 'papers'} a topic appeared. Past frequency does not guarantee what comes next.</p>
            {result.warning && <p className="note">Note: {result.warning}</p>}
            <div className="chips">
              {['All', ...mods.map((m) => m.id)].map((m) => (
                <button key={m} className={'chip' + (m === mod ? ' sel' : '')} onClick={() => setMod(m)}>{m}</button>
              ))}
            </div>
            {shown.length === 0 && <p className="sub">No topics were found. Check that the pages are clear and try again.</p>}
            {shown.map((t) => (
              <div className="topic" key={t.id}>
                <div className="head"><span>{t.name}</span><span className="meta">{t.mod}: {t.label}</span></div>
                <div className="meta">{t.c} of {P} {P === 1 ? 'paper' : 'papers'}{t.note ? ' · ' + t.note : ''}</div>
                <div className="bar"><i className={t.c >= P && P > 1 ? 'hot' : ''} style={{ width: (t.c / P) * 100 + '%' }} /></div>
              </div>
            ))}
          </section>
          <section className="glass card">
            <h2>Questions that keep returning</h2>
            {(result.repeated || []).length === 0 && <p className="sub">None found.</p>}
            {(result.repeated || []).map((r, i) => (
              <div className="rq" key={i}><span>{r.q}</span><b>{Math.min(Number(r.times) || 1, P)} of {P}</b></div>
            ))}
          </section>
        </div>
        <section className="glass card plan">
          <h2>Your revision plan</h2>
          <div className="plan-top">
            <div className="ring">
              <svg width="70" height="70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="var(--track)" strokeWidth="7" />
                <circle cx="35" cy="35" r="28" fill="none" stroke="var(--accent2)" strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .5s' }} />
              </svg>
              <span>{pct}%</span>
            </div>
            <div className="grow">
              <b>{days} {days === 1 ? 'day' : 'days'} left</b>
              <input type="range" min="1" max="10" value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Days left" />
            </div>
          </div>
          {plan.map((list, d) => (
            <div className="day" key={d}>
              <h3>Day {d + 1}</h3>
              {list.map((t) => (
                <label key={t.id} className={done.has(t.id) ? 'ok' : ''}>
                  <input type="checkbox" checked={done.has(t.id)} onChange={() => toggle(t.id)} />
                  <span>{t.name} <small>({t.mod}, {t.c} of {P})</small></span>
                </label>
              ))}
            </div>
          ))}
        </section>
      </div>
      <p className="note">These results come from an AI reading your files. Check them against the papers before relying on them.</p>
    </>
  );
}
