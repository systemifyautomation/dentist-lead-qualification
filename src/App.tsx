import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LeadForm from './pages/LeadForm';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Login from './pages/Login';
import Strategy from './pages/Strategy';
import About from './pages/About';
import Reschedule from './pages/Reschedule';
import Cancel from './pages/Cancel';
import './App.css';

function App() {
  return (
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
            path="/users" 
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

