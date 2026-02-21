const SYSTEM_PROMPT = `Tu es l'assistant commercial d'Okms Digital Agency, 
fonde par Beni, expert IA base a Cotonou, Benin.
TON ROLE : Qualifier les prospects qui arrivent via WhatsApp.
Repondre en francais uniquement. Style professionnel et direct. 
Jamais d'emojis. Une seule question par message. 
Maximum 4 lignes par reponse.

SEQUENCE :
1. Accueil : demander si formation ou livre publie
2. Qualifier : nombre d'etudiants/lecteurs, 
   probleme principal, experience avec l IA
3. Presenter l offre Agent IA apres 3 reponses
4. Obtenir disponibilite pour appel 15 min avec Beni

PRIX : 200 000 FCFA one-time. 
Offre gratuite pour 3 formateurs avec 50 etudiants minimum.
Si question hors sujet : 
Beni vous repondra directement sur ce point.`;

const conversations = {};

export default async function handler(req, res) {

  if (req.method === "POST") {
    const from = req.body?.From;
    const userText = req.body?.Body;

    if (!from || !userText) return res.sendStatus(200);

    if (!conversations[from]) conversations[from] = [];
    conversations[from].push({ 
      role: "user", content: userText 
    });

    // Appel LLM NVIDIA
    const llmResponse = await fetch(
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

    const data = await llmResponse.json();
    const reply = data.choices[0].message.content;

    conversations[from].push({ 
      role: "assistant", content: reply 
    });

    // Envoi via Twilio
    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_TOKEN;
    const credentials = Buffer.from(
      `${accountSid}:${authToken}`
    ).toString("base64");

    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_NUMBER,
          To: from,
          Body: reply,
        }),
      }
    );

    return res.sendStatus(200);
  }

  return res.sendStatus(405);
}
