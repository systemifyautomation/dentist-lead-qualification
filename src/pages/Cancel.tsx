import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import Footer from '../components/Footer';
import './Cancel.css';

const Cancel = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [visitDate, setVisitDate] = useState<string | null>(null);

  const visitId = searchParams.get('visit_id');
  const canceledBy = searchParams.get('canceled_by');

  useEffect(() => {
    const verifyVisit = async () => {
      if (!visitId) {
        setError('Les paramètres de l\'URL sont manquants.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_WEBHOOK_RESCHEDULE_MEETING}?visit_id=${encodeURIComponent(visitId)}`
        );

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification du rendez-vous');
        }

        const data = await response.json();

        // Check if visit is verified
        if (data.visit === 'verified') {
          setIsVerified(true);
          setVisitDate(data.visit_date || null);
          setShowConfirmation(true);
          setError(null);
        } else {
          setError('Cette URL n\'est pas valide ou le rendez-vous n\'a pas pu être vérifié.');
          setIsVerified(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la vérification';
        setError(message);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verifyVisit();
  }, [visitId]);

  const handleCancel = async () => {
    if (!visitId) {
      setError('Les paramètres de l\'URL sont manquants.');
      return;
    }

    try {
      setCanceling(true);
      setError(null);

      // Cancel the meeting
      const cancelResponse = await fetch(
        import.meta.env.VITE_WEBHOOK_CANCEL_MEETING,
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
        throw new Error('Erreur lors de l\'annulation du rendez-vous');
      }

      // Send cancellation notification
      const notifyResponse = await fetch(
        import.meta.env.VITE_WEBHOOK_RESCHEDULED_CONFIRMATION,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visit_id: visitId,
            canceled: true,
            canceled_by: canceledBy || '',
            cancellation_date: new Date().toISOString()
          })
        }
      );

      if (!notifyResponse.ok) {
        throw new Error('Erreur lors de l\'envoi de la notification d\'annulation');
      }

      setCanceled(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      setCanceling(false);
    }
  };

  const handleDecline = () => {
    setShowConfirmation(false);
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

  return (
    <div className="cancel-container">
      <div className="cancel-content">
        <div className="form-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Vérification du rendez-vous...</p>
            </div>
          ) : error && !isVerified ? (
            <div className="error-state">
              <div className="error-icon">✕</div>
              <h2>URL Non Valide</h2>
              <p>{error}</p>
              <a href="/" className="back-link">Retour à l'accueil</a>
            </div>
          ) : canceled ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Rendez-vous Annulé</h2>
              <p>Votre rendez-vous a été annulé avec succès. Vous recevrez une confirmation par email.</p>
            </div>
          ) : showConfirmation && isVerified ? (
            <div className="confirmation-state">
              <div className="confirmation-icon">⚠</div>
              <h2>Confirmer l'Annulation</h2>
              
              {visitDate && (
                <div className="visit-info">
                  <p><strong>Date du rendez-vous:</strong> {formatVisitDate(visitDate)}</p>
                </div>
              )}

              <p className="confirmation-message">
                Êtes-vous sûr de vouloir annuler ce rendez-vous? Cette action ne peut pas être annulée.
              </p>

              {error && <div className="form-error">{error}</div>}

              <div className="confirmation-actions">
                <button 
                  className="decline-button"
                  onClick={handleDecline}
                  disabled={canceling}
                >
                  Non, Garder le Rendez-vous
                </button>
                <button 
                  className="confirm-button"
                  onClick={handleCancel}
                  disabled={canceling}
                >
                  {canceling ? 'Annulation en cours...' : 'Oui, Annuler'}
                </button>
              </div>
            </div>
          ) : null}
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
      <Footer />
    </div>
  );
};

export default Cancel;
