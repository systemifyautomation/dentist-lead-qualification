import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  Circle,
  Clock3,
  Headphones,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  UserCircle,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import './Support.css';

type TicketStatus = 'Ouvert' | 'En attente' | 'Résolu';

type Message = {
  id: number;
  sender: 'client' | 'support';
  body: string;
  time: string;
};

type Ticket = {
  id: string;
  subject: string;
  contact: string;
  initials: string;
  preview: string;
  updatedAt: string;
  status: TicketStatus;
  priority: 'Haute' | 'Normale' | 'Basse';
  unread: number;
  messages: Message[];
};

const initialTickets: Ticket[] = [
  {
    id: 'SUP-1048',
    subject: 'Campagne WhatsApp non envoyée',
    contact: 'Clinique Dentaire Laval',
    initials: 'CD',
    preview: 'La campagne reste en attente depuis ce matin.',
    updatedAt: '10:42',
    status: 'Ouvert',
    priority: 'Haute',
    unread: 2,
    messages: [
      { id: 1, sender: 'client', body: 'Bonjour, notre campagne WhatsApp reste en attente depuis ce matin. Pouvez-vous vérifier ?', time: '09:18' },
      { id: 2, sender: 'support', body: 'Bonjour Sophie, merci pour votre message. Je vérifie la file d’envoi et votre connexion WhatsApp.', time: '09:26' },
      { id: 3, sender: 'client', body: 'Merci. La campagne concerne 186 patients et devait partir à 9 h.', time: '10:42' },
    ],
  },
  {
    id: 'SUP-1047',
    subject: 'Impossible de modifier un contact',
    contact: 'Centre Physio Plus',
    initials: 'CP',
    preview: 'Le bouton Enregistrer ne répond pas.',
    updatedAt: '09:15',
    status: 'En attente',
    priority: 'Normale',
    unread: 0,
    messages: [
      { id: 1, sender: 'client', body: 'Le bouton Enregistrer ne répond pas lorsque je modifie le numéro d’un contact.', time: 'Hier, 16:31' },
      { id: 2, sender: 'support', body: 'Pouvez-vous nous envoyer une capture et préciser le navigateur utilisé ?', time: '09:15' },
    ],
  },
  {
    id: 'SUP-1043',
    subject: 'Question sur les contacts passés',
    contact: 'Clinique Santé Active',
    initials: 'SA',
    preview: 'Merci, tout est clair maintenant !',
    updatedAt: 'Lun.',
    status: 'Résolu',
    priority: 'Basse',
    unread: 0,
    messages: [
      { id: 1, sender: 'client', body: 'Comment un patient passe-t-il dans la colonne Contacts passés ?', time: 'Lun., 11:04' },
      { id: 2, sender: 'support', body: 'Il y est déplacé automatiquement lorsque son suivi est terminé ou marqué comme non intéressé.', time: 'Lun., 11:22' },
      { id: 3, sender: 'client', body: 'Merci, tout est clair maintenant !', time: 'Lun., 11:29' },
    ],
  },
  {
    id: 'SUP-1039',
    subject: 'Ajouter un nouvel utilisateur',
    contact: 'Cabinet Nova',
    initials: 'CN',
    preview: 'Le compte de Marie est maintenant actif.',
    updatedAt: '18 juil.',
    status: 'Résolu',
    priority: 'Normale',
    unread: 0,
    messages: [
      { id: 1, sender: 'client', body: 'Pourriez-vous nous aider à ajouter Marie comme utilisatrice ?', time: '18 juil., 14:02' },
      { id: 2, sender: 'support', body: 'Le compte de Marie est maintenant actif. Elle recevra ses accès par message.', time: '18 juil., 14:18' },
    ],
  },
];

const Support = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState(initialTickets[0].id);
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [showConversation, setShowConversation] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    if (!normalizedQuery) return tickets;
    return tickets.filter((ticket) =>
      `${ticket.id} ${ticket.subject} ${ticket.contact}`.toLocaleLowerCase('fr').includes(normalizedQuery),
    );
  }, [query, tickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0];

  const selectTicket = (ticketId: string) => {
    setSelectedId(ticketId);
    setShowConversation(true);
    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, unread: 0 } : ticket)),
    );
  };

  const sendReply = (event: React.FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if (!body) return;

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              preview: body,
              updatedAt: 'À l’instant',
              status: ticket.status === 'Résolu' ? 'Ouvert' : ticket.status,
              messages: [
                ...ticket.messages,
                { id: Date.now(), sender: 'support', body, time: 'À l’instant' },
              ],
            }
          : ticket,
      ),
    );
    setReply('');
  };

  const updateStatus = (status: TicketStatus) => {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === selectedTicket.id ? { ...ticket, status } : ticket)),
    );
  };

  return (
    <div className={`admin-dashboard support-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Link to="/" className="sidebar-brand" aria-label="ReactivationFlow CRM">
          <img src="/reactivationflow-logo.svg" alt="" className="sidebar-brand-logo" />
          {!sidebarCollapsed && <span>ReactivationFlow</span>}
        </Link>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
          title={sidebarCollapsed ? 'Ouvrir la barre latérale' : 'Fermer la barre latérale'}
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link"><LayoutDashboard size={20} />{!sidebarCollapsed && <span>CRM</span>}</Link>
          <Link to="/no-shows" className="sidebar-link"><UserX size={20} />{!sidebarCollapsed && <span>NO-SHOWS</span>}</Link>
          <Link to="/contacts-passes" className="sidebar-link"><CheckCircle size={20} />{!sidebarCollapsed && <span>CONTACTS PASSÉS</span>}</Link>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Link to="/promotions" className="sidebar-link"><Megaphone size={20} />{!sidebarCollapsed && <span>PROMOTIONS</span>}</Link>
          )}
          <Link to="/utilisateurs" className="sidebar-link"><Users size={20} />{!sidebarCollapsed && <span>UTILISATEURS</span>}</Link>
          <Link to="/support" className={`sidebar-link ${location.pathname === '/support' ? 'active' : ''}`}>
            <Headphones size={20} />{!sidebarCollapsed && <span>SUPPORT</span>}
          </Link>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-icon"><UserCircle size={36} /></div>
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">{user?.name || 'Utilisateur'}</div>
                <div className="sidebar-user-phone">{user?.phone || ''}</div>
              </div>
            </div>
          )}
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/login'); }}>
            <LogOut size={20} />{!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      <main className="support-main">
        <header className="support-topbar">
          <div>
            <p className="support-eyebrow">CENTRE D’AIDE</p>
            <h1>Support</h1>
          </div>
          <button className="support-new-ticket">
            <MessageCircle size={18} />
            Nouveau ticket
          </button>
        </header>

        <section className={`support-workspace ${showConversation ? 'show-conversation' : ''}`}>
          <aside className="ticket-panel">
            <div className="ticket-panel-header">
              <div>
                <h2>Tickets</h2>
                <span>{tickets.filter((ticket) => ticket.status !== 'Résolu').length} en cours</span>
              </div>
              <div className="ticket-search">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un ticket"
                  aria-label="Rechercher un ticket"
                />
                {query && (
                  <button onClick={() => setQuery('')} aria-label="Effacer la recherche"><X size={16} /></button>
                )}
              </div>
            </div>

            <div className="ticket-list">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  className={`ticket-card ${selectedTicket.id === ticket.id ? 'active' : ''}`}
                  onClick={() => selectTicket(ticket.id)}
                >
                  <span className="ticket-avatar">{ticket.initials}</span>
                  <span className="ticket-card-content">
                    <span className="ticket-card-topline">
                      <strong>{ticket.contact}</strong>
                      <time>{ticket.updatedAt}</time>
                    </span>
                    <span className="ticket-subject">{ticket.subject}</span>
                    <span className="ticket-preview">{ticket.preview}</span>
                    <span className="ticket-card-meta">
                      <span className={`ticket-status status-${ticket.status.replace(' ', '-').toLowerCase()}`}>
                        <Circle size={7} fill="currentColor" />{ticket.status}
                      </span>
                      {ticket.unread > 0 && <span className="ticket-unread">{ticket.unread}</span>}
                    </span>
                  </span>
                </button>
              ))}
              {filteredTickets.length === 0 && (
                <div className="ticket-empty"><Search size={24} /><p>Aucun ticket trouvé</p></div>
              )}
            </div>
          </aside>

          <article className="conversation-panel">
            <header className="conversation-header">
              <button className="conversation-back" onClick={() => setShowConversation(false)} aria-label="Retour aux tickets">
                <ArrowLeft size={20} />
              </button>
              <div className="conversation-title">
                <div className="conversation-title-row">
                  <span className="conversation-id">{selectedTicket.id}</span>
                  <span className={`priority priority-${selectedTicket.priority.toLowerCase()}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <h2>{selectedTicket.subject}</h2>
                <p>{selectedTicket.contact}</p>
              </div>
              <select
                className={`conversation-status status-${selectedTicket.status.replace(' ', '-').toLowerCase()}`}
                value={selectedTicket.status}
                onChange={(event) => updateStatus(event.target.value as TicketStatus)}
                aria-label="Statut du ticket"
              >
                <option>Ouvert</option>
                <option>En attente</option>
                <option>Résolu</option>
              </select>
            </header>

            <div className="conversation-messages" aria-live="polite">
              <div className="conversation-date"><span>Aujourd’hui</span></div>
              {selectedTicket.messages.map((message) => (
                <div key={message.id} className={`message-row ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === 'support' ? <Headphones size={17} /> : selectedTicket.initials}
                  </div>
                  <div>
                    <div className="message-author">
                      <strong>{message.sender === 'support' ? 'Équipe Support' : selectedTicket.contact}</strong>
                      <time>{message.time}</time>
                    </div>
                    <div className="message-bubble">{message.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <form className="reply-composer" onSubmit={sendReply}>
              <div className="reply-box">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Écrivez votre réponse…"
                  aria-label="Réponse"
                  rows={3}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <div className="reply-actions">
                  <button type="button" className="attach-button" aria-label="Joindre un fichier"><Paperclip size={19} /></button>
                  <span><Clock3 size={14} /> Entrée pour envoyer</span>
                  <button type="submit" className="send-button" disabled={!reply.trim()}>
                    <Send size={17} /> Envoyer
                  </button>
                </div>
              </div>
            </form>
          </article>
        </section>
      </main>
    </div>
  );
};

export default Support;
