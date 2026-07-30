import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import PastPatients from './pages/PastPatients';
import Promotions from './pages/Promotions';
import Users from './pages/Users';
import Support from './pages/Support';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Strategy from './pages/Strategy';
import About from './pages/About';
import Reschedule from './pages/Reschedule';
import Cancel from './pages/Cancel';
import Verify from './pages/Verify';
import NotFound from './pages/NotFound';
import './App.css';
import { I18nProvider } from './i18n/I18nContext';

function App() {
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('reactivationflow_settings') || '{}');
      if (saved.primaryColor) document.documentElement.style.setProperty('--color-gold', saved.primaryColor);
      if (saved.accentColor) document.documentElement.style.setProperty('--color-dark-gray', saved.accentColor);
      if (saved.backgroundColor) document.documentElement.style.setProperty('--color-light-gray', saved.backgroundColor);
    } catch {
      // Ignore invalid device-local preferences and retain the default theme.
    }
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/CRM" element={<Navigate to="/" replace />} />
          <Route path="/no-shows" element={<Navigate to="/contacts-passes" replace />} />
          <Route 
            path="/contacts-passes"
            element={
              <ProtectedRoute>
                <PastPatients />
              </ProtectedRoute>
            } 
          />
          <Route path="/patients-passes" element={<Navigate to="/contacts-passes" replace />} />
          <Route 
            path="/promotions" 
            element={
              <ProtectedRoute>
                <Promotions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/utilisateurs" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/about" element={<About />} />
          <Route path="/reschedule" element={<Reschedule />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;

