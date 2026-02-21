import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, Users as UsersIcon, LayoutDashboard, ChevronLeft, UserCircle, UserPlus, Trash2, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Users.css';

interface User {
  id: string;
  phone: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      phone: '+1 514-890-1234',
      name: 'Admin Principal',
      role: 'admin',
      createdAt: '2026-01-15T10:00:00Z'
    },
    {
      id: '2',
      phone: '+1 514-890-5678',
      name: 'Utilisateur Test',
      role: 'user',
      createdAt: '2026-02-01T14:30:00Z'
    }
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ phone: '', name: '', role: 'user' as 'admin' | 'user' });

  const handleAddUser = () => {
    if (newUser.phone && newUser.name) {
      const user: User = {
        id: Date.now().toString(),
        phone: newUser.phone,
        name: newUser.name,
        role: newUser.role,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, user]);
      setNewUser({ phone: '', name: '', role: 'user' });
      setShowAddUser(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const toggleUserRole = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`users-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
          <Link to="/users" className={`sidebar-link ${location.pathname === '/users' ? 'active' : ''}`}>
            <UsersIcon size={20} />
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
              <h1>DENTISTO</h1>
            </div>
            <div className="header-center">
              <h2 className="page-title">Gestion des Utilisateurs</h2>
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

        <div className="users-content">
          <div className="users-header">
            <div className="users-stats">
              <div className="stat-card">
                <UsersIcon size={24} />
                <div className="stat-info">
                  <div className="stat-label">Total Utilisateurs</div>
                  <div className="stat-value">{users.length}</div>
                </div>
              </div>
              <div className="stat-card">
                <Shield size={24} />
                <div className="stat-info">
                  <div className="stat-label">Administrateurs</div>
                  <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
                </div>
              </div>
              <div className="stat-card">
                <ShieldOff size={24} />
                <div className="stat-info">
                  <div className="stat-label">Utilisateurs Standard</div>
                  <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
                </div>
              </div>
            </div>
            <button 
              className="add-user-button"
              onClick={() => setShowAddUser(!showAddUser)}
            >
              <UserPlus size={20} />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          {showAddUser && (
            <div className="add-user-form">
              <h3>Nouvel Utilisateur</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nom complet"
                  />
                </div>
                <div className="form-field">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+1 514-890-1234"
                  />
                </div>
                <div className="form-field">
                  <label>Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'user' })}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowAddUser(false)}>
                  Annuler
                </button>
                <button className="btn-save" onClick={handleAddUser}>
                  Créer l'utilisateur
                </button>
              </div>
            </div>
          )}

          <div className="users-list">
            <div className="users-table">
              <div className="table-header">
                <div className="th-name">Nom</div>
                <div className="th-phone">Téléphone</div>
                <div className="th-role">Rôle</div>
                <div className="th-created">Date de création</div>
                <div className="th-actions">Actions</div>
              </div>
              <div className="table-body">
                {users.map((user) => (
                  <div key={user.id} className="table-row">
                    <div className="td-name">
                      <UserCircle size={32} className="user-avatar" />
                      <span>{user.name}</span>
                    </div>
                    <div className="td-phone">{user.phone}</div>
                    <div className="td-role">
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? <Shield size={14} /> : <ShieldOff size={14} />}
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </span>
                    </div>
                    <div className="td-created">{formatDate(user.createdAt)}</div>
                    <div className="td-actions">
                      <button
                        className="btn-toggle-role"
                        onClick={() => toggleUserRole(user.id)}
                        title={user.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir en admin'}
                      >
                        {user.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Users;
