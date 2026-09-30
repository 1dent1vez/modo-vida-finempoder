import { test } from 'node:test';
import assert from 'node:assert/strict';
import { briefSchema, citedSources, createEditorialDraft } from '../src/newsletter/agents.js';

const brief = { topic: 'Cómo comparar el costo de una tarjeta de crédito', angle: 'Explicar el CAT sin recomendar productos', category: 'Antes de contratar' };
const researched = {
  status: 'completed',
  output: [
    { type: 'web_search_call', status: 'completed' },
    { type: 'message', content: [{ type: 'output_text', text: 'Investigación con referencias y notas sobre costos, condiciones, vigencia y comparación de productos financieros. '.repeat(2), annotations: [
      { type: 'url_citation', title: 'CONDUSEF', url: 'https://www.condusef.gob.mx/' },
      { type: 'url_citation', title: 'Banco de México', url: 'https://www.banxico.org.mx/' },
      { type: 'url_citation', title: 'No segura', url: 'http://example.com/' },
    ] }] },
  ],
};
const output = (text: string) => ({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text }] }] });

test('editorial brief and cited sources reject weak input and unsafe links', () => {
  assert.equal(briefSchema.safeParse({ ...brief, topic: 'CAT' }).success, false);
  assert.deepEqual(citedSources(researched).map(source => source.url), [
    'https://www.condusef.gob.mx/', 'https://www.banxico.org.mx/',
  ]);
});

test('research, writer and reviewer return an editable draft without publishing', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const originalFetch = globalThis.fetch;
  const requests: any[] = [];
  const replies = [researched, output(JSON.stringify({
    title: 'Cómo leer el costo de una tarjeta', summary: 'Una guía para entender cargos y comparar opciones antes de contratar.',
    body: 'Antes de contratar, revisa el costo total y las condiciones vigentes. '.repeat(8),
  })), output(JSON.stringify({ passed: false, issues: ['Confirmar el ejemplo numérico con la fuente original.'] }))];
  globalThis.fetch = (async (_url: unknown, options: any) => {
    requests.push(JSON.parse(options.body));
    return { ok: true, json: async () => replies.shift() } as Response;
  }) as typeof fetch;
  try {
    const draft = await createEditorialDraft(brief);
    assert.equal(requests.length, 3);
    assert.equal(requests[0].tools[0].type, 'web_search');
    assert.equal(requests.every(request => request.store === false), true);
    assert.equal(draft.sources.length, 2);
    assert.equal(draft.review.passed, false);
    assert.equal('status' in draft, false);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  }
});

test('generation stops when research has fewer than two cited sources', async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return { ok: true, json: async () => ({ ...researched, output: [researched.output[0],
      { type: 'message', content: [{ type: 'output_text', text: 'Insuficiente', annotations: [
        { type: 'url_citation', title: 'Única', url: 'https://example.com/' },
      ] }] }] }) } as Response;
  }) as typeof fetch;
  try {
    await assert.rejects(createEditorialDraft(brief), /menos de dos fuentes/);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  }
});
