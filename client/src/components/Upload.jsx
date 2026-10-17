import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

const MAX_FILES = 6;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /pdf|jpe?g|png/;
const sizeText = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');

export default function Upload({ onDone, left }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const [secs, setSecs] = useState(0);
  const input = useRef();

  useEffect(() => {
    if (!busy) { setSecs(0); return; }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [busy]);

  const add = (list) => {
    // Copy the files right now. The browser empties the live list as soon as
    // the file dialog closes, which is why a second pick used to add nothing.
    const picked = [...list];
    const valid = picked.filter((f) => ALLOWED.test(f.type) && f.size <= MAX_BYTES);
    setErr(
      valid.length < picked.length
        ? 'Some files were skipped. Use PDF, JPG or PNG files under 10 MB.'
        : ''
    );
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => f.name + f.size));
      const fresh = valid.filter((f) => !seen.has(f.name + f.size));
      return [...prev, ...fresh].slice(0, MAX_FILES);
    });
  };

  const run = async () => {
    setBusy(true);
    setErr('');
    try {
      onDone(await api.analyze(files));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="hero">
        <h1>Know what to study first.</h1>
        <p>Upload your syllabus and past question papers. Exam Focus groups the questions by topic and shows which ones keep coming back.</p>
      </div>
      <div className="up">
        <section className="glass card">
          <h2>Add your papers</h2>
          <p className="sub">One subject at a time. PDF, JPG or PNG, up to 10 MB each.</p>
          <div
            className={'drop' + (over ? ' over' : '') + (busy ? ' off' : '')}
            role="button" tabIndex={0}
            onClick={() => !busy && input.current.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !busy && input.current.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); if (!busy) add(e.dataTransfer.files); }}
          >
            <div className="drop-icon" aria-hidden="true">＋</div>
            <b>Drop files here or tap to choose</b>
            <small>{files.length} of {MAX_FILES} added. You can add more files one at a time.</small>
          </div>
          <input ref={input} type="file" multiple hidden accept=".pdf,image/jpeg,image/png"
            onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
          {files.length > 0 && (
            <ul className="files">
              {files.map((f, i) => (
                <li key={f.name + f.size}>
                  <span className="fname">{f.name}</span><small>{sizeText(f.size)}</small>
                  {!busy && <button aria-label={'Remove ' + f.name} onClick={() => setFiles(files.filter((_, k) => k !== i))}>×</button>}
                </li>
              ))}
            </ul>
          )}
          {err && <p className="err" role="alert">{err}</p>}
          {busy && (
            <p className="working"><span className="spin" aria-hidden="true" />
              Reading your files… {secs}s. This can take a few minutes, so keep this page open.</p>
          )}
          <button className="btn wide-btn" disabled={busy || !files.length || left === 0} onClick={run}>
            {busy ? 'Analyzing…' : 'Analyze papers'}
          </button>
          {left === 0 && <p className="sub">Daily limit reached. Try again tomorrow.</p>}
        </section>
        <aside className="glass card tips">
          <h2>How it works</h2>
          <ol className="how">
            <li><b>Upload</b><span>Add the syllabus and 3 to 5 past papers of one subject.</span></li>
            <li><b>Read</b><span>AI reads every page and lists the questions.</span></li>
            <li><b>Rank</b><span>Similar questions are grouped, so you see what repeats.</span></li>
            <li><b>Revise</b><span>Get a day-by-day plan and tick topics off.</span></li>
          </ol>
          <h3>For the best result</h3>
          <ul className="tipl">
            <li>Use papers of the same subject and scheme.</li>
            <li>Clear scans read better than blurry photos.</li>
            <li>Add the syllabus to get the exact module names.</li>
          </ul>
          <p className="note">Your files are read by Google Gemini and are not stored. Only the results are saved to your account.</p>
        </aside>
      </div>
      <div className="feats">
        <div className="glass feat"><span aria-hidden="true">📊</span><b>Topic ranking</b><p>See which topics appear in the most papers, module by module.</p></div>
        <div className="glass feat"><span aria-hidden="true">🔁</span><b>Repeated questions</b><p>Spot questions that come back in the same or similar wording.</p></div>
        <div className="glass feat"><span aria-hidden="true">🗓️</span><b>Revision plan</b><p>Pick how many days you have and get a plan you can tick off.</p></div>
      </div>
    </>
  );
}
