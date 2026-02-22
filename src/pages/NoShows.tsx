import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, Pencil, Trash2, Save, X, LogOut, Calendar, UserX, CheckCircle, Menu, Users, LayoutDashboard, ChevronLeft, UserCircle, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Lead } from '../types';
import Footer from '../components/Footer';
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

const NoShows = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Lead | null>(null);
  const [editOriginalId, setEditOriginalId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'custom'>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
      const response = await fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?statut=no-show`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }
      
      const data = await response.json();
      const rawLeads = Array.isArray(data) ? data : data.leads || [];
      setLeads(normalizeLeads(rawLeads));
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
      case 'completed': return 'Visite complétée';
      default: return 'Non confirmé';
    }
  };

  // Apply date filter
  const filteredByDate = dateFilter === 'all'
    ? leads
    : leads.filter(lead => {
        if (!lead.dateVisite) return false;
        switch (dateFilter) {
          case 'today':
            return isToday(lead.dateVisite);
          case 'tomorrow':
            return isTomorrow(lead.dateVisite);
          case 'custom':
            return matchesCustomDate(lead.dateVisite, customDate);
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
    
    // Format time
    const timeString = date.toLocaleString('fr-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Check if date is yesterday, today, or tomorrow
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return `Hier à ${timeString}`;
    } else if (dateOnly.getTime() === todayOnly.getTime()) {
      return `Aujourd'hui à ${timeString}`;
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return `Demain à ${timeString}`;
    }
    
    // Default format for other dates
    return date.toLocaleString('fr-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Helper function to check if a date is tomorrow in Montreal timezone
  const isTomorrow = (dateString: string) => {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(tomorrow);
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(tomorrowParts, 'year') === getPart(dateParts, 'year') &&
           getPart(tomorrowParts, 'month') === getPart(dateParts, 'month') &&
           getPart(tomorrowParts, 'day') === getPart(dateParts, 'day');
  };

  // Helper function to check if a date matches the custom date filter
  const matchesCustomDate = (dateString: string, customDate: string) => {
    if (!customDate) return true;
    const date = new Date(dateString);
    const filterDate = new Date(customDate);
    
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);
    
    const filterParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(filterDate);
    
    const getPart = (parts: Intl.DateTimeFormatPart[], type: string) => 
      parts.find((part) => part.type === type)?.value ?? '';
    
    return getPart(filterParts, 'year') === getPart(dateParts, 'year') &&
           getPart(filterParts, 'month') === getPart(dateParts, 'month') &&
           getPart(filterParts, 'day') === getPart(dateParts, 'day');
  };

  const handleEditChange = (field: keyof Lead, value: string | boolean) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm || !editOriginalId) return;
    
    // Update timestamp
    const updatedForm = {
      ...editForm,
      updatedAt: formatMontrealDateTime(new Date())
    };
    
    // Send PUT request to webhook
    try {
      const webhookData = {
        id: updatedForm.id,
        nom: updatedForm.name,
        email: updatedForm.email,
        telephone: updatedForm.phone,
        typeDemande: updatedForm.leadType,
        statut: updatedForm.status,
        rappelEnvoye: updatedForm.reminderSent,
        dateRappel: updatedForm.reminderDate,
        dateVisite: updatedForm.dateVisite,
        calendar_url: updatedForm.calendarUrl,
        calendar_id: updatedForm.calendarId,
        reschedule_url: updatedForm.rescheduleUrl,
        cancel_url: updatedForm.cancelUrl,
        creeA: updatedForm.createdAt,
        modifieA: updatedForm.updatedAt
      };

      await fetch(import.meta.env.VITE_WEBHOOK_LEADS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Failed to update lead on server:', error);
      // Continue with local update even if webhook fails
    }
    
    // Update local state
    const updatedLeads = leads.map(lead =>
      lead.id === editOriginalId ? updatedForm : lead
    );
    setLeads(updatedLeads);
    setSelectedLead(updatedForm);
    setIsEditing(false);
    setEditForm(null);
    setEditOriginalId(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.')) {
      return;
    }

    try {
      // Send DELETE request to webhook
      await fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?id=${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('Failed to delete lead from server:', error);
      // Continue with local deletion even if webhook fails
    }

    // Update local state
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    setLeads(updatedLeads);
    
    // Close the modal
    setSelectedLead(null);
    setIsEditing(false);
    setEditForm(null);
    setEditOriginalId(null);
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
            <h1>DENTISTO - No-Shows</h1>
          </div>
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
          <div className="header-right">
            <a
              className="header-text-button"
              href="/formulaire"
              target="_blank"
              rel="noopener noreferrer"
              title="Ouvrir le formulaire"
            >
              Formulaire
            </a>
          </div>
        </div>
      </header>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des no-shows...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>⚠️ {error}</p>
          <button onClick={fetchLeads} className="retry-button">Réessayer</button>
        </div>
      )}

      {!loading && (
      <div className="dashboard-content">
        <div className="kpis-section">
          <div className="kpi-card kpi-noshows">
            <div className="kpi-icon">
              <UserX size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Total No-Shows</div>
              <div className="kpi-value">{leads.length}</div>
            </div>
          </div>

          <div className="kpi-card kpi-visits">
            <div className="kpi-icon">
              <Calendar size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Rendez-vous manqués</div>
              <div className="kpi-value">
                {leads.filter(l => l.leadType === 'appointment').length}
              </div>
            </div>
          </div>

          <div className="kpi-card kpi-emergencies">
            <div className="kpi-icon">
              <ClipboardList size={28} strokeWidth={2} />
            </div>
            <div className="kpi-content">
              <div className="kpi-label">Urgences manquées</div>
              <div className="kpi-value">
                {leads.filter(l => l.leadType === 'emergency').length}
              </div>
            </div>
          </div>
        </div>

        <main className="main-content">
          <div className="leads-toolbar">
            <div className="filters-top">
              <div className="filter-group">
                <label htmlFor="date-filter" className="filter-label">Filtrer par date</label>
                <select
                  id="date-filter"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value as typeof dateFilter);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="tomorrow">Demain</option>
                  <option value="custom">Date personnalisée</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="sort-select" className="filter-label">Trier par</label>
                <select
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                  className="filter-select"
                >
                  <optgroup label="Date de visite">
                    <option value="dateVisiteDesc">Dernières visites</option>
                    <option value="dateVisiteAsc">Prochaines visites</option>
                  </optgroup>
                  <optgroup label="Nom du patient">
                    <option value="nameAsc">A → Z</option>
                    <option value="nameDesc">Z → A</option>
                  </optgroup>
                  <optgroup label="Date de création">
                    <option value="createdDesc">Plus récentes</option>
                    <option value="createdAsc">Plus anciennes</option>
                  </optgroup>
                </select>
              </div>
            </div>
            {dateFilter === 'custom' && (
              <div className="custom-date-picker">
                <label htmlFor="custom-date" className="filter-label">Sélectionner la date:</label>
                <input
                  type="date"
                  id="custom-date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="date-input"
                />
              </div>
            )}
          </div>
          <div className="leads-list">
            <div className="leads-list-header">
              <h2>No-Shows ({sortedLeads.length})</h2>
            </div>
            {sortedLeads.length === 0 ? (
              <div className="empty-state">
                <p>Aucun no-show trouvé.</p>
              </div>
            ) : (
              <div className="leads-grid">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsEditing(false);
                      setEditForm(null);
                      setEditOriginalId(null);
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
            )}
          </div>

          {sortedLeads.length > 0 && (
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
                setIsEditing(false);
                setEditForm(null);
                setEditOriginalId(null);
              }}
            ></div>
            <div className="details-modal">
              <div className="details-header">
                <h2>Détails de la Demande</h2>
                <div className="details-actions">
                  {!isEditing && (
                    <button
                      className="icon-button edit-button"
                      onClick={() => {
                        setIsEditing(true);
                        setEditForm({ ...selectedLead });
                        setEditOriginalId(selectedLead.id);
                      }}
                      title="Editer"
                    >
                      <Pencil size={20} strokeWidth={2.5} />
                    </button>
                  )}
                  {!isEditing && (
                    <button
                      className="icon-button delete-button"
                      onClick={() => handleDeleteLead(selectedLead.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        className="icon-button save-button"
                        onClick={handleSaveEdit}
                        title="Sauvegarder"
                      >
                        <Save size={20} strokeWidth={2.5} />
                      </button>
                      <button
                        className="icon-button cancel-button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm(null);
                          setEditOriginalId(null);
                        }}
                        title="Annuler"
                      >
                        <X size={20} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                  <button 
                    className="close-details"
                    onClick={() => {
                      setSelectedLead(null);
                      setIsEditing(false);
                      setEditForm(null);
                      setEditOriginalId(null);
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="details-content">
              {!isEditing && (
                <>
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
                      <span>{getStatusLabel(selectedLead.status)}</span>
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

                </>
              )}

              {isEditing && editForm && (
                <>
                  <div className="detail-section">
                    <h3>Edition</h3>
                    <div className="edit-form">
                      <div className="edit-field">
                        <label>Nom</label>
                        <input
                          className="edit-input"
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Email</label>
                        <input
                          className="edit-input"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Telephone</label>
                        <input
                          className="edit-input"
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="edit-field">
                        <label>Type de demande</label>
                        <select
                          className="edit-select"
                          value={editForm.leadType}
                          onChange={(e) => handleEditChange('leadType', e.target.value as Lead['leadType'])}
                        >
                          <option value="appointment">rendez-vous</option>
                          <option value="emergency">urgence</option>
                          <option value="question">question</option>
                        </select>
                      </div>
                      <div className="edit-field">
                        <label>Statut</label>
                        <select
                          className="edit-select status-filter"
                          value={editForm.status}
                          onChange={(e) => handleEditChange('status', e.target.value as Lead['status'])}
                        >
                          <option value="phone-unconfirmed" className="status-phone-unconfirmed">Non confirmé</option>
                          <option value="phone-confirmed" className="status-phone-confirmed">Confirmé</option>
                          <option value="canceled" className="status-canceled">Annulé</option>
                          <option value="no-show" className="status-no-show">Absent</option>
                          <option value="completed" className="status-completed">Visite complétée</option>
                        </select>
                      </div>
                      <div className="edit-field">
                        <label>Rappel envoye</label>
                        <select
                          className="edit-select"
                          value={editForm.reminderSent ? 'true' : 'false'}
                          onChange={(e) => handleEditChange('reminderSent', e.target.value === 'true')}
                        >
                          <option value="true">Oui</option>
                          <option value="false">Non</option>
                        </select>
                      </div>
                      <div className="edit-field">
                        <label>Description</label>
                        <textarea
                          className="edit-input"
                          value={editForm.description || ''}
                          onChange={(e) => handleEditChange('description', e.target.value)}
                          placeholder="Description de la visite..."
                          rows={4}
                          style={{ resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
        )}
      </div>
      )}
      <Footer />
      </div>
    </div>
  );
};

export default NoShows;
