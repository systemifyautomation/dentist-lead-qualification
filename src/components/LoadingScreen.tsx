import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
  compact?: boolean;
}

const LoadingScreen = ({ message = 'Chargement...', compact = false }: LoadingScreenProps) => (
  <div className={`brand-loading ${compact ? 'brand-loading-compact' : ''}`} role="status" aria-live="polite">
    <img
      src="/reactivationflow-logo.gif"
      alt=""
      className="brand-loading-animation"
      aria-hidden="true"
    />
    <p>{message}</p>
  </div>
);

export default LoadingScreen;
