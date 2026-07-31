import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle, Check, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, Headphones,
  LayoutDashboard, LogOut, Mail, Megaphone, Menu, MessageSquare, Send,
  Settings, Smartphone, Sparkles, UserCircle, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import Footer from '../components/Footer';
import SidebarBrand from '../components/SidebarBrand';
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
  const campaignVariables = [
    { token: '{{Prénom}}', label: p.variableFirstName, preview: p.variableFirstNameExample },
    { token: '{{Nom}}', label: p.variableFullName, preview: p.variableFullNameExample },
    { token: '{{Email}}', label: p.variableEmail, preview: 'jean@email.com' },
    { token: '{{Téléphone}}', label: p.variablePhone, preview: '+1 514 555 1234' },
    { token: '{{DateDernierRDV}}', label: p.variableLastAppointment, preview: p.variableLastAppointmentExample },
    { token: '{{TypeDemande}}', label: p.variableRequestType, preview: p.variableRequestTypeExample },
  ];
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [previewChannel, setPreviewChannel] = useState<'email' | 'whatsapp' | 'sms'>('whatsapp');
  const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);
  const previewChannels = [
    { id: 'email' as const, name: p.email, description: p.emailDescription, icon: Mail, tone: 'blue' },
    { id: 'whatsapp' as const, name: p.whatsapp, description: p.whatsappDescription, icon: MessageSquare, tone: 'green' },
    { id: 'sms' as const, name: p.sms, description: p.smsDescription, icon: Smartphone, tone: 'violet' },
  ];
  const activePreviewChannel = previewChannels.find(channel => channel.id === previewChannel) ?? previewChannels[1];
  const ActivePreviewIcon = activePreviewChannel.icon;
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

  const insertCampaignVariable = (token: string) => {
    const textarea = messageRef.current;
    const start = textarea?.selectionStart ?? campaignBody.length;
    const end = textarea?.selectionEnd ?? campaignBody.length;
    const nextBody = `${campaignBody.slice(0, start)}${token}${campaignBody.slice(end)}`;
    setCampaignBody(nextBody);
    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const previewBody = campaignVariables.reduce(
    (message, variable) => message.replaceAll(variable.token, variable.preview),
    campaignBody
  );

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
        <SidebarBrand />
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
                    <textarea ref={messageRef} id="campaign-message" className="campaign-textarea" value={campaignBody} onChange={e => setCampaignBody(e.target.value)} placeholder={p.messagePlaceholder} rows={7} />
                    <div className="campaign-variables" aria-label={p.availableVariables}>
                      <div className="campaign-variables-heading"><Sparkles size={14} /><span>{p.availableVariables}</span><small>{p.insertVariableHint}</small></div>
                      <div className="campaign-variable-list">
                        {campaignVariables.map(variable => (
                          <button key={variable.token} type="button" title={variable.label} onClick={() => insertCampaignVariable(variable.token)}>
                            {variable.token}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="personalization-hint"><Sparkles size={14} /> {p.personalizationHint}</p>
                  </div>
                </section>
              </div>

              <aside className="campaign-preview-column">
                <div className="preview-card">
                  <div className="preview-heading"><span>{p.livePreview}</span><span className="preview-live"><i /> {p.live}</span></div>
                  <div className="preview-channel-picker" onBlur={event => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsPreviewMenuOpen(false);
                  }}>
                    <span className="preview-picker-label">{p.previewChannel}</span>
                    <button type="button" className={`preview-picker-trigger ${isPreviewMenuOpen ? 'open' : ''}`} aria-haspopup="listbox" aria-expanded={isPreviewMenuOpen} onClick={() => setIsPreviewMenuOpen(open => !open)}>
                      <span className={`preview-picker-icon ${activePreviewChannel.tone}`}><ActivePreviewIcon size={17} /></span>
                      <span className="preview-picker-copy"><strong>{activePreviewChannel.name}</strong><small>{activePreviewChannel.description}</small></span>
                      <ChevronDown className="preview-picker-chevron" size={17} />
                    </button>
                    {isPreviewMenuOpen && <div className="preview-picker-menu" role="listbox" aria-label={p.previewChannel}>
                      {previewChannels.map(({ id, name, description, icon: Icon, tone }) => (
                        <button key={id} type="button" role="option" aria-selected={previewChannel === id} className={previewChannel === id ? 'selected' : ''} onClick={() => { setPreviewChannel(id); setIsPreviewMenuOpen(false); }}>
                          <span className={`preview-picker-icon ${tone}`}><Icon size={17} /></span>
                          <span className="preview-picker-copy"><strong>{name}</strong><small>{description}</small></span>
                          <span className="preview-picker-check">{previewChannel === id && <Check size={14} />}</span>
                        </button>
                      ))}
                    </div>}
                  </div>
                  {previewChannel === 'email' ? (
                    <div className="email-preview-frame">
                      <div className="email-preview-toolbar"><Mail size={14} /><span>{p.emailInbox}</span></div>
                      <div className="email-preview-meta"><span className="preview-avatar">RF</span><div><strong>{p.clinic}</strong><small>{p.toRecipient.replace('{name}', campaignVariables[0].preview)}</small></div></div>
                      <div className="email-preview-content">
                        <h3>{campaignHeader || p.previewTitle}</h3>
                        <p>{p.hello} <strong>{campaignVariables[0].preview}</strong>,</p>
                        <p>{previewBody || p.previewMessage}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`phone-frame ${previewChannel === 'sms' ? 'sms-preview' : 'whatsapp-preview'}`}>
                      <div className="phone-top"><span /><span /><span /></div>
                      <div className="phone-appbar"><span className="preview-avatar">RF</span><div><strong>{p.clinic}</strong><small>{previewChannel === 'sms' ? p.textMessage : p.online}</small></div></div>
                      <div className="phone-content">
                        <div className="message-bubble">
                          {previewChannel === 'whatsapp' && <strong>{campaignHeader || p.previewTitle}</strong>}
                          <p>{p.hello} <span>{campaignVariables[0].preview}</span>,</p>
                          <p>{previewBody || p.previewMessage}</p>
                          <time>10:42 {previewChannel === 'whatsapp' ? '✓✓' : ''}</time>
                        </div>
                      </div>
                    </div>
                  )}
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
