import { useApp } from '../context/AppContext';

export function ToastStack() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="toast-stack" aria-live="polite" data-testid="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} role="alert" data-testid={`toast-${t.type}`}>
          <div className="toast-indicator" />
          <span className="toast-msg">{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}
