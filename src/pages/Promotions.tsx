import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, Users, LayoutDashboard, ChevronLeft, UserCircle, UserX, CheckCircle, Mail, MessageSquare, Smartphone, Send, Megaphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './AdminDashboard.css';

const Promotions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCampaignTypes, setSelectedCampaignTypes] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [campaignHeader, setCampaignHeader] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'error' | 'success' | 'confirm' | null>(null);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Check if user has permission (admin or super-admin only)
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCampaignTypeToggle = (type: string) => {
    setSelectedCampaignTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleAudienceToggle = (audience: string) => {
    setSelectedAudiences(prev => {
      if (prev.includes(audience)) {
        return prev.filter(a => a !== audience);
      } else {
        return [...prev, audience];
      }
    });
  };

  const showModalMessage = (type: 'error' | 'success' | 'confirm', message: string, action?: () => void) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
    if (action) {
      setPendingAction(() => action);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalMessage('');
    setPendingAction(null);
  };

  const confirmModal = () => {
    if (pendingAction) {
      pendingAction();
    }
    closeModal();
  };

  const executeSendCampaign = async () => {

    setIsSending(true);

    try {
      // Prepare campaign data
      const campaignData = {
        types: selectedCampaignTypes,
        header: campaignHeader,
        body: campaignBody,
        audiences: selectedAudiences,
        timestamp: new Date().toISOString()
      };

      // Send to webhook
      const response = await fetch('https://n8n.systemifyautomation.com/webhook/reactivationflow-offers-and-promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        const channelText = selectedCampaignTypes.join(', ');
        showModalMessage('success', `Campagne(s) envoyée(s) avec succès via ${channelText}!`);
        // Reset form
        setCampaignHeader('');
        setCampaignBody('');
        setSelectedCampaignTypes([]);
        setSelectedAudiences([]);
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Campaign send error:', error);
      showModalMessage('error', 'Erreur lors de l\'envoi de la campagne. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCampaign = () => {
    if (selectedCampaignTypes.length === 0) {
      showModalMessage('error', 'Veuillez sélectionner au moins un canal de campagne');
      return;
    }

    if (selectedAudiences.length === 0) {
      showModalMessage('error', 'Veuillez sélectionner au moins une audience');
      return;
    }

    if (!campaignHeader.trim()) {
      showModalMessage('error', 'Veuillez entrer un en-tête');
      return;
    }

    if (!campaignBody.trim()) {
      showModalMessage('error', 'Veuillez entrer un message');
      return;
    }

    const channelText = selectedCampaignTypes.join(', ');
    const confirmMessage = `Êtes-vous sûr de vouloir envoyer cette campagne via ${channelText} ?`;
    showModalMessage('confirm', confirmMessage, executeSendCampaign);
  };

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Link to="/" className="sidebar-brand" aria-label="ReactivationFlow CRM">
          <img src="/reactivationflow-logo.svg" alt="" className="sidebar-brand-logo" />
          {!sidebarCollapsed && <span>ReactivationFlow</span>}
        </Link>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            {!sidebarCollapsed && <span>CRM</span>}
          </Link>
          <Link to="/no-shows" className={`sidebar-link ${location.pathname === '/no-shows' ? 'active' : ''}`}>
            <UserX size={20} />
            {!sidebarCollapsed && <span>NO-SHOWS</span>}
          </Link>
          <Link to="/contacts-passes" className={`sidebar-link ${location.pathname === '/contacts-passes' ? 'active' : ''}`}>
            <CheckCircle size={20} />
            {!sidebarCollapsed && <span>CONTACTS PASSÉS</span>}
          </Link>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Link to="/promotions" className={`sidebar-link ${location.pathname === '/promotions' ? 'active' : ''}`}>
              <Megaphone size={20} />
              {!sidebarCollapsed && <span>PROMOTIONS</span>}
            </Link>
          )}
          <Link to="/utilisateurs" className={`sidebar-link ${location.pathname === '/utilisateurs' ? 'active' : ''}`}>
            <Users size={20} />
            {!sidebarCollapsed && <span>UTILISATEURS</span>}
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-icon">
                <UserCircle size={36} />
              </div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{user?.name || 'Utilisateur'}</div>
                <div className="sidebar-user-phone">{user?.phone || ''}</div>
              </div>
            </div>
          )}
          <button
            className="sidebar-logout"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Se déconnecter"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
      
      <div className="main-wrapper">
        <header className="admin-header">
          <div className="header-content">
            <div className="header-center">
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="promotions-container">
            <div className="promotions-header">
              <h2>Créer une Campagne</h2>
              <p>Sélectionnez un ou plusieurs canaux pour envoyer vos offres et promotions</p>
            </div>

                <div className="campaign-types">
                  <button
                    className={`campaign-type-card ${selectedCampaignTypes.includes('email') ? 'active' : ''}`}
                    onClick={() => handleCampaignTypeToggle('email')}
                  >
                    <Mail size={32} />
                    <h3>Campagne Email</h3>
                    <p>Envoyez des emails personnalisés à vos contacts</p>
                  </button>

                  <button
                    className={`campaign-type-card ${selectedCampaignTypes.includes('whatsapp') ? 'active' : ''}`}
                    onClick={() => handleCampaignTypeToggle('whatsapp')}
                  >
                    <MessageSquare size={32} />
                    <h3>Campagne WhatsApp</h3>
                    <p>Contactez votre audience via WhatsApp</p>
                  </button>

                  <button
                    className={`campaign-type-card ${selectedCampaignTypes.includes('sms') ? 'active' : ''}`}
                    onClick={() => handleCampaignTypeToggle('sms')}
                  >
                    <Smartphone size={32} />
                    <h3>Campagne SMS</h3>
                    <p>Envoyez des messages SMS directs</p>
                  </button>
                </div>

                {selectedCampaignTypes.length > 0 && (
                  <div className="selected-channels-indicator">
                    <p>✓ {selectedCampaignTypes.length} canal{selectedCampaignTypes.length > 1 ? 'aux' : ''} sélectionné{selectedCampaignTypes.length > 1 ? 's' : ''}: {selectedCampaignTypes.join(', ')}</p>
                  </div>
                )}

                {selectedCampaignTypes.length > 0 && (
                  <div className="campaign-form">
                    <div className="form-section">
                      <h3>Audience</h3>
                      <div className="audience-selector">
                        <label className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedAudiences.includes('leads')}
                            onChange={() => handleAudienceToggle('leads')}
                          />
                          <span>Leads</span>
                        </label>
                        <label className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedAudiences.includes('no-shows')}
                            onChange={() => handleAudienceToggle('no-shows')}
                          />
                          <span>No-shows</span>
                        </label>
                        <label className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={selectedAudiences.includes('past-patients')}
                            onChange={() => handleAudienceToggle('past-patients')}
                          />
                          <span>Contacts passés</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-section">
                      <label>En-tête</label>
                      <input
                        type="text"
                        className="campaign-input"
                        value={campaignHeader}
                        onChange={(e) => setCampaignHeader(e.target.value)}
                        placeholder="Entrez l'en-tête de votre campagne..."
                      />
                    </div>

                    <div className="form-section">
                      <label>Message</label>
                      <div className="message-preview">
                        <div className="static-greeting">Bonjour {`{{Prénom}}`}</div>
                        <textarea
                          className="campaign-textarea"
                          value={campaignBody}
                          onChange={(e) => setCampaignBody(e.target.value)}
                          placeholder={`Entrez le corps de votre message...`}
                          rows={8}
                        />
                      </div>
                      <small className="char-count">{campaignBody.length} caractères</small>
                    </div>

                    <div className="form-actions">
                      <button
                        className="send-campaign-button"
                        onClick={handleSendCampaign}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>Envoi en cours...</>
                        ) : (
                          <>
                            <Send size={20} />
                            Envoyer la campagne
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">
                {modalType === 'error' && <AlertCircle size={48} color="#e74c3c" />}
                {modalType === 'success' && <CheckCircle2 size={48} color="#27ae60" />}
                {modalType === 'confirm' && <AlertCircle size={48} color="#f39c12" />}
              </div>
              <h3 className="modal-title">
                {modalType === 'error' && 'Erreur'}
                {modalType === 'success' && 'Succès'}
                {modalType === 'confirm' && 'Confirmation'}
              </h3>
              <p className="modal-message">{modalMessage}</p>
              <div className="modal-actions">
                {modalType === 'confirm' ? (
                  <>
                    <button className="modal-button cancel" onClick={closeModal}>
                      Annuler
                    </button>
                    <button className="modal-button confirm" onClick={confirmModal}>
                      Confirmer
                    </button>
                  </>
                ) : (
                  <button className="modal-button confirm" onClick={closeModal}>
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Promotions;
