import { type ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastStack } from './Toast';
import { useApp } from '../context/AppContext';

export function Layout({ children }: { children: ReactNode }) {
  const { resetApp, addToast } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleReset = async () => {
    await resetApp();
    setConfirmOpen(false);
    addToast('success', 'Test environment reset to baseline');
    window.location.href = '/dashboard';
  };

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-wrapper">
            {children}
          </div>
          <button
            className="reset-env-btn"
            onClick={() => setConfirmOpen(true)}
            data-testid="reset-test-environment"
          >
            Reset Test Environment
          </button>
        </main>
      </div>
      <ToastStack />

      {confirmOpen && (
        <div className="overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="reset-modal">
            <div className="modal-header">
              <span className="modal-title">Reset Test Environment</span>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>
                This will clear all table records, kanban cards, uploaded files, form submissions, and activity log.
              </p>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Are you sure?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmOpen(false)} data-testid="reset-cancel">Cancel</button>
              <button className="btn btn-danger"    onClick={handleReset}               data-testid="reset-confirm">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
