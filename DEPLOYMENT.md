# DENTIRO - Guide de Déploiement sur Vercel

## Vue d'Ensemble

Ce guide vous accompagne dans le déploiement de l'application DENTIRO sur Vercel, de la configuration des webhooks n8n jusqu'à la mise en production.

---

## Prérequis

- [ ] Compte Vercel (gratuit ou Pro)
- [ ] Instance n8n configurée et accessible
- [ ] Compte GitHub avec accès au repository
- [ ] Webhooks n8n configurés pour:
  - Gestion des leads (`VITE_WEBHOOK_LEADS`)
  - Chatbot Scalint (`VITE_WEBHOOK_CHATBOT`)

---

## Étape 1: Configuration des Webhooks n8n

### 1.1 Webhook pour la Gestion des Leads

Créez un workflow n8n avec les endpoints suivants:

**Endpoint:** `https://your-n8n-instance.com/webhook/dentist-leads`

**Méthodes supportées:**
- `GET` - Récupération de tous les leads
- `POST` - Création d'un nouveau lead
- `PUT` - Mise à jour d'un lead existant
- `DELETE` - Suppression d'un lead (avec paramètre `?id=`)

**Format de données (Lead):**
```json
{
  "id": "unique-id",
  "name": "Nom du patient",
  "email": "patient@example.com",
  "phone": "+1234567890",
  "leadType": "appointment|emergency|question",
  "status": "new|contacted|qualified|scheduled|no-show|completed",
  "description": "Description de la demande",
  "visitDate": "2026-02-20T14:30:00.000Z",
  "reminderSent": false,
  "reminderDate": null,
  "createdAt": "2026-02-18T10:00:00.000Z"
}
```

### 1.2 Webhook pour le Chatbot Scalint

**Endpoint:** `https://your-n8n-instance.com/webhook/scalint-chatbot`

**Méthode:** `POST`

**Payload:**
```json
{
  "message": "Message de l'utilisateur",
  "sessionId": "session-unique-id",
  "context": {
    "currentPage": "home|strategy|form|admin"
  }
}
```

**Réponse attendue:**
```json
{
  "response": "Réponse du chatbot",
  "sessionId": "session-unique-id"
}
```

---

## Étape 2: Déploiement sur Vercel

### 2.1 Via l'Interface Vercel (Recommandé)

1. **Connectez votre repository GitHub:**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Importez le repository `dentist-lead-qualification`

2. **Configuration du projet:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Variables d'environnement:**
   
   Ajoutez ces variables dans les paramètres du projet:
   
   | Variable | Valeur | Description |
   |----------|--------|-------------|
   | `VITE_WEBHOOK_LEADS` | `https://your-n8n.com/webhook/dentist-leads` | Endpoint n8n pour les leads |
   | `VITE_WEBHOOK_CHATBOT` | `https://your-n8n.com/webhook/scalint-chatbot` | Endpoint n8n pour le chatbot |

4. **Déploiement:**
   - Cliquez sur "Deploy"
   - Attendez que le build se termine (environ 2-3 minutes)
   - Votre application sera disponible sur `https://your-project.vercel.app`

### 2.2 Via Vercel CLI

```bash
# Installation de Vercel CLI
npm install -g vercel

# Déploiement depuis le terminal
cd dentist-lead-qualification
vercel

# Suivez les instructions:
# - Sélectionnez votre scope
# - Confirmez le nom du projet
# - Confirmez les paramètres détectés

# Ajoutez les variables d'environnement
vercel env add VITE_WEBHOOK_LEADS
vercel env add VITE_WEBHOOK_CHATBOT

# Déploiement en production
vercel --prod
```

---

## Étape 3: Configuration Post-Déploiement

### 3.1 Configuration du Domaine Personnalisé (Optionnel)

1. Allez dans les paramètres du projet sur Vercel
2. Section "Domains"
3. Ajoutez votre domaine personnalisé (ex: `dentiro.votreclinique.com`)
4. Suivez les instructions pour configurer les DNS

### 3.2 Test du Déploiement

Vérifiez que toutes les fonctionnalités fonctionnent:

- [ ] Navigation entre les pages (Accueil, Stratégie, Formulaire, Admin)
- [ ] Formulaire de lead - soumission et validation
- [ ] Dashboard Admin - liste des leads
- [ ] Dashboard Admin - filtres et recherche
- [ ] Dashboard Admin - création de nouveau lead
- [ ] Dashboard Admin - édition de lead
- [ ] Dashboard Admin - suppression de lead
- [ ] Chatbot - ouverture et interaction
- [ ] Responsive design - test mobile et tablette

### 3.3 Configuration CORS sur n8n

Si vous rencontrez des erreurs CORS, configurez votre workflow n8n:

1. Ajoutez un nœud "Response" après votre webhook
2. Configurez les headers:
```json
{
  "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

---

## Étape 4: Workflows n8n Recommandés

### 4.1 Workflow de Rappel Automatique (24h avant RDV)

**Déclencheur:** Cron - Tous les jours à 10h00

**Logique:**
1. Récupérer tous les leads avec `status: "scheduled"`
2. Filtrer ceux dont `visitDate` = demain
3. Pour chaque lead:
   - Envoyer SMS via Twilio/WhatsApp
   - Mettre à jour `reminderSent: true`
   - Mettre à jour `reminderDate: now()`

### 4.2 Workflow de Relance No-Show

**Déclencheur:** Cron - Toutes les 15 minutes

**Logique:**
1. Récupérer tous les leads avec `status: "scheduled"`
2. Filtrer ceux dont `visitDate` < now() - 15 minutes
3. Pour chaque lead:
   - Changer `status: "no-show"`
   - Envoyer SMS de relance
   - Notifier le staff via email/Slack

### 4.3 Workflow de Qualification Automatique

**Déclencheur:** Webhook `POST /dentist-leads`

**Logique:**
1. Recevoir le nouveau lead
2. Analyser `leadType` et `description` avec OpenAI
3. Assigner un score de priorité (0-100)
4. Si `leadType: "emergency"` → Notification immédiate
5. Sauvegarder dans la base de données
6. Envoyer email de confirmation au patient

---

## Étape 5: Monitoring et Maintenance

### 5.1 Analytics Vercel

Activez Vercel Analytics pour suivre:
- Nombre de visiteurs
- Performance (Core Web Vitals)
- Taux d'erreur

### 5.2 Logs Vercel

Consultez les logs en temps réel:
```bash
vercel logs
```

Ou via le dashboard Vercel:
- Projet → Functions → View Logs

### 5.3 Mises à Jour

Pour déployer une mise à jour:

**Méthode Git (Automatique):**
```bash
git add .
git commit -m "Update: description de la mise à jour"
git push origin main
```
Vercel déploiera automatiquement.

**Méthode Manuelle:**
```bash
vercel --prod
```

---

## Dépannage

### Problème: Les variables d'environnement ne sont pas chargées

**Solution:**
- Vérifiez que les variables commencent par `VITE_`
- Redéployez le projet après ajout de variables
- Videz le cache du navigateur

### Problème: Erreur 404 sur les routes

**Solution:**
- Vérifiez que `vercel.json` est présent
- Le fichier doit contenir la configuration de réécriture SPA

### Problème: Build échoue

**Solution:**
```bash
# Localement, testez le build
npm run build

# Vérifiez les erreurs TypeScript
npm run lint
```

### Problème: Webhook n8n inaccessible

**Solution:**
- Vérifiez que l'URL du webhook est correcte
- Testez le webhook directement avec curl:
```bash
curl -X GET https://your-n8n.com/webhook/dentist-leads
```
- Vérifiez les paramètres CORS sur n8n

---

## Checklist de Déploiement

Avant de considérer le déploiement comme terminé:

- [x] Build TypeScript réussi (`npm run build`)
- [x] `vercel.json` configuré
- [ ] Variables d'environnement `VITE_WEBHOOK_LEADS` ajoutées
- [ ] Variables d'environnement `VITE_WEBHOOK_CHATBOT` ajoutées
- [ ] Webhooks n8n fonctionnels (testés manuellement)
- [ ] Application déployée sur Vercel
- [ ] Tests fonctionnels complets réussis
- [ ] CORS configuré sur n8n si nécessaire
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Workflows n8n de rappel automatique configurés
- [ ] Workflows n8n de no-show configurés
- [ ] Monitoring activé (Vercel Analytics)

---

## Support et Ressources

- **Documentation Vercel:** https://vercel.com/docs
- **Documentation n8n:** https://docs.n8n.io
- **Documentation Vite:** https://vitejs.dev/guide/
- **React Router:** https://reactrouter.com/

---

## Architecture de Production

```
[Utilisateur Web/Mobile]
       |
       v
[Vercel CDN] (dentiro.vercel.app)
       |
       v
[Application React/Vite]
       |
       +---> [n8n Webhooks]
             |
             +---> [Base de Données]
             +---> [Twilio/WhatsApp API]
             +---> [OpenAI API]
             +---> [Email Service]
```

---

**Date de dernière mise à jour:** 18 Février 2026  
**Version:** 1.0
