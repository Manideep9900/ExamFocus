import { useState } from 'react';
import { api } from '../api.js';
import ThemeToggle from './ThemeToggle.jsx';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const d = await (mode === 'login' ? api.login : api.register)({ email, password });
      onAuth(d.user);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap center-wrap">
      <div className="blob b1" /><div className="blob b2" />
      <div className="auth-theme"><ThemeToggle /></div>
      <form className="glass auth" onSubmit={submit}>
        <div className="logo">Exam<span>Focus</span></div>
        <h1>Know what to study first.</h1>
        <p className="sub">Upload your syllabus and past papers. See which topics keep coming back.</p>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
        <p className="note">Your files are read by Google Gemini and are not stored. Only the results are saved to your account.</p>
      </form>
    </div>
  );
}
