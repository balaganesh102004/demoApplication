import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function ModalLab() {
  const { addToast } = useApp();
  const [basicOpen,   setBasicOpen]   = useState(false);
  const [largeOpen,   setLargeOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formOpen,    setFormOpen]    = useState(false);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [formData, setFormData]       = useState({ name: '', message: '' });
  const [formErrors, setFormErrors]   = useState<{ name?: string; message?: string }>({});
  const [formTouched, setFormTouched] = useState<{ name?: boolean; message?: boolean }>({});

  const validateModalForm = () => {
    const errs: { name?: string; message?: string } = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.message.trim()) errs.message = 'Message is required';
    else if (formData.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleFormModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched({ name: true, message: true });
    const errs = validateModalForm();
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addToast('success', 'Modal form submitted');
    setFormOpen(false);
    setFormData({ name: '', message: '' });
    setFormErrors({});
    setFormTouched({});
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setFormData({ name: '', message: '' });
    setFormErrors({});
    setFormTouched({});
  };

  return (
    <div data-testid="page-overlays">
      <div className="page-header">
        <h1>Modal &amp; Overlay Lab</h1>
        <p>Modals, drawers, and notification toasts — all variants</p>
      </div>

      <div className="controls-layout">
        <div className="card">
          <div className="card-header"><span className="card-title">Modals</span></div>
          <div className="card-body">
            <div className="check-group">
              <p className="text-sm text-muted mb-12">Click a button to open a modal variant.</p>
              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setBasicOpen(true)}   data-testid="open-basic-modal">Basic modal</button>
                <button className="btn btn-secondary" onClick={() => setLargeOpen(true)}   data-testid="open-large-modal">Large modal</button>
                <button className="btn btn-danger"    onClick={() => setConfirmOpen(true)} data-testid="open-confirm-modal">Confirmation</button>
                <button className="btn btn-primary"   onClick={() => setFormOpen(true)}    data-testid="open-form-modal">Form modal</button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Drawer</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">A panel that slides in from the right side.</p>
            <button className="btn btn-secondary" onClick={() => setDrawerOpen(true)} data-testid="open-drawer">Open Drawer</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Toast Notifications</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">Trigger different notification types.</p>
            <div className="btn-row">
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('success', 'Operation completed successfully')} data-testid="toast-success">Success</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('error',   'Something went wrong')}              data-testid="toast-error">Error</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('warning', 'Proceed with caution')}              data-testid="toast-warning">Warning</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('info',    'Here is some information')}          data-testid="toast-info">Info</button>
              <button className="btn btn-secondary btn-sm" onClick={() => addToast('info', 'This will not auto-dismiss', true)}     data-testid="toast-persistent">Persistent</button>
            </div>
          </div>
        </div>
      </div>

      {/* Basic */}
      {basicOpen && (
        <div className="overlay" onClick={() => setBasicOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="basic-modal">
            <div className="modal-header">
              <span className="modal-title">Basic Modal</span>
              <button className="modal-close" onClick={() => setBasicOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p className="text-sm">This modal can be closed by clicking the × button, clicking outside, or pressing Escape.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setBasicOpen(false)} data-testid="modal-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Large */}
      {largeOpen && (
        <div className="overlay" onClick={() => setLargeOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} data-testid="large-modal">
            <div className="modal-header">
              <span className="modal-title">Large Modal</span>
              <button className="modal-close" onClick={() => setLargeOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <p className="text-sm mb-12">A wider modal for more content.</p>
              <p className="text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setLargeOpen(false)} data-testid="large-modal-close">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm */}
      {confirmOpen && (
        <div className="overlay" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="confirm-modal">
            <div className="modal-header"><span className="modal-title">Confirm Action</span></div>
            <div className="modal-body">
              <p className="text-sm">Are you sure? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmOpen(false)} data-testid="confirm-cancel">Cancel</button>
              <button className="btn btn-danger" onClick={() => { addToast('success', 'Action confirmed'); setConfirmOpen(false); }} data-testid="modal-confirm">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Form modal */}
      {formOpen && (
        <div className="overlay" onClick={closeFormModal}>
          <div className="modal" onClick={e => e.stopPropagation()} data-testid="form-modal">
            <div className="modal-header">
              <span className="modal-title">Form Modal</span>
              <button className="modal-close" onClick={closeFormModal} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleFormModalSubmit} noValidate>
              <div className="modal-body">
                <div className="form-row">
                  <label className="field-label" htmlFor="modal-name">
                    Name <span className="required-mark">*</span>
                  </label>
                  <input
                    id="modal-name"
                    className={`field${formTouched.name && formErrors.name ? ' field-error' : ''}`}
                    value={formData.name}
                    onChange={e => {
                      const v = e.target.value;
                      setFormData(p => ({ ...p, name: v }));
                      if (formTouched.name) {
                        setFormErrors(p => ({ ...p, name: !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'At least 2 characters' : '' }));
                      }
                    }}
                    onBlur={() => {
                      setFormTouched(p => ({ ...p, name: true }));
                      setFormErrors(p => ({ ...p, name: !formData.name.trim() ? 'Name is required' : formData.name.trim().length < 2 ? 'At least 2 characters' : '' }));
                    }}
                    data-testid="modal-form-name"
                    aria-invalid={!!(formTouched.name && formErrors.name)}
                  />
                  {formTouched.name && formErrors.name && (
                    <span className="field-error-msg" role="alert" data-testid="modal-form-name-error">
                      {formErrors.name}
                    </span>
                  )}
                </div>
                <div className="form-row">
                  <label className="field-label" htmlFor="modal-message">
                    Message <span className="required-mark">*</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                      ({formData.message.length}/10 min)
                    </span>
                  </label>
                  <textarea
                    id="modal-message"
                    className={`field${formTouched.message && formErrors.message ? ' field-error' : ''}`}
                    value={formData.message}
                    onChange={e => {
                      const v = e.target.value;
                      setFormData(p => ({ ...p, message: v }));
                      if (formTouched.message) {
                        setFormErrors(p => ({ ...p, message: !v.trim() ? 'Message is required' : v.trim().length < 10 ? 'At least 10 characters' : '' }));
                      }
                    }}
                    onBlur={() => {
                      setFormTouched(p => ({ ...p, message: true }));
                      setFormErrors(p => ({ ...p, message: !formData.message.trim() ? 'Message is required' : formData.message.trim().length < 10 ? 'At least 10 characters' : '' }));
                    }}
                    data-testid="modal-form-message"
                    aria-invalid={!!(formTouched.message && formErrors.message)}
                  />
                  {formTouched.message && formErrors.message && (
                    <span className="field-error-msg" role="alert" data-testid="modal-form-message-error">
                      {formErrors.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeFormModal} data-testid="modal-form-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="modal-form-submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} data-testid="drawer-overlay" />
          <div className="drawer" data-testid="drawer">
            <div className="drawer-header">
              <span className="drawer-title">Drawer Panel</span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="drawer-body">
              <p>This drawer slides in from the right. Useful for settings panels, detail views, or forms that don't need to block the full page.</p>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setDrawerOpen(false)} data-testid="drawer-close-btn">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
