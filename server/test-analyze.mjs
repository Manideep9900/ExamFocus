import { readFileSync } from 'node:fs';

const base = 'http://localhost:3001/api';
const paths = process.argv.slice(2);

if (!paths.length) {
  console.log('Usage: node test-analyze.mjs paper1.pdf paper2.pdf');
  process.exit(1);
}

const creds = JSON.stringify({ email: 'tester@example.com', password: 'password123' });
const json = { 'Content-Type': 'application/json' };

let res = await fetch(`${base}/auth/register`, { method: 'POST', headers: json, body: creds });
if (res.status === 409) {
  res = await fetch(`${base}/auth/login`, { method: 'POST', headers: json, body: creds });
}
const cookie = res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');

const form = new FormData();
for (const p of paths) {
  form.append('files', new Blob([readFileSync(p)], { type: 'application/pdf' }), p.split(/[\\/]/).pop());
}

console.log('Analyzing. This can take a minute...');
const out = await fetch(`${base}/analyses`, { method: 'POST', headers: { Cookie: cookie }, body: form });
console.log(out.status, JSON.stringify(await out.json(), null, 2));