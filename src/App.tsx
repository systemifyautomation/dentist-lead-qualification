import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LeadForm from './pages/LeadForm';
import AdminDashboard from './pages/AdminDashboard';
import NoShows from './pages/NoShows';
import PastPatients from './pages/PastPatients';
import Promotions from './pages/Promotions';
import Users from './pages/Users';
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
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/formulaire" replace />} />
          <Route path="/formulaire" element={<LeadForm />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/CRM" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/no-shows" 
            element={
              <ProtectedRoute>
                <NoShows />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients-passes" 
            element={
              <ProtectedRoute>
                <PastPatients />
              </ProtectedRoute>
            } 
          />
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

