# DENTIRO - Système de Gestion des Demandes Dentaires

DENTIRO est une application web complète conçue pour les cliniques dentaires de Montréal. Elle permet de qualifier les demandes de patients, de gérer les rendez-vous et de relancer automatiquement les absents.

## Caractéristiques Principales

- **Formulaire de Qualification des Leads**: Collecte les informations essentielles des patients (nom, téléphone, email, type de demande)
- **Réceptionniste IA (Chatbot)**: Assistant conversationnel pour répondre aux questions des patients en temps réel
- **Tableau de Bord Administrateur**: Gestion complète des demandes de patients avec filtrage et statuts
- **Suivi en Temps Réel**: Suivi des demandes à travers différents statuts (nouveau, contacté, qualifié, planifié, absent, complété)
- **Design Responsif**: Fonctionne sur ordinateur et appareils mobiles

## Types de Demandes

DENTIRO accepte trois types de demandes:
- **RDV** - Demande de rendez-vous
- **Urgence** - Urgence dentaire (traitement prioritaire)
- **Question Générale** - Questions sur les services

## Démarrage Rapide

### Prérequis

- Node.js (v16 ou plus)
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera disponible à `http://localhost:5173/`

### Compilation

```bash
npm run build
```

## Structure du Projet

```
src/
├── components/
│   └── Chatbot.tsx              # Réceptionniste IA
├── pages/
│   ├── LeadForm.tsx             # Formulaire d'admission patient
│   └── AdminDashboard.tsx       # Tableau de bord de gestion
├── App.tsx                      # Application principale avec routage
├── types.ts                     # Définitions des types TypeScript
└── main.tsx                     # Point d'entrée

DENTIRO_Blueprint_Workflow.md    # Documentation détaillée du workflow
README_FR.md                     # Ce fichier
```

## Stack Technologique

- **Framework Frontend**: React 18
- **Langage**: TypeScript
- **Routage**: React Router v6
- **Style**: CSS
- **Outil de Build**: Vite
- **Linting**: ESLint

## Routes Disponibles

- `/apply` - Formulaire d'admission patient (page d'accueil)
- `/admin` - Tableau de bord administrateur pour la gestion des demandes

## Stockage des Données

Actuellement utilise le localStorage du navigateur pour la persistance des données. En production, devrait être remplacé par une API backend et une base de données.

## Structure des Données

### Interface Lead
```typescript
{
  id: string;                    // Identifiant unique
  name: string;                  // Nom du patient
  email: string;                 // Email du patient
  phone: string;                 // Numéro de téléphone
  leadType: 'appointment' | 'emergency' | 'question'; // Type de demande
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'no-show' | 'completed'; // Statut
  reminderSent?: boolean;        // Rappel SMS envoyé?
  reminderDate?: string;         // Date du rappel
  createdAt: string;             // Date/heure de création
}
```

## Utilisation du Chatbot

Le chatbot DENTIRO reconnaît les mots-clés en français et en anglais pour répondre aux questions courantes:
- Rendez-vous / Appointment
- Urgence / Emergency
- Heures / Hours
- Services
- Paiement / Payment
- Localisation / Location
- Expérience / Experience

## Formulaire Patient Simplifié

Le formulaire de patient est simple et intuitif, collectant uniquement les informations essentielles:

```
Nom Complet *
Numéro de Téléphone *
Adresse Email *
Raison de votre demande * (RDV, Urgence, Question)
```

## Fonctionnalités Futures

- Intégration API backend (Node.js/Express ou autres)
- Système de notification SMS (Intégration Twilio)
- Système de rappels automatiques 24h avant RDV
- Relance automatique des absents (no-show)
- Analyses avancées et rapports
- Intégration avec Make.com ou n8n pour automations
- Intégration avec logiciels de gestion dentaire
- Paiement en ligne
- Multilingue (anglais/français)

## Structure du Workflow DENTIRO

```
Patient → Formulaire → Qualification IA → Admin Dashboard → Gestion RDV → SMS Rappels
                          (Automat.)         (Manuel)
```

Pour plus de détails sur l'architecture du workflow et la vision à long terme, consultez le document `DENTIRO_Blueprint_Workflow.md`.

## Documentation du Workflow

Le document `DENTIRO_Blueprint_Workflow.md` contient:
- Description complète du workflow
- Recommendations d'outils (Make.com, n8n, Zapier, Twilio, Airtable)
- Diagramme de flux détaillé
- Exemples de messages SMS (confirmation, rappel 24h, relance no-show)
- Plan d'implémentation technique
- Budget annuel estimé (~1,080€)
- KPIs de succès

## Localisation

L'application est entièrement en français, optimisée pour les patients de Montréal, Canada.

## Statuts et Cycles de Vie

```
Nouveau (New)
    ↓
Contacté (Contacted)
    ↓
Qualifié (Qualified)
    ↓
Planifié (Scheduled)
    ├→ Absent (No-Show) → Relance
    └→ Complété (Completed)
```

## Commandes Disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Compiler pour la production
npm run build

# Prévisualiser la version compilée
npm run preview

# Vérifier la syntaxe
npm run lint
```

## Support et Développement

Pour toute question ou contribution, veuillez contacter l'équipe DENTIRO.

---

**Version**: 1.0  
**Date**: Février 2026  
**Status**: Production
