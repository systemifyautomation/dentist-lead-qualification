import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './NotFound.css';
import { useI18n } from '../i18n/I18nContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const { messages } = useI18n();

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
        <h2>{messages.notFound.title}</h2>
        <p>{messages.notFound.description}</p>
        
        <div className="notfound-redirect">
          <p>
            {messages.notFound.redirect} {user ? messages.notFound.crm : messages.notFound.form}{' '}
            {messages.notFound.in} <strong>{countdown}</strong> {messages.notFound.seconds}...
          </p>
          <button onClick={handleRedirectNow} className="btn-redirect">
            {messages.notFound.now}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
