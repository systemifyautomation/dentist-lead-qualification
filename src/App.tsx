import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LeadForm from './pages/LeadForm';
import AdminDashboard from './pages/AdminDashboard';
import Strategy from './pages/Strategy';
import Reschedule from './pages/Reschedule';
import Cancel from './pages/Cancel';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/apply" replace />} />
        <Route path="/apply" element={<LeadForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/reschedule" element={<Reschedule />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

