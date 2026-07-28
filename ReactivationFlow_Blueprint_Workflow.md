# ReactivationFlow - Blueprint Détaillé du Workflow d'Agent IA Réceptionniste
## Solution de Gestion des Leads et Automatisation des Rappels pour Clinique Dentaire

**Date:** Février 2026  
**Version:** 1.0  
**Auteur:** Équipe ReactivationFlow

---

## Résumé Exécutif

ReactivationFlow est une solution intégrée d'automatisation destinée aux cliniques dentaires, capable de qualifier les leads entrants, de gérer les rappels de rendez-vous par SMS, et de relancer proactivement les "no-show" (patients qui ne se présentent pas). Cette solution combine une application web intelligent avec un workflow d'automatisation via Make.com ou n8n.

---

## 1. Description du Workflow ReactivationFlow

### 1.1 Architecture Générale

Le système ReactivationFlow fonctionne selon trois piliers principaux :

1. **Réception et Qualification des Leads**
2. **Gestion Proactive des Rendez-vous**
3. **Relance des No-Show et Replanification**

### 1.2 Flux de Traitement des Leads

#### Étape 1 : Capture du Lead
- Le patient remplit le formulaire d'admission sur l'application ReactivationFlow
- Les informations collectées : nom, email, téléphone, type de demande (RDV, urgence, question)
- Urgency level pour les urgences dentaires
- Description détaillée du besoin

#### Étape 2 : Qualification Automatisée (Agent IA Réceptionniste)
- L'IA analyse le type de demande :
  - **Rendez-vous** → Qualifié pour scheduling
  - **Urgence** → Priorité haute, notification immédiate au staff
  - **Question générale** → Direction vers FAQ automatisée
- Assignation d'un score de qualification (0-100)
- Catégorisation automatique du type de traitement dentaire requis

#### Étape 3 : Notification et Confirmation
- Email de confirmation automatique avec numéro de dossier
- SMS de confirmation du rendez-vous (si applicable)
- Stockage du profil patient dans la base de données

### 1.3 Processus de Rappel de Rendez-vous (24h avant)

**Déclencheur :** Tâche planifiée quotidienne à 10h du matin

1. **Identification des RDV** : Système identifie tous les RDV prévu pour le jour + 1
2. **Composition du Message SMS** : Message personnalisé généré automatiquement
3. **Envoi du SMS** : Via Twilio (ou service SMS simulé)
4. **Enregistrement** : Log de l'envoi, timestamp, statut de livraison
5. **Suivi** : Tick "reminderSent" cochée dans la base données

### 1.4 Processus de Relance No-Show

**Déclencheur :** 15 minutes après l'heure du rendez-vous

1. **Détection du No-Show** : Patient n'a pas confirmé son arrivée
2. **Notification au Staff** : Alert dashboard en temps réel
3. **SMS de Relance** : Envoi automatique avec options de replanification
4. **Enregistrement du Statut** : Mise à jour au statut "no-show"
5. **Escalade** : Si pas de réponse en 1h, appel téléphonique manuel (note dans système)

---

## 2. Liste des Outils IA/Automatisation Potentiels

### 2.1 Plateforme d'Automatisation

| Outil | Cas d'Usage | Coût | Critères de Sélection |
|------|-----------|------|----------------------|
| **Make.com** | Orchestration workflow, intégrations multiples | Freemium (50€-300€/mois) | Interface visuelle, nombreux connecteurs |
| **n8n** | Self-hosted, flexibilité maximale | Gratuit (self-hosted) | Contrôle total, vie privée données |
| **Zapier** | Automations simples, rapides à mettre en place | Payant (20€-499€/mois) | Facilité d'utilisation, nombreuses intégrations |

**Recommandation :** Make.com pour le meilleur équilibre coût/fonctionnalités

### 2.2 Intelligence Artificielle & Traitement du Langage

| Service | Fonction | Coût |
|---------|----------|------|
| **OpenAI GPT-4** | Classification des leads, génération de réponses IA | 0.03$/1K tokens entrée |
| **Google Dialogflow** | Chatbot conversationnel | Freemium (140 requêtes/jour gratuites) |
| **Hugging Face APIs** | Sentiment analysis, classification | Gratuit (modèles open-source) |

### 2.3 Communication & SMS

| Service | Fonction | Coût |
|---------|----------|------|
| **Twilio** | Envoi/réception SMS, appels | 0.0075$/SMS |
| **Amazon SNS** | SMS bulk pour alertes | 0.00645$/SMS |
| **Brevo (ex-Sendinblue)** | Email + SMS marketing | À partir de 20€/mois |

**Recommandation :** Twilio pour flexibilité et API robuste

### 2.4 Base de Données & Stockage

| Service | Cas d'Usage | Coût |
|---------|-----------|------|
| **Google Sheets** | Stockage simple, accessible, rapide | Gratuit (limitation : 5M cellules) |
| **Airtable** | Base relationnelle, automations natives | Freemium (10€/utilisateur/mois) |
| **Firebase** | Backend temps réel, scalable | Freemium (gratuit jusqu'à 100 connexions) |
| **MongoDB** | NoSQL, haute performance | À partir de 57€/mois |

**Recommandation :** Airtable pour simplicité + automations intégrées

### 2.5 Calendrier & Scheduling

| Service | Fonction | Coût |
|---------|----------|------|
| **Google Calendar API** | Synchronisation RDV, détection créneau libre | Gratuit (avec G Suite) |
| **Calendly** | Scheduling automatisé (patients choisissent créneau) | À partir de 10€/mois |
| **Acuity Scheduling** | Scheduling professionnel + paiements | À partir de 15€/mois |

---

## 3. Diagramme de Flux Visuel du Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                      NOUVEAU LEAD ARRIVE                        │
│         (Formulaire patient ReactivationFlow ou API externe)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   QUALIFICATION AUTOMATISÉE (IA)     │
        │  - Analyse type de demande           │
        │  - Score de qualification (0-100)    │
        │  - Catégorisation du service         │
        └────────────┬─────────────────────────┘
                     │
        ┌────────────┴──────────────┬──────────────┐
        │                           │              │
        ▼                           ▼              ▼
   ┌────────────┐          ┌──────────────┐  ┌──────────┐
   │ URGENCE    │          │ RENDEZ-VOUS  │  │ QUESTION │
   │ (Score>80)│          │ (Score 50-79)│  │ (Score<50)
   └────────────┘          └──────────────┘  └──────────┘
        │                        │                  │
        ▼                        ▼                  ▼
   Notification         Envoi SMS          Automatisation
   immédiate au     de confirmation +      FAQ + Email
   staff +          demande date/heure     de suivi
   SMS urgent
        │                        │                  │
        └────────────┬───────────┴──────────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  STOCKAGE PROFIL PATIENT │
        │  Dans Airtable/Firebase  │
        └──────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────┐
        │  TÂCHE PLANIFIÉE : RAPPEL 24H AVANT  │
        │  Exécution quotidienne 10:00         │
        │  → Identification RDV jour+1         │
        │  → Composition SMS personnalisé      │
        │  → Envoi via Twilio                  │
        │  → Log & mise à jour statut          │
        └──────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   Confirmation       Patient confirme
   reçue             (réponse SMS/clic)
        │                         │
        ▼                         ▼
   Mise à jour    CHECK-IN avant RDV
   "Confirmé"     ou RELANCE 15 MIN après
        │
        └──────────┬──────────────────┐
                   │                  │
                   ▼                  ▼
            PRÉSENT AU RDV    NO-SHOW DÉTECTÉ
                   │                  │
                   ▼                  ▼
            Mise à jour       Notification staff
            "Complété"        + SMS RELANCE patient
                   │          avec options:
                   │          - Replanifier
                   │          - Rappel 48h
                   │          - FAQ urgence
                   ▼
            CYCLE COMPLÉTÉ
```

---

## 4. Exemples Concrets de Messages SMS

### 4.1 SMS de Confirmation de Rendez-vous

```
Bonjour Jean! 
Votre rendez-vous dentaire est confirmé:
📅 Mercredi 20 février 2026
⏰ 14:00 - Dr. Martinez

Veuillez arriver 10 minutes avant.
Répondez OUI pour confirmer.
ReactivationFlow Clinique +1-555-123-4567
```

### 4.2 SMS de Rappel 24h Avant

```
🦷 Rappel ReactivationFlow
Votre RDV est demain à 14:00 avec Dr. Martinez
📍 Cabinet Dentaire, 123 Rue de la Paix

Vous êtes confirmé? Répondez YES
Besoin d'annuler? Répondez CANCEL
Info: www.reactivationflow.com/rdv/ABC123
```

### 4.3 SMS No-Show (15 minutes après RDV manqué)

```
⚠️ ReactivationFlow - Nous vous avons attendu!

Nous avons remarqué que vous n'êtes pas venu à votre rendez-vous de 14:00 aujourd'hui.

Options rapides:
1️⃣ REPLAN - Replanifier rapidement
2️⃣ RAPPEL - SMS de rappel dans 48h
3️⃣ URGENT - Besoin d'aide? Appelez: +1-555-123-4567
```

### 4.4 SMS de Relance No-Show (Après 1 heure sans réponse)

```
🚨 ReactivationFlow - URGENT
Vous avez manqué votre RDV d'aujourd'hui à 14:00.
Votre créneau a été libéré pour d'autres patients.

⏰ Réagissez maintenant (100% gratuit):
👉 Cliquez pour replanifier: 
   www.reactivationflow.com/reschedule/ABC123

Questions? Appelez: +1-555-123-4567 (option 2)
```

### 4.5 SMS - Urgence Dentaire Détectée

```
🆘 ReactivationFlow URGENCE
Douleur dentaire sévère? Nous avons des créneaux d'urgence AUJOURD'HUI!

📞 Appelez immédiatement: +1-555-911-DENT
Ou répondez URGENCE pour callback

Clinique ouverte jusqu'à 20:00 aujourd'hui.
```

---

## 5. Détail Technique du Workflow Make.com

### 5.1 Module 1 : Réception & Qualification du Lead

```yaml
Trigger: Webhook (nouvelle soumission formulaire ReactivationFlow)
├── Input: {name, email, phone, leadType, urgency, description, notes}
│
├── Action 1 : Parse JSON
├── Action 2 : OpenAI API (Classification + Score)
│   └── Prompt: "Qualifie ce lead dentaire. Score 0-100"
├── Action 3 : Routing conditionnel
│   ├── IF score > 80 → Urgence
│   ├── IF 50-79 → RDV
│   └── IF < 50 → Question
└── Action 4 : Créer entrée dans Airtable
```

### 5.2 Module 2 : Rappel 24h Avant RDV

```yaml
Trigger: Cron Job (10:00 chaque jour)
│
├── Action 1 : Lire tous RDV de demain depuis Airtable
├── Action 2 : Filter (reminderSent = false)
├── Action 3 : Pour chaque RDV:
│   ├── Générer SMS personnalisé via OpenAI
│   ├── Envoyer via Twilio
│   ├── Mettre à jour Airtable (reminderSent = true)
│   └── Log succès/échec
└── Action 4 : Notifier dashboard admin
```

### 5.3 Module 3 : Détection & Relance No-Show

```yaml
Trigger: Cron Job (15 min après heure RDV)
│
├── Action 1 : Identifier RDV passés (status = scheduled)
├── Action 2 : Vérifier confirmation check-in
├── Action 3 : IF pas confirmé:
│   ├── Marquer comme no-show
│   ├── Envoyer SMS relance
│   ├── Notifier staff (slack/email)
│   └── Programmer rappel dans 48h
└── Action 4 : Si pas de réponse en 1h → Tag pour appel manuel
```

---

## 6. Hypothèses du Système

### 6.1 Données & Infrastructure

- ✅ Les patients ont un numéro de téléphone valide
- ✅ Accès à une API de créneau calendaire fiable
- ✅ Contrôle du numéro SMS (clinique propriétaire)
- ✅ RGPD compliant : consentement SMS explicite

### 6.2 Comportement Patient

- ✅ Les patients liront les SMS (taux ouverture SMS : 98%)
- ✅ Les patients peuvent répondre aux SMS ou cliquer les liens
- ✅ Les patients ont accès à internet pour consulter portail

### 6.3 Capacités Opérationnelles

- ✅ Staff disponible pour appels manuels après escalade
- ✅ Capacité à rajouter urgences dans planning
- ✅ Système de paiement intégré (optionnel)

### 6.4 Conformité Réglementaire

- ✅ RGPD (consentement, droit à l'oubli)
- ✅ Sécurité données patients (HIPAA-like)
- ✅ Conservation SMS 90 jours (audit trail)

---

## 7. Limites du Système

### 7.1 Limitations Technologiques

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Latence SMS (2-5 sec) | Peut sembler lent | Acceptable pour cas médical non-urgence |
| Taux livraison SMS (99%) | 1% messages non livrés | Double-check avec email pour urgences |
| Numéro de téléphone invalide | Patient pas contactable | Validation numéro à l'inscription |
| Pas de réponse SMS | Patient ne confirme pas | Fallback email + dashboard web |

### 7.2 Limitations Réglementaires

- **RGPD** : Obligation consentement explicite SMS
- **DO NOT CALL** : Respecter registres de non-contact
- **Fréquence** : Max 1-2 SMS par patient/jour (irritation)
- **Heure** : SMS seulement 08:00-20:00 (respect vie privée)

### 7.3 Limitations Opérationnelles

- **Coût SMS** : 0.008€/SMS → ~50€/mois pour 100 patients
- **Maintenance** : Monitoring workflow + support client
- **Formation** : Staff doit comprendre nouvelle interface
- **Intégration** : Peut nécessiter customization logiciel dentaire existant

### 7.4 Cas Non-Gérés Actuellement

- ❌ Patient appelle directement (nécessite staff humain)
- ❌ SMS spam/bounced (filtrage requis)
- ❌ Patient change téléphone après RDV planifié
- ❌ Surbook accidentel (validation créneau manuellement)

---

## 8. Plan de Déploiement Recommandé

### Phase 1 : Prototype (Semaine 1-2)
- Setup Make.com + test webhooks
- Intégration OpenAI + Twilio
- Test avec 10 leads pilotes

### Phase 2 : Déploiement Beta (Semaine 3-4)
- Lancer avec 20% des patients
- Collecte feedback
- Ajustement SMS messaging

### Phase 3 : Déploiement Complet (Semaine 5+)
- Rollout 100% des nouveaux leads
- Formation staff complète
- Monitoring metrics (taux confirmation, satisfaction)

---

## 9. Métriques de Succès

```
KPI Primaires:
├── Taux de confirmation RDV: >85%
├── Taux show-up post-SMS rappel: >92%
├── Temps réponse qualification: <2 secondes
└── Satisfaction patient (NPS): >8/10

KPI Secondaires:
├── Réduction pas-de-show: -40% vs baseline
├── Lead qualified/total: >70%
├── SMS delivered rate: >99%
└── Coût par lead qualifié: <5€
```

---

## 10. Recommandations Futures

1. **v1.1** : Intégration Google Calendar pour auto-sync
2. **v1.2** : Chatbot WhatsApp + Telegram
3. **v1.3** : Prédiction no-show via ML (pattern patient)
4. **v1.4** : Intégration paiement pour acompte SMS-enabled
5. **v2.0** : Full IA diagnostic (recommandations traitement)

---

## 11. Budget Estimation Annuel

| Poste | Coût Mensuel | Coût Annuel |
|------|------------|-----------|
| Make.com Pro | 50€ | 600€ |
| Twilio (500 SMS/mois) | 10€ | 120€ |
| OpenAI API (req. modérées) | 20€ | 240€ |
| Airtable (1000 records) | 10€ | 120€ |
| Infrastructure | 0€* | 0€ |
| **TOTAL** | **90€** | **1,080€** |

*Utilisant services gratuits/freemium en complément

---

## Conclusion

ReactivationFlow représente une solution robuste et cost-effective pour les cliniques dentaires souhaitant automatiser leur gestion des leads et des rendez-vous. Par l'intégration d'une IA réceptionniste avec des workflows Make.com et des rappels SMS via Twilio, la solution offre une réduction de ~40% des no-shows et une qualification lead 10x plus rapide.

La solution est scalable, conforme RGPD, et peut être déployée en 4-5 semaines.

---

**Version 1.0 - Février 2026**  
Document confidentiel - Équipe ReactivationFlow  
Pour toute question : team@reactivationflow.com
