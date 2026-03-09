export const SYSTEM_PROMPT = `Tu es l'assistant commercial d'Okms Digital Agency, fonde par Beni, expert IA base a Cotonou, Benin.
TON ROLE : Qualifier les prospects qui arrivent via WhatsApp.
Repondre en francais uniquement. Style professionnel et direct.
Jamais d'emojis. Une seule question par message.
Maximum 4 lignes par reponse.

SEQUENCE :
1. Accueil : demander si formation ou livre publie
2. Qualifier : nombre d'etudiants/lecteurs, probleme principal, experience avec l IA
3. Presenter l offre Agent IA apres 3 reponses
4. Obtenir disponibilite pour appel 15 min avec Beni

PRIX : 200 000 FCFA one-time.
Offre gratuite pour 3 formateurs avec 50 etudiants minimum.
Si question hors sujet : Beni vous repondra directement sur ce point.`;

const MAX_HISTORY = 10;
const LLM_MODEL = 'meta/llama-3.3-70b-instruct';
const LLM_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const WA_API_VERSION = 'v19.0';

export const conversations = {};

function extractMessage(body) {
  if (body?.object !== 'whatsapp_business_account') return null;
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message || message.type !== 'text') return null;
  return { from: message.from, text: message.text.body };
}

async function callLLM(history) {
  const response = await fetch(LLM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-MAX_HISTORY),
      ],
      max_tokens: 200,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('LLM returned empty response');
  }
  return reply;
}

async function sendWhatsAppMessage(to, text) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const waToken = process.env.WA_TOKEN;

  const response = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WhatsApp API error (${response.status}): ${errorText}`);
  }
}

export default async function handler(req, res) {
  // Verification webhook (GET)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }

  // Reception des messages (POST)
  if (req.method === 'POST') {
    const msg = extractMessage(req.body);
    if (!msg) return res.sendStatus(200);

    const { from, text: userText } = msg;

    if (!conversations[from]) conversations[from] = [];
    conversations[from].push({ role: 'user', content: userText });

    try {
      const reply = await callLLM(conversations[from]);
      conversations[from].push({ role: 'assistant', content: reply });
      await sendWhatsAppMessage(from, reply);
    } catch (err) {
      console.error(`Error processing message from ${from}:`, err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(405);
}
