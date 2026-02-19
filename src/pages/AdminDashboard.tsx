import { useState, useEffect } from 'react';
import { Phone, Pencil, Trash2, Save, X } from 'lucide-react';
import type { Lead } from '../types';
import DateTimePicker from '../components/DateTimePicker';
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

const AdminDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Lead | null>(null);
  const [editOriginalId, setEditOriginalId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'dateVisiteAsc' | 'dateVisiteDesc' | 'nameAsc' | 'nameDesc' | 'createdDesc' | 'createdAsc'>('dateVisiteAsc');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [addLeadForm, setAddLeadForm] = useState({
    name: '',
    email: '',
    phone: '+1 ',
    leadType: 'appointment' as Lead['leadType'],
    status: 'phone-unconfirmed' as Lead['status'],
    description: '',
    calendarUrl: '',
    calendarId: '',
    rescheduleUrl: '',
    cancelUrl: '',
    dateVisite: '',
    reminderSent: false
  });
  const [addLeadSelectedDate, setAddLeadSelectedDate] = useState<Date | null>(null);
  const [addLeadBookedSlots, setAddLeadBookedSlots] = useState<Array<{ start: string; end: string }>>([]);
  const [addLeadAvailabilityLoading, setAddLeadAvailabilityLoading] = useState(false);
  const [addLeadAvailabilityError, setAddLeadAvailabilityError] = useState<string | null>(null);
  const pageSize = 25;

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortOrder]);

  useEffect(() => {
    if (!showAddLeadModal) return;

    let isMounted = true;
    const fetchAvailability = async () => {
      setAddLeadAvailabilityLoading(true);
      setAddLeadAvailabilityError(null);
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const availabilityUrl = new URL('https://n8n.systemifyautomation.com/webhook/scalint-check-availability');
        availabilityUrl.searchParams.set('month_start', formatMontrealDateTime(monthStart));
        availabilityUrl.searchParams.set('month_end', formatMontrealDateTime(monthEnd));

        const response = await fetch(availabilityUrl.toString());
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des disponibilites');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Format de disponibilites invalide');
        }
        if (isMounted) {
          setAddLeadBookedSlots(data);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Erreur inconnue';
          setAddLeadAvailabilityError(message);
        }
      } finally {
        if (isMounted) {
          setAddLeadAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [showAddLeadModal]);

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
      const response = await fetch(import.meta.env.VITE_WEBHOOK_LEADS);
      
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
      // Fallback to localStorage if webhook fails
      const storedLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      setLeads(normalizeLeads(storedLeads));
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      setLeads(updatedLeads);
      localStorage.setItem('leads', JSON.stringify(updatedLeads));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    }
  };

  const filteredByStatus = filterStatus === 'all'
    ? leads
    : leads.filter(lead => lead.status === filterStatus);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLeads = normalizedQuery
    ? filteredByStatus.filter((lead) => {
        const typeLabel = lead.leadType === 'appointment'
          ? 'rendez-vous'
          : lead.leadType === 'emergency'
            ? 'urgence'
            : 'question';
        const statusLabel = getStatusLabel(lead.status).toLowerCase();
        const haystack = [
          lead.name,
          lead.email,
          lead.phone,
          lead.leadType,
          typeLabel,
          lead.status,
          statusLabel,
          lead.calendarUrl,
          lead.calendarId,
          lead.rescheduleUrl,
          lead.cancelUrl
        ].join(' ').toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : filteredByStatus;

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
    return new Date(dateString).toLocaleString('fr-CA', {
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

  const getStatusLabel = (status: Lead['status']) => {
    switch (status) {
      case 'phone-unconfirmed': return 'Non confirmé (WhatsApp)';
      case 'phone-confirmed': return 'Confirmé WhatsApp';
      case 'canceled': return 'Annulé';
      case 'no-show': return 'absent';
      case 'completed': return 'Visite complétée';
      default: return 'Non confirmé (WhatsApp)';
    }
  };

  const formatYesNo = (value?: boolean) => (value ? 'Oui' : 'Non');

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const phoneDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    
    if (phoneDigits.length === 0) {
      return '+1 ';
    } else if (phoneDigits.length <= 3) {
      return `+1 (${phoneDigits}`;
    } else if (phoneDigits.length <= 6) {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3)}`;
    } else {
      return `+1 (${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6, 10)}`;
    }
  };

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

  const handleAddLeadChange = (field: string, value: string | boolean) => {
    if (field === 'phone' && typeof value === 'string') {
      setAddLeadForm(prev => ({ ...prev, [field]: formatPhoneNumber(value) }));
    } else {
      setAddLeadForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddLeadDateChange = (date: Date | null) => {
    setAddLeadSelectedDate(date);
    if (date) {
      setAddLeadForm(prev => ({ ...prev, dateVisite: formatMontrealDateTime(date) }));
    } else {
      setAddLeadForm(prev => ({ ...prev, dateVisite: '' }));
    }
  };

  const handleCloseAddLeadModal = () => {
    setShowAddLeadModal(false);
    setAddLeadForm({
      name: '',
      email: '',
      phone: '+1 ',
      leadType: 'appointment',
      status: 'phone-unconfirmed',
      description: '',
      calendarUrl: '',
      calendarId: '',
      rescheduleUrl: '',
      cancelUrl: '',
      dateVisite: '',
      reminderSent: false
    });
    setAddLeadSelectedDate(null);
  };

  const handleAddLeadSubmit = async () => {
    if (!addLeadForm.name || !addLeadForm.phone || !addLeadForm.email) {
      alert('Veuillez remplir tous les champs obligatoires (nom, email, téléphone)');
      return;
    }

    const createdAt = formatMontrealDateTime(new Date());
    const newLead: Lead = {
      id: Date.now().toString(),
      name: addLeadForm.name,
      email: addLeadForm.email,
      phone: addLeadForm.phone,
      leadType: addLeadForm.leadType,
      status: addLeadForm.status,
      description: addLeadForm.description || undefined,
      calendarUrl: addLeadForm.calendarUrl || undefined,
      calendarId: addLeadForm.calendarId || undefined,
      rescheduleUrl: addLeadForm.rescheduleUrl || undefined,
      cancelUrl: addLeadForm.cancelUrl || undefined,
      reminderSent: addLeadForm.reminderSent,
      dateVisite: addLeadForm.dateVisite || undefined,
      createdAt
    };

    try {
      const webhookData = {
        nom: newLead.name,
        email: newLead.email,
        telephone: newLead.phone,
        typeDemande: newLead.leadType,
        statut: newLead.status,
        description: newLead.description,
        calendar_url: newLead.calendarUrl,
        calendar_id: newLead.calendarId,
        reschedule_url: newLead.rescheduleUrl,
        cancel_url: newLead.cancelUrl,
        rappelEnvoye: newLead.reminderSent,
        dateVisite: newLead.dateVisite,
        creeA: createdAt
      };

      await fetch(`${import.meta.env.VITE_WEBHOOK_LEADS}?type=manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Failed to submit manual lead:', error);
    }

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    
    handleCloseAddLeadModal();
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
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
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
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    
    // Close the modal
    setSelectedLead(null);
    setIsEditing(false);
    setEditForm(null);
    setEditOriginalId(null);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <h1>SCALINT</h1>
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
              href="https://scalint.net"
              target="_blank"
              rel="noreferrer"
              title="scalint.net"
            >
              Site
            </a>
            <a
              className="header-text-button"
              href="/strategy"
              title="Stratégie"
            >
              Stratégie
            </a>
            <a
              className="header-text-button"
              href="/apply"
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
          <p>Chargement des demandes...</p>
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
        <aside className="sidebar">
          <div className="stats-section">
            <h2>Résumé</h2>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              <div className="stat-number">{leads.length}</div>
              <div className="stat-label">Total Demandes</div>
            </button>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'phone-unconfirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('phone-unconfirmed')}
            >
              <div className="stat-number">{leads.filter(l => l.status === 'phone-unconfirmed').length}</div>
              <div className="stat-label">Non confirmé WhatsApp</div>
            </button>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'phone-confirmed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('phone-confirmed')}
            >
              <div className="stat-number">{leads.filter(l => l.status === 'phone-confirmed').length}</div>
              <div className="stat-label">Confirmé WhatsApp</div>
            </button>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'canceled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('canceled')}
            >
              <div className="stat-number">{leads.filter(l => l.status === 'canceled').length}</div>
              <div className="stat-label">Annulés</div>
            </button>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'no-show' ? 'active' : ''}`}
              onClick={() => setFilterStatus('no-show')}
            >
              <div className="stat-number">{leads.filter(l => l.status === 'no-show').length}</div>
              <div className="stat-label">No-shows</div>
            </button>
            <button
              type="button"
              className={`stat-card ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              <div className="stat-number">{leads.filter(l => l.status === 'completed').length}</div>
              <div className="stat-label">Visites complétées</div>
            </button>
          </div>

        </aside>

        <main className="main-content">
          <div className="leads-toolbar">
            <div className="filters-top">
              <div className="filter-group">
                <label htmlFor="status-filter" className="filter-label">Filtrer par statut</label>
                <select 
                  id="status-filter"
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select status-filter"
                >
                  <option value="all">Toutes les demandes</option>
                  <option value="phone-unconfirmed" className="status-phone-unconfirmed">Non confirmé WhatsApp</option>
                  <option value="phone-confirmed" className="status-phone-confirmed">Confirmé WhatsApp</option>
                  <option value="canceled" className="status-canceled">Annulé</option>
                  <option value="no-show" className="status-no-show">Absent</option>
                  <option value="completed" className="status-completed">Visite complétée</option>
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
                    <option value="dateVisiteAsc">Prochaines visites</option>
                    <option value="dateVisiteDesc">Dernières visites</option>
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
          </div>
          <div className="leads-list">
            <div className="leads-list-header">
              <h2>Demandes Patients ({sortedLeads.length})</h2>
              <button
                type="button"
                className="add-lead-button"
                onClick={() => setShowAddLeadModal(true)}
              >
                + Ajouter Lead
              </button>
            </div>
            {sortedLeads.length === 0 ? (
              <div className="empty-state">
                <p>Aucune demande trouvée. Ajustez votre recherche ou votre filtre.</p>
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
                    <div className="detail-item">
                      <label>Lien de report:</label>
                      {selectedLead.rescheduleUrl ? (
                        <a
                          href={selectedLead.rescheduleUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Replanifier
                        </a>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                    <div className="detail-item">
                      <label>Lien d'annulation:</label>
                      {selectedLead.cancelUrl ? (
                        <a
                          href={selectedLead.cancelUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Annuler
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
                          <option value="phone-unconfirmed" className="status-phone-unconfirmed">Non confirmé WhatsApp</option>
                          <option value="phone-confirmed" className="status-phone-confirmed">Confirmé WhatsApp</option>
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

                  <div className="detail-section">
                    <button
                      className="delete-button"
                      onClick={() => deleteLead(selectedLead.id)}
                    >
                      Supprimer la Demande
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
        )}

      {showAddLeadModal && (
        <>
          <div 
            className="modal-backdrop"
            onClick={handleCloseAddLeadModal}
          ></div>
          <div className="details-modal">
            <div className="details-header">
              <h2>Ajouter un Lead</h2>
              <div className="details-actions">
                <button 
                  className="close-details"
                  onClick={handleCloseAddLeadModal}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h3>Informations du Lead</h3>
                <div className="edit-form">
                  <div className="edit-field">
                    <label>Nom *</label>
                    <input
                      className="edit-input"
                      type="text"
                      value={addLeadForm.name}
                      onChange={(e) => handleAddLeadChange('name', e.target.value)}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Email *</label>
                    <input
                      className="edit-input"
                      type="email"
                      value={addLeadForm.email}
                      onChange={(e) => handleAddLeadChange('email', e.target.value)}
                      placeholder="exemple@email.com"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Téléphone *</label>
                    <input
                      className="edit-input"
                      type="text"
                      value={addLeadForm.phone}
                      onChange={(e) => handleAddLeadChange('phone', e.target.value)}
                      placeholder="+1 (XXX) XXX-XXXX"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Type de demande</label>
                    <select
                      className="edit-select"
                      value={addLeadForm.leadType}
                      onChange={(e) => handleAddLeadChange('leadType', e.target.value)}
                    >
                      <option value="appointment">rendez-vous</option>
                      <option value="emergency">urgence</option>
                      <option value="question">question</option>
                    </select>
                  </div>
                  <div className="edit-field">
                    <label>Statut</label>
                    <select
                      className="edit-select"
                      value={addLeadForm.status}
                      onChange={(e) => handleAddLeadChange('status', e.target.value)}
                    >
                      <option value="phone-unconfirmed">non confirmé WhatsApp</option>
                      <option value="phone-confirmed">confirmé WhatsApp</option>
                      <option value="canceled">annulé</option>
                      <option value="no-show">absent</option>
                      <option value="completed">visite complétée</option>
                    </select>
                  </div>
                  <div className="edit-field">
                    <label>Date de visite</label>
                    <DateTimePicker
                      selected={addLeadSelectedDate}
                      onChange={handleAddLeadDateChange}
                      placeholder="Cliquez pour sélectionner une date"
                      isClearable
                      bookedSlots={addLeadBookedSlots}
                      availabilityLoading={addLeadAvailabilityLoading}
                      availabilityError={addLeadAvailabilityError}
                    />
                    <small className="form-hint">Disponibilités: Lundi au Vendredi, 8h00 à 18h00</small>
                  </div>
                  <div className="edit-field">
                    <label>Rappel envoyé</label>
                    <select
                      className="edit-select"
                      value={addLeadForm.reminderSent ? 'true' : 'false'}
                      onChange={(e) => handleAddLeadChange('reminderSent', e.target.value === 'true')}
                    >
                      <option value="false">Non</option>
                      <option value="true">Oui</option>
                    </select>
                  </div>
                  <div className="edit-field">
                    <label>Description</label>
                    <textarea
                      className="edit-input"
                      value={addLeadForm.description}
                      onChange={(e) => handleAddLeadChange('description', e.target.value)}
                      placeholder="Description de la visite..."
                      rows={4}
                      style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <button
                  className="save-button"
                  onClick={handleAddLeadSubmit}
                >
                  Créer le Lead
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
