import { useState } from 'react';

export function AccessibilityLab() {
  const [liveMsg, setLiveMsg] = useState('');
  const [count, setCount]     = useState(0);

  // Form labels demo — with accessible validation
  const [a11yName,  setA11yName]  = useState('');
  const [a11yQuery, setA11yQuery] = useState('');
  const [a11yNameErr,  setA11yNameErr]  = useState('');
  const [a11yQueryErr, setA11yQueryErr] = useState('');
  const [a11ySubmitted, setA11ySubmitted] = useState(false);

  const validateA11yName  = (v: string) => !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'At least 2 characters' : '';
  const validateA11yQuery = (v: string) => !v.trim() ? 'Search query is required' : '';

  const handleA11ySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr  = validateA11yName(a11yName);
    const queryErr = validateA11yQuery(a11yQuery);
    setA11yNameErr(nameErr);
    setA11yQueryErr(queryErr);
    if (!nameErr && !queryErr) {
      setA11ySubmitted(true);
      setLiveMsg('Form submitted successfully');
    } else {
      setLiveMsg(`${[nameErr, queryErr].filter(Boolean).length} error(s) — please correct and resubmit`);
    }
  };

  return (
    <div data-testid="page-accessibility">
      <div className="page-header">
        <h1>Accessibility Lab</h1>
        <p>Correctly implemented accessible interactions for testing agent behaviour</p>
      </div>

      <div className="controls-layout">

        <div className="card">
          <div className="card-header"><span className="card-title">Semantic HTML</span></div>
          <div className="card-body">
            <article>
              <header><h3>Article heading</h3></header>
              <p className="text-sm text-muted mt-4">This card uses semantic article/header/footer elements.</p>
              <footer style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>Article footer</footer>
            </article>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Form Labels &amp; Accessible Validation</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">
              Every error is linked to its field via <code>aria-describedby</code> so screen readers announce it automatically.
            </p>
            <form onSubmit={handleA11ySubmit} noValidate>
              <div className="form-row">
                <label className="field-label" htmlFor="a11y-name">
                  Name (explicit label) <span className="required-mark">*</span>
                </label>
                <input
                  id="a11y-name"
                  className={`field${a11yNameErr ? ' field-error' : ''}`}
                  type="text"
                  value={a11yName}
                  onChange={e => {
                    setA11yName(e.target.value);
                    if (a11yNameErr) setA11yNameErr(validateA11yName(e.target.value));
                  }}
                  onBlur={() => setA11yNameErr(validateA11yName(a11yName))}
                  aria-describedby={a11yNameErr ? 'a11y-name-err' : undefined}
                  aria-invalid={!!a11yNameErr}
                  aria-required="true"
                  data-testid="a11y-input-label"
                />
                {a11yNameErr && (
                  <span id="a11y-name-err" className="field-error-msg" role="alert" data-testid="a11y-name-error">
                    {a11yNameErr}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label className="field-label">
                  Search query (aria-label on input) <span className="required-mark">*</span>
                </label>
                <input
                  className={`field${a11yQueryErr ? ' field-error' : ''}`}
                  type="text"
                  aria-label="Search query"
                  aria-describedby={a11yQueryErr ? 'a11y-query-err' : undefined}
                  aria-invalid={!!a11yQueryErr}
                  aria-required="true"
                  placeholder="Type to search…"
                  value={a11yQuery}
                  onChange={e => {
                    setA11yQuery(e.target.value);
                    if (a11yQueryErr) setA11yQueryErr(validateA11yQuery(e.target.value));
                  }}
                  onBlur={() => setA11yQueryErr(validateA11yQuery(a11yQuery))}
                  data-testid="a11y-input-aria-label"
                />
                {a11yQueryErr && (
                  <span id="a11y-query-err" className="field-error-msg" role="alert" data-testid="a11y-query-error">
                    {a11yQueryErr}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label className="field-label" id="a11y-grp-label">aria-labelledby group</label>
                <div role="group" aria-labelledby="a11y-grp-label" className="check-group">
                  <label className="check-label"><input type="checkbox" /> Option A</label>
                  <label className="check-label"><input type="checkbox" /> Option B</label>
                </div>
              </div>

              <div className="btn-row">
                <button type="submit" className="btn btn-primary btn-sm" data-testid="a11y-form-submit">
                  Submit
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => {
                  setA11yName(''); setA11yQuery('');
                  setA11yNameErr(''); setA11yQueryErr('');
                  setA11ySubmitted(false);
                }} data-testid="a11y-form-reset">
                  Reset
                </button>
              </div>

              {a11ySubmitted && (
                <div className="alert alert-success mt-12" role="alert" data-testid="a11y-form-success">
                  <span className="alert-msg">Form submitted — all fields valid</span>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">ARIA Live Region</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">
              Screen readers announce changes automatically. Submit the form above or click Activate.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setCount(c => c + 1); setLiveMsg(`Button activated ${count + 1} time${count + 1 === 1 ? '' : 's'}`); }}
              data-testid="update-live-region"
            >
              Activate
            </button>
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="a11y-live-region"
              data-testid="live-region"
            >
              {liveMsg || 'Live region — will announce changes'}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Keyboard Navigation</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">Tab between buttons. Enter or Space activates each one.</p>
            <div className="btn-row">
              <button className="btn btn-secondary btn-sm" data-testid="keyboard-btn-1">Button 1</button>
              <button className="btn btn-secondary btn-sm" data-testid="keyboard-btn-2">Button 2</button>
              <button className="btn btn-secondary btn-sm" data-testid="keyboard-btn-3">Button 3</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Focus Indicators</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">All interactive elements show a visible focus ring.</p>
            <button className="btn btn-primary btn-sm" data-testid="focus-visible-btn">Focus me (Tab key)</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Skip Navigation</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">Tab once from the top of the page to reach the skip link.</p>
            <a href="#a11y-main" className="skip-link">Skip to main content</a>
            <nav style={{ fontSize: 13, display: 'flex', gap: 12 }}>
              <a href="#a11y-link1">Nav Link 1</a>
              <a href="#a11y-link2">Nav Link 2</a>
            </nav>
            <main id="a11y-main" tabIndex={-1} style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              Main content region
            </main>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">ARIA Roles &amp; States</span></div>
          <div className="card-body">
            <div role="tablist" style={{ display: 'flex', gap: 4 }}>
              <button role="tab" aria-selected={true}  className="tab-btn active" data-testid="aria-tab-1">Tab 1</button>
              <button role="tab" aria-selected={false} className="tab-btn"        data-testid="aria-tab-2">Tab 2</button>
            </div>
            <div className="divider" />
            <p className="text-sm text-muted">aria-selected communicates the active tab to screen readers.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Button vs Link</span></div>
          <div className="card-body">
            <p className="text-sm text-muted mb-12">Use <code>button</code> for actions, <code>a</code> for navigation.</p>
            <div className="btn-row">
              <button className="btn btn-secondary btn-sm" data-testid="action-button">Action (button)</button>
              <a href="/dashboard" className="btn btn-ghost btn-sm" data-testid="navigation-link">Navigate (link)</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
