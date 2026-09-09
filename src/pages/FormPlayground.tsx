import { useState, type FormEvent, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';

interface FormOptions {
  countries: string[];
  statesByCountry: Record<string, string[]>;
  roles: string[];
  departments: string[];
}

const EMPTY: FormOptions = { countries: [], statesByCountry: {}, roles: [], departments: [] };

export function FormPlayground() {
  const { addToast } = useApp();
  const [opts, setOpts] = useState<FormOptions>(EMPTY);
  const [validationMode, setValidationMode] = useState<'blur' | 'change' | 'submit'>('blur');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [fd, setFd] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', age: '', website: '',
    country: '', region: '', role: '', bio: '',
    startDate: '', endDate: '',
    color: '#2563eb', rating: '3',
    newsletter: false, notifications: false, advancedSettings: false,
    terms: false,
    interests: [] as string[],
  });

  useEffect(() => {
    api.get<FormOptions>('/api/settings/form-options').then(d => setOpts(d)).catch(() => {});
  }, []);

  const validate = (name: string, value: unknown): string => {
    switch (name) {
      case 'name':            return !value ? 'Required' : String(value).length < 2 ? 'Min 2 characters' : '';
      case 'email':           return !value ? 'Required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? 'Invalid email' : '';
      case 'password': {
        const v = String(value || '');
        if (!v) return 'Required';
        if (v.length < 8) return 'Min 8 characters';
        if (!/[A-Z]/.test(v)) return 'Needs uppercase';
        if (!/[a-z]/.test(v)) return 'Needs lowercase';
        if (!/[0-9]/.test(v)) return 'Needs number';
        if (!/[^A-Za-z0-9]/.test(v)) return 'Needs special character';
        return '';
      }
      case 'confirmPassword':  return !value ? 'Required' : value !== fd.password ? 'Passwords do not match' : '';
      case 'phone':            return value && !/^\+?[\d\s\-()]{7,}$/.test(String(value)) ? 'Invalid phone' : '';
      case 'age': {
        if (!value) return 'Required';
        const n = Number(value);
        return isNaN(n) || n < 18 || n > 100 ? 'Must be 18–100' : '';
      }
      case 'website':          return value && !/^https?:\/\/.+/.test(String(value)) ? 'Must start with http(s)://' : '';
      case 'startDate':        return !value ? 'Required' : '';
      case 'endDate':          return !value ? 'Required' : (fd.startDate && String(value) < fd.startDate ? 'Must be after start date' : '');
      case 'terms':            return !value ? 'You must accept the terms' : '';
      default:                 return '';
    }
  };

  // Mark a field touched and validate it against a known current value
  // (avoids reading stale state when called right after a change)
  const touchWithValue = (name: string, currentValue: unknown) => {
    setTouched(p => ({ ...p, [name]: true }));
    if (validationMode === 'blur' || submitAttempted) {
      setErrors(p => ({ ...p, [name]: validate(name, currentValue) }));
    }
  };

  const touch = (name: string) => {
    touchWithValue(name, fd[name as keyof typeof fd]);
  };

  const change = (name: string, value: unknown) => {
    setFd(p => ({ ...p, [name]: value }));
    if (validationMode === 'change' || submitAttempted) {
      setErrors(p => ({ ...p, [name]: validate(name, value) }));
    }
  };

  // Combined: update value AND immediately validate (for checkboxes/toggles
  // where onChange and onBlur fire together or touch is called right after)
  const changeAndTouch = (name: string, value: unknown) => {
    setFd(p => ({ ...p, [name]: value }));
    setTouched(p => ({ ...p, [name]: true }));
    // Always validate immediately when the user explicitly interacts
    setErrors(p => ({ ...p, [name]: validate(name, value) }));
  };

  const pwStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s <= 2 ? 'weak' : s <= 3 ? 'medium' : 'strong';
  };

  const pwPct = { weak: 33, medium: 66, strong: 100 };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Validate every field using current fd values directly (not via closure)
    const newErrors: Record<string, string> = {};
    const currentFd = fd; // snapshot — React state is stable within the handler
    Object.keys(currentFd).forEach(k => {
      const err = validate(k, currentFd[k as keyof typeof currentFd]);
      if (err) newErrors[k] = err;
    });
    // Mark all fields touched so errors are visible
    const allTouched: Record<string, boolean> = {};
    Object.keys(currentFd).forEach(k => { allTouched[k] = true; });
    setTouched(allTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      addToast('error', 'Please fix validation errors');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      await api.post('/api/form-submissions', { ...currentFd, submittedAt: new Date().toISOString() });
      await api.post('/api/activities', { action: 'Form submitted', status: 'success' });
      setSubmitResult('success');
      addToast('success', 'Form submitted successfully');
    } catch {
      setSubmitResult('error');
      addToast('error', 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFd({ name: '', email: '', password: '', confirmPassword: '', phone: '', age: '', website: '', country: '', region: '', role: '', bio: '', startDate: '', endDate: '', color: '#2563eb', rating: '3', newsletter: false, notifications: false, advancedSettings: false, terms: false, interests: [] });
    setErrors({}); setTouched({}); setSubmitAttempted(false); setSubmitResult('idle');
    addToast('info', 'Form reset');
  };

  const showErr = (name: string) => (touched[name] || submitAttempted) && errors[name];

  const interests = ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Testing', 'UI/UX'];

  return (
    <div data-testid="page-forms">
      <div className="page-header">
        <h1>Form Playground</h1>
        <p>Comprehensive form with validation modes and full submission lifecycle</p>
      </div>

      {submitResult === 'success' && (
        <div className="alert alert-success" role="alert" data-testid="submit-success">
          <span className="alert-msg">Form submitted successfully! You can reset and try again.</span>
        </div>
      )}

      <div className="card mb-16">
        <div className="card-header"><span className="card-title">Validation Mode</span></div>
        <div className="card-body">
          <div className="check-group check-group-inline">
            {(['blur', 'change', 'submit'] as const).map(m => (
              <label className="radio-label" key={m}>
                <input type="radio" name="validationMode" value={m} checked={validationMode === m}
                  onChange={() => setValidationMode(m)} data-testid={`validation-${m}`} />
                On {m}
              </label>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="test-form" data-testid="main-form">
        {/* Basic info */}
        <div className="form-section">
          <div className="form-section-title">Basic Information</div>
          <div className="form-cols-2">
            <div className="form-row">
              <label className="field-label" htmlFor="f-name">Name <span className="required-mark">*</span></label>
              <input id="f-name" className={`field${showErr('name') ? ' field-error' : ''}`} value={fd.name}
                onChange={e => change('name', e.target.value)} onBlur={() => touch('name')} data-testid="form-name" />
              {showErr('name') && <span className="field-error-msg" role="alert">{errors.name}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-email">Email <span className="required-mark">*</span></label>
              <input id="f-email" type="email" className={`field${showErr('email') ? ' field-error' : ''}`} value={fd.email}
                onChange={e => change('email', e.target.value)} onBlur={() => touch('email')} data-testid="form-email" />
              {showErr('email') && <span className="field-error-msg" role="alert">{errors.email}</span>}
            </div>
          </div>
          <div className="form-cols-2">
            <div className="form-row">
              <label className="field-label" htmlFor="f-pwd">Password <span className="required-mark">*</span></label>
              <input id="f-pwd" type="password" className={`field${showErr('password') ? ' field-error' : ''}`} value={fd.password}
                onChange={e => change('password', e.target.value)} onBlur={() => touch('password')} data-testid="form-password" />
              {fd.password && (
                <div className={`strength-bar-wrap strength-${pwStrength(fd.password)}`}>
                  <div className="strength-bar"><div className="strength-fill" style={{ width: `${pwPct[pwStrength(fd.password)]}%` }} /></div>
                  <div className="strength-label">{pwStrength(fd.password)}</div>
                </div>
              )}
              {showErr('password') && <span className="field-error-msg" role="alert">{errors.password}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-confirm">Confirm Password <span className="required-mark">*</span></label>
              <input id="f-confirm" type="password" className={`field${showErr('confirmPassword') ? ' field-error' : ''}`} value={fd.confirmPassword}
                onChange={e => change('confirmPassword', e.target.value)} onBlur={() => touch('confirmPassword')} data-testid="form-confirm-password" />
              {showErr('confirmPassword') && <span className="field-error-msg" role="alert">{errors.confirmPassword}</span>}
            </div>
          </div>
          <div className="form-cols-3">
            <div className="form-row">
              <label className="field-label" htmlFor="f-phone">Phone</label>
              <input id="f-phone" type="tel" className={`field${showErr('phone') ? ' field-error' : ''}`} value={fd.phone}
                onChange={e => change('phone', e.target.value)} onBlur={() => touch('phone')} data-testid="form-phone" />
              {showErr('phone') && <span className="field-error-msg" role="alert">{errors.phone}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-age">Age <span className="required-mark">*</span></label>
              <input id="f-age" type="number" min={18} max={100} className={`field${showErr('age') ? ' field-error' : ''}`} value={fd.age}
                onChange={e => change('age', e.target.value)} onBlur={() => touch('age')} data-testid="form-age" />
              {showErr('age') && <span className="field-error-msg" role="alert">{errors.age}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-website">Website</label>
              <input id="f-website" type="url" placeholder="https://" className={`field${showErr('website') ? ' field-error' : ''}`} value={fd.website}
                onChange={e => change('website', e.target.value)} onBlur={() => touch('website')} data-testid="form-website" />
              {showErr('website') && <span className="field-error-msg" role="alert">{errors.website}</span>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <div className="form-section-title">Location</div>
          <div className="form-cols-2">
            <div className="form-row">
              <label className="field-label" htmlFor="f-country">Country</label>
              <select id="f-country" className="field" value={fd.country}
                onChange={e => { change('country', e.target.value); change('region', ''); }} data-testid="form-country">
                <option value="">Select country</option>
                {(opts.countries.length ? opts.countries : []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {opts.countries.length === 0 && (
                <span className="field-hint">Add countries via Settings → Form Options</span>
              )}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-region">State / Region</label>
              <select id="f-region" className="field" value={fd.region} disabled={!fd.country}
                onChange={e => change('region', e.target.value)} data-testid="form-state">
                <option value="">Select region</option>
                {(fd.country && opts.statesByCountry[fd.country] || []).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Professional */}
        <div className="form-section">
          <div className="form-section-title">Professional</div>
          <div className="form-cols-2">
            <div className="form-row">
              <label className="field-label" htmlFor="f-role">Role</label>
              <select id="f-role" className="field" value={fd.role} onChange={e => change('role', e.target.value)} data-testid="form-role">
                <option value="">Select role</option>
                {(opts.roles.length ? opts.roles : []).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-bio">Bio</label>
              <textarea id="f-bio" className="field" maxLength={200} value={fd.bio}
                onChange={e => change('bio', e.target.value)} data-testid="form-bio" />
              <div className="char-count">{fd.bio.length}/200</div>
            </div>
          </div>
          <div className="form-row">
            <label className="field-label">Interests</label>
            <div className="check-group check-group-inline">
              {interests.map(i => (
                <label className="check-label" key={i}>
                  <input type="checkbox" checked={fd.interests.includes(i)}
                    onChange={() => {
                      const next = fd.interests.includes(i) ? fd.interests.filter(x => x !== i) : [...fd.interests, i];
                      change('interests', next);
                    }}
                    data-testid={`interest-${i.toLowerCase()}`} />
                  {i}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Dates & misc */}
        <div className="form-section">
          <div className="form-section-title">Dates &amp; Preferences</div>
          <div className="form-cols-3">
            <div className="form-row">
              <label className="field-label" htmlFor="f-start">Start Date <span className="required-mark">*</span></label>
              <input id="f-start" type="date" className={`field${showErr('startDate') ? ' field-error' : ''}`} value={fd.startDate}
                onChange={e => change('startDate', e.target.value)} onBlur={() => touch('startDate')} data-testid="form-start-date" />
              {showErr('startDate') && <span className="field-error-msg" role="alert">{errors.startDate}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-end">End Date <span className="required-mark">*</span></label>
              <input id="f-end" type="date" className={`field${showErr('endDate') ? ' field-error' : ''}`} value={fd.endDate}
                onChange={e => change('endDate', e.target.value)} onBlur={() => touch('endDate')} data-testid="form-end-date" />
              {showErr('endDate') && <span className="field-error-msg" role="alert">{errors.endDate}</span>}
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="f-color">Accent Color</label>
              <input id="f-color" type="color" className="field" style={{ height: 36, padding: '2px 4px' }} value={fd.color}
                onChange={e => change('color', e.target.value)} data-testid="form-color" />
            </div>
          </div>
          <div className="form-row">
            <label className="field-label" htmlFor="f-rating">Rating: {fd.rating}/5</label>
            <div className="range-wrap">
              <input id="f-rating" type="range" min={1} max={5} value={fd.rating}
                onChange={e => change('rating', e.target.value)} data-testid="form-rating" />
              <span className="range-val">{fd.rating}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="form-section">
          <div className="form-section-title">Preferences</div>
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-title">Newsletter</div>
              <div className="toggle-desc">Receive weekly updates</div>
            </div>
            <button type="button" role="switch" aria-checked={fd.newsletter}
              className="toggle-switch" onClick={() => change('newsletter', !fd.newsletter)}
              data-testid="form-newsletter">
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-title">Notifications</div>
              <div className="toggle-desc">Enable in-app notifications</div>
            </div>
            <button type="button" role="switch" aria-checked={fd.notifications}
              className="toggle-switch" onClick={() => change('notifications', !fd.notifications)}
              data-testid="form-notifications">
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-title">Advanced Settings</div>
              <div className="toggle-desc">Reveal additional configuration options</div>
            </div>
            <button type="button" role="switch" aria-checked={fd.advancedSettings}
              className="toggle-switch" onClick={() => change('advancedSettings', !fd.advancedSettings)}
              data-testid="form-advanced">
              <span className="toggle-thumb" />
            </button>
          </div>
          {fd.advancedSettings && (
            <div className="state-dependent" data-testid="advanced-settings-panel">
              <div className="check-group">
                <label className="check-label"><input type="checkbox" /> Enable debug mode</label>
                <label className="check-label"><input type="checkbox" /> Enable experimental features</label>
                <label className="check-label"><input type="checkbox" /> Log all interactions</label>
              </div>
            </div>
          )}
          <div className="form-row mt-12">
            <label className="check-label">
              <input type="checkbox" checked={fd.terms}
                onChange={e => changeAndTouch('terms', e.target.checked)}
                data-testid="form-terms" />
              I accept the terms and conditions <span className="required-mark">*</span>
            </label>
            {(touched.terms || submitAttempted) && errors.terms && (
              <span className="field-error-msg" role="alert">{errors.terms}</span>
            )}
          </div>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} data-testid="form-submit">
            {isSubmitting ? <><span className="btn-spinner" /> Submitting…</> : 'Submit Form'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm} data-testid="form-reset">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
