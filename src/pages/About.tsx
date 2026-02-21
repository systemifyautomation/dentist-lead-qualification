import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="brand-mark">
                <img
                  src="/Dentisto Logo.png"
                  alt="Dentisto"
                  className="brand-logo"
                />
                <h1>DENTIRO</h1>
              </div>
            </Link>
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
            <Link className="header-text-button" to="/strategy">
              Stratégie
            </Link>
            <Link className="header-text-button" to="/formulaire">
              Formulaire
            </Link>
            <Link className="header-text-button" to="/CRM">
              CRM
            </Link>
          </div>
        </div>
      </header>

      <div className="about-content">
        <section className="about-section">
          <h2>À Propos de DENTIRO</h2>
          <div className="content-block">
            <p>
              DENTIRO est une solution complète d'automatisation pour cliniques dentaires, conçue
              pour optimiser la gestion des leads, les rappels de rendez-vous et la communication
              avec les patients.
            </p>
          </div>
        </section>

        <section className="about-section">
          <h2>Notre Mission</h2>
          <div className="content-block">
            <p>
              Simplifier la gestion administrative des cabinets dentaires en automatisant les tâches
              répétitives, permettant ainsi aux professionnels de se concentrer sur l'essentiel :
              le soin des patients.
            </p>
          </div>
        </section>

        <section className="about-section">
          <h2>Fonctionnalités Principales</h2>
          <div className="content-block">
            <ul>
              <li>
                <strong>Capture de Leads:</strong> Formulaire web intelligent pour collecter les
                demandes de rendez-vous
              </li>
              <li>
                <strong>CRM Intégré:</strong> Dashboard admin complet pour gérer tous vos leads et
                rendez-vous
              </li>
              <li>
                <strong>Rappels Automatiques:</strong> Notifications WhatsApp 24h avant chaque
                rendez-vous
              </li>
              <li>
                <strong>Gestion No-Shows:</strong> Relance automatique des patients absents avec
                proposition de reprogrammation
              </li>
              <li>
                <strong>Chatbot IA:</strong> Assistant virtuel Dentisto pour répondre aux questions
                courantes
              </li>
              <li>
                <strong>Monitoring Temps Réel:</strong> Alertes Telegram en cas d'erreur système
              </li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2>Technologies</h2>
          <div className="content-block">
            <div className="tech-grid">
              <div className="tech-card">
                <h3>Frontend</h3>
                <p>React 19 + TypeScript + Vite</p>
              </div>
              <div className="tech-card">
                <h3>Automation</h3>
                <p>n8n + Webhooks REST API</p>
              </div>
              <div className="tech-card">
                <h3>Messaging</h3>
                <p>WhatsApp Business API</p>
              </div>
              <div className="tech-card">
                <h3>Intelligence</h3>
                <p>OpenAI GPT-4</p>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Contact & Support</h2>
          <div className="content-block">
            <p>
              Pour toute question ou demande de démonstration, n'hésitez pas à nous contacter via
              notre site web ou directement depuis l'application.
            </p>
            <p>
              <strong>Développé et maintenu par:</strong>{' '}
              <a
                href="https://systemifyautomation.com"
                target="_blank"
                rel="noopener noreferrer"
                className="systemify-link"
              >
                Systemify Automation
              </a>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;
