import { useState } from 'react';
import type { Lead } from '../types';
import Chatbot from '../components/Chatbot';
import DateTimePicker from '../components/DateTimePicker';
import './LeadForm.css';

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+1 ',
    leadType: 'appointment' as 'appointment' | 'emergency' | 'question',
    description: '',
    dateVisite: ''
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Remove leading 1 if present (country code)
    const phoneDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    
    // Format based on length
    if (phoneDigits.length === 0) {
      return '+1 ';
    } else if (phoneDigits.length <= 3) {
      return `+1 (${phoneDigits}`;
    } else if (phoneDigits.length <= 6) {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
    } else {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Format phone number as user types
      const formatted = formatPhoneNumber(value);
      setFormData({
        ...formData,
        phone: formatted
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setFormData({
        ...formData,
        dateVisite: date.toISOString()
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lead: Lead = {
      id: Date.now().toString(),
      ...formData,
      status: 'verification-pending',
      reminderSent: false,
      createdAt: new Date().toISOString()
    };

    // Send to webhook
    try {
      const webhookData = {
        nom: formData.name,
        email: formData.email,
        telephone: formData.phone,
        typeDemande: formData.leadType,
        description: formData.description,
        dateVisite: formData.dateVisite,
        statut: 'verification-pending',
        rappelEnvoye: false,
        creeA: new Date().toISOString()
      };

      await fetch(import.meta.env.VITE_WEBHOOK_LEADS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      // Store in localStorage as backup
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      localStorage.setItem('leads', JSON.stringify([...existingLeads, lead]));

    } catch (error) {
      console.error('Failed to submit form:', error);
      // Still store locally even if webhook fails
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      localStorage.setItem('leads', JSON.stringify([...existingLeads, lead]));
    }

    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '+1 ',
        leadType: 'appointment',
        description: '',
        dateVisite: ''
      });
      setSelectedDate(null);
      setSubmitted(false);
      setCurrentStep(1);
    }, 3000);
  };

  return (
    <div className="lead-form-container">
      <div className="lead-form-content">
        <div className="form-wrapper">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Merci!</h2>
              <p>Votre demande a été reçue. Notre équipe vous contactera très bientôt.</p>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="progress-indicator">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                  <div className="step-number">1</div>
                  <div className="step-label">Informations</div>
                </div>
                <div className="progress-line"></div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-label">Rendez-vous</div>
                </div>
              </div>

              {currentStep === 1 ? (
                <form onSubmit={handleNextStep} className="lead-form">
                  <h2>Vos Informations</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom Complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Numéro de Téléphone *</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (___) ___-____"
                  />
                  <small className="form-hint">Vous recevrez un message WhatsApp pour confirmer vos informations</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Adresse Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="jean@email.com"
                  />
                  <small className="form-hint">Requis - utilise pour planifier via Google Calendar</small>
                </div>

                <div className="form-group">
                  <label htmlFor="leadType">Raison de votre demande *</label>
                  <select
                    id="leadType"
                    name="leadType"
                    value={formData.leadType}
                    onChange={handleChange}
                    required
                  >
                    <option value="appointment">Prendre un rendez-vous</option>
                    <option value="emergency">Urgence dentaire</option>
                    <option value="question">Question générale</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description de votre visite</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez brièvement la raison de votre visite (ex: nettoyage de routine, douleur dentaire, blanchiment, etc.)"
                  rows={3}
                />
                <small className="form-hint">Optionnel - aidez-nous à mieux vous servir</small>
              </div>

              <button type="submit" className="submit-button">
                Suivant
              </button>
            </form>
              ) : (
                <form onSubmit={handleSubmit} className="lead-form">
                  <h2>Choisir une Disponibilité</h2>
                  
                  <div className="form-group">
                    <label htmlFor="dateVisite">Date et heure souhaitées *</label>
                    <DateTimePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      placeholder="Cliquez pour sélectionner une date"
                    />
                    <small className="form-hint">Disponibilités: Lundi au Vendredi, 8h00 à 18h00</small>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="back-button" onClick={handlePreviousStep}>
                      Retour
                    </button>
                    <button type="submit" className="submit-button">
                      Confirmer le Rendez-vous
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        <div className="form-info">
          <p>Pour toute information ou question, appelez-nous au <a href="tel:+15145551234" className="phone-link"><strong>+1 (514) 555-1234</strong></a> ou utilisez notre chatbot ci-dessous.</p>
        </div>
      </div>

      {/* Chatbot Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setShowChatbot(!showChatbot)}
        aria-label="Toggle chatbot"
      >
        {showChatbot ? '✕' : (
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="chatgpt-logo">
            <defs>
              <linearGradient id="gpt-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            <path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm0 26c-6.63 0-12-5.37-12-12S9.37 4 16 4s12 5.37 12 12-5.37 12-12 12z" fill="url(#gpt-gradient)"/>
            <circle cx="16" cy="10" r="2" fill="currentColor"/>
            <path d="M11 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
            <path d="M21 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Chatbot Component */}
      {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

export default LeadForm;
