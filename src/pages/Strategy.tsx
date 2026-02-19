import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Strategy.css';

const Strategy: React.FC = () => {
  const [expandedJob, setExpandedJob] = useState(false);

  const jobDescription = `Conception & Blueprint de Workflow d'Agent IA Réceptionniste Simplifié pour Clinique Dentaire

Objectif : Développer un blueprint détaillé pour un workflow automatisé capable de qualifier un nouveau lead, envoyer des rappels RDV personnalisés et relancer les no-shows.`;

  const jobDescriptionFull = `Conception & Blueprint de Workflow d'Agent IA Réceptionniste Simplifié pour Clinique Dentaire

Objectif : Développer un blueprint détaillé pour un workflow automatisé capable de :
- Qualifier un nouveau lead venant d'un formulaire web (nom, tel, e-mail, besoin principal)
- Envoyer un rappel de RDV personnalisé par SMS/WhatsApp 24h avant RDV
- Relancer proactivement un "no-show" par SMS et proposer de replanifier

Livrables Attendus :
- Document Blueprint Détaillé (PDF, 2-3 pages)
- Description du workflow (logique, étapes clés)
- Liste des outils IA/automatisation suggérés
- Diagramme de flux visuel simple
- Exemples concrets des messages SMS (rappel, relance no-show)
- Hypothèses et limites du système proposé`;

  return (
    <div className="strategy-container">
      <header className="strategy-header">
        <div className="header-content">
          <div className="header-left">
            <h1>DENTIRO</h1>
          </div>
          <div className="header-center">
            <div className="header-search">
              <span className="header-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Rechercher..."
                className="header-search-input"
                disabled
              />
            </div>
          </div>
          <div className="header-right">
            <Link
              className="header-text-button"
              to="/lead-form"
              title="Nouveau lead"
            >
              Formulaire
            </Link>
            <Link
              className="header-text-button"
              to="/admin"
              title="Admin CRM"
            >
              CRM
            </Link>
          </div>
        </div>
      </header>

      <div className="strategy-content">
        {/* Section 1: Job Description */}
        <section className="strategy-section">
          <h2>Spécification du Projet</h2>
          <div className="content-block">
            <div className="job-description">
              <p className="job-title-preview">
                {expandedJob ? jobDescriptionFull : jobDescription}
              </p>
              <button
                className="btn btn-secondary read-more-btn"
                onClick={() => setExpandedJob(!expandedJob)}
              >
                {expandedJob ? 'Voir moins' : 'Voir plus'}
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Tool Stack */}
        <section className="strategy-section">
          <h2>Stack Technologique</h2>
          <div className="content-block">
            <div className="tool-stack">
              <div className="tool-card">
                <h3>n8n</h3>
                <p>Orchestration des workflows d'automatisation et gestion des webhooks</p>
              </div>
              <div className="tool-card">
                <h3>React</h3>
                <p>Interface web pour formulaire de leads et dashboard CRM</p>
              </div>
              <div className="tool-card">
                <h3>OpenAI</h3>
                <p>IA pour chatbot intelligent et qualification des leads</p>
              </div>
              <div className="tool-card">
                <h3>WaSender API</h3>
                <p>Envoi de messages WhatsApp/SMS automatisés aux patients</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Lead Form */}
        <section className="strategy-section">
          <h2>Formulaire de Lead - Flux & Architecture</h2>
          <div className="content-block">
            <h3>Workflow du Formulaire (2 Étapes)</h3>
            <div className="form-flow">
              <div className="flow-step">
                <h4>Étape 1 : Informations Personnelles</h4>
                <ul>
                  <li><strong>Nom Complet</strong> - Requis</li>
                  <li><strong>Numéro de Téléphone</strong> - Requis (Format: +1 (XXX) XXX-XXXX)</li>
                  <li><strong>Email</strong> - Requis (Google Calendar)</li>
                  <li><strong>Raison de la Demande</strong> - Requis (Rendez-vous, Urgence, Question)</li>
                  <li><strong>Description</strong> - Optionnel (Détails de la visite)</li>
                </ul>
              </div>
              <div className="flow-arrow">→</div>
              <div className="flow-step">
                <h4>Étape 2 : Disponibilité</h4>
                <ul>
                  <li><strong>Date & Heure Souhaitées</strong> - Requis (Calendrier intégré)</li>
                </ul>
              </div>
            </div>

            <h3>JSON Envoyé à n8n</h3>
            <div className="json-example">
              <p className="json-label">Webhook POST → https://n8n.systemifyautomation.com/webhook/dentist-leads</p>
              <pre className="json-code">{`{
  "nom": "Jean Dupont",
  "email": "jean@email.com",
  "téléphone": "+1 (514) 123-4567",
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
}`}</pre>
            </div>

            <h3>Fonctionnement</h3>
            <ul>
              <li><strong>Frontend (React):</strong> Collecte les données + validation</li>
              <li><strong>Webhook Trigger:</strong> POST JSON à l'URL n8n configurable</li>
              <li>Backup local en localStorage si submission échoue</li>
              <li><strong>Réponse:</strong> Message de confirmation "Merci! Notre équipe vous contactera bientôt"</li>
              <li><strong>Next Step:</strong> n8n reçoit le webhook et lance les automatisations</li>
            </ul>
          </div>
        </section>

        {/* Section 4: n8n Workflow */}
        <section className="strategy-section">
          <h2>Workflow n8n - Automatisation Complète</h2>
          <div className="content-block workflow-centered">
            <div className="n8n-workflow">
              <div className="workflow-step step-1">
                <div className="step-title">1. Webhook Reçu</div>
                <p>Lead soumis via formulaire web</p>
              </div>
              
              <div className="workflow-arrow">↓</div>
              
              <div className="workflow-step step-2">
                <div className="step-title">2. Réponse Immédiate</div>
                <p>HTTP 202 (Accepted) → Confirmation UX</p>
                <small>Assure la réactivité</small>
              </div>

              <div className="workflow-arrow">↓</div>

              <div className="workflow-step step-3">
                <div className="step-title">3. Database Write</div>
                <p>Sauvegarde lead dans n8n DB</p>
                <small>Nom, Tél, Email, Type, Date</small>
              </div>

              <div className="workflow-arrow">↓</div>

              <div className="workflow-step step-4">
                <div className="step-title">4. OpenAI (GPT-4)</div>
                <p>Crée conversation d'accueil</p>
                <small>Utilise system prompt personnalisé</small>
              </div>

              <div className="workflow-arrow">↓</div>

              <div className="workflow-step step-5">
                <div className="step-title">5. WaSender API</div>
                <p>Envoi WhatsApp au patient</p>
                <small>Message généré par OpenAI</small>
              </div>
            </div>

            <div className="n8n-diagram">
              <p className="diagram-label">Workflow complet en n8n.systemifyautomation.com</p>
              <img 
                src="/Scalint - Leads Workflow.png" 
                alt="n8n Workflow Diagram" 
                className="workflow-diagram-image"
                style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '8px' }}
              />
              <p className="diagram-note">✅ Workflow testé et publié</p>
            </div>
          </div>
        </section>

        {/* Section 5: Availability Workflow */}
        <section className="strategy-section">
          <h2>Workflow n8n - Disponibilites Mensuelles</h2>
          <div className="content-block">
            <h3>Objectif</h3>
            <p>
              Ce workflow sert a recuperer les disponibilites du mois depuis Google Calendar afin de
              desactiver les plages deja reservees dans le selecteur de date/heure.
            </p>

            <h3>Fonctionnement</h3>
            <ul>
              <li><strong>Webhook GET:</strong> accepte les parametres <em>month_start</em> et <em>month_end</em></li>
              <li><strong>Google Calendar:</strong> liste les evenements confirmes dans cette plage</li>
              <li><strong>Response:</strong> renvoie un tableau <em>booked_slots</em> avec {`{ start, end }`}</li>
              <li><strong>Frontend:</strong> bloque les creneaux correspondants dans le calendrier</li>
            </ul>

            <div className="n8n-diagram">
              <p className="diagram-label">Workflow disponibilites mensuelles</p>
              <img
                src="/Scalint - Get Booked Slots.png"
                alt="Workflow n8n pour recuperer les creneaux reserves"
                className="workflow-diagram-image"
                style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '8px' }}
              />
              <p className="diagram-note">✅ Workflow publie pour l'API de disponibilites</p>
            </div>
          </div>
        </section>

        {/* Section 6: Reminder Workflow */}
        <section className="strategy-section">
          <h2>Workflow n8n - Rappel WhatsApp 24h</h2>
          <div className="content-block">
            <h3>Objectif</h3>
            <p>
              Ce workflow envoie un message WhatsApp automatique quand il reste moins de 24h avant la
              date de visite.
            </p>

            <h3>Fonctionnement</h3>
            <ul>
              <li><strong>Schedule Trigger:</strong> lance le workflow a intervalle regulier</li>
              <li><strong>Get row(s):</strong> recupere les leads planifies</li>
              <li><strong>Date & Time:</strong> calcule la difference avec la date de visite</li>
              <li><strong>Filter:</strong> garde uniquement les RDV a moins de 24h</li>
              <li><strong>Send WhatsApp DM:</strong> envoie le rappel au patient</li>
            </ul>

            <h3>Message WhatsApp</h3>
            <div className="json-example">
              <pre className="json-code">{`Salut {prenom},
Petit rappel: ton rendez-vous est dans 24h.
Si tu dois annuler ou reprogrammer, réponds à ce message.

À bientôt! 😊`}</pre>
            </div>

            <h3>Diagramme de flux</h3>
            <div className="workflow-centered">
              <div className="n8n-workflow">
                <div className="workflow-step step-1">
                  <div className="step-title">1. Schedule Trigger</div>
                  <p>Declencheur planifie</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-2">
                  <div className="step-title">2. Get Uninformed Leads</div>
                  <p>Recuperer les leads non informes</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-3">
                  <div className="step-title">3. Calculate Time Left</div>
                  <p>Comparer la date de visite</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-4">
                  <div className="step-title">4. Filtre &lt; 24h</div>
                  <p>Garder les RDV imminents</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-5">
                  <div className="step-title">5. Send WhatsApp DM</div>
                  <p>Envoi du rappel</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-6">
                  <div className="step-title">6. Update Lead</div>
                  <p>reminderSent = true</p>
                  <small>reminderDate = now()</small>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-7">
                  <div className="step-title">7. Loop Informed Leads</div>
                  <p>Traiter chaque lead</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-8">
                  <div className="step-title">8. Get Conversation</div>
                  <p>Recuperer la discussion WhatsApp</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-9">
                  <div className="step-title">9. Update Conversation</div>
                  <p>Archiver la reponse</p>
                </div>
              </div>
            </div>

            <div className="n8n-diagram">
              <p className="diagram-label">Workflow rappel WhatsApp 24h</p>
              <img
                src="/Scalint - Reminder workflow.png"
                alt="Workflow n8n pour envoyer les rappels WhatsApp 24h"
                className="workflow-diagram-image"
                style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '8px' }}
              />
              <p className="diagram-note">✅ Workflow publie pour les rappels automatiques</p>
            </div>
          </div>
        </section>

        {/* Section 7: No-Show Workflow */}
        <section className="strategy-section">
          <h2>Workflow n8n - Gestion No-Show</h2>
          <div className="content-block">
            <h3>Objectif</h3>
            <p>
              Ce workflow detecte les rendez-vous manques, notifie le patient et met a jour les
              enregistrements pour relancer ou reprogrammer.
            </p>

            <h3>Fonctionnement</h3>
            <ul>
              <li><strong>Schedule Trigger:</strong> lance la verification des no-shows</li>
              <li><strong>Get no-shows:</strong> recupere les RDV rates</li>
              <li><strong>Send WhatsApp DM:</strong> envoie le message de relance</li>
              <li><strong>Edit Fields:</strong> met a jour le statut du lead</li>
              <li><strong>Move records:</strong> ajoute aux no-shows et retire des leads actifs</li>
              <li><strong>Loop:</strong> met a jour la conversation WhatsApp</li>
            </ul>

            <h3>Message WhatsApp No-Show</h3>
            <div className="json-example">
              <pre className="json-code">{`Salut {prenom},
Nous avons remarque que tu n'as pas pu venir a ton rendez-vous aujourd'hui.
Tu peux reprogrammer ici: {reschedule_url}

Si tu as besoin d'aide, reponds a ce message.

A bientot! 😊`}</pre>
            </div>

            <h3>Diagramme de flux</h3>
            <div className="workflow-centered">
              <div className="n8n-workflow">
                <div className="workflow-step step-1">
                  <div className="step-title">1. Schedule Trigger</div>
                  <p>Declencheur planifie</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-2">
                  <div className="step-title">2. Get No-Shows</div>
                  <p>Recuperer les RDV rates</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-3">
                  <div className="step-title">3. Send WhatsApp DM</div>
                  <p>Message de relance</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-4">
                  <div className="step-title">4. Edit Fields</div>
                  <p>Statut = no-show</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-5">
                  <div className="step-title">5. Add to No-Shows</div>
                  <p>Ajout base no-show</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-6">
                  <div className="step-title">6. Remove from Active</div>
                  <p>Retrait base principale</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-7">
                  <div className="step-title">7. Loop No-Shows</div>
                  <p>Traiter chaque no-show</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-8">
                  <div className="step-title">8. Get Conversation</div>
                  <p>Recuperer discussion</p>
                </div>

                <div className="workflow-arrow">↓</div>

                <div className="workflow-step step-9">
                  <div className="step-title">9. Update Conversation</div>
                  <p>Archiver la reponse</p>
                </div>
              </div>
            </div>

            <div className="n8n-diagram">
              <p className="diagram-label">Workflow no-shows</p>
              <img
                src="/Scalint - No-shows workflow.png"
                alt="Workflow n8n pour gerer les no-shows"
                className="workflow-diagram-image"
                style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '8px' }}
              />
              <p className="diagram-note">✅ Workflow publie pour la relance no-show</p>
            </div>
          </div>
        </section>

        {/* Section 8: Voice AI Fallback */}
        <section className="strategy-section">
          <h2>Alternative: Retell AI Voice Service</h2>
          <div className="content-block">
            <div className="voice-ai-container">
              <div className="voice-ai-card">
                <h3>🎤 Pourquoi une voix IA?</h3>
                <p>Tous les patients n'ont pas WhatsApp, notamment les personnes âgées qui constituent une part importante de la clientèle dentaire. Une solution de communication vocale élargit la couverture.</p>
              </div>

              <div className="voice-ai-card">
                <h3>📞 Retell AI - Communication Vocale</h3>
                <p><strong>Capacités:</strong></p>
                <ul>
                  <li>Appels automatisés avec voix IA naturelle</li>
                  <li>Reconnaissance vocale pour interactif</li>
                  <li>Prise de rendez-vous directement par appel</li>
                  <li>Rappels RDV personnalisés</li>
                  <li>Relance no-shows avec proposition de reschedule</li>
                </ul>
              </div>

              <div className="voice-ai-card">
                <h3>⚙️ Flux d'Utilisation</h3>
                <p><strong>Intégration dans le workflow:</strong></p>
                <ul>
                  <li>Détection: Lead n'a pas WhatsApp? → Utiliser Retell AI</li>
                  <li>Appel automatisé avec message personnalisé (généré OpenAI)</li>
                  <li>Patient confirme/annule RDV par voix</li>
                  <li>Réponse enregistrée → sauvegardée dans base de données</li>
                  <li>CRM mis à jour avec statut de confirmation</li>
                </ul>
              </div>

              <div className="voice-ai-card">
                <h3>✅ Bénéfices</h3>
                <ul>
                  <li><strong>Couverture 100%:</strong> Tous les patients, quelque soit leur technologie</li>
                  <li><strong>Taux de confirmation ↑:</strong> Les appels vocaux ont meilleur taux de confirmation</li>
                  <li><strong>Réduction no-shows:</strong> Contact direct + rappel vocal = moins d'absences</li>
                  <li><strong>Expérience premium:</strong> Service personnalisé + voix naturelle</li>
                  <li><strong>Compliance:</strong> Conforme RGPD avec enregistrements consentis</li>
                </ul>
              </div>

              <div className="voice-ai-card">
                <h3>💡 Considérations</h3>
                <ul>
                  <li>Coûts: Environ €0.50-1.00 par appel (selon minutes)</li>
                  <li>Temps: Appels 2-3 minutes généralement (rappel + confirmation)</li>
                  <li>Timing: Meilleur entre 10h-17h (pas après 19h)</li>
                  <li>Fallback: Si pas de réponse → Envoi SMS classique</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Strategy;
