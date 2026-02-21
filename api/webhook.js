const SYSTEM_PROMPT = `Tu es l'assistant commercial d'Okms Digital Agency, 
fonde par Beni, expert IA base a Cotonou, Benin.
TON ROLE : Qualifier les prospects qui arrivent via WhatsApp.
Repondre en francais uniquement. Style professionnel et direct. 
Jamais d'emojis. Une seule question par message. 
Maximum 4 lignes par reponse.

SEQUENCE :
1. Accueil : demander si formation ou livre publie
2. Qualifier : nombre d'etudiants/lecteurs, 
   probleme principal, experience avec l'IA
3. Presenter l'offre Agent IA apres 3 reponses
4. Obtenir disponibilite pour appel 15 min avec Beni

PRIX : 200 000 FCFA one-time. 
Offre gratuite pour 3 formateurs avec 50+ etudiants.
Si question hors sujet : 
'Beni vous repondra directement sur ce point.'`;

const conversations = {};

export default async function handler(req, res) {

  if (req.method === "GET") {
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (token === process.env.VERIFY_TOKEN) return res.send(challenge);
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    const message = req.body?.entry?.[0]
      ?.changes?.[0]?.value?.messages?.[0];
    if (!message || message.type !== "text") 
      return res.sendStatus(200);

    const from = message.from;
    const userText = message.text.body;

    if (!conversations[from]) conversations[from] = [];
    conversations[from].push({ 
      role: "user", content: userText 
    });

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta/llama-3.3-70b-instruct",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversations[from].slice(-10),
          ],
          max_tokens: 200,
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    const data = await response.json();
    const reply = data.choices[0].message.content;

    conversations[from].push({ 
      role: "assistant", content: reply 
    });

    await fetch(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply },
        }),
      }
    );

    return res.sendStatus(200);
  }
}
