import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, Check, CheckCircle, CheckCircle2, ChevronLeft, Headphones,
  LayoutDashboard, LogOut, Mail, Megaphone, Menu, MessageSquare, Send,
  Settings, Smartphone, Sparkles, UserCircle, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import Footer from '../components/Footer';
import './AdminDashboard.css';

const Promotions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { messages } = useI18n();
  const p = messages.promotions;
  const channels = [
    { id: 'email', name: p.email, description: p.emailDescription, icon: Mail, tone: 'blue' },
    { id: 'whatsapp', name: p.whatsapp, description: p.whatsappDescription, icon: MessageSquare, tone: 'green' },
    { id: 'sms', name: p.sms, description: p.smsDescription, icon: Smartphone, tone: 'violet' },
  ];
  const audiences = [
    { id: 'leads', name: p.leads, description: p.leadsDescription, icon: Sparkles },
    { id: 'no-shows', name: p.noShows, description: p.noShowsDescription, icon: AlertCircle },
    { id: 'past-patients', name: p.pastPatients, description: p.pastPatientsDescription, icon: Users },
  ];
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

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'super-admin') navigate('/');
  }, [user, navigate]);

  const toggle = (value: string, values: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  };

  const showModalMessage = (type: 'error' | 'success' | 'confirm', message: string, action?: () => void) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
    setPendingAction(action ? () => action : null);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalMessage('');
    setPendingAction(null);
  };

  const executeSendCampaign = async () => {
    setIsSending(true);
    try {
      const response = await fetch('https://n8n.systemifyautomation.com/webhook/reactivationflow-offers-and-promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          types: selectedCampaignTypes,
          header: campaignHeader,
          body: campaignBody,
          audiences: selectedAudiences,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error('Failed to send campaign');
      showModalMessage('success', p.sendSuccess.replace('{channels}', selectedCampaignTypes.join(', ')));
      setCampaignHeader('');
      setCampaignBody('');
      setSelectedCampaignTypes([]);
      setSelectedAudiences([]);
    } catch (error) {
      console.error('Campaign send error:', error);
      showModalMessage('error', p.sendError);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCampaign = () => {
    if (!selectedCampaignTypes.length) return showModalMessage('error', p.selectChannel);
    if (!selectedAudiences.length) return showModalMessage('error', p.selectAudience);
    if (!campaignHeader.trim()) return showModalMessage('error', p.addTitle);
    if (!campaignBody.trim()) return showModalMessage('error', p.addMessage);
    showModalMessage(
      'confirm',
      p.sendQuestion.replace('{channels}', selectedCampaignTypes.join(', ')),
      executeSendCampaign
    );
  };

  const completedSteps = [
    selectedCampaignTypes.length > 0,
    selectedAudiences.length > 0,
    Boolean(campaignHeader.trim() && campaignBody.trim())
  ].filter(Boolean).length;

  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Link to="/" className="sidebar-brand" aria-label="ReactivationFlow CRM">
          <img src="/reactivationflow-logo.svg" alt="" className="sidebar-brand-logo" />
          {!sidebarCollapsed && <span>ReactivationFlow</span>}
        </Link>
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? p.openSidebar : p.closeSidebar}>
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}><LayoutDashboard size={20} />{!sidebarCollapsed && <span>CRM</span>}</Link>
          <Link to="/contacts-passes" className={`sidebar-link ${location.pathname === '/contacts-passes' ? 'active' : ''}`}><CheckCircle size={20} />{!sidebarCollapsed && <span>{p.navPastContacts}</span>}</Link>
          <Link to="/promotions" className="sidebar-link active"><Megaphone size={20} />{!sidebarCollapsed && <span>{p.navPromotions}</span>}</Link>
          <Link to="/utilisateurs" className={`sidebar-link ${location.pathname === '/utilisateurs' ? 'active' : ''}`}><Users size={20} />{!sidebarCollapsed && <span>{p.navUsers}</span>}</Link>
          <Link to="/support" className={`sidebar-link ${location.pathname === '/support' ? 'active' : ''}`}><Headphones size={20} />{!sidebarCollapsed && <span>{p.navSupport}</span>}</Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}><Settings size={20} />{!sidebarCollapsed && <span>{p.navSettings}</span>}</Link>
        </nav>
        <div className="sidebar-footer">
          {!sidebarCollapsed && <div className="sidebar-user-info"><div className="sidebar-user-icon"><UserCircle size={36} /></div><div className="sidebar-user-details"><div className="sidebar-user-name">{user?.name || 'Utilisateur'}</div><div className="sidebar-user-phone">{user?.phone || ''}</div></div></div>}
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/login'); }} title={p.logout}><LogOut size={20} />{!sidebarCollapsed && <span>{p.logout}</span>}</button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="admin-header"><div className="header-content"><div className="header-center" /></div></header>
        <main className="admin-content promotions-page">
          <div className="promotions-container">
            <section className="promotions-hero">
              <div>
                <span className="promotions-eyebrow"><Megaphone size={14} /> {p.eyebrow}</span>
                <h1>{p.titleStart} <em>{p.titleEmphasis}</em></h1>
                <p>{p.subtitle}</p>
              </div>
              <div className="campaign-progress" aria-label={p.progressLabel.replace('{completed}', String(completedSteps))}>
                <strong>{completedSteps}/3</strong>
                <span>{p.stepsCompleted}</span>
                <div><i style={{ width: `${completedSteps * 33.34}%` }} /></div>
              </div>
            </section>

            <div className="campaign-workspace">
              <div className="campaign-builder">
                <section className="campaign-panel">
                  <div className="section-heading"><span>1</span><div><h2>{p.stepChannels}</h2><p>{p.stepChannelsHint}</p></div></div>
                  <div className="campaign-types">
                    {channels.map(({ id, name, description, icon: Icon, tone }) => {
                      const active = selectedCampaignTypes.includes(id);
                      return <button key={id} type="button" aria-pressed={active} className={`campaign-type-card ${tone} ${active ? 'active' : ''}`} onClick={() => toggle(id, selectedCampaignTypes, setSelectedCampaignTypes)}>
                        <span className="channel-check">{active && <Check size={14} />}</span>
                        <span className="channel-icon"><Icon size={24} /></span>
                        <strong>{name}</strong><small>{description}</small>
                      </button>;
                    })}
                  </div>
                </section>

                <section className="campaign-panel">
                  <div className="section-heading"><span>2</span><div><h2>{p.stepAudience}</h2><p>{p.stepAudienceHint}</p></div></div>
                  <div className="audience-selector">
                    {audiences.map(({ id, name, description, icon: Icon }) => {
                      const active = selectedAudiences.includes(id);
                      return <button key={id} type="button" aria-pressed={active} className={`audience-card ${active ? 'active' : ''}`} onClick={() => toggle(id, selectedAudiences, setSelectedAudiences)}>
                        <span className="audience-icon"><Icon size={20} /></span><span><strong>{name}</strong><small>{description}</small></span><span className="audience-check">{active && <Check size={14} />}</span>
                      </button>;
                    })}
                  </div>
                </section>

                <section className="campaign-panel">
                  <div className="section-heading"><span>3</span><div><h2>{p.stepMessage}</h2><p>{p.stepMessageHint}</p></div></div>
                  <div className="form-section">
                    <div className="field-label"><label htmlFor="campaign-title">{p.campaignTitle}</label><span>{campaignHeader.length}/80</span></div>
                    <input id="campaign-title" type="text" maxLength={80} className="campaign-input" value={campaignHeader} onChange={e => setCampaignHeader(e.target.value)} placeholder={p.titlePlaceholder} />
                  </div>
                  <div className="form-section">
                    <div className="field-label"><label htmlFor="campaign-message">{p.message}</label><span>{campaignBody.length} {p.characters}</span></div>
                    <textarea id="campaign-message" className="campaign-textarea" value={campaignBody} onChange={e => setCampaignBody(e.target.value)} placeholder={p.messagePlaceholder} rows={7} />
                    <p className="personalization-hint"><Sparkles size={14} /> {p.personalizationHint}</p>
                  </div>
                </section>
              </div>

              <aside className="campaign-preview-column">
                <div className="preview-card">
                  <div className="preview-heading"><span>{p.livePreview}</span><span className="preview-live"><i /> {p.live}</span></div>
                  <div className="phone-frame">
                    <div className="phone-top"><span /><span /><span /></div>
                    <div className="phone-appbar"><span className="preview-avatar">RF</span><div><strong>{p.clinic}</strong><small>{p.online}</small></div></div>
                    <div className="phone-content">
                      <div className="message-bubble">
                        <strong>{campaignHeader || p.previewTitle}</strong>
                        <p>{p.hello} <span>{`{{${p.firstName}}}`}</span>,</p>
                        <p>{campaignBody || p.previewMessage}</p>
                        <time>10:42 ✓✓</time>
                      </div>
                    </div>
                  </div>
                  <div className="campaign-summary">
                    <div><span>{p.channels}</span><strong>{selectedCampaignTypes.length || '—'}</strong></div>
                    <div><span>{p.audiences}</span><strong>{selectedAudiences.length || '—'}</strong></div>
                  </div>
                  <button className="send-campaign-button" onClick={handleSendCampaign} disabled={isSending}>
                    {isSending ? <><span className="button-spinner" /> {p.sending}</> : <><Send size={18} /> {p.send}</>}
                  </button>
                  <p className="send-note">{p.confirmationHint}</p>
                </div>
              </aside>
            </div>
          </div>
        </main>

        {showModal && <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-modal-title" onClick={e => e.stopPropagation()}>
            <div className={`modal-icon ${modalType}`}>
              {modalType === 'error' && <AlertCircle size={30} />}
              {modalType === 'success' && <CheckCircle2 size={30} />}
              {modalType === 'confirm' && <Send size={28} />}
            </div>
            <h3 id="campaign-modal-title" className="modal-title">{modalType === 'error' ? p.wait : modalType === 'success' ? p.sent : p.ready}</h3>
            <p className="modal-message">{modalMessage}</p>
            <div className="modal-actions">
              {modalType === 'confirm' && <button className="modal-button cancel" onClick={closeModal}>{p.back}</button>}
              <button className="modal-button confirm" onClick={modalType === 'confirm' ? () => { pendingAction?.(); closeModal(); } : closeModal}>{modalType === 'confirm' ? p.confirmSend : p.understood}</button>
            </div>
          </div>
        </div>}
        <Footer />
      </div>
    </div>
  );
};

export default Promotions;
