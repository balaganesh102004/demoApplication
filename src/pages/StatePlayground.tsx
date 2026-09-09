import { useEffect, useState } from 'react';
import { api } from '../api';

type LoadState = 'idle' | 'loading' | 'success' | 'error';
type WizardStep = 1 | 2 | 3 | 4;
type PlanTier = 'free' | 'pro' | 'enterprise';

export function StatePlayground() {
  const [opts, setOpts] = useState<{
    countries: string[];
    statesByCountry: Record<string, string[]>;
    roles: string[];
  }>({ countries: [], statesByCountry: {}, roles: [] });

  // ── existing state ─────────────────────────────────────────────────
  const [advEnabled,   setAdvEnabled]   = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [country, setCountry]           = useState('');
  const [role,    setRole]              = useState('');
  const [slider,  setSlider]            = useState(50);

  // ── new state ──────────────────────────────────────────────────────
  // 1. Multi-step wizard
  const [wizardStep, setWizardStep]     = useState<WizardStep>(1);
  const [wizardData, setWizardData]     = useState({ name: '', email: '', plan: 'free' as PlanTier, confirm: false });

  // 2. Async load simulation
  const [loadState, setLoadState]       = useState<LoadState>('idle');
  const [loadResult, setLoadResult]     = useState<string | null>(null);

  // 3. Character counter / text analysis
  const [bioText, setBioText]           = useState('');
  const MAX_BIO = 150;

  // 4. Tag input
  const [tags, setTags]                 = useState<string[]>([]);
  const [tagInput, setTagInput]         = useState('');

  // 5. Quantity stepper with stock state
  const STOCK = 8;
  const [qty, setQty]                   = useState(1);

  // 6. Radio-driven content swap
  const [viewMode, setViewMode]         = useState<'grid' | 'list' | 'table'>('grid');

  // 7. Accordion-driven form sections (each section visible only after the previous is complete)
  const [section1Done, setSection1Done] = useState(false);
  const [section2Done, setSection2Done] = useState(false);
  const [s1Val, setS1Val]               = useState('');
  const [s2Val, setS2Val]               = useState('');
  const [s3Val, setS3Val]               = useState('');

  // 8. Live search / filter
  const ITEMS = ['Dashboard', 'Form Playground', 'Controls Lab', 'Navigation Lab', 'Data Table',
    'Modal Lab', 'Drag & Drop', 'File Upload', 'Validation Lab', 'Accessibility', 'State Playground'];
  const [filterQ, setFilterQ]           = useState('');
  const filtered = ITEMS.filter(i => i.toLowerCase().includes(filterQ.toLowerCase()));

  useEffect(() => {
    api.get<typeof opts>('/api/settings/form-options').then(setOpts).catch(() => {});
  }, []);

  const permissions: Record<string, string[]> = {
    Admin:    ['Read', 'Write', 'Delete', 'Manage Users', 'Settings'],
    Manager:  ['Read', 'Write', 'Approve', 'Reports'],
    User:     ['Read', 'Comment'],
    Tester:   ['Read', 'Write', 'Test'],
    Designer: ['Read', 'Write', 'Assets'],
  };

  const planFeatures: Record<PlanTier, string[]> = {
    free:       ['Up to 3 projects', 'Basic analytics', 'Community support'],
    pro:        ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'],
    enterprise: ['Everything in Pro', 'SSO/SAML', 'Dedicated account manager', 'SLA guarantee', 'Custom integrations'],
  };

  const simulateLoad = async (succeed: boolean) => {
    setLoadState('loading');
    setLoadResult(null);
    await new Promise(r => setTimeout(r, 1500));
    if (succeed) {
      setLoadState('success');
      setLoadResult('Data fetched: 42 records returned');
    } else {
      setLoadState('error');
      setLoadResult('Error 503: Service temporarily unavailable');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  // ── wizard validation ────────────────────────────────────────────
  const [wizardErrors, setWizardErrors] = useState<Record<string, string>>({});

  const validateWizardStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!wizardData.name.trim()) errs.name = 'Name is required';
    else if (wizardData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!wizardData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wizardData.email)) errs.email = 'Enter a valid email address';
    setWizardErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const wizardNext = () => {
    if (wizardStep === 1 && !validateWizardStep1()) return;
    setWizardErrors({});
    setWizardStep(s => (s + 1) as WizardStep);
  };

  return (
    <div data-testid="page-state">
      <div className="page-header">
        <h1>State Playground</h1>
        <p>Every card demonstrates a different state-dependent UI pattern</p>
      </div>

      <div className="controls-layout">

        {/* ── 1. Advanced settings toggle ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Toggle → Reveal Fields</span></div>
          <div className="card-body" style={{ padding: '4px 18px' }}>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Enable Advanced Settings</div>
                <div className="toggle-desc">Reveals additional configuration fields</div>
              </div>
              <button role="switch" aria-checked={advEnabled} className="toggle-switch"
                onClick={() => setAdvEnabled(v => !v)} data-testid="toggle-advanced">
                <span className="toggle-thumb" />
              </button>
            </div>
            {advEnabled && (
              <div className="state-dependent" data-testid="advanced-panel">
                <div className="check-group">
                  <label className="check-label"><input type="checkbox" /> Debug mode</label>
                  <label className="check-label"><input type="checkbox" /> Experimental features</label>
                  <label className="check-label"><input type="checkbox" /> Verbose logging</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Notification preferences ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Toggle → Conditional Form</span></div>
          <div className="card-body" style={{ padding: '4px 18px' }}>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Enable Notifications</div>
              </div>
              <button role="switch" aria-checked={notifEnabled} className="toggle-switch"
                onClick={() => setNotifEnabled(v => !v)} data-testid="toggle-notifications">
                <span className="toggle-thumb" />
              </button>
            </div>
            {notifEnabled && (
              <div className="state-dependent" data-testid="notifications-panel">
                <div className="form-row">
                  <label className="field-label">Frequency</label>
                  <select className="field" data-testid="notification-frequency">
                    <option>Immediate</option>
                    <option>Daily Digest</option>
                    <option>Weekly Summary</option>
                  </select>
                </div>
                <div className="check-group mt-8">
                  <label className="check-label"><input type="checkbox" defaultChecked /> Email</label>
                  <label className="check-label"><input type="checkbox" /> Push</label>
                  <label className="check-label"><input type="checkbox" /> SMS</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. Country → Region ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Select → Dependent Select</span></div>
          <div className="card-body">
            <div className="form-row">
              <label className="field-label">Country</label>
              <select className="field" value={country} onChange={e => { setCountry(e.target.value); }}
                data-testid="select-country">
                <option value="">Select country</option>
                {opts.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {opts.countries.length === 0 && (
                <span className="field-hint">No countries configured yet.</span>
              )}
            </div>
            <div className="form-row">
              <label className="field-label">Region</label>
              <select className="field" disabled={!country} data-testid="select-state">
                <option value="">{country ? 'Select region' : 'Select country first'}</option>
                {(opts.statesByCountry[country] || []).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. Role → Permissions ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Select → Dynamic List</span></div>
          <div className="card-body">
            <div className="form-row">
              <label className="field-label">Role</label>
              <select className="field" value={role} onChange={e => setRole(e.target.value)} data-testid="select-role">
                <option value="">Select role</option>
                {(opts.roles.length ? opts.roles : Object.keys(permissions)).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            {role && (
              <div className="state-dependent" data-testid="permissions-panel">
                <div className="section-title" style={{ marginBottom: 8 }}>Permissions for {role}</div>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, fontSize: 13, margin: 0 }}>
                  {(permissions[role] || ['Read']).map(p => <li key={p}>{p}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Slider → Visual ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Slider → Visual + Threshold Alert</span></div>
          <div className="card-body">
            <div className="range-wrap mb-12">
              <input type="range" min={0} max={100} value={slider}
                onChange={e => setSlider(+e.target.value)} data-testid="value-slider" />
              <span className="range-val">{slider}</span>
            </div>
            <div style={{ height: 28, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${slider}%`, background: slider > 75 ? 'var(--warning)' : 'var(--accent)', transition: 'width .1s, background .2s' }} data-testid="slider-display" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {slider <= 25 && <span data-testid="slider-state-low">Low</span>}
              {slider > 25 && slider <= 75 && <span data-testid="slider-state-normal">Normal</span>}
              {slider > 75 && (
                <div className="alert alert-warning mt-8" data-testid="slider-warning">
                  <span className="alert-msg">Value is high ({slider}) — consider reducing</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 6. Multi-step wizard ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Multi-step Wizard</span>
            <span className="badge badge-info">Step {wizardStep} of 4</span>
          </div>
          <div className="card-body">
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
              {([1, 2, 3, 4] as WizardStep[]).map(s => (
                <div key={s} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: s <= wizardStep ? 'var(--accent)' : 'var(--border)',
                  transition: 'background .2s',
                }} data-testid={`wizard-step-indicator-${s}`} />
              ))}
            </div>

            {wizardStep === 1 && (
              <div data-testid="wizard-step-1">
                <div className="section-title" style={{ marginBottom: 12 }}>Account Details</div>
                <div className="form-row">
                  <label className="field-label" htmlFor="wiz-name">
                    Name <span className="required-mark">*</span>
                  </label>
                  <input
                    id="wiz-name"
                    className={`field${wizardErrors.name ? ' field-error' : ''}`}
                    value={wizardData.name}
                    onChange={e => {
                      setWizardData(p => ({ ...p, name: e.target.value }));
                      if (wizardErrors.name) {
                        const v = e.target.value.trim();
                        setWizardErrors(p => ({ ...p, name: !v ? 'Name is required' : v.length < 2 ? 'At least 2 characters' : '' }));
                      }
                    }}
                    onBlur={() => {
                      const v = wizardData.name.trim();
                      setWizardErrors(p => ({ ...p, name: !v ? 'Name is required' : v.length < 2 ? 'At least 2 characters' : '' }));
                    }}
                    placeholder="Your full name"
                    data-testid="wizard-name"
                    aria-describedby="wiz-name-err"
                    aria-invalid={!!wizardErrors.name}
                  />
                  {wizardErrors.name && (
                    <span id="wiz-name-err" className="field-error-msg" role="alert" data-testid="wizard-name-error">
                      {wizardErrors.name}
                    </span>
                  )}
                </div>
                <div className="form-row">
                  <label className="field-label" htmlFor="wiz-email">
                    Email <span className="required-mark">*</span>
                  </label>
                  <input
                    id="wiz-email"
                    type="email"
                    className={`field${wizardErrors.email ? ' field-error' : ''}`}
                    value={wizardData.email}
                    onChange={e => {
                      setWizardData(p => ({ ...p, email: e.target.value }));
                      if (wizardErrors.email) {
                        const v = e.target.value.trim();
                        setWizardErrors(p => ({ ...p, email: !v ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email' : '' }));
                      }
                    }}
                    onBlur={() => {
                      const v = wizardData.email.trim();
                      setWizardErrors(p => ({ ...p, email: !v ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'Enter a valid email' : '' }));
                    }}
                    placeholder="you@example.com"
                    data-testid="wizard-email"
                    aria-describedby="wiz-email-err"
                    aria-invalid={!!wizardErrors.email}
                  />
                  {wizardErrors.email && (
                    <span id="wiz-email-err" className="field-error-msg" role="alert" data-testid="wizard-email-error">
                      {wizardErrors.email}
                    </span>
                  )}
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div data-testid="wizard-step-2">
                <div className="section-title" style={{ marginBottom: 12 }}>Choose Plan</div>
                <div className="radio-group">
                  {(['free', 'pro', 'enterprise'] as PlanTier[]).map(plan => (
                    <label key={plan} className="radio-label" style={{ alignItems: 'flex-start', gap: 10, padding: '10px 12px', border: `1px solid ${wizardData.plan === plan ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', marginBottom: 6 }}>
                      <input type="radio" name="wizard-plan" value={plan} checked={wizardData.plan === plan}
                        onChange={() => setWizardData(p => ({ ...p, plan }))}
                        data-testid={`wizard-plan-${plan}`} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'capitalize' }}>{plan}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {planFeatures[plan][0]}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {/* Plan features panel */}
                <div className="state-dependent" data-testid="plan-features">
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{wizardData.plan} includes</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {planFeatures[wizardData.plan].map(f => <li key={f}>{f}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div data-testid="wizard-step-3">
                <div className="section-title" style={{ marginBottom: 12 }}>Confirm Details</div>
                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {wizardData.name || '—'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {wizardData.email || '—'}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Plan:</span> <span style={{ textTransform: 'capitalize' }}>{wizardData.plan}</span></div>
                </div>
                <div className="form-row" style={{ marginTop: 16 }}>
                  <label className="check-label">
                    <input type="checkbox" checked={wizardData.confirm}
                      onChange={e => setWizardData(p => ({ ...p, confirm: e.target.checked }))}
                      data-testid="wizard-confirm" />
                    I confirm this information is correct
                  </label>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div data-testid="wizard-step-4" style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>Setup complete!</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Account created for {wizardData.email || 'you'} on the {wizardData.plan} plan.
                </div>
              </div>
            )}

            <div className="btn-row" style={{ marginTop: 16 }}>
              {wizardStep > 1 && wizardStep < 4 && (
                <button className="btn btn-secondary btn-sm"
                  onClick={() => { setWizardErrors({}); setWizardStep(s => (s - 1) as WizardStep); }}
                  data-testid="wizard-prev">
                  Back
                </button>
              )}
              {wizardStep < 3 && (
                <button className="btn btn-primary btn-sm" onClick={wizardNext} data-testid="wizard-next">
                  Next
                </button>
              )}
              {wizardStep === 3 && (
                <button className="btn btn-primary btn-sm"
                  disabled={!wizardData.confirm}
                  onClick={() => setWizardStep(4)}
                  data-testid="wizard-submit">
                  Complete Setup
                </button>
              )}
              {wizardStep === 4 && (
                <button className="btn btn-secondary btn-sm"
                  onClick={() => { setWizardStep(1); setWizardData({ name: '', email: '', plan: 'free', confirm: false }); setWizardErrors({}); }}
                  data-testid="wizard-restart">
                  Start Over
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 7. Async load simulation ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Button → Async Load States</span></div>
          <div className="card-body">
            <p className="text-muted text-sm mb-12">
              Trigger an async operation and observe loading, success, and error states.
            </p>
            <div className="btn-row mb-12">
              <button className="btn btn-primary btn-sm"
                disabled={loadState === 'loading'}
                onClick={() => simulateLoad(true)}
                data-testid="load-success-btn">
                {loadState === 'loading' ? <><span className="btn-spinner" /> Loading…</> : 'Load Data'}
              </button>
              <button className="btn btn-secondary btn-sm"
                disabled={loadState === 'loading'}
                onClick={() => simulateLoad(false)}
                data-testid="load-error-btn">
                Simulate Error
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setLoadState('idle'); setLoadResult(null); }}
                data-testid="load-reset-btn">
                Reset
              </button>
            </div>
            <div
              style={{
                minHeight: 48, padding: '12px 14px',
                border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                background: 'var(--surface)',
                fontSize: 13, color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
              }}
              data-testid="load-result-area"
            >
              {loadState === 'idle'    && 'No data loaded yet.'}
              {loadState === 'loading' && 'Fetching data…'}
              {loadState === 'success' && <span style={{ color: 'var(--success)' }} data-testid="load-success-msg">{loadResult}</span>}
              {loadState === 'error'   && <span style={{ color: 'var(--error)'   }} data-testid="load-error-msg">{loadResult}</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Current state: <strong data-testid="load-state-label">{loadState}</strong>
            </div>
          </div>
        </div>

        {/* ── 8. Character counter ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Input → Live Character Analysis</span></div>
          <div className="card-body">
            <div className="form-row">
              <label className="field-label" htmlFor="bio-input">
                Bio{' '}
                <span style={{
                  fontSize: 12, fontWeight: 400,
                  color: bioText.length > MAX_BIO * 0.9 ? 'var(--error)' : 'var(--text-muted)',
                }} data-testid="char-counter">
                  {bioText.length}/{MAX_BIO}
                </span>
              </label>
              <textarea
                id="bio-input"
                className={`field${bioText.length > MAX_BIO ? ' field-error' : ''}`}
                style={{ minHeight: 80 }}
                maxLength={MAX_BIO + 20}
                value={bioText}
                onChange={e => setBioText(e.target.value)}
                placeholder="Write a short bio…"
                data-testid="bio-input"
              />
            </div>
            {bioText.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 16 }} data-testid="text-stats">
                <span>Words: <strong data-testid="word-count">{bioText.trim().split(/\s+/).filter(Boolean).length}</strong></span>
                <span>Sentences: <strong data-testid="sentence-count">{(bioText.match(/[.!?]+/g) || []).length}</strong></span>
                {bioText.length > MAX_BIO && (
                  <span style={{ color: 'var(--error)' }} data-testid="char-over-limit">
                    {bioText.length - MAX_BIO} over limit
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 9. Tag input ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Input → Tag Collection</span></div>
          <div className="card-body">
            <p className="text-muted text-sm mb-12">Type a tag and press Enter or click Add. Max 8 tags.</p>
            <div className="btn-row mb-12">
              <input
                className="field"
                style={{ flex: 1 }}
                placeholder="Add a tag…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                disabled={tags.length >= 8}
                data-testid="tag-input"
                aria-label="New tag"
              />
              <button className="btn btn-primary btn-sm" onClick={addTag} disabled={tags.length >= 8 || !tagInput.trim()} data-testid="tag-add-btn">
                Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32 }} data-testid="tag-list">
              {tags.length === 0 && (
                <span className="text-muted text-sm" data-testid="tag-empty">No tags added yet</span>
              )}
              {tags.map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', background: 'var(--accent-light)',
                  color: 'var(--accent)', borderRadius: 20,
                  fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--accent-border)',
                }} data-testid={`tag-${t}`}>
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent)', fontSize: 14, lineHeight: 1 }}
                    aria-label={`Remove tag ${t}`}
                    data-testid={`remove-tag-${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {tags.length >= 8 && (
              <p className="text-sm mt-8" style={{ color: 'var(--warning)' }} data-testid="tag-limit-msg">
                Maximum of 8 tags reached
              </p>
            )}
          </div>
        </div>

        {/* ── 10. Quantity stepper ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Stepper → Stock-aware State</span></div>
          <div className="card-body">
            <p className="text-muted text-sm mb-12">
              Quantity is constrained by available stock ({STOCK} units). The button states, label, and alert change reactively.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ width: 36, padding: 0 }}
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                data-testid="qty-dec"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span style={{ fontSize: 18, fontWeight: 700, minWidth: 32, textAlign: 'center' }} data-testid="qty-value">
                {qty}
              </span>
              <button
                className="btn btn-secondary"
                style={{ width: 36, padding: 0 }}
                onClick={() => setQty(q => Math.min(STOCK, q + 1))}
                disabled={qty >= STOCK}
                data-testid="qty-inc"
                aria-label="Increase quantity"
              >
                +
              </button>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }} data-testid="qty-stock-label">
                {STOCK - qty} remaining
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              {qty === STOCK && (
                <div className="alert alert-warning" data-testid="qty-max-alert">
                  <span className="alert-msg">Maximum stock selected</span>
                </div>
              )}
              {qty >= STOCK * 0.75 && qty < STOCK && (
                <div className="alert alert-info" data-testid="qty-high-alert">
                  <span className="alert-msg">Only {STOCK - qty} left — order soon</span>
                </div>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm mt-12"
              disabled={qty === 0}
              data-testid="qty-add-cart"
            >
              Add {qty} to Cart
            </button>
          </div>
        </div>

        {/* ── 11. Radio → content swap ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Radio → Layout / View Switch</span></div>
          <div className="card-body">
            <div className="check-group check-group-inline mb-12">
              {(['grid', 'list', 'table'] as const).map(m => (
                <label key={m} className="radio-label">
                  <input type="radio" name="view-mode" value={m} checked={viewMode === m}
                    onChange={() => setViewMode(m)} data-testid={`view-mode-${m}`} />
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </label>
              ))}
            </div>

            <div data-testid="view-container">
              {viewMode === 'grid' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }} data-testid="view-grid">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(l => (
                    <div key={l} style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                      Item {l}
                    </div>
                  ))}
                </div>
              )}
              {viewMode === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} data-testid="view-list">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(l => (
                    <div key={l} style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                      Item {l}
                    </div>
                  ))}
                </div>
              )}
              {viewMode === 'table' && (
                <table className="tbl" style={{ fontSize: 12 }} data-testid="view-table">
                  <thead>
                    <tr><th>Label</th><th>Value</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((l, i) => (
                      <tr key={l}><td>Item {l}</td><td>{(i + 1) * 100}</td><td><span className="badge badge-active">active</span></td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── 12. Progressive form unlock ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Sequential Form Unlock</span></div>
          <div className="card-body">
            <p className="text-muted text-sm mb-12">
              Each section unlocks only after the previous one is completed.
            </p>

            {/* Section 1 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Step 1: Enter project name</span>
                {section1Done && <span style={{ color: 'var(--success)', fontSize: 12 }}>Done</span>}
              </div>
              <div className="btn-row">
                <input
                  className={`field${!section1Done && s1Val.trim().length > 0 && s1Val.trim().length < 3 ? ' field-error' : ''}`}
                  style={{ flex: 1 }}
                  placeholder="Project name (min 3 chars)"
                  value={s1Val}
                  onChange={e => setS1Val(e.target.value)}
                  disabled={section1Done}
                  data-testid="seq-input-1"
                />
                {!section1Done && (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={s1Val.trim().length < 3}
                    onClick={() => setSection1Done(true)}
                    data-testid="seq-confirm-1"
                  >
                    Confirm
                  </button>
                )}
              </div>
              {!section1Done && s1Val.trim().length > 0 && s1Val.trim().length < 3 && (
                <span className="field-error-msg" role="alert" data-testid="seq-input-1-error">
                  Project name must be at least 3 characters
                </span>
              )}
            </div>

            {/* Section 2 — only visible after step 1 */}
            {section1Done && (
              <div style={{ marginBottom: 12 }} data-testid="seq-section-2">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Step 2: Choose priority</span>
                  {section2Done && <span style={{ color: 'var(--success)', fontSize: 12 }}>✓ Done</span>}
                </div>
                <div className="btn-row">
                  <select className="field" style={{ flex: 1 }} value={s2Val}
                    onChange={e => setS2Val(e.target.value)} disabled={section2Done}
                    data-testid="seq-input-2">
                    <option value="">Select priority…</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                  {!section2Done && (
                    <button className="btn btn-primary btn-sm" disabled={!s2Val}
                      onClick={() => setSection2Done(true)} data-testid="seq-confirm-2">
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Section 3 — only visible after step 2 */}
            {section2Done && (
              <div data-testid="seq-section-3">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Step 3: Add description</div>
                <textarea className="field" style={{ minHeight: 64 }} placeholder="Describe the project…"
                  value={s3Val} onChange={e => setS3Val(e.target.value)}
                  data-testid="seq-input-3" />
                <button
                  className="btn btn-primary btn-sm mt-8"
                  disabled={!s3Val.trim()}
                  onClick={() => alert(`Created: "${s1Val}" (${s2Val})`)}
                  data-testid="seq-submit"
                  style={{ marginTop: 8 }}
                >
                  Create Project
                </button>
              </div>
            )}

            {(section1Done || section2Done) && (
              <button className="btn btn-ghost btn-xs mt-12"
                onClick={() => { setSection1Done(false); setSection2Done(false); setS1Val(''); setS2Val(''); setS3Val(''); }}
                data-testid="seq-reset"
                style={{ marginTop: 12 }}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── 13. Live search / filter ── */}
        <div className="card">
          <div className="card-header"><span className="card-title">Input → Live Filter</span></div>
          <div className="card-body">
            <input
              className="field mb-12"
              placeholder="Filter items…"
              value={filterQ}
              onChange={e => setFilterQ(e.target.value)}
              data-testid="live-filter-input"
              aria-label="Filter list"
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }} data-testid="filter-count">
              {filtered.length} of {ITEMS.length} items
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }} data-testid="filter-results">
              {filtered.length === 0 ? (
                <li style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }} data-testid="filter-empty">
                  No matches for "{filterQ}"
                </li>
              ) : (
                filtered.map(item => (
                  <li key={item} style={{ fontSize: 13, padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} data-testid={`filter-item-${item.replace(/\s+/g, '-').toLowerCase()}`}>
                    {filterQ ? (
                      <>
                        {item.substring(0, item.toLowerCase().indexOf(filterQ.toLowerCase()))}
                        <mark style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                          {item.substring(item.toLowerCase().indexOf(filterQ.toLowerCase()), item.toLowerCase().indexOf(filterQ.toLowerCase()) + filterQ.length)}
                        </mark>
                        {item.substring(item.toLowerCase().indexOf(filterQ.toLowerCase()) + filterQ.length)}
                      </>
                    ) : item}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
