import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Maximize2,
  Megaphone,
  Menu,
  MessageCircle,
  Minimize2,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  Settings,
  Trash2,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusDropdown from '../components/StatusDropdown';
import './AdminDashboard.css';
import './Support.css';

type TicketStatus = 'Ouvert' | 'En attente' | 'Résolu';

type Message = {
  id: number | string;
  sender: 'client' | 'support';
  senderName: string;
  body: string;
  time: string;
  sentAt: string;
  recordId?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

type Ticket = {
  id: string;
  subject: string;
  contact: string;
  initials: string;
  preview: string;
  updatedAt: string;
  updatedAtRaw: string;
  status: TicketStatus;
  priority: 'Haute' | 'Normale' | 'Basse';
  unread: number;
  messages: Message[];
};

type WebhookTicketRow = {
  ticket_id: string;
  subject: string;
  contact_name: string;
  contact_initials: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'high' | 'normal' | 'low';
  unread_count: number;
  ticket_updated_at: string;
  message_id: string | number | null;
  sender_type: 'customer' | 'support' | null;
  sender_name: string | null;
  message_body: string | null;
  message_sent_at: string | null;
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
};

const ticketStatusOptions = [
  { value: 'Ouvert', label: 'Ouvert', color: '#c94f42' },
  { value: 'En attente', label: 'En attente', color: '#c18b18' },
  { value: 'Résolu', label: 'Résolu', color: '#2f8a59' },
] as const;

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};

const formatTicketDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-CA', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const normalizeStatus = (value: unknown): TicketStatus => {
  const status = String(value ?? '').toLowerCase();
  if (status === 'resolved' || status === 'résolu' || status === 'resolu') return 'Résolu';
  if (status === 'pending' || status === 'en attente') return 'En attente';
  return 'Ouvert';
};

const normalizePriority = (value: unknown): Ticket['priority'] => {
  const priority = String(value ?? '').toLowerCase();
  if (priority === 'high' || priority === 'haute') return 'Haute';
  if (priority === 'low' || priority === 'basse') return 'Basse';
  return 'Normale';
};

const webhookStatus = (status: TicketStatus): WebhookTicketRow['status'] =>
  status === 'Résolu' ? 'resolved' : status === 'En attente' ? 'pending' : 'open';

const webhookPriority = (priority: Ticket['priority']): WebhookTicketRow['priority'] =>
  priority === 'Haute' ? 'high' : priority === 'Basse' ? 'low' : 'normal';

const toWebhookRow = (ticket: Ticket, message?: Message): WebhookTicketRow => ({
  ticket_id: ticket.id,
  subject: ticket.subject,
  contact_name: ticket.contact,
  contact_initials: ticket.initials,
  status: webhookStatus(ticket.status),
  priority: webhookPriority(ticket.priority),
  unread_count: ticket.unread,
  ticket_updated_at: ticket.updatedAtRaw,
  message_id: message?.id ?? null,
  sender_type: message ? (message.sender === 'support' ? 'support' : 'customer') : null,
  sender_name: message?.senderName ?? null,
  message_body: message?.body ?? null,
  message_sent_at: message?.sentAt ?? null,
  ...(message?.recordId !== undefined ? { id: message.recordId } : {}),
  ...(message?.createdAt ? { createdAt: message.createdAt } : {}),
  ...(message?.updatedAt ? { updatedAt: message.updatedAt } : {}),
});

const normalizeWebhookTickets = (
  payload: unknown,
  sourceType: 'tickets' | 'messages',
): Ticket[] => {
  const envelope = asRecord(payload);
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(envelope.tickets)
      ? envelope.tickets
      : Array.isArray(envelope.data)
        ? envelope.data
        : [];

  const tickets = new Map<string, Ticket>();

  source.forEach((item, index) => {
    const row = asRecord(item);
    // Ticket records own the canonical conversation ID. On message records,
    // `id` is the message-row ID and `ticket_id` points back to the ticket.
    const id = String(
      sourceType === 'tickets'
        ? row.id ?? row.ticket_id ?? ''
        : row.ticket_id ?? '',
    );
    if (!id) return;
    const nestedMessages = Array.isArray(row.messages) ? row.messages : [];
    const contact = String(row.contact ?? row.contact_name ?? 'Client');
    const existing = tickets.get(id);
    const messageRow = row.message_body
      ? [{
          id: String(row.message_id ?? `${id}-${index}`),
          sender: row.sender_type === 'support' ? 'support' as const : 'client' as const,
          senderName: String(row.sender_name ?? ''),
          body: String(row.message_body),
          time: formatTicketDate(row.message_sent_at),
          sentAt: String(row.message_sent_at ?? ''),
          recordId: row.id as string | number | undefined,
          createdAt: typeof row.createdAt === 'string' ? row.createdAt : undefined,
          updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : undefined,
        }]
      : [];
    const messages = nestedMessages.map((message, messageIndex) => {
      const normalized = asRecord(message);
      return {
        id: String(normalized.id ?? normalized.message_id ?? `${id}-${messageIndex}`),
        sender: normalized.sender === 'support' || normalized.sender_type === 'support'
          ? 'support' as const
          : 'client' as const,
        senderName: String(normalized.senderName ?? normalized.sender_name ?? ''),
        body: String(normalized.body ?? normalized.message_body ?? ''),
        time: formatTicketDate(normalized.time ?? normalized.message_sent_at),
        sentAt: String(normalized.sentAt ?? normalized.message_sent_at ?? ''),
        recordId: (normalized.recordId ?? normalized.id) as string | number | undefined,
        createdAt: typeof normalized.createdAt === 'string' ? normalized.createdAt : undefined,
        updatedAt: typeof normalized.updatedAt === 'string' ? normalized.updatedAt : undefined,
      };
    });

    if (existing) {
      existing.messages.push(...messageRow, ...messages);
      existing.messages.sort((first, second) =>
        new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime(),
      );
      existing.preview = existing.messages.at(-1)?.body || existing.preview;
      existing.updatedAtRaw = String(
        row.ticket_updated_at ?? row.updated_at ?? row.updatedAt ?? existing.updatedAtRaw,
      );
      existing.updatedAt = formatTicketDate(existing.updatedAtRaw);
      existing.status = normalizeStatus(row.status);
      existing.priority = normalizePriority(row.priority);
      existing.unread = Number(row.unread ?? row.unread_count ?? existing.unread);
      return;
    }

    const allMessages = [...messageRow, ...messages];
    allMessages.sort((first, second) =>
      new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime(),
    );
    tickets.set(id, {
      id,
      subject: String(row.subject ?? 'Ticket de support'),
      contact,
      initials: String(row.initials ?? row.contact_initials ?? contact.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()),
      preview: String(row.preview ?? allMessages.at(-1)?.body ?? ''),
      updatedAt: formatTicketDate(row.updatedAt ?? row.ticket_updated_at ?? row.updated_at),
      updatedAtRaw: String(row.ticket_updated_at ?? row.updated_at ?? row.updatedAt ?? ''),
      status: normalizeStatus(row.status),
      priority: normalizePriority(row.priority),
      unread: Number(row.unread ?? row.unread_count ?? 0),
      messages: allMessages,
    });
  });

  return Array.from(tickets.values());
};

const extractCreatedTicketId = (payload: unknown): string | null => {
  const envelope = asRecord(payload);
  const candidate = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(envelope.data)
      ? envelope.data[0]
      : envelope.data ?? payload;
  const record = asRecord(candidate);
  const id = record.id ?? record.ticket_id;
  return id === undefined || id === null || id === '' ? null : String(id);
};

const Support = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [webhookError, setWebhookError] = useState('');
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isConversationFullscreen, setIsConversationFullscreen] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const createTicketLock = useRef(false);
  const skipNextMessageLoad = useRef(false);
  const [showConversation, setShowConversation] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const loadTickets = useCallback(async () => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_SUPPORT_TICKETS;
    setIsLoadingTickets(true);
    setWebhookError('');

    try {
      if (!webhookUrl) throw new Error('Le webhook de support n’est pas configuré.');
      const response = await fetch(webhookUrl, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Le webhook de support a répondu avec le statut ${response.status}.`);
      }

      const loadedTickets = normalizeWebhookTickets(await response.json(), 'tickets');
      setTickets(loadedTickets);
      setSelectedId((current) =>
        loadedTickets.some((ticket) => ticket.id === current)
          ? current
          : loadedTickets[0]?.id ?? '',
      );
    } catch (error) {
      console.error('Support webhook loading error:', error);
      setTickets([]);
      setSelectedId('');
      setWebhookError('Impossible de charger les tickets depuis le service de support.');
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const loadTicketMessages = useCallback(async (ticketId: string) => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_SUPPORT_MESSAGES;
    setIsLoadingMessages(true);

    try {
      if (!webhookUrl) throw new Error('Le webhook des messages de support n’est pas configuré.');
      const endpoint = new URL(webhookUrl);
      endpoint.searchParams.set('id', ticketId);
      const response = await fetch(endpoint.toString(), {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`Le webhook des messages a répondu avec le statut ${response.status}.`);
      }

      const responseText = response.status === 204 ? '' : await response.text();
      const payload = responseText.trim() ? JSON.parse(responseText) : [];
      const loadedMessages = normalizeWebhookTickets(payload, 'messages')
        .flatMap((ticket) => ticket.messages)
        .sort((first, second) =>
          new Date(first.sentAt).getTime() - new Date(second.sentAt).getTime(),
        );
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                messages: loadedMessages,
                preview: loadedMessages.at(-1)?.body ?? ticket.preview,
              }
            : ticket,
        ),
      );
    } catch (error) {
      console.error('Support messages webhook loading error:', error);
      setWebhookError('Impossible de charger les messages de ce ticket.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    if (skipNextMessageLoad.current) {
      skipNextMessageLoad.current = false;
      return;
    }
    void loadTicketMessages(selectedId);
  }, [loadTicketMessages, selectedId]);

  useEffect(() => {
    if (!isConversationFullscreen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsConversationFullscreen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isConversationFullscreen]);

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr');
    if (!normalizedQuery) return tickets;
    return tickets.filter((ticket) =>
      `${ticket.id} ${ticket.subject} ${ticket.contact}`.toLocaleLowerCase('fr').includes(normalizedQuery),
    );
  }, [query, tickets]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

  const requestSupportWebhook = async (
    method: 'POST' | 'PATCH' | 'DELETE',
    payload: WebhookTicketRow,
  ) => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_SUPPORT_TICKETS;
    if (!webhookUrl) throw new Error('Le webhook de support n’est pas configuré.');
    const response = await fetch(webhookUrl, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Le webhook de support a répondu avec le statut ${response.status}.`);
    }
    if (response.status === 204) return null;
    const responseText = await response.text();
    return responseText.trim() ? JSON.parse(responseText) : null;
  };

  const postSupportMessage = async (payload: WebhookTicketRow) => {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_SUPPORT_MESSAGES;
    if (!webhookUrl) throw new Error('Le webhook des messages de support n’est pas configuré.');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Le webhook des messages a répondu avec le statut ${response.status}.`);
    }
  };

  const selectTicket = async (ticketId: string) => {
    const ticket = tickets.find((item) => item.id === ticketId);
    setSelectedId(ticketId);
    setShowConversation(true);
    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, unread: 0 } : ticket)),
    );
    if (ticket?.unread) {
      const updatedTicket = { ...ticket, unread: 0 };
      try {
        await Promise.all(
          ticket.messages.map((message) =>
            requestSupportWebhook('PATCH', toWebhookRow(updatedTicket, message)),
          ),
        );
      } catch (error) {
        console.error('Support webhook error:', error);
        setWebhookError('Le ticket est ouvert, mais la mise à jour des messages lus a échoué.');
      }
    }
  };

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault();
    if (createTicketLock.current) return;
    const firstMessageBody = newTicketMessage.trim();
    if (!firstMessageBody) return;
    createTicketLock.current = true;
    setIsCreatingTicket(true);
    const nextTicketNumber =
      Math.max(
        ...tickets.map((ticket) => Number(ticket.id.replace(/\D/g, '')) || 0),
        1000,
      ) + 1;
    const contact = user?.name?.trim() || 'Nouvelle demande';
    const initials =
      contact
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase() || 'ND';
    const now = new Date().toISOString();
    const subject = newTicketSubject.trim() || firstMessageBody.split(/\r?\n/, 1)[0].slice(0, 80);
    const firstMessage: Message = {
      id: `MSG-pending-${Date.now()}`,
      sender: 'client',
      senderName: user?.name || contact,
      body: firstMessageBody,
      time: 'À l’instant',
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    };
    const ticketDraft: Ticket = {
      id: String(nextTicketNumber),
      subject,
      contact,
      initials,
      preview: firstMessageBody,
      updatedAt: 'À l’instant',
      updatedAtRaw: now,
      status: 'Ouvert',
      priority: 'Normale',
      unread: 0,
      messages: [firstMessage],
    };

    setWebhookError('');

    let ticketCreated = false;
    let createdTicket: Ticket | null = null;
    try {
      const createdPayload = await requestSupportWebhook('POST', toWebhookRow(ticketDraft));
      ticketCreated = true;
      const canonicalTicketId = extractCreatedTicketId(createdPayload);
      if (!canonicalTicketId) {
        throw new Error('La création du ticket n’a retourné aucun identifiant.');
      }
      const createdMessage = {
        ...firstMessage,
        id: `MSG-${canonicalTicketId}-${Date.now()}`,
      };
      createdTicket = {
        ...ticketDraft,
        id: canonicalTicketId,
        messages: [createdMessage],
      };
      await postSupportMessage(toWebhookRow(createdTicket, createdMessage));
      skipNextMessageLoad.current = true;
      setTickets((current) => [createdTicket as Ticket, ...current]);
      setSelectedId(canonicalTicketId);
      setQuery('');
      setReply('');
      setNewTicketSubject('');
      setNewTicketMessage('');
      setShowNewTicketModal(false);
      setShowConversation(true);
    } catch (error) {
      console.error('Support webhook error:', error);
      if (ticketCreated) {
        try {
          await requestSupportWebhook('DELETE', toWebhookRow(createdTicket ?? ticketDraft));
        } catch (rollbackError) {
          console.error('Support ticket rollback error:', rollbackError);
        }
      }
      setWebhookError('La création de la conversation a échoué. Veuillez réessayer.');
    } finally {
      createTicketLock.current = false;
      setIsCreatingTicket(false);
    }
  };

  const sendReply = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if (!body || isSendingReply || !selectedTicket) return;

    const now = new Date().toISOString();
    const newMessage: Message = {
      id: `MSG-${selectedTicket.id.replace(/^SUP-/, '')}-${Date.now()}`,
      sender: 'support',
      senderName: user?.name || 'Équipe Support',
      body,
      time: 'À l’instant',
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    };
    const updatedTicket: Ticket = {
      ...selectedTicket,
      preview: body,
      updatedAt: 'À l’instant',
      updatedAtRaw: now,
      status: selectedTicket.status === 'Résolu' ? 'Ouvert' : selectedTicket.status,
      messages: [...selectedTicket.messages, newMessage],
    };

    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === selectedTicket.id ? updatedTicket : ticket,
      ),
    );
    setReply('');
    setWebhookError('');
    setIsSendingReply(true);

    try {
      await postSupportMessage(toWebhookRow(updatedTicket, newMessage));
      await loadTicketMessages(updatedTicket.id);
    } catch (error) {
      console.error('Support webhook error:', error);
      setTickets((current) =>
        current.map((ticket) => ticket.id === selectedTicket.id ? selectedTicket : ticket),
      );
      setReply(body);
      setWebhookError('L’envoi de la réponse a échoué.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const updateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    const previousStatus = selectedTicket.status;
    const updatedTicket = {
      ...selectedTicket,
      status,
      updatedAt: 'À l’instant',
      updatedAtRaw: new Date().toISOString(),
    };
    setTickets((current) =>
      current.map((ticket) => (ticket.id === selectedTicket.id ? { ...ticket, status } : ticket)),
    );
    setWebhookError('');

    try {
      const rows = updatedTicket.messages.length
        ? updatedTicket.messages.map((message) => toWebhookRow(updatedTicket, message))
        : [toWebhookRow(updatedTicket)];
      await Promise.all(rows.map((row) => requestSupportWebhook('PATCH', row)));
    } catch (error) {
      console.error('Support webhook error:', error);
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selectedTicket.id ? { ...ticket, status: previousStatus } : ticket,
        ),
      );
      setWebhookError('La modification du statut a échoué. Le statut précédent a été restauré.');
    }
  };

  const deleteTicket = async () => {
    if (!selectedTicket || isDeletingTicket) return;
    if (!window.confirm(`Supprimer définitivement le ticket ${selectedTicket.id} ?`)) return;

    setIsDeletingTicket(true);
    setWebhookError('');
    try {
      const rows = selectedTicket.messages.length
        ? selectedTicket.messages.map((message) => toWebhookRow(selectedTicket, message))
        : [toWebhookRow(selectedTicket)];
      await Promise.all(rows.map((row) => requestSupportWebhook('DELETE', row)));
      const remainingTickets = tickets.filter((ticket) => ticket.id !== selectedTicket.id);
      setTickets(remainingTickets);
      setSelectedId(remainingTickets[0]?.id ?? '');
      setShowConversation(false);
    } catch (error) {
      console.error('Support webhook error:', error);
      setWebhookError('La suppression du ticket a échoué.');
    } finally {
      setIsDeletingTicket(false);
    }
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
          <Link to="/contacts-passes" className="sidebar-link"><CheckCircle size={20} />{!sidebarCollapsed && <span>CONTACTS PASSÉS</span>}</Link>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <Link to="/promotions" className="sidebar-link"><Megaphone size={20} />{!sidebarCollapsed && <span>PROMOTIONS</span>}</Link>
          )}
          <Link to="/utilisateurs" className="sidebar-link"><Users size={20} />{!sidebarCollapsed && <span>UTILISATEURS</span>}</Link>
          <Link to="/support" className={`sidebar-link ${location.pathname === '/support' ? 'active' : ''}`}>
            <Headphones size={20} />{!sidebarCollapsed && <span>SUPPORT</span>}
          </Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} />{!sidebarCollapsed && <span>PARAMÈTRES</span>}
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
          <button
            type="button"
            className="support-new-ticket"
            onClick={() => {
              setWebhookError('');
              setShowNewTicketModal(true);
            }}
          >
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
                  className={`ticket-card ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
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
              {isLoadingTickets && (
                <div className="ticket-empty"><RefreshCw className="support-spinner" size={24} /><p>Chargement des tickets…</p></div>
              )}
              {!isLoadingTickets && filteredTickets.length === 0 && (
                <div className="ticket-empty">
                  <Search size={24} />
                  <p>{query ? 'Aucun ticket trouvé' : 'Aucun ticket de support'}</p>
                  {!query && (
                    <button type="button" className="support-retry-button" onClick={() => void loadTickets()}>
                      Actualiser
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          <article className={`conversation-panel ${isConversationFullscreen ? 'conversation-fullscreen' : ''}`}>
            {selectedTicket ? (
              <>
            {webhookError && (
              <div className="support-webhook-error" role="alert">
                <span>{webhookError}</span>
                <button type="button" onClick={() => setWebhookError('')} aria-label="Fermer le message">
                  <X size={15} />
                </button>
              </div>
            )}
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
              <StatusDropdown
                className={`conversation-status-dropdown status-${selectedTicket.status.replace(' ', '-').toLowerCase()}`}
                value={selectedTicket.status}
                onChange={(status) => updateStatus(status as TicketStatus)}
                options={ticketStatusOptions}
                ariaLabel="Modifier le statut du ticket"
              />
              <button
                type="button"
                className="conversation-header-action"
                onClick={() => setIsConversationFullscreen((fullscreen) => !fullscreen)}
                aria-label={isConversationFullscreen ? 'Quitter le plein écran' : 'Afficher la conversation en plein écran'}
                title={isConversationFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isConversationFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
              <button
                type="button"
                className="conversation-header-action conversation-delete"
                onClick={() => void deleteTicket()}
                disabled={isDeletingTicket}
                aria-label={`Supprimer le ticket ${selectedTicket.id}`}
                title="Supprimer le ticket"
              >
                <Trash2 size={17} />
              </button>
            </header>

            <div className="conversation-messages" aria-live="polite">
              <div className="conversation-date"><span>Aujourd’hui</span></div>
              {isLoadingMessages && (
                <div className="conversation-empty">
                  <RefreshCw className="support-spinner" size={24} />
                  <p>Chargement des messages…</p>
                </div>
              )}
              {!isLoadingMessages && selectedTicket.messages.length === 0 && (
                <div className="conversation-empty">
                  <MessageCircle size={24} />
                  <p>Écrivez un premier message pour démarrer cette conversation.</p>
                </div>
              )}
              {!isLoadingMessages && selectedTicket.messages.map((message) => (
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
                  rows={2}
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
                  <button type="submit" className="send-button" disabled={!reply.trim() || isSendingReply}>
                    <Send size={17} /> {isSendingReply ? 'Envoi…' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </form>
              </>
            ) : (
              <div className="conversation-empty support-empty-conversation">
                <MessageCircle size={28} />
                <p>
                  {isLoadingTickets
                    ? 'Chargement de vos conversations…'
                    : 'Sélectionnez un ticket ou créez une nouvelle demande.'}
                </p>
                {!isLoadingTickets && webhookError && (
                  <button type="button" className="support-retry-button" onClick={() => void loadTickets()}>
                    Réessayer
                  </button>
                )}
              </div>
            )}
          </article>
        </section>
      </main>

      {showNewTicketModal && (
        <div className="support-modal-backdrop" role="presentation">
          <form className="support-ticket-modal" onSubmit={createTicket}>
            <div className="support-ticket-modal-header">
              <div>
                <p className="support-eyebrow">NOUVELLE CONVERSATION</p>
                <h2>Contacter le support</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                disabled={isCreatingTicket}
                aria-label="Fermer"
              >
                <X size={19} />
              </button>
            </div>

            <label className="support-modal-field">
              <span>Sujet <small>facultatif</small></span>
              <input
                value={newTicketSubject}
                onChange={(event) => setNewTicketSubject(event.target.value)}
                placeholder="Ex. Problème avec une campagne"
                maxLength={120}
                autoFocus
              />
            </label>

            <label className="support-modal-field">
              <span>Votre message</span>
              <textarea
                value={newTicketMessage}
                onChange={(event) => setNewTicketMessage(event.target.value)}
                placeholder="Décrivez votre demande à l’équipe support…"
                rows={6}
                required
              />
            </label>

            {webhookError && <div className="support-modal-error" role="alert">{webhookError}</div>}

            <div className="support-ticket-modal-actions">
              <button
                type="button"
                className="support-modal-cancel"
                onClick={() => setShowNewTicketModal(false)}
                disabled={isCreatingTicket}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="send-button"
                disabled={!newTicketMessage.trim() || isCreatingTicket}
              >
                <Send size={17} />
                {isCreatingTicket ? 'Création…' : 'Envoyer au support'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Support;
