import { config } from './config.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(parts) {
    const startedAt = Date.now();
  console.log('[Gemini] Request started');
  if (!config.geminiKey) throw new Error('GEMINI_API_KEY is not set on the server.');
  const url = `${ENDPOINT}/${config.geminiModel}:generateContent`;
  let lastError = 'Gemini request failed.';

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.geminiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(120000),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      try {
        return JSON.parse(text.replace(/^```json\s*|```$/g, '').trim());
      } catch {
        lastError = 'Gemini returned an unreadable answer.';
        continue;
      }
    }
    lastError = `Gemini error ${res.status}: ${data.error?.message ?? 'unknown'}`;
    if (res.status !== 429 && res.status < 500) break;
    await new Promise((r) => setTimeout(r, 1500));
  }
    console.error(`[Gemini] Failed after ${Date.now() - startedAt}ms: ${lastError}`);
  throw new Error(lastError);
}

// Pass 1: read one whole file (PDF or image) and list what is in it.
export function extractFile(file) {
  const prompt =
    'This is one uploaded file named ' + file.originalname + ' (VTU, India). First decide whether it is a syllabus or a question paper. ' +
    'Read every page fully. For a question paper list EVERY question and sub-question you can read: its number, the module or part it belongs to if shown, a short wording, and its marks. ' +
    'For a syllabus list every module with its topics. Do not invent anything that is not visible. ' +
    'Reply with JSON only: {"kind":"paper or syllabus","subject":"name","code":"subject code if shown",' +
    '"questions":[{"no":"1a","module":"Module 1 or empty","text":"short wording","marks":0}],' +
    '"modules":[{"id":"Module 1","name":"short name","topics":["topic"]}],"warning":"text or empty"}';
  return callGemini([
    { text: prompt },
    { inline_data: { mime_type: file.mimetype, data: file.buffer.toString('base64') } },
  ]);
}

// Pass 2: group questions from all files by topic.
export function groupFiles(parts) {
  const papers = parts.filter((p) => p.data?.kind !== 'syllabus').length || parts.length;
  const prompt =
    'A student uploaded these files for one subject. Below is what was read from each file, as JSON: ' + JSON.stringify(parts) +
    ' . Using ONLY this data, group the questions from all question papers by topic. Use the syllabus modules if a syllabus is present; ' +
    'otherwise use the module or part numbers given in the questions; otherwise group by theme. A topic count is the number of different papers in which the topic appears. ' +
    'If the files belong to different subjects, analyze the most common subject and say so in warning. Mention in warning anything that looks incomplete. ' +
    'Reply with JSON only: {"subject":"name","papers":' + papers + ',"modules":[{"id":"Module 1","name":"short name","topics":[{"name":"topic","count":1,"note":"high marks or empty"}]}],' +
    '"repeated":[{"q":"question in short wording","times":1}],"warning":"text or empty"}. ' +
    'Include every module that has questions, 3 to 8 topics each, and the 8 most repeated questions.';
  return callGemini([{ text: prompt }]).then((r) => ({ ...r, papers: Number(r.papers) || papers }));
}
