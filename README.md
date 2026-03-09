# okms-whatsapp-bot

Bot WhatsApp open source pour connecter l'IA (LLM NVIDIA Llama) aux petites entreprises, cliniques et agences en Afrique francophone.
L'objectif est de proposer un assistant conversationnel prêt à l'emploi pour le support client, la prise de rendez-vous et la qualification de leads directement dans WhatsApp.

---

## Fonctionnalités

- Réception et envoi de messages WhatsApp via l'API Cloud de Meta
- Appels au LLM NVIDIA (Llama 3.3 70B) pour générer des réponses intelligentes
- Gestion du contexte de conversation par utilisateur (10 derniers messages)
- Qualification automatique de prospects via un prompt commercial configurable
- Gestion des erreurs avec logs structurés
- Configuration par variables d'environnement (pas de secrets dans le code)
- Tests unitaires automatisés
- Architecture simple, pensée pour être forkée et réutilisée

> Le projet est en cours de développement. Les fonctionnalités peuvent évoluer rapidement.

---

## Stack technique

- **Langage** : Node.js / JavaScript (ES modules)
- **API de messagerie** : Meta WhatsApp Cloud API
- **IA** : NVIDIA API (Llama 3.3 70B Instruct)
- **Tests** : Jest
- **Hébergement** : Vercel (serverless), n8n, Termux ou VPS low-cost

---

## Démarrage rapide

### 1. Prérequis

- Node.js installé (version recommandée : 18+)
- Un compte Meta Developer avec un numéro WhatsApp de test
- Une clé API NVIDIA

### 2. Cloner le projet

```bash
git clone https://github.com/beniokms11/okms-whatsapp-bot.git
cd okms-whatsapp-bot
```

### 3. Installer les dépendances

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

### 6. Déployer

Le projet est prêt pour un déploiement sur **Vercel** (configuration incluse dans `vercel.json`).
Tu peux aussi exposer ton serveur en local avec ngrok pour connecter le webhook Meta.

---

## Flux général du bot

1. L'utilisateur envoie un message à ton numéro WhatsApp
2. Meta envoie un webhook HTTP à ton serveur (`/api/webhook`)
3. Le serveur formate la requête et appelle le LLM NVIDIA
4. La réponse de l'IA est renvoyée à l'utilisateur sur WhatsApp

---

## Déploiement

Les scénarios visés :

- **Vercel** : déploiement serverless automatique (configuration incluse)
- **n8n / make.com** : intégration du bot dans des workflows no-code
- **Termux / Android** : expérimentation locale pour devs sans serveur dédié
- **VPS / PaaS** : petit serveur Node.js pour déploiement continu

---

## Roadmap

- [x] Intégration WhatsApp / IA de base
- [x] Gestion du contexte de conversation par utilisateur
- [x] Gestion des erreurs et logs
- [x] Tests unitaires
- [ ] Templates de prompts pour cas d'usage (support client, rendez-vous, leads)
- [ ] Intégration simple avec n8n (exemples de workflows)
- [ ] Script d'installation rapide sur Termux
- [ ] Interface d'admin minimale (configuration, logs, monitoring)

Les issues et pull requests sont les bienvenues.

---

## Contribution

Tu peux contribuer en :

- ouvrant une issue pour signaler un bug ou proposer une idée
- soumettant une pull request avec une amélioration
- partageant des exemples d'usage (templates de messages, workflows, etc.)

---

## Licence

Ce projet est publié sous licence MIT.
Tu es libre de l'utiliser, le modifier et le distribuer, tant que tu inclus la licence originale.

---

## À propos

Ce projet est maintenu par OKOUMASSOUN Ganelle Béni Koba (@beniokms11).
Il est pensé pour aider les développeurs et entrepreneurs d'Afrique francophone à déployer rapidement des assistants IA sur un canal critique : WhatsApp.
