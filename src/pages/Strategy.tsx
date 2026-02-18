import './Strategy.css';

const Strategy = () => {
  return (
    <div className="strategy-page">
      <header className="strategy-header">
        <div className="header-content">
          <h1>SCALINT - Stratégie de Développement</h1>
          <a
            className="header-button"
            href="/admin"
          >
            Retour au CRM
          </a>
        </div>
      </header>

      <div className="strategy-container">
        <section className="strategy-section">
          <h2>Vision et Objectifs</h2>
          <div className="content-block">
            <p>Cette section contient la vision stratégique et les objectifs clés du projet SCALINT.</p>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Analyse du Marché</h2>
          <div className="content-block">
            <h3>Marché Cible</h3>
            <p>Dentistes et cliniques dentaires au Canada</p>
            
            <h3>Besoins Identifiés</h3>
            <ul>
              <li>Automatisation de la qualification des leads</li>
              <li>Réduction du temps de gestion administrative</li>
              <li>Amélioration de la conversion des prospects</li>
              <li>Centralisation des informations patients</li>
            </ul>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Proposition de Valeur</h2>
          <div className="content-block">
            <h3>Pour les Dentistes</h3>
            <ul>
              <li>Gain de temps significatif sur la gestion des rendez-vous</li>
              <li>Interface simple et intuitive</li>
              <li>Assistant IA DENTIRO pour répondre aux questions courantes</li>
              <li>Suivi complet des leads avec statuts personnalisés</li>
            </ul>

            <h3>Différenciation</h3>
            <ul>
              <li>Solution spécialisée pour le secteur dentaire</li>
              <li>Chatbot IA contextuel en français canadien</li>
              <li>Design premium et professionnel</li>
              <li>Intégration avec n8n pour automatisation avancée</li>
            </ul>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Roadmap Produit</h2>
          <div className="content-block">
            <h3>Phase 1 - MVP (Actuel)</h3>
            <ul>
              <li>✅ Formulaire de qualification des leads</li>
              <li>✅ Dashboard administrateur avec filtres</li>
              <li>✅ Chatbot IA DENTIRO</li>
              <li>✅ Intégration webhook n8n</li>
              <li>✅ Ajout manuel de leads</li>
            </ul>

            <h3>Phase 2 - Améliorations</h3>
            <ul>
              <li>Notifications par email/SMS automatiques</li>
              <li>Calendrier de rendez-vous intégré</li>
              <li>Rapports et analytiques avancés</li>
              <li>Intégration avec systèmes de paiement</li>
            </ul>

            <h3>Phase 3 - Évolution</h3>
            <ul>
              <li>Application mobile</li>
              <li>Intégrations avec logiciels dentaires existants</li>
              <li>Fonctionnalités de marketing automation</li>
              <li>Multi-cliniques et gestion d'équipe</li>
            </ul>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Modèle Commercial</h2>
          <div className="content-block">
            <h3>Options de Tarification (Proposé)</h3>
            <div className="pricing-options">
              <div className="pricing-card">
                <h4>Starter</h4>
                <p className="price">49$/mois</p>
                <ul>
                  <li>1 clinique</li>
                  <li>100 leads/mois</li>
                  <li>Chatbot basique</li>
                  <li>Support par email</li>
                </ul>
              </div>

              <div className="pricing-card featured">
                <h4>Professionnel</h4>
                <p className="price">149$/mois</p>
                <ul>
                  <li>1 clinique</li>
                  <li>Leads illimités</li>
                  <li>Chatbot IA avancé</li>
                  <li>Automatisations n8n</li>
                  <li>Support prioritaire</li>
                </ul>
              </div>

              <div className="pricing-card">
                <h4>Entreprise</h4>
                <p className="price">Sur mesure</p>
                <ul>
                  <li>Cliniques multiples</li>
                  <li>Personnalisation complète</li>
                  <li>Intégrations avancées</li>
                  <li>Support dédié 24/7</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Plan Marketing</h2>
          <div className="content-block">
            <h3>Canaux d'Acquisition</h3>
            <ul>
              <li>LinkedIn - Ciblage dentistes québécois</li>
              <li>Google Ads - Mots-clés secteur dentaire</li>
              <li>Webinaires et démos en ligne</li>
              <li>Partenariats avec associations dentaires</li>
              <li>Bouche-à-oreille et références</li>
            </ul>

            <h3>Métriques Clés</h3>
            <ul>
              <li>Coût d'acquisition par client (CAC)</li>
              <li>Taux de conversion des démos</li>
              <li>Taux de rétention mensuel</li>
              <li>Valeur vie client (LTV)</li>
              <li>Net Promoter Score (NPS)</li>
            </ul>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Stack Technique</h2>
          <div className="content-block">
            <h3>Technologies Actuelles</h3>
            <ul>
              <li><strong>Frontend:</strong> React 19 + TypeScript + Vite</li>
              <li><strong>Routing:</strong> React Router 7</li>
              <li><strong>Icons:</strong> Lucide React</li>
              <li><strong>Date Handling:</strong> React DatePicker + date-fns</li>
              <li><strong>Automation:</strong> n8n (webhooks)</li>
              <li><strong>IA:</strong> Intégration chatbot avec prompt système personnalisé</li>
            </ul>

            <h3>Infrastructure Future</h3>
            <ul>
              <li>Base de données: PostgreSQL ou MongoDB</li>
              <li>Backend API: Node.js + Express ou NestJS</li>
              <li>Hébergement: AWS ou Azure</li>
              <li>CI/CD: GitHub Actions</li>
              <li>Monitoring: Sentry + Analytics</li>
            </ul>
          </div>
        </section>

        <section className="strategy-section">
          <h2>Prochaines Étapes</h2>
          <div className="content-block">
            <div className="action-items">
              <div className="action-item">
                <h4>🎯 Court Terme (1-2 mois)</h4>
                <ul>
                  <li>Obtenir 5-10 beta testeurs dentistes</li>
                  <li>Collecter feedback et itérer</li>
                  <li>Optimiser les conversions du formulaire</li>
                  <li>Améliorer le chatbot avec vrais cas d'usage</li>
                </ul>
              </div>

              <div className="action-item">
                <h4>📈 Moyen Terme (3-6 mois)</h4>
                <ul>
                  <li>Lancer officiellement avec pricing</li>
                  <li>Développer Phase 2 features</li>
                  <li>Construire cas d'étude clients</li>
                  <li>Établir partenariats stratégiques</li>
                </ul>
              </div>

              <div className="action-item">
                <h4>🚀 Long Terme (6-12 mois)</h4>
                <ul>
                  <li>Atteindre 50+ cliniques clientes</li>
                  <li>Expansion hors Québec (Ontario, BC)</li>
                  <li>Lever des fonds si nécessaire</li>
                  <li>Recruter équipe (dev, sales, support)</li>
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
