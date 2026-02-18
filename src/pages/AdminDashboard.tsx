import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Lead } from '../types';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const getStoredLeads = () => JSON.parse(localStorage.getItem('leads') || '[]');
  const [leads, setLeads] = useState<Lead[]>(getStoredLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const updateLeadStatus = (leadId: string, newStatus: Lead['status']) => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
    if (selectedLead?.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
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

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filterStatus);

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new': return '#d2ac67';
      case 'contacted': return '#4a90e2';
      case 'qualified': return '#50c878';
      case 'unqualified': return '#e74c3c';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Lead Management Dashboard</h1>
          <Link to="/apply" className="view-form-link">View Application Form</Link>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="stats-section">
            <h2>Overview</h2>
            <div className="stat-card">
              <div className="stat-number">{leads.length}</div>
              <div className="stat-label">Total Leads</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{leads.filter(l => l.status === 'new').length}</div>
              <div className="stat-label">New</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{leads.filter(l => l.status === 'qualified').length}</div>
              <div className="stat-label">Qualified</div>
            </div>
          </div>

          <div className="filter-section">
            <h3>Filter by Status</h3>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="unqualified">Unqualified</option>
            </select>
          </div>
        </aside>

        <main className="main-content">
          <div className="leads-list">
            <h2>Leads ({filteredLeads.length})</h2>
            {filteredLeads.length === 0 ? (
              <div className="empty-state">
                <p>No leads found. Leads will appear here when submitted through the application form.</p>
              </div>
            ) : (
              <div className="leads-grid">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`lead-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="lead-card-header">
                      <h3>{lead.name}</h3>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(lead.status) }}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <div className="lead-card-info">
                      <p><strong>{lead.practiceName}</strong></p>
                      <p className="lead-meta">{lead.email}</p>
                      <p className="lead-meta">{lead.phone}</p>
                      <p className="lead-date">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {selectedLead && (
          <aside className="details-panel">
            <div className="details-header">
              <h2>Lead Details</h2>
              <button 
                className="close-details"
                onClick={() => setSelectedLead(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{selectedLead.name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedLead.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone:</label>
                  <span>{selectedLead.phone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Practice Information</h3>
                <div className="detail-item">
                  <label>Practice Name:</label>
                  <span>{selectedLead.practiceName}</span>
                </div>
                <div className="detail-item">
                  <label>Practice Size:</label>
                  <span>{selectedLead.practiceSize}</span>
                </div>
                <div className="detail-item">
                  <label>Budget:</label>
                  <span>{selectedLead.budget}</span>
                </div>
                <div className="detail-item">
                  <label>Timeline:</label>
                  <span>{selectedLead.timeline}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Challenges</h3>
                <p className="detail-text">{selectedLead.currentChallenges}</p>
              </div>

              {selectedLead.notes && (
                <div className="detail-section">
                  <h3>Additional Notes</h3>
                  <p className="detail-text">{selectedLead.notes}</p>
                </div>
              )}

              <div className="detail-section">
                <h3>Status Management</h3>
                <div className="status-buttons">
                  <button
                    className={`status-button ${selectedLead.status === 'new' ? 'active' : ''}`}
                    onClick={() => updateLeadStatus(selectedLead.id, 'new')}
                  >
                    New
                  </button>
                  <button
                    className={`status-button ${selectedLead.status === 'contacted' ? 'active' : ''}`}
                    onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}
                  >
                    Contacted
                  </button>
                  <button
                    className={`status-button ${selectedLead.status === 'qualified' ? 'active' : ''}`}
                    onClick={() => updateLeadStatus(selectedLead.id, 'qualified')}
                  >
                    Qualified
                  </button>
                  <button
                    className={`status-button ${selectedLead.status === 'unqualified' ? 'active' : ''}`}
                    onClick={() => updateLeadStatus(selectedLead.id, 'unqualified')}
                  >
                    Unqualified
                  </button>
                </div>
              </div>

              <div className="detail-section">
                <button
                  className="delete-button"
                  onClick={() => deleteLead(selectedLead.id)}
                >
                  Delete Lead
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
