import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, AlertCircle } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './Login.css';
import { useI18n } from '../i18n/I18nContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { messages } = useI18n();

  // Redirect to CRM if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setVerificationMessage('Verifying credentials...');

    console.log('Login form submitted with phone:', phone);

    try {
      const result = await login(phone, password);
      
      console.log('Login result:', result);
      
      if (result.success) {
        setVerificationMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
        setVerificationMessage('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      setVerificationMessage('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/reactivationflow-logo.svg" alt="ReactivationFlow" />
          </div>
          <h1>ReactivationFlow</h1>
          <p>{messages.login.portal}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {verificationMessage && !error && (
            <div className="login-info">
              <span>{verificationMessage}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="phone">
              <Phone size={18} />
              {messages.login.phone}
            </label>
            <PhoneInput
              international
              defaultCountry="CA"
              value={phone}
              onChange={(value) => setPhone(value || '')}
              placeholder={messages.login.phonePlaceholder}
              disabled={loading}
              className="login-phone-input"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              <Lock size={18} />
              {messages.login.password}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={messages.login.passwordPlaceholder}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? messages.login.submitting : messages.login.submit}
          </button>
        </form>

        <div className="login-footer">
          <p>Powered by <a href="https://systemifyautomation.com" target="_blank" rel="noopener noreferrer">Systemify Automation</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
