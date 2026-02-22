import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to CRM if authenticated (worker), otherwise to form
          navigate(user ? '/CRM' : '/formulaire', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user]);

  const handleRedirectNow = () => {
    navigate(user ? '/CRM' : '/formulaire', { replace: true });
  };

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-icon">
          <AlertCircle size={80} />
        </div>
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
        
        <div className="notfound-redirect">
          <p>
            Redirection automatique vers {user ? 'le CRM' : 'le formulaire'} dans <strong>{countdown}</strong> seconde{countdown > 1 ? 's' : ''}...
          </p>
          <button onClick={handleRedirectNow} className="btn-redirect">
            Rediriger maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
