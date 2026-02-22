import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, Users as UsersIcon, LayoutDashboard, ChevronLeft, UserCircle, UserPlus, Trash2, Shield, ShieldOff, AlertCircle, Loader2, Key, Eye, EyeOff, UserX, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import './Users.css';

interface User {
  id: number;
  phone_number: string;
  email: string | null;
  name: string;
  role: 'admin' | 'super-admin' | 'utilisateur';
}

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ 
    phone: '', 
    name: '', 
    email: '',
    role: 'utilisateur' as 'admin' | 'super-admin' | 'utilisateur' 
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showConfirmPasswordModal, setShowConfirmPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(import.meta.env.VITE_WEBHOOK_USERS);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleHierarchy = (role: string): number => {
    switch (role) {
      case 'utilisateur': return 1;
      case 'admin': return 2;
      case 'super-admin': return 3;
      default: return 0;
    }
  };

  const getAvailableRoles = () => {
    const currentUserRole = user?.role || 'utilisateur';
    const currentLevel = getRoleHierarchy(currentUserRole);
    
    const allRoles = [
      { value: 'utilisateur', label: 'Utilisateur', level: 1 },
      { value: 'admin', label: 'Administrateur', level: 2 },
      { value: 'super-admin', label: 'Super Admin', level: 3 }
    ];
    
    return allRoles.filter(role => role.level <= currentLevel);
  };

  const handleAddUser = async () => {
    if (!newUser.phone || !newUser.name) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    // Basic email validation (only if email is provided)
    if (newUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUser.email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
      }
    }

    // Show password confirmation modal
    setShowConfirmPasswordModal(true);
  };

  const confirmAddUser = async () => {
    if (!adminPassword) {
      alert('Veuillez entrer votre mot de passe');
      return;
    }

    if (!user?.phone) {
      alert('Impossible de récupérer votre numéro de téléphone');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(import.meta.env.VITE_WEBHOOK_USERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: newUser.phone,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          admin_password: adminPassword,
          admin_phone_number: user.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add user');
      }

      // Refresh the user list
      await fetchUsers();
      
      // Reset form
      setNewUser({ 
        phone: '', 
        name: '', 
        email: '',
        role: 'utilisateur' 
      });
      setAdminPassword('');
      setShowAddUser(false);
      setShowConfirmPasswordModal(false);
    } catch (err) {
      console.error('Error adding user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'utilisateur';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = (id: number) => {
    // Check if user has permission to delete
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
      alert('Seuls les administrateurs peuvent supprimer des utilisateurs');
      return;
    }

    // Show password confirmation modal
    setDeleteUserId(id);
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId || !deletePassword) {
      alert('Veuillez entrer votre mot de passe');
      return;
    }

    if (!user?.phone) {
      alert('Impossible de récupérer votre numéro de téléphone');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(import.meta.env.VITE_WEBHOOK_USERS, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteUserId,
          admin_password: deletePassword,
          admin_phone_number: user.phone
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setShowDeleteModal(false);
      setDeleteUserId(null);
      setDeletePassword('');

      // Refresh the user list
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserRole = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    // Calculate next role
    let newRole: 'admin' | 'super-admin' | 'utilisateur';
    if (user.role === 'utilisateur') newRole = 'admin';
    else if (user.role === 'admin') newRole = 'super-admin';
    else newRole = 'utilisateur';

    try {
      setActionLoading(true);
      const response = await fetch(import.meta.env.VITE_WEBHOOK_USERS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          phone_number: user.phone_number,
          name: user.name,
          email: user.email,
          role: newRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Refresh the user list
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Erreur lors de la mise à jour du rôle. Veuillez réessayer.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'super-admin': return 'Super Admin';
      case 'utilisateur': return 'Utilisateur';
      default: return role;
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUserId || !oldPassword || !newPassword || !confirmNewPassword) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      alert('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (oldPassword === newPassword) {
      alert('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(import.meta.env.VITE_WEBHOOK_USERS, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUserId,
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update password');
      }

      setShowPasswordModal(false);
      setSelectedUserId(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOldPasswordVisible(false);
      setNewPasswordVisible(false);
      setConfirmPasswordVisible(false);
    } catch (err) {
      console.error('Error updating password:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mot de passe';
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openPasswordModal = (userId: number) => {
    if (user?.role !== 'super-admin') {
      alert('Seuls les super-administrateurs peuvent changer les mots de passe des utilisateurs');
      return;
    }
    setSelectedUserId(userId);
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setOldPasswordVisible(false);
    setNewPasswordVisible(false);
    setConfirmPasswordVisible(false);
    setShowPasswordModal(true);
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
          <Link to="/no-shows" className={`sidebar-link ${location.pathname === '/no-shows' ? 'active' : ''}`}>
            <UserX size={20} />
            {!sidebarCollapsed && <span>NO-SHOWS</span>}
          </Link>
          <Link to="/patients-passes" className={`sidebar-link ${location.pathname === '/patients-passes' ? 'active' : ''}`}>
            <CheckCircle size={20} />
            {!sidebarCollapsed && <span>PATIENTS PASSÉS</span>}
          </Link>
          <Link to="/utilisateurs" className={`sidebar-link ${location.pathname === '/utilisateurs' ? 'active' : ''}`}>
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
          {loading && (
            <div className="loading-container">
              <Loader2 size={48} className="spinner" />
              <p>Chargement des utilisateurs...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <AlertCircle size={48} />
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-retry">
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
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
                  <div className="stat-value">{users.filter(u => u.role === 'admin' || u.role === 'super-admin').length}</div>
                </div>
              </div>
              <div className="stat-card">
                <ShieldOff size={24} />
                <div className="stat-info">
                  <div className="stat-label">Utilisateurs Standard</div>
                  <div className="stat-value">{users.filter(u => u.role === 'utilisateur').length}</div>
                </div>
              </div>
            </div>
            <button 
              className="add-user-button"
              onClick={() => setShowAddUser(!showAddUser)}
              disabled={actionLoading}
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
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-field">
                  <label>Email <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(optionnel)</span></label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@exemple.com"
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-field">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+1 514-890-1234"
                    disabled={actionLoading}
                  />
                </div>
                <div className="form-field">
                  <label>Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'super-admin' | 'utilisateur' })}
                    disabled={actionLoading}
                  >
                    {getAvailableRoles().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {user?.role !== 'super-admin' && (
                    <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Vous pouvez uniquement attribuer des rôles égaux ou inférieurs au vôtre
                    </small>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button 
                  className="btn-cancel" 
                  onClick={() => setShowAddUser(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  className="btn-save" 
                  onClick={handleAddUser}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Création...</span>
                    </>
                  ) : (
                    'Créer l\'utilisateur'
                  )}
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
                <div className="th-actions">Actions</div>
              </div>
              <div className="table-body">
                {users.map((userData) => (
                  <div key={userData.id} className="table-row">
                    <div className="td-name">
                      <UserCircle size={32} className="user-avatar" />
                      <span>{userData.name}</span>
                    </div>
                    <div className="td-phone">{userData.phone_number}</div>
                    <div className="td-role">
                      <span className={`role-badge ${userData.role}`}>
                        {userData.role === 'super-admin' ? <Shield size={14} /> : userData.role === 'admin' ? <Shield size={14} /> : <ShieldOff size={14} />}
                        {getRoleLabel(userData.role)}
                      </span>
                    </div>
                    <div className="td-actions">
                      {user?.role === 'super-admin' && (
                        <button
                          className="btn-password"
                          onClick={() => openPasswordModal(userData.id)}
                          title="Changer le mot de passe"
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 size={16} className="spinner" /> : <Key size={16} />}
                        </button>
                      )}
                      <button
                        className="btn-toggle-role"
                        onClick={() => toggleUserRole(userData.id)}
                        title="Changer le rôle"
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 size={16} className="spinner" /> : <Shield size={16} />}
                      </button>
                      {(user?.role === 'admin' || user?.role === 'super-admin') && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteUser(userData.id)}
                          title="Supprimer l'utilisateur"
                          disabled={actionLoading}
                        >
                          {actionLoading ? <Loader2 size={16} className="spinner" /> : <Trash2 size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Changer le mot de passe</h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={actionLoading}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label htmlFor="old-password">Ancien mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="old-password"
                      type={oldPasswordVisible ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Entrez l'ancien mot de passe"
                      disabled={actionLoading}
                      autoComplete="current-password"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      disabled={actionLoading}
                    >
                      {oldPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="new-password">Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={newPasswordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez le nouveau mot de passe"
                      disabled={actionLoading}
                      minLength={6}
                      autoComplete="new-password"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      disabled={actionLoading}
                    >
                      {newPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <small>Le mot de passe doit contenir au moins 6 caractères</small>
                </div>
                <div className="form-field">
                  <label htmlFor="confirm-password">Confirmer le nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                      disabled={actionLoading}
                      minLength={6}
                      autoComplete="new-password"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      disabled={actionLoading}
                    >
                      {confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  className="btn-save"
                  onClick={handlePasswordChange}
                  disabled={actionLoading || !oldPassword || !newPassword || !confirmNewPassword}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <>
                      <Key size={16} />
                      <span>Mettre à jour</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content password-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirmer la suppression</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteUserId(null);
                  }}
                  disabled={actionLoading}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  Pour supprimer cet utilisateur, veuillez confirmer votre mot de passe.
                </p>
                <div className="form-field">
                  <label htmlFor="delete-password">Votre mot de passe</label>
                  <input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    disabled={actionLoading}
                    autoComplete="current-password"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && deletePassword) {
                        confirmDeleteUser();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteUserId(null);
                  }}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  className="btn-save"
                  onClick={confirmDeleteUser}
                  disabled={actionLoading || !deletePassword}
                  style={{ background: '#dc2626' }}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Suppression...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Supprimer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowConfirmPasswordModal(false)}>
            <div className="modal-content password-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Confirmer votre mot de passe</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowConfirmPasswordModal(false);
                    setAdminPassword('');
                  }}
                  disabled={actionLoading}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                  Pour créer un nouvel utilisateur, veuillez confirmer votre mot de passe.
                </p>
                <div className="form-field">
                  <label htmlFor="admin-password">Votre mot de passe</label>
                  <input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    disabled={actionLoading}
                    autoComplete="current-password"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && adminPassword) {
                        confirmAddUser();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setShowConfirmPasswordModal(false);
                    setAdminPassword('');
                  }}
                  disabled={actionLoading}
                >
                  Annuler
                </button>
                <button 
                  className="btn-save"
                  onClick={confirmAddUser}
                  disabled={actionLoading || !adminPassword}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Vérification...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      <span>Confirmer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Users;
