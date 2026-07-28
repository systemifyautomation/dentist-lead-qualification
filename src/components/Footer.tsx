import React from 'react';
import './Footer.css';
import { useI18n } from '../i18n/I18nContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { messages } = useI18n();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} ReactivationFlow. {messages.developedBy}{' '}
          <a
            href="https://systemifyautomation.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Systemify Automation
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
