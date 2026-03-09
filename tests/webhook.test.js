import { jest } from '@jest/globals';

// Mock fetch globally before importing the handler
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Set env vars before importing
process.env.VERIFY_TOKEN = 'test-verify-token';
process.env.LLM_API_KEY = 'test-llm-key';
process.env.PHONE_NUMBER_ID = '123456';
process.env.WA_TOKEN = 'test-wa-token';

const { default: handler, conversations } = await import('../api/webhook.js');

function makeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { res.statusCode = code; return res; },
    send(body) { res.body = body; return res; },
    sendStatus(code) { res.statusCode = code; return res; },
    json(data) { res.body = data; return res; },
  };
  return res;
}

function makeWhatsAppBody(from, text) {
  return {
    object: 'whatsapp_business_account',
    entry: [{
      changes: [{
        value: {
          messages: [{
            from,
            type: 'text',
            text: { body: text },
          }],
        },
      }],
    }],
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  // Clear conversations between tests
  for (const key of Object.keys(conversations)) {
    delete conversations[key];
  }
});

describe('GET /api/webhook - Verification', () => {
  test('returns challenge when token matches', async () => {
    const req = {
      method: 'GET',
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123',
      },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe('challenge-123');
  });

  test('returns 403 when token is wrong', async () => {
    const req = {
      method: 'GET',
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'challenge-123',
      },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });

  test('returns 403 when mode is not subscribe', async () => {
    const req = {
      method: 'GET',
      query: {
        'hub.mode': 'unsubscribe',
        'hub.verify_token': 'test-verify-token',
        'hub.challenge': 'challenge-123',
      },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(403);
  });
});

describe('POST /api/webhook - Message handling', () => {
  test('ignores non-whatsapp_business_account objects', async () => {
    const req = { method: 'POST', body: { object: 'other' } };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('ignores non-text messages', async () => {
    const req = {
      method: 'POST',
      body: {
        object: 'whatsapp_business_account',
        entry: [{ changes: [{ value: { messages: [{ type: 'image', from: '123' }] } }] }],
      },
    };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('processes text message, calls LLM and sends reply', async () => {
    // Mock LLM response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Bonjour, bienvenue chez Okms.' } }],
      }),
    });
    // Mock WhatsApp send response
    mockFetch.mockResolvedValueOnce({ ok: true });

    const req = { method: 'POST', body: makeWhatsAppBody('22990001234', 'Bonjour') };
    const res = makeRes();
    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Verify LLM call
    const llmCall = mockFetch.mock.calls[0];
    expect(llmCall[0]).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    const llmBody = JSON.parse(llmCall[1].body);
    expect(llmBody.model).toBe('meta/llama-3.3-70b-instruct');
    expect(llmBody.messages[0].role).toBe('system');
    expect(llmBody.messages[1]).toEqual({ role: 'user', content: 'Bonjour' });

    // Verify WhatsApp call
    const waCall = mockFetch.mock.calls[1];
    expect(waCall[0]).toContain('graph.facebook.com');
    expect(waCall[0]).toContain('123456');
    const waBody = JSON.parse(waCall[1].body);
    expect(waBody.to).toBe('22990001234');
    expect(waBody.text.body).toBe('Bonjour, bienvenue chez Okms.');
  });

  test('maintains conversation history per user', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Reply 1' } }] }),
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Reply 2' } }] }),
      })
      .mockResolvedValueOnce({ ok: true });

    const req1 = { method: 'POST', body: makeWhatsAppBody('user1', 'Message 1') };
    await handler(req1, makeRes());

    const req2 = { method: 'POST', body: makeWhatsAppBody('user1', 'Message 2') };
    await handler(req2, makeRes());

    expect(conversations['user1']).toHaveLength(4);
    expect(conversations['user1'][0]).toEqual({ role: 'user', content: 'Message 1' });
    expect(conversations['user1'][1]).toEqual({ role: 'assistant', content: 'Reply 1' });
    expect(conversations['user1'][2]).toEqual({ role: 'user', content: 'Message 2' });
    expect(conversations['user1'][3]).toEqual({ role: 'assistant', content: 'Reply 2' });
  });

  test('returns 500 when LLM API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const req = { method: 'POST', body: makeWhatsAppBody('22990001234', 'Bonjour') };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });

  test('returns 500 when WhatsApp API fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Reply' } }] }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

    const req = { method: 'POST', body: makeWhatsAppBody('22990001234', 'Bonjour') };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
  });
});

describe('Other methods', () => {
  test('returns 405 for unsupported methods', async () => {
    const req = { method: 'PUT' };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 405 for DELETE', async () => {
    const req = { method: 'DELETE' };
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });
});
