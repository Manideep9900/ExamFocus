// One place for every call to the backend.
async function request(path, options = {}) {
  const res = await fetch('/api' + path, { credentials: 'same-origin', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status });
  return data;
}

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const api = {
  me: () => request('/auth/me'),
  register: (b) => request('/auth/register', json('POST', b)),
  login: (b) => request('/auth/login', json('POST', b)),
  logout: () => request('/auth/logout', { method: 'POST' }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),
  analyses: () => request('/analyses'),
  analysis: (id) => request('/analyses/' + id),
  remove: (id) => request('/analyses/' + id, { method: 'DELETE' }),
  analyze: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return request('/analyses', { method: 'POST', body: form });
  },
};
