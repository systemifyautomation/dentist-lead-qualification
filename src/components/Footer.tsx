import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className="footer-text">
          © {currentYear} DENTIRO. Développé par{' '}
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
