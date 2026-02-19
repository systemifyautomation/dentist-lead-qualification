import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DateTimePicker from '../components/DateTimePicker';
import Chatbot from '../components/Chatbot';
import './Reschedule.css';

type BookedSlot = {
  start: string;
  end: string;
};

const Reschedule = () => {
  const [searchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visitDate, setVisitDate] = useState<string | null>(null);

  const visitId = searchParams.get('visit_id');
  const rescheduledBy = searchParams.get('rescheduled_by');

  useEffect(() => {
    const fetchVisitData = async () => {
      if (!visitId) {
        setError('Les paramètres de l\'URL sont manquants.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://n8n.systemifyautomation.com/webhook/scalint-lead-reschedule?visit_id=${encodeURIComponent(visitId)}`
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de visite');
        }

        const data = await response.json();

        if (!data.visit_date || data.visit_date === null || data.visit_date === '') {
          setError('Cette URL n\'est pas valide ou le rendez-vous n\'existe pas.');
          setLoading(false);
          return;
        }

        setVisitDate(data.visit_date);

        if (Array.isArray(data.booked_slots)) {
          setBookedSlots(data.booked_slots);
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitData();
  }, [visitId]);

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

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const formatVisitDate = (value: string | null) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'America/Toronto',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(parsed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !visitId) {
      setError('Veuillez sélectionner une date et une heure.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // First, cancel the existing meeting
      const cancelResponse = await fetch(
        'https://n8n.systemifyautomation.com/webhook/scalint-cancel-meeting',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visit_id: visitId
          })
        }
      );

      if (!cancelResponse.ok) {
        throw new Error('Erreur lors de l\'annulation du rendez-vous existant');
      }

      // Then, create the new rescheduled meeting
      const rescheduleResponse = await fetch(
        'https://n8n.systemifyautomation.com/webhook/scalint-lead-rescheduled',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visit_id: visitId,
            new_date: formatMontrealDateTime(selectedDate),
            rescheduled_by: rescheduledBy || ''
          })
        }
      );

      if (!rescheduleResponse.ok) {
        throw new Error('Erreur lors de la création du nouveau rendez-vous');
      }

      setSubmitted(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="reschedule-container">
      <div className="reschedule-content">
        <div className="form-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">✕</div>
              <h2>Erreur</h2>
              <p>{error}</p>
              <a href="/" className="back-link">Retour à l'accueil</a>
            </div>
          ) : submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Merci!</h2>
              <p>Votre rendez-vous a été reprogrammé avec succès.</p>
            </div>
          ) : (
            <>
              <h2>Reprogrammer votre Rendez-vous</h2>
              <div className="current-visit-info">
                <p><strong>Date actuelle:</strong> {formatVisitDate(visitDate)}</p>
              </div>

              <form onSubmit={handleSubmit} className="reschedule-form">
                <div className="form-group">
                  <label htmlFor="dateVisite">Choisir une nouvelle date et heure *</label>
                  <DateTimePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    placeholder="Cliquez pour sélectionner une date"
                    bookedSlots={bookedSlots}
                    availabilityLoading={loading}
                    availabilityError={error}
                  />
                  <small className="form-hint">Disponibilités: Lundi au Vendredi, 8h00 à 18h00</small>
                </div>

                {error && <div className="form-error">{error}</div>}

                <div className="form-actions">
                  <a href="/" className="cancel-button">Annuler</a>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={submitting || !selectedDate}
                  >
                    {submitting ? 'Traitement en cours...' : 'Confirmer la nouvelle date'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="form-info">
          <p>Pour toute question ou assistance, appelez-nous au <a href="tel:+15145551234" className="phone-link"><strong>+1 (514) 555-1234</strong></a></p>
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

export default Reschedule;
