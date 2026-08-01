import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Calendar, Columns3, Phone, LogOut, CheckCircle, Menu, Users, LayoutDashboard, LayoutGrid, List, ChevronLeft, UserCircle, Megaphone, Headphones, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import type { Lead } from '../types';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import SidebarBrand from '../components/SidebarBrand';
import StatusDropdown from '../components/StatusDropdown';
import './AdminDashboard.css';

type ApiLead = {
  id?: number | string;
  nom?: string;
  email?: string;
  telephone?: string;
  typeDemande?: string;
  statut?: string;
  description?: string;
  calendar_url?: string;
  calendar_id?: string;
  reschedule_url?: string;
  cancel_url?: string;
  rappelEnvoye?: boolean;
  dateRappel?: string;
  dateVisite?: string;
  createdAt?: string;
  updatedAt?: string;
  name?: string;
  phone?: string;
  leadType?: string;
  status?: string;
  calendarUrl?: string;
  calendarId?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  reminderSent?: boolean;
  reminderDate?: string;
};

const PastPatients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { messages } = useI18n();
  const cardsText = messages.crmCards;
  const dateFilterOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'yesterday', label: 'Hier' },
  ];
  const sortOptions = [
    { value: 'dateVisiteDesc', label: 'Dernières visites' },
    { value: 'dateVisiteAsc', label: 'Prochaines visites' },
    { value: 'nameAsc', label: 'Nom — A à Z' },
    { value: 'nameDesc', label: 'Nom — Z à A' },
    { value: 'createdDesc', label: 'Création — plus récentes' },
    { value: 'createdAsc', label: 'Création — plus anciennes' },
  ];
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'board'>('cards');
  const [pendingStatus, setPendingStatus] = useState<Lead['status'] | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState('');
  const [sortOrder, setSortOrder] = useState<'dateVisiteAsc' | 'dateVisiteDesc' | 'nameAsc' | 'nameDesc' | 'createdDesc' | 'createdAsc'>('dateVisiteDesc');
  const pageSize = 24;

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  const mapStatus = (statut?: string): Lead['status'] => {
    switch ((statut || '').toLowerCase()) {
      case 'phone-unconfirmed':
      case 'phone_unconfirmed':
      case 'whatsapp-pending':
      case 'pending':
      case 'non confirme':
      case 'non confirmé':
      case 'non-confirme':
      case 'non-confirmé':
      case 'attente whatsapp':
      case 'en attente whatsapp':
      case 'verification en attente':
      case 'nouveau':
      case 'new':
        return 'phone-unconfirmed';
      case 'phone-confirmed':
      case 'phone_confirmed':
      case 'whatsapp-confirmed':
      case 'confirme whatsapp':
      case 'confirmé whatsapp':
      case 'confirme':
      case 'confirmé':
      case 'confirmed':
      case 'contacte':
      case 'contacté':
      case 'contacted':
      case 'qualifie':
      case 'qualifié':
      case 'qualified':
      case 'planifie':
      case 'planifié':
      case 'scheduled':
        return 'phone-confirmed';
      case 'annule':
      case 'annulé':
      case 'canceled':
      case 'cancelled':
        return 'canceled';
      case 'absent':
      case 'no-show':
        return 'no-show';
      case 'complete':
      case 'complété':
      case 'completed':
        return 'completed';
      default:
        return 'phone-unconfirmed';
    }
  };

  const mapLeadType = (typeDemande?: string): Lead['leadType'] => {
    switch ((typeDemande || '').toLowerCase()) {
      case 'rendez-vous':
      case 'rendez vous':
      case 'appointment':
        return 'appointment';
      case 'urgence':
      case 'emergency':
        return 'emergency';
      case 'question':
        return 'question';
      default:
        return 'question';
    }
  };

  const normalizeLeads = (data: ApiLead[]): Lead[] => {
    return data.map((lead) => ({
      id: String(lead.id ?? Date.now()),
      name: lead.nom ?? lead.name ?? '',
      email: lead.email ?? '',
      phone: lead.telephone ?? lead.phone ?? '',
      leadType: mapLeadType(lead.typeDemande ?? lead.leadType),
      status: mapStatus(lead.statut ?? lead.status),
      description: lead.description,
      calendarUrl: lead.calendar_url ?? lead.calendarUrl,
      calendarId: lead.calendar_id ?? lead.calendarId,
      rescheduleUrl: lead.reschedule_url ?? lead.rescheduleUrl,
      cancelUrl: lead.cancel_url ?? lead.cancelUrl,
      reminderSent: Boolean(lead.rappelEnvoye ?? lead.reminderSent),
      reminderDate: lead.dateRappel ?? lead.reminderDate,
      dateVisite: lead.dateVisite,
      updatedAt: lead.updatedAt,
      createdAt: lead.createdAt ?? formatMontrealDateTime(new Date())
    }));
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const statuses = ['completed', 'no-show'];
      const responses = await Promise.all(
        statuses.map((status) =>
          fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?statut=${encodeURIComponent(status)}`),
        ),
      );

      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        throw new Error(`Failed to fetch leads: ${failedResponse.statusText}`);
      }

      const payloads = await Promise.all(responses.map((response) => response.json()));
      let rawLeads = payloads.flatMap((data) =>
        Array.isArray(data) ? data : data.value ?? data.leads ?? [],
      );
      // Filter out empty objects (e.g., [{}]) that indicate no leads
      rawLeads = rawLeads.filter((lead: ApiLead) =>
        lead && (lead.id || lead.nom || lead.name || lead.email || lead.telephone || lead.phone)
      );
      const uniqueLeads = Array.from(
        new Map(rawLeads.map((lead: ApiLead) => [String(lead.id), lead])).values(),
      );
      setLeads(normalizeLeads(uniqueLeads));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads';
      setError(errorMessage);
      console.error('Error fetching leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case 'phone-unconfirmed': return 'Non confirmé';
      case 'phone-confirmed': return 'Confirmé';
      case 'canceled': return 'Annulé';
      case 'no-show': return 'absent';
      case 'completed': return 'Complété';
      default: return 'Non confirmé';
    }
  };

  // Helper function to check if a date is today in Montreal timezone
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const nowParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(nowParts, 'year') === getPart(dateParts, 'year') &&
           getPart(nowParts, 'month') === getPart(dateParts, 'month') &&
           getPart(nowParts, 'day') === getPart(dateParts, 'day');
  };

  // Helper function to check if a date is yesterday in Montreal timezone
  const isYesterday = (dateString: string) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(yesterday);
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(yesterdayParts, 'year') === getPart(dateParts, 'year') &&
           getPart(yesterdayParts, 'month') === getPart(dateParts, 'month') &&
           getPart(yesterdayParts, 'day') === getPart(dateParts, 'day');
  };


  // Apply date filter
  const filteredByDate = dateFilter === 'all'
    ? leads
    : leads.filter(lead => {
        if (!lead.dateVisite) return false;
        switch (dateFilter) {
          case 'today':
            return isToday(lead.dateVisite);
          case 'yesterday':
            return isYesterday(lead.dateVisite);
          default:
            return true;
        }
      });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLeads = normalizedQuery
    ? filteredByDate.filter((lead) => {
        const typeLabel = lead.leadType === 'appointment'
          ? 'rendez-vous'
          : lead.leadType === 'emergency'
            ? 'urgence'
            : 'question';
        const statusLabel = getStatusLabel(lead.status).toLowerCase();
        const haystack = [
          lead.name || '',
          lead.email || '',
          lead.phone || '',
          lead.leadType || '',
          typeLabel,
          lead.status || '',
          statusLabel,
          lead.calendarUrl || '',
          lead.calendarId || '',
          lead.rescheduleUrl || '',
          lead.cancelUrl || ''
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : filteredByDate;

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    // Sorting by name
    if (sortOrder === 'nameAsc') {
      return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
    }
    if (sortOrder === 'nameDesc') {
      return b.name.localeCompare(a.name, 'fr', { sensitivity: 'base' });
    }
    
    // Sorting by created date
    if (sortOrder === 'createdDesc') {
      const aCreated = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bCreated = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bCreated - aCreated;
    }
    if (sortOrder === 'createdAsc') {
      const aCreated = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bCreated = b.createdAt ? Date.parse(b.createdAt) : 0;
      return aCreated - bCreated;
    }
    
    // Sorting by visit date (default)
    const aDate = a.dateVisite ? Date.parse(a.dateVisite) : NaN;
    const bDate = b.dateVisite ? Date.parse(b.dateVisite) : NaN;
    const aMissing = Number.isNaN(aDate);
    const bMissing = Number.isNaN(bDate);

    if (aMissing && bMissing) return 0;
    if (aMissing) return 1;
    if (bMissing) return -1;

    return sortOrder === 'dateVisiteAsc' ? aDate - bDate : bDate - aDate;
  });

  const totalPages = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'phone-unconfirmed': return '#d2ac67';
      case 'phone-confirmed': return '#2d9cdb';
      case 'canceled': return '#9b9b9b';
      case 'no-show': return '#e74c3c';
      case 'completed': return '#27ae60';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Get dates at midnight for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayOnly = new Date(todayOnly);
    yesterdayOnly.setDate(yesterdayOnly.getDate() - 1);
    const tomorrowOnly = new Date(todayOnly);
    tomorrowOnly.setDate(tomorrowOnly.getDate() + 1);
    
    // Format time as HH:MM
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Check if date is yesterday, today, or tomorrow
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return `Hier à ${timeString}`;
    } else if (dateOnly.getTime() === todayOnly.getTime()) {
      return `Aujourd'hui à ${timeString}`;
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return `Demain à ${timeString}`;
    }
    
    // Default format for other dates
    const dateStr = date.toLocaleDateString('fr-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${dateStr} ${timeString}`;
  };

  const formatMaybeDate = (dateString?: string) => {
    if (!dateString) return '—';
    const parsed = Date.parse(dateString);
    if (Number.isNaN(parsed)) return '—';
    return formatDate(dateString);
  };

  const getLeadTypeLabel = (leadType: Lead['leadType']) => {
    return leadType === 'appointment' ? 'rendez-vous' : leadType === 'emergency' ? 'urgence' : 'question';
  };

  const formatYesNo = (value?: boolean) => (value ? 'Oui' : 'Non');

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

  const statusOptions = (['phone-unconfirmed', 'phone-confirmed', 'canceled', 'no-show', 'completed'] as const).map(status => ({
    value: status,
    label: getStatusLabel(status),
    color: getStatusColor(status),
  }));

  const confirmStatusOverride = async () => {
    if (!selectedLead || !pendingStatus || pendingStatus === selectedLead.status) return;
    setIsStatusUpdating(true);
    setStatusUpdateError('');
    const updatedLead = { ...selectedLead, status: pendingStatus, updatedAt: formatMontrealDateTime(new Date()) };

    try {
      const endpoint = new URL(import.meta.env.VITE_WEBHOOK_LEADS);
      endpoint.searchParams.set('id', updatedLead.id);
      endpoint.searchParams.set('statut', updatedLead.status);
      const response = await fetch(endpoint.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedLead.id, nom: updatedLead.name, email: updatedLead.email,
          telephone: updatedLead.phone, typeDemande: updatedLead.leadType,
          statut: updatedLead.status, rappelEnvoye: updatedLead.reminderSent,
          dateRappel: updatedLead.reminderDate, dateVisite: updatedLead.dateVisite,
          calendar_url: updatedLead.calendarUrl, calendar_id: updatedLead.calendarId,
          reschedule_url: updatedLead.rescheduleUrl, cancel_url: updatedLead.cancelUrl,
          creeA: updatedLead.createdAt, modifieA: updatedLead.updatedAt,
        }),
      });
      if (!response.ok) throw new Error(`Webhook error: ${response.status}`);

      setLeads(current => ['completed', 'no-show'].includes(updatedLead.status)
        ? current.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
        : current.filter(lead => lead.id !== updatedLead.id));
      setSelectedLead(null);
      setPendingStatus(null);
    } catch (updateError) {
      console.error('Failed to override past-contact status:', updateError);
      setStatusUpdateError("Le statut n’a pas été modifié. Vérifiez la connexion au webhook et réessayez.");
    } finally {
      setIsStatusUpdating(false);
    }
  };



  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <SidebarBrand />
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
          <Link to="/support" className={`sidebar-link ${location.pathname === '/support' ? 'active' : ''}`}>
            <Headphones size={20} />
            {!sidebarCollapsed && <span>SUPPORT</span>}
          </Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} />
            {!sidebarCollapsed && <span>PARAMÈTRES</span>}
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
            <div className="header-search">
              <span className="header-search-icon">⌕</span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              {searchQuery && (
                <button
                  className="header-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <LoadingScreen message="Chargement des contacts passés..." />
      )}

      {error && (
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={fetchLeads} className="retry-button">Réessayer</button>
        </div>
      )}

      {!loading && (
      <div className="dashboard-content">
        <main className="main-content">
          <div className="leads-toolbar">
            <div className="filters-top">
              <div className="filter-group">
                <label className="filter-label">Filtrer par date</label>
                <StatusDropdown
                  value={dateFilter}
                  onChange={(value) => {
                    setDateFilter(value as typeof dateFilter);
                    setCurrentPage(1);
                  }}
                  options={dateFilterOptions}
                  className="filter-context"
                  ariaLabel="Filtrer par date"
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Trier par</label>
                <StatusDropdown
                  value={sortOrder}
                  onChange={(value) => setSortOrder(value as typeof sortOrder)}
                  options={sortOptions}
                  className="filter-context"
                  ariaLabel="Trier les contacts"
                />
              </div>
            </div>
          </div>
          <div className="leads-list">
            <div className="leads-list-header">
              <h2>Contacts passés ({sortedLeads.length})</h2>
              <div className="view-switcher" role="group" aria-label={cardsText.viewMode}>
                <button type="button" className={viewMode === 'cards' ? 'active' : ''} aria-pressed={viewMode === 'cards'} onClick={() => { setViewMode('cards'); setCurrentPage(1); }}>
                  <LayoutGrid size={15} aria-hidden="true" />{cardsText.cards}
                </button>
                <button type="button" className={viewMode === 'list' ? 'active' : ''} aria-pressed={viewMode === 'list'} onClick={() => { setViewMode('list'); setCurrentPage(1); }}>
                  <List size={15} aria-hidden="true" />{cardsText.list}
                </button>
                <button type="button" className={viewMode === 'board' ? 'active' : ''} aria-pressed={viewMode === 'board'} onClick={() => setViewMode('board')}>
                  <Columns3 size={15} aria-hidden="true" />{cardsText.pipeline}
                </button>
              </div>
            </div>
            {sortedLeads.length === 0 ? (
              <div className="empty-state">
                <p>Aucun contact passé trouvé.</p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="leads-grid">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedLead(lead);
                    }}
                  >
                    <div className="lead-card-header">
                      <h3>{lead.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(lead.status) }}
                      >
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                    <div className="lead-card-info">
                      <p><strong>{lead.leadType === 'appointment' ? 'Demande RDV' : lead.leadType === 'emergency' ? 'Urgence' : 'Question'}</strong></p>
                      <div className="lead-meta-row">
                        <span className="lead-meta">{lead.email}</span>
                        <a
                          className="lead-icon-button"
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Email ${lead.name}`}
                          title="Envoyer un email"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2 8 5 8-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </a>
                      </div>
                      <div className="lead-meta-row">
                        <span className="lead-meta">{lead.phone}</span>
                        <a
                          className="lead-icon-button"
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Appeler ${lead.name}`}
                          title="Appeler"
                        >
                          <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                        </a>
                      </div>
                      <p className="lead-date">Visite: {formatMaybeDate(lead.dateVisite)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'list' ? (
              <div className="leads-table-wrap">
                <table className="leads-table">
                  <thead><tr><th>Contact</th><th>Type</th><th>Statut</th><th>Dernière visite</th><th>Téléphone</th></tr></thead>
                  <tbody>
                    {paginatedLeads.map(lead => (
                      <tr key={lead.id} className={selectedLead?.id === lead.id ? 'selected' : ''} onClick={() => setSelectedLead(lead)} tabIndex={0} onKeyDown={event => {
                        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedLead(lead); }
                      }}>
                        <td><strong>{lead.name || 'Sans nom'}</strong><span>{lead.email || 'Aucun e-mail'}</span></td>
                        <td>{getLeadTypeLabel(lead.leadType)}</td>
                        <td><span className="status-badge" style={{ backgroundColor: getStatusColor(lead.status) }}>{getStatusLabel(lead.status)}</span></td>
                        <td>{formatMaybeDate(lead.dateVisite)}</td>
                        <td>{lead.phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="pipeline-board past-contacts-board" aria-label={cardsText.pipelineTitle}>
                {([
                  { status: 'completed' as const, label: cardsText.completed },
                  { status: 'no-show' as const, label: cardsText.absent },
                ]).map(column => {
                  const columnLeads = sortedLeads.filter(lead => lead.status === column.status);
                  return <section key={column.status} className="pipeline-column">
                    <div className="pipeline-column-header">
                      <div className="pipeline-column-title"><span className="pipeline-status-dot" style={{ backgroundColor: getStatusColor(column.status) }} /><h3>{column.label}</h3></div>
                      <span className="pipeline-count">{columnLeads.length}</span>
                    </div>
                    <div className="pipeline-column-cards">
                      {columnLeads.length === 0 ? <div className="pipeline-empty">Aucun contact</div> : columnLeads.map(lead => (
                        <article key={lead.id} className="pipeline-card" onClick={() => setSelectedLead(lead)} tabIndex={0} onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedLead(lead); }
                        }}>
                          <div className="pipeline-card-top">
                            <div className="pipeline-avatar" aria-hidden="true">{(lead.name || '?').trim().charAt(0).toUpperCase()}</div>
                            <div className="pipeline-card-identity"><h4>{lead.name || 'Sans nom'}</h4><span>{getLeadTypeLabel(lead.leadType)}</span></div>
                          </div>
                          {lead.dateVisite && <div className="pipeline-card-row"><Calendar size={14} aria-hidden="true" /><span>{formatMaybeDate(lead.dateVisite)}</span></div>}
                          <div className="pipeline-card-footer"><span>{lead.email || '—'}</span><span className="pipeline-contact">{lead.phone || '—'}</span></div>
                        </article>
                      ))}
                    </div>
                  </section>;
                })}
              </div>
            )}
          </div>

          {sortedLeads.length > 0 && viewMode !== 'board' && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
              >
                Precedent
              </button>
              <div className="pagination-info">
                Page {safePage} sur {totalPages} · {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} sur {sortedLeads.length}
              </div>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
              >
                Suivant
              </button>
            </div>
          )}
        </main>

        {selectedLead && (
          <>
            <div 
              className="modal-backdrop"
              onClick={() => {
                setSelectedLead(null);
              }}
            ></div>
            <div className="details-modal">
              <div className="details-header">
                <h2>Détails de la Demande</h2>
                <div className="details-actions">
                  <button 
                    className="close-details"
                    onClick={() => {
                      setSelectedLead(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="details-content">
                  <div className="detail-section">
                    <h3>Coordonnées</h3>
                    <div className="detail-item">
                      <label>Nom:</label>
                      <span>{selectedLead.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedLead.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Téléphone:</label>
                      <span>{selectedLead.phone}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Information de la Demande</h3>
                    <div className="detail-item">
                      <label>Type:</label>
                      <span>{getLeadTypeLabel(selectedLead.leadType)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Statut:</label>
                      <div className="past-contact-status-control">
                        <StatusDropdown
                          value={selectedLead.status}
                          onChange={(value) => {
                            if (value === selectedLead.status) return;
                            setStatusUpdateError('');
                            setPendingStatus(value as Lead['status']);
                          }}
                          options={statusOptions}
                          ariaLabel="Modifier le statut"
                        />
                        <small>Toute modification nécessite une confirmation d’écrasement.</small>
                      </div>
                    </div>
                    {selectedLead.description && (
                      <div className="detail-item">
                        <label>Description:</label>
                        <span>{selectedLead.description}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-section">
                    <h3>Visite</h3>
                    <div className="detail-item">
                      <label>Date de visite:</label>
                      <span>{formatMaybeDate(selectedLead.dateVisite)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Calendar ID:</label>
                      <span>{selectedLead.calendarId || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Calendar URL:</label>
                      {selectedLead.calendarUrl ? (
                        <a
                          href={selectedLead.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir l'evenement
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Rappel</h3>
                    <div className="detail-item">
                      <label>Rappel envoye:</label>
                      <span>{formatYesNo(selectedLead.reminderSent)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date du rappel:</label>
                      <span>{formatMaybeDate(selectedLead.reminderDate)}</span>
                    </div>
                  </div>

            </div>
          </div>
        </>
        )}
        {pendingStatus && selectedLead && (
          <div className="past-status-confirm-overlay" role="presentation">
            <div className="past-status-confirm" role="alertdialog" aria-modal="true" aria-labelledby="status-override-title">
              <div className="past-status-confirm-icon"><CheckCircle size={26} /></div>
              <p className="past-status-eyebrow">ÉCRASEMENT DU STATUT</p>
              <h3 id="status-override-title">Confirmer cette modification ?</h3>
              <p>Le statut de <strong>{selectedLead.name}</strong> passera de <strong>{getStatusLabel(selectedLead.status)}</strong> à <strong>{getStatusLabel(pendingStatus)}</strong>.</p>
              <p className="past-status-warning">Cette action mettra à jour la fiche via le webhook et peut retirer ce contact de cette page.</p>
              {statusUpdateError && <p className="past-status-error" role="alert">{statusUpdateError}</p>}
              <div className="past-status-confirm-actions">
                <button type="button" className="cancel" disabled={isStatusUpdating} onClick={() => { setPendingStatus(null); setStatusUpdateError(''); }}>Conserver le statut</button>
                <button type="button" className="confirm" disabled={isStatusUpdating} onClick={() => void confirmStatusOverride()}>
                  {isStatusUpdating ? <><span className="button-spinner" /> Mise à jour…</> : 'Oui, écraser le statut'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default PastPatients;
