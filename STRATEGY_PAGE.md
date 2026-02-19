# DENTIRO - Strategy

## Specification du projet

Conception & Blueprint de Workflow d'Agent IA Receptionniste Simplifie pour Clinique Dentaire

Objectif : Developper un blueprint detaille pour un workflow automatise capable de :
- Qualifier un nouveau lead venant d'un formulaire web (nom, tel, e-mail, besoin principal)
- Envoyer un rappel de RDV personnalise par SMS/WhatsApp 24h avant RDV
- Relancer proactivement un "no-show" par SMS et proposer de replanifier

Livrables attendus :
- Document Blueprint Detaille (PDF, 2-3 pages)
- Description du workflow (logique, etapes cles)
- Liste des outils IA/automatisation suggeres
- Diagramme de flux visuel simple
- Exemples concrets des messages SMS (rappel, relance no-show)
- Hypotheses et limites du systeme propose

## Stack technologique

- n8n: Orchestration des workflows d'automatisation et gestion des webhooks
- React: Interface web pour formulaire de leads et dashboard CRM
- OpenAI: IA pour chatbot intelligent et qualification des leads
- WaSender API: Envoi de messages WhatsApp/SMS automatises aux patients

## Formulaire de lead - Flux et architecture

### Workflow du formulaire (2 etapes)

**Etape 1 : Informations personnelles**
- Nom complet (requis)
- Numero de telephone (requis, format +1 (XXX) XXX-XXXX)
- Email (requis, Google Calendar)
- Raison de la demande (requis: rendez-vous, urgence, question)
- Description (optionnel)

**Etape 2 : Disponibilite**
- Date et heure souhaitees (requis, calendrier integre)

### JSON envoye a n8n

Webhook POST -> https://n8n.systemifyautomation.com/webhook/dentist-leads

```json
{
  "nom": "Jean Dupont",
  "email": "jean@email.com",
  "telephone": "+1 (514) 123-4567",
  "typeDemande": "appointment",
  "statut": "phone-unconfirmed",
  "description": "Nettoyage dentaire",
  "dateVisite": "2025-02-25T14:30:00.000Z",
  "url_calendrier": "https://calendar.google.com/calendar/event?eid=evt-001",
  "id_calendrier": "cal_001",
  "url_reprogrammation": "https://calendar.google.com/calendar/event?eid=evt-001-resched",
  "url_annulation": "https://calendar.google.com/calendar/event?eid=evt-001-cancel",
  "rappelEnvoye": false,
  "dateRappel": null,
  "updatedAt": "2025-02-18T17:22:45.123Z",
  "createdAt": "2025-02-18T17:22:45.123Z"
}
```

### Fonctionnement

- Frontend (React): collecte des donnees et validation
- Webhook Trigger: POST JSON a l'URL n8n configurable
- Backup local en localStorage si la soumission echoue
- Reponse: message de confirmation "Merci! Notre equipe vous contactera bientot"
- Next Step: n8n recoit le webhook et lance les automatisations

## Workflow n8n - Automatisation complete

Etapes:
1. Webhook recu (lead soumis via formulaire web)
2. Reponse immediate (HTTP 202 -> confirmation UX)
3. Database write (sauvegarde lead dans n8n DB)
4. OpenAI (GPT-4) (creer conversation d'accueil)
5. WaSender API (envoi WhatsApp au patient)

Image:
- /Scalint - Leads Workflow.png

## Workflow n8n - Disponibilites mensuelles

### Objectif

Recuperer les disponibilites du mois depuis Google Calendar afin de desactiver les plages deja reservees dans le selecteur de date/heure.

### Fonctionnement

- Webhook GET: accepte les parametres month_start et month_end
- Google Calendar: liste les evenements confirmes dans cette plage
- Response: renvoie un tableau booked_slots avec { start, end }
- Frontend: bloque les creneaux correspondants dans le calendrier

Image:
- /Scalint - Get Booked Slots.png

## Workflow n8n - Rappel WhatsApp 24h

### Objectif

Envoyer un message WhatsApp automatique quand il reste moins de 24h avant la date de visite.

### Fonctionnement

- Schedule Trigger: lance le workflow a intervalle regulier
- Get row(s): recupere les leads planifies
- Date & Time: calcule la difference avec la date de visite
- Filter: garde uniquement les RDV a moins de 24h
- Send WhatsApp DM: envoie le rappel au patient
- Update Lead: reminderSent = true, reminderDate = now()
- Loop Informed Leads: traiter chaque lead
- Get Conversation: recuperer la discussion WhatsApp
- Update Conversation: archiver la reponse

### Message WhatsApp

```
Salut {prenom},
Petit rappel: ton rendez-vous est dans 24h.
Si tu dois annuler ou reprogrammer, reponds a ce message.

A bientot! 😊
```

Image:
- /Scalint - Reminder workflow.png

## Workflow n8n - Gestion no-show

### Objectif

Detecter les rendez-vous manques, notifier le patient et mettre a jour les enregistrements pour relancer ou reprogrammer.

### Fonctionnement

- Schedule Trigger: lance la verification des no-shows
- Get no-shows: recupere les RDV rates
- Send WhatsApp DM: envoie le message de relance
- Edit Fields: met a jour le statut du lead
- Move records: ajoute aux no-shows et retire des leads actifs
- Loop: met a jour la conversation WhatsApp

### Message WhatsApp No-Show

```
Salut {prenom},
Nous avons remarque que tu n'as pas pu venir a ton rendez-vous aujourd'hui.
Tu peux reprogrammer ici: {reschedule_url}

Si tu as besoin d'aide, reponds a ce message.

A bientot! 😊
```

Image:
- /Scalint - No-shows workflow.png

## Alternative: Retell AI Voice Service

### Pourquoi une voix IA?

Tous les patients n'ont pas WhatsApp, notamment les personnes agees qui constituent une part importante de la clientele dentaire. Une solution de communication vocale elargit la couverture.

### Retell AI - Communication vocale

Capacites:
- Appels automatisees avec voix IA naturelle
- Reconnaissance vocale pour interactif
- Prise de rendez-vous directement par appel
- Rappels RDV personnalises
- Relance no-shows avec proposition de reschedule

### Flux d'utilisation

- Detection: lead n'a pas WhatsApp -> utiliser Retell AI
- Appel automatise avec message personnalise (genere OpenAI)
- Patient confirme/annule RDV par voix
- Reponse enregistree -> sauvegardee dans base de donnees
- CRM mis a jour avec statut de confirmation

### Benefices

- Couverture 100%: tous les patients, quel que soit leur technologie
- Taux de confirmation en hausse: les appels vocaux ont meilleur taux de confirmation
- Reduction no-shows: contact direct + rappel vocal
- Experience premium: service personnalise + voix naturelle
- Compliance: conforme RGPD avec enregistrements consentis

### Considerations

- Couts: environ EUR 0.50-1.00 par appel (selon minutes)
- Temps: appels 2-3 minutes en general
- Timing: meilleur entre 10h-17h (pas apres 19h)
- Fallback: si pas de reponse -> envoi SMS classique
