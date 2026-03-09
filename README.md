# okms-whatsapp-bot

Bot WhatsApp open source pour connecter l'IA (LLM NVIDIA Llama) aux petites entreprises, cliniques et agences en Afrique francophone.
L'objectif est de proposer un assistant conversationnel pret a l'emploi pour le support client, la prise de rendez-vous et la qualification de leads directement dans WhatsApp.

---

## Fonctionnalites

- Reception et envoi de messages WhatsApp via l'API Cloud de Meta
- Appels au LLM NVIDIA (Llama 3.3 70B) pour generer des reponses intelligentes
- Gestion du contexte de conversation par utilisateur (10 derniers messages)
- Qualification automatique de prospects via un prompt commercial configurable
- Gestion des erreurs avec logs structures
- Configuration par variables d'environnement (pas de secrets dans le code)
- Tests unitaires automatises
- Architecture simple, pensee pour etre forkee et reutilisee

> Le projet est en cours de developpement. Les fonctionnalites peuvent evoluer rapidement.

---

## Stack technique

- **Langage** : Node.js / JavaScript (ES modules)
- **API de messagerie** : Meta WhatsApp Cloud API
- **IA** : NVIDIA API (Llama 3.3 70B Instruct)
- **Tests** : Jest
- **Hebergement** : Vercel (serverless), n8n, Termux ou VPS low-cost

---

## Demarrage rapide

### 1. Prerequis

- Node.js installe (version recommandee : 18+)
- Un compte Meta Developer avec un numero WhatsApp de test
- Une cle API NVIDIA

### 2. Cloner le projet

```bash
git clone https://github.com/beniokms11/okms-whatsapp-bot.git
cd okms-whatsapp-bot
```

### 3. Installer les dependances

```bash
npm install
```

### 4. Configurer les variables d'environnement

Copie le fichier `.env.example` et adapte les valeurs :

```bash
cp .env.example .env
```

Variables requises :

```
VERIFY_TOKEN=ton_token_de_verification
LLM_API_KEY=ta_cle_nvidia
PHONE_NUMBER_ID=ton_phone_number_id
WA_TOKEN=ton_token_meta
```

> Ne commite jamais le fichier `.env` dans Git.

### 5. Lancer les tests

```bash
npm test
```

### 6. Deployer

Le projet est pret pour un deploiement sur **Vercel** (configuration incluse dans `vercel.json`).
Tu peux aussi exposer ton serveur en local avec ngrok pour connecter le webhook Meta.

---

## Flux general du bot

1. L'utilisateur envoie un message a ton numero WhatsApp
2. Meta envoie un webhook HTTP a ton serveur (`/api/webhook`)
3. Le serveur formate la requete et appelle le LLM NVIDIA
4. La reponse de l'IA est renvoyee a l'utilisateur sur WhatsApp

---

## Deploiement

Les scenarios vises :

- **Vercel** : deploiement serverless automatique (configuration incluse)
- **n8n / make.com** : integration du bot dans des workflows no-code
- **Termux / Android** : experimentation locale pour devs sans serveur dedie
- **VPS / PaaS** : petit serveur Node.js pour deploiement continu

---

## Roadmap

- [x] Integration WhatsApp / IA de base
- [x] Gestion du contexte de conversation par utilisateur
- [x] Gestion des erreurs et logs
- [x] Tests unitaires
- [ ] Templates de prompts pour cas d'usage (support client, rendez-vous, leads)
- [ ] Integration simple avec n8n (exemples de workflows)
- [ ] Script d'installation rapide sur Termux
- [ ] Interface d'admin minimale (configuration, logs, monitoring)

Les issues et pull requests sont les bienvenues.

---

## Contribution

Tu peux contribuer en :

- ouvrant une issue pour signaler un bug ou proposer une idee
- soumettant une pull request avec une amelioration
- partageant des exemples d'usage (templates de messages, workflows, etc.)

---

## Licence

Ce projet est publie sous licence MIT.
Tu es libre de l'utiliser, le modifier et le distribuer, tant que tu inclus la licence originale.

---

## A propos

Ce projet est maintenu par OKOUMASSOUN Ganelle Beni Koba (@beniokms11).
Il est pense pour aider les developpeurs et entrepreneurs d'Afrique francophone a deployer rapidement des assistants IA sur un canal critique : WhatsApp.
