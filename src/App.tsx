import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LeadForm from './pages/LeadForm';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/apply" replace />} />
        <Route path="/apply" element={<LeadForm />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

