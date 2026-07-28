import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import './NotFound.css';
import { useI18n } from '../i18n/I18nContext';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const { messages } = useI18n();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleRedirectNow = () => {
    navigate('/', { replace: true });
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
            {messages.notFound.redirect} {messages.notFound.crm}{' '}
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
