import { useEffect, useState } from 'react';
import type { Lead } from '../types';
import Chatbot from '../components/Chatbot';
import DateTimePicker from '../components/DateTimePicker';
import Footer from '../components/Footer';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './LeadForm.css';

type BookedSlot = {
  start: string;
  end: string;
};

const LeadForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    leadType: 'appointment' as 'appointment' | 'emergency' | 'question',
    description: '',
    dateVisite: ''
  });

  // Bot protection
  const [honeypot, setHoneypot] = useState('');
  const [formLoadTime] = useState(Date.now());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep !== 2) return;

    let isMounted = true;
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const availabilityUrl = new URL(import.meta.env.VITE_WEBHOOK_CHECK_AVAILABILITY);
        availabilityUrl.searchParams.set('month_start', formatMontrealDateTime(monthStart));
        availabilityUrl.searchParams.set('month_end', formatMontrealDateTime(monthEnd));

        const response = await fetch(availabilityUrl.toString());
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des disponibilites');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Format de disponibilites invalide');
        }
        if (isMounted) {
          setBookedSlots(data);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Erreur inconnue';
          setAvailabilityError(message);
        }
      } finally {
        if (isMounted) {
          setAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [currentStep]);

  const isPhoneValid = (phone: string) => {
    // Phone input library handles validation internally
    // Just check if phone is provided and has reasonable length
    return phone && phone.length >= 10;
  };

  const formatMontrealDateTime = (date: Date) => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');

    const localIso = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const utcFromLocal = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
    const offsetMinutes = Math.round((utcFromLocal - date.getTime()) / 60000);
    const sign = offsetMinutes <= 0 ? '-' : '+';
    const absMinutes = Math.abs(offsetMinutes);
    const offsetHours = String(Math.floor(absMinutes / 60)).padStart(2, '0');
    const offsetMins = String(absMinutes % 60).padStart(2, '0');

    return `${localIso}${sign}${offsetHours}:${offsetMins}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({
      ...formData,
      phone: value || ''
    });
    
    // Validate phone
    if (value && isPhoneValid(value)) {
      setPhoneError(null);
    } else if (value) {
      setPhoneError('Veuillez entrer un numéro de téléphone valide');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number before proceeding
    if (!isPhoneValid(formData.phone)) {
      setPhoneError('Veuillez entrer un numéro de téléphone valide (10 chiffres)');
      return;
    }
    
    setPhoneError(null);
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
        dateVisite: formatMontrealDateTime(date)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot protection checks
    // 1. Honeypot field should be empty (bots will fill it)
    if (honeypot) {
      console.log('Bot detected: honeypot filled');
      return;
    }

    // 2. Form should take at least 3 seconds to fill (too fast = bot)
    const timeTaken = Date.now() - formLoadTime;
    if (timeTaken < 3000) {
      console.log('Bot detected: form filled too quickly');
      return;
    }

    // 3. Rate limiting - max 3 submissions per IP per hour (using localStorage as proxy)
    const submissionKey = 'dentisto_form_submissions';
    const submissions = JSON.parse(localStorage.getItem(submissionKey) || '[]');
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentSubmissions = submissions.filter((time: number) => time > oneHourAgo);
    
    if (recentSubmissions.length >= 3) {
      alert('Vous avez atteint la limite de soumissions. Veuillez réessayer plus tard.');
      return;
    }
    
    const createdAt = formatMontrealDateTime(new Date());
    const lead: Lead = {
      id: Date.now().toString(),
      ...formData,
      status: 'phone-unconfirmed',
      reminderSent: false,
      createdAt
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
        statut: 'phone-unconfirmed',
        rappelEnvoye: false,
        creeA: createdAt
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

      // Record submission time for rate limiting
      recentSubmissions.push(Date.now());
      localStorage.setItem(submissionKey, JSON.stringify(recentSubmissions));

    } catch (error) {
      console.error('Failed to submit form:', error);
      // Still store locally even if webhook fails
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      localStorage.setItem('leads', JSON.stringify([...existingLeads, lead]));

      // Record submission time for rate limiting
      recentSubmissions.push(Date.now());
      localStorage.setItem(submissionKey, JSON.stringify(recentSubmissions));
    }

    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
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

                  {/* Honeypot field - hidden from users, bots will fill it */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
              
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
                  <PhoneInput
                    international
                    defaultCountry="CA"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    className={phoneError ? 'phone-input-error' : ''}
                  />
                  {phoneError && <small className="form-error">{phoneError}</small>}
                  {!phoneError && <small className="form-hint">Vous recevrez un message WhatsApp pour confirmer vos informations</small>}
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
                      bookedSlots={bookedSlots}
                      availabilityLoading={availabilityLoading}
                      availabilityError={availabilityError}
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
      <Footer />
    </div>
  );
};

export default LeadForm;
