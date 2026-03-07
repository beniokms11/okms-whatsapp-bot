# okms-whatsapp-bot

Bot WhatsApp open source pour connecter l’API d’OpenAI aux petites entreprises, cliniques et agences en Afrique francophone.  
L’objectif est de proposer un assistant conversationnel prêt à l’emploi pour le support client, la prise de rendez-vous et la qualification de leads directement dans WhatsApp.

---

## ✨ Fonctionnalités

- Réception et envoi de messages WhatsApp via l’API Cloud de Meta  
- Appels à l’API d’OpenAI (assistant IA) pour générer des réponses intelligentes  
- Gestion basique du contexte de conversation (par utilisateur)  
- Configuration par variables d’environnement (pas de secrets dans le code)  
- Architecture simple, pensée pour être forkée et réutilisée

> ⚠️ Le projet est en cours de développement. Les fonctionnalités peuvent évoluer rapidement.

---

## 🏗️ Stack technique

- Langage : Node.js / JavaScript (ou adapter ici au stack réel)
- API de messagerie : Meta WhatsApp Cloud API
- IA : OpenAI API (Assistants / Chat completions, selon ce que tu utilises)
- Hébergement prévu : n8n, Termux ou petits VPS low-cost (à adapter selon ton usage)

---

## 🚀 Démarrage rapide

### 1. Prérequis

- Node.js installé (version recommandée : 18+)
- Un compte Meta Developer avec un numéro WhatsApp de test
- Un compte OpenAI avec une clé API active

### 2. Cloner le projet

```bash
git clone https://github.com/beniokms11/okms-whatsapp-bot.git
cd okms-whatsapp-bot
3. Installer les dépendances
bash
npm install
4. Configurer les variables d’environnement
Crée un fichier .env à la racine du projet avec les valeurs adaptées :

text
OPENAI_API_KEY=ta_cle_openai
WHATSAPP_PHONE_NUMBER_ID=ton_phone_number_id
WHATSAPP_ACCESS_TOKEN=ton_token_meta
VERIFY_TOKEN=ton_token_pour_le_webhook
PORT=3000
Ne commite jamais ce fichier .env dans Git.

5. Lancer le serveur en local
bash
npm start
Expose ensuite ton serveur en public (par exemple avec ngrok) pour connecter le webhook Meta.

🔁 Flux général du bot
L’utilisateur envoie un message à ton numéro WhatsApp.

Meta envoie un webhook HTTP à ton serveur.

Le serveur formate la requête et appelle l’API d’OpenAI.

La réponse de l’IA est renvoyée à l’utilisateur sur WhatsApp.

📦 Déploiement
Les scénarios visés :

n8n / make.com : intégration du bot dans des workflows no-code (CRM, Notion, Google Sheets…).

Termux / Android : expérimentation locale pour devs sans serveur dédié.

VPS / PaaS : petit serveur Node.js pour déploiement continu.

Des exemples de configurations et templates seront ajoutés au fur et à mesure.

🧩 Roadmap
 Gestion avancée du contexte par utilisateur

 Templates de prompts pour cas d’usage (support client, rendez-vous, leads)

 Intégration simple avec n8n (exemples de workflows)

 Script d’installation rapide sur Termux

 Interface d’admin minimale (configuration, logs, monitoring)

Les issues et pull requests sont les bienvenues.

🤝 Contribution
Tu peux contribuer en :

ouvrant une issue pour signaler un bug ou proposer une idée,

soumettant une pull request avec une amélioration,

partageant des exemples d’usage (templates de messages, workflows, etc.).

📝 Licence
Ce projet est publié sous licence MIT.
Tu es libre de l’utiliser, le modifier et le distribuer, tant que tu inclus la licence originale.

🌍 À propos
Ce projet est maintenu par OKOUMASSOUN Ganelle Béni Koba (@beniokms11).
Il est pensé pour aider les développeurs et entrepreneurs d’Afrique francophone à déployer rapidement des assistants IA sur un canal critique : WhatsApp.
