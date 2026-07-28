# ReactivationFlow

ReactivationFlow est une plateforme indépendante du secteur d'activité pour la réactivation de leads et l'automatisation des rendez-vous. Elle aide les entreprises de services à capter les demandes, renouer avec les contacts inactifs, confirmer les rendez-vous, relancer les absences et piloter le suivi depuis un CRM unique.

Application de production : [app.reactivation.com](https://app.reactivation.com)

## Fonctionnalités

- Formulaire multilingue de demande et de rendez-vous
- Pipeline de leads et gestion des contacts
- Confirmation, annulation et reprogrammation
- Réactivation des contacts inactifs et des rendez-vous manqués
- Campagnes WhatsApp, e-mail et vocales
- Chatbot web
- Administration avec gestion des rôles

Le vocabulaire par défaut reste générique. Chaque déploiement peut employer « client », « patient », « membre » ou un autre terme adapté, sans imposer un contexte dentaire ou médical au produit.

## Installation locale

Prérequis : une version LTS maintenue de Node.js et npm.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Renseignez les webhooks dans `.env`. Ne versionnez jamais les secrets ou identifiants de production.

## Vérification

```bash
npm run lint
npm run build
```

Avant un déploiement, testez les parcours de demande, connexion, CRM, réservation, annulation, reprogrammation et chatbot. Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour les détails opérationnels.

## Marque et assistants IA

[BRAND.md](BRAND.md) définit le positionnement, la voix et la terminologie. Les prompts système et les profils métier doivent utiliser des variables de configuration pour les services, horaires, prix, coordonnées, liens de réservation et règles d'escalade. Aucune information métier ne doit être inventée ou codée en dur.

