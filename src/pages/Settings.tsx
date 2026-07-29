import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCircle,
  ChevronLeft,
  Clock3,
  Headphones,
  Languages,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Star,
  UserCircle,
  Users,
  UserX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appLocale } from '../config/localization';
import type { AppLocale } from '../config/localization';
import './AdminDashboard.css';
import './Settings.css';

type TimeUnit = 'minutes' | 'hours' | 'days';

type AppSettings = {
  language: AppLocale;
  appointmentReminders: boolean;
  reminderDelay: number;
  reminderUnit: TimeUnit;
  reviewRequests: boolean;
  reviewDelay: number;
  reviewUnit: TimeUnit;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
};

const SETTINGS_KEY = 'reactivationflow_settings';

const defaultSettings: AppSettings = {
  language: appLocale,
  appointmentReminders: true,
  reminderDelay: 24,
  reminderUnit: 'hours',
  reviewRequests: true,
  reviewDelay: 2,
  reviewUnit: 'hours',
  primaryColor: '#d2ac67',
  accentColor: '#1a1a1a',
  backgroundColor: '#f5f5f5',
};

const readSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(readSettings);
  const [saved, setSaved] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.setProperty('--color-gold', settings.primaryColor);
    document.documentElement.style.setProperty('--color-dark-gray', settings.accentColor);
    document.documentElement.style.setProperty('--color-light-gray', settings.backgroundColor);
  }, [settings.primaryColor, settings.accentColor, settings.backgroundColor]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = () => {
    const previousLanguage = readSettings().language;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem('reactivationflow_locale', settings.language);
    setSaved(true);
    if (previousLanguage !== settings.language) window.location.reload();
  };

  const resetColors = () => {
    update('primaryColor', defaultSettings.primaryColor);
    update('accentColor', defaultSettings.accentColor);
    update('backgroundColor', defaultSettings.backgroundColor);
  };

  return (
    <div className={`admin-dashboard settings-page ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
          <Link to="/support" className="sidebar-link"><Headphones size={20} />{!sidebarCollapsed && <span>SUPPORT</span>}</Link>
          <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
            <SettingsIcon size={20} />{!sidebarCollapsed && <span>PARAMÈTRES</span>}
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

      <main className="settings-main">
        <header className="settings-header">
          <div>
            <p className="settings-eyebrow">CONFIGURATION</p>
            <h1>Paramètres</h1>
            <p>Personnalisez les communications et l’apparence de votre espace.</p>
          </div>
          <button className={`settings-save ${saved ? 'saved' : ''}`} onClick={saveSettings}>
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        </header>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-icon"><Languages size={21} /></span>
              <div><h2>Langue</h2><p>Langue utilisée dans toute l’application.</p></div>
            </div>
            <label className="settings-field">
              <span>Langue de l’interface</span>
              <select value={settings.language} onChange={(event) => update('language', event.target.value as AppLocale)}>
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-icon"><Bell size={21} /></span>
              <div><h2>Rappels</h2><p>Planifiez les rappels avant une visite ou une commande.</p></div>
              <label className="settings-switch">
                <input type="checkbox" checked={settings.appointmentReminders} onChange={(event) => update('appointmentReminders', event.target.checked)} />
                <span />
              </label>
            </div>
            <div className={`settings-timing ${!settings.appointmentReminders ? 'disabled' : ''}`}>
              <Clock3 size={18} />
              <span>Envoyer</span>
              <input type="number" min="1" value={settings.reminderDelay} disabled={!settings.appointmentReminders} onChange={(event) => update('reminderDelay', Math.max(1, Number(event.target.value)))} />
              <select value={settings.reminderUnit} disabled={!settings.appointmentReminders} onChange={(event) => update('reminderUnit', event.target.value as TimeUnit)}>
                <option value="minutes">minutes</option>
                <option value="hours">heures</option>
                <option value="days">jours</option>
              </select>
              <span>avant</span>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <span className="settings-icon"><Star size={21} /></span>
              <div><h2>Demande d’avis</h2><p>Demandez automatiquement un avis après la visite ou la commande.</p></div>
              <label className="settings-switch">
                <input type="checkbox" checked={settings.reviewRequests} onChange={(event) => update('reviewRequests', event.target.checked)} />
                <span />
              </label>
            </div>
            <div className={`settings-timing ${!settings.reviewRequests ? 'disabled' : ''}`}>
              <Clock3 size={18} />
              <span>Envoyer</span>
              <input type="number" min="1" value={settings.reviewDelay} disabled={!settings.reviewRequests} onChange={(event) => update('reviewDelay', Math.max(1, Number(event.target.value)))} />
              <select value={settings.reviewUnit} disabled={!settings.reviewRequests} onChange={(event) => update('reviewUnit', event.target.value as TimeUnit)}>
                <option value="minutes">minutes</option>
                <option value="hours">heures</option>
                <option value="days">jours</option>
              </select>
              <span>après</span>
            </div>
          </section>

          <section className="settings-card settings-colors-card">
            <div className="settings-card-heading">
              <span className="settings-icon"><Palette size={21} /></span>
              <div><h2>Couleurs</h2><p>Adaptez l’interface à votre identité visuelle.</p></div>
              <button className="reset-colors" onClick={resetColors}><RotateCcw size={15} /> Réinitialiser</button>
            </div>
            <div className="color-settings">
              {([
                ['primaryColor', 'Couleur principale'],
                ['accentColor', 'Couleur foncée'],
                ['backgroundColor', 'Arrière-plan'],
              ] as const).map(([key, label]) => (
                <label className="color-field" key={key}>
                  <span>{label}</span>
                  <div>
                    <input type="color" value={settings[key]} onChange={(event) => update(key, event.target.value)} />
                    <input type="text" value={settings[key]} maxLength={7} onChange={(event) => update(key, event.target.value)} />
                  </div>
                </label>
              ))}
            </div>
            <div className="brand-preview" style={{ background: settings.backgroundColor }}>
              <div className="brand-preview-bar" style={{ background: settings.accentColor }} />
              <div>
                <span>Aperçu</span>
                <button style={{ background: settings.primaryColor }}>Action principale</button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
