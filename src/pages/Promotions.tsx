import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, Users, LayoutDashboard, ChevronLeft, UserCircle, UserX, CheckCircle, Mail, MessageSquare, Smartphone, Send, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './AdminDashboard.css';

const Promotions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCampaignType, setSelectedCampaignType] = useState<'email' | 'whatsapp' | 'sms' | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [campaignHeader, setCampaignHeader] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Check if user has permission (admin or super-admin only)
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      navigate('/CRM');
    }
  }, [user, navigate]);

  const handleAudienceToggle = (audience: string) => {
    setSelectedAudiences(prev => {
      if (prev.includes(audience)) {
        return prev.filter(a => a !== audience);
      } else {
        return [...prev, audience];
      }
    });
  };

  const handleSendCampaign = async () => {
    if (!selectedCampaignType) {
      alert('Veuillez sélectionner un type de campagne');
      return;
    }

    if (selectedAudiences.length === 0) {
      alert('Veuillez sélectionner au moins une audience');
      return;
    }

    if (!campaignHeader.trim()) {
      alert('Veuillez entrer un en-tête');
      return;
    }

    if (!campaignBody.trim()) {
      alert('Veuillez entrer un message');
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir envoyer cette campagne ${selectedCampaignType} ?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSending(true);

    try {
      // Prepare campaign data
      const campaignData = {
        type: selectedCampaignType,
        header: campaignHeader,
        body: campaignBody,
        audiences: selectedAudiences,
        timestamp: new Date().toISOString()
      };

      // Send to webhook
      const response = await fetch('https://n8n.systemifyautomation.com/webhook/dentisto-offers-and-promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        alert(`Campagne ${selectedCampaignType} envoyée avec succès!`);
        // Reset form
        setCampaignHeader('');
        setCampaignBody('');
        setSelectedCampaignType(null);
        setSelectedAudiences([]);
      } else {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Campaign send error:', error);
      alert('Erreur lors de l\'envoi de la campagne. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
        
        <nav className="sidebar-nav">
          <Link to="/CRM" className={`sidebar-link ${location.pathname === '/CRM' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            {!sidebarCollapsed && <span>CRM</span>}
          </Link>
          <Link to="/no-shows" className={`sidebar-link ${location.pathname === '/no-shows' ? 'active' : ''}`}>
            <UserX size={20} />
            {!sidebarCollapsed && <span>NO-SHOWS</span>}
          </Link>
          <Link to="/patients-passes" className={`sidebar-link ${location.pathname === '/patients-passes' ? 'active' : ''}`}>
            <CheckCircle size={20} />
            {!sidebarCollapsed && <span>PATIENTS PASSÉS</span>}
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
            <div className="header-left">
              <img
                src="/Dentisto Logo.png"
                alt="Dentisto"
                className="brand-logo"
              />
              <h1>DENTISTO - Promotions</h1>
            </div>
            <div className="header-right">
              <a
                className="header-text-button"
                href="/formulaire"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ajouter Nouveau Lead
              </a>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="promotions-container">
            <div className="promotions-header">
              <h2>Créer une Campagne</h2>
              <p>Envoyez des offres et promotions à vos patients existants et passés</p>
            </div>

                <div className="campaign-types">
                  <button
                    className={`campaign-type-card ${selectedCampaignType === 'email' ? 'active' : ''}`}
                    onClick={() => setSelectedCampaignType('email')}
                  >
                    <Mail size={32} />
                    <h3>Campagne Email</h3>
                    <p>Envoyez des emails personnalisés à vos patients</p>
                  </button>

                  <button
                    className={`campaign-type-card ${selectedCampaignType === 'whatsapp' ? 'active' : ''}`}
                    onClick={() => setSelectedCampaignType('whatsapp')}
                  >
                    <MessageSquare size={32} />
                    <h3>Campagne WhatsApp</h3>
                    <p>Contactez vos patients via WhatsApp</p>
                  </button>

                  <button
                    className={`campaign-type-card ${selectedCampaignType === 'sms' ? 'active' : ''}`}
                    onClick={() => setSelectedCampaignType('sms')}
                  >
                    <Smartphone size={32} />
                    <h3>Campagne SMS</h3>
                    <p>Envoyez des messages SMS directs</p>
                  </button>
                </div>

                {selectedCampaignType && (
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
                          <span>Patients passés</span>
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
                      <textarea
                        className="campaign-textarea"
                        value={campaignBody}
                        onChange={(e) => setCampaignBody(e.target.value)}
                        placeholder={`Entrez le corps de votre message...`}
                        rows={8}
                      />
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

        <Footer />
      </div>
    </div>
  );
};

export default Promotions;
