import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';

// ── Types ──────────────────────────────────────────────────────────────────
type Errors = Record<string, string>;
type Touched = Record<string, boolean>;

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  hint?: string;
  rule: (v: string, all: Record<string, string>) => string;
}

// ── Validation rules (used across multiple passes) ─────────────────────────
const FIELDS: Field[] = [
  {
    name: 'fullName',
    label: 'Full Name',
    type: 'text',
    required: true,
    hint: 'Min 2 chars, max 60, no numbers',
    rule: v => {
      if (!v.trim()) return 'Required';
      if (v.trim().length < 2) return 'At least 2 characters';
      if (v.trim().length > 60) return 'No more than 60 characters';
      if (/\d/.test(v)) return 'Must not contain numbers';
      return '';
    },
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    required: true,
    hint: '3–20 chars, letters/numbers/underscores only, must start with a letter',
    rule: v => {
      if (!v) return 'Required';
      if (v.length < 3) return 'At least 3 characters';
      if (v.length > 20) return 'No more than 20 characters';
      if (!/^[a-zA-Z]/.test(v)) return 'Must start with a letter';
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(v)) return 'Letters, numbers, and underscores only';
      return '';
    },
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    hint: 'Valid email format, e.g. user@example.com',
    rule: v => {
      if (!v) return 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Invalid email address';
      return '';
    },
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    hint: 'International format, e.g. +1 555 000 0000 (optional)',
    rule: v => {
      if (!v) return '';
      if (!/^\+?[\d\s\-().]{7,20}$/.test(v)) return 'Invalid phone number format';
      return '';
    },
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
    hint: 'Must be between 18 and 100',
    rule: v => {
      if (!v) return 'Required';
      const n = Number(v);
      if (isNaN(n) || !Number.isInteger(n)) return 'Must be a whole number';
      if (n < 18) return 'Must be at least 18';
      if (n > 100) return 'Must be 100 or younger';
      return '';
    },
  },
  {
    name: 'website',
    label: 'Website URL',
    type: 'url',
    hint: 'Must start with https:// (optional)',
    rule: v => {
      if (!v) return '';
      if (!/^https:\/\/.{3,}/.test(v)) return 'Must start with https://';
      try { new URL(v); return ''; } catch { return 'Invalid URL'; }
    },
  },
  {
    name: 'postalCode',
    label: 'Postal Code',
    type: 'text',
    required: true,
    hint: 'US ZIP (12345 or 12345-6789) or Canadian postal code (A1A 1A1)',
    rule: v => {
      if (!v) return 'Required';
      if (/^\d{5}(-\d{4})?$/.test(v)) return '';
      if (/^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/.test(v)) return '';
      return 'Invalid postal code format';
    },
  },
  {
    name: 'creditCard',
    label: 'Credit Card Number',
    type: 'text',
    hint: '16-digit number (spaces allowed), e.g. 4111 1111 1111 1111 — Luhn-checked',
    rule: v => {
      if (!v) return '';
      const digits = v.replace(/\s/g, '');
      if (!/^\d{16}$/.test(digits)) return 'Must be exactly 16 digits';
      // Luhn algorithm
      let sum = 0;
      for (let i = 0; i < 16; i++) {
        let d = parseInt(digits[15 - i]);
        if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
        sum += d;
      }
      if (sum % 10 !== 0) return 'Invalid card number (fails Luhn check)';
      return '';
    },
  },
];

const PASSWORD_RULES = [
  { id: 'len',   label: 'At least 12 characters',         check: (v: string) => v.length >= 12 },
  { id: 'upper', label: 'At least 2 uppercase letters',   check: (v: string) => (v.match(/[A-Z]/g) || []).length >= 2 },
  { id: 'lower', label: 'At least 2 lowercase letters',   check: (v: string) => (v.match(/[a-z]/g) || []).length >= 2 },
  { id: 'num',   label: 'At least 2 digits',              check: (v: string) => (v.match(/\d/g) || []).length >= 2 },
  { id: 'sym',   label: 'At least 1 special character',   check: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { id: 'noseq', label: 'No sequential chars (abc, 123)', check: (v: string) => !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(v) },
];

function validatePassword(v: string): string {
  if (!v) return 'Required';
  const failed = PASSWORD_RULES.filter(r => !r.check(v));
  if (failed.length) return failed[0].label;
  return '';
}

export function ValidationLab() {
  const { addToast } = useApp();

  const emptyValues = () => Object.fromEntries(FIELDS.map(f => [f.name, '']));

  const [values, setValues]         = useState<Record<string, string>>(emptyValues());
  const [password, setPassword]     = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errors, setErrors]         = useState<Errors>({});
  const [touched, setTouched]       = useState<Touched>({});
  const [mode, setMode]             = useState<'blur' | 'change' | 'submit'>('blur');
  const [attempts, setAttempts]     = useState(0);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [crossErrors, setCrossErrors] = useState<string[]>([]);

  // Cross-field validation
  const validateCross = (_vals: Record<string, string>, pwd: string, cpwd: string): string[] => {
    const errs: string[] = [];
    if (pwd && cpwd && pwd !== cpwd) errs.push('Passwords do not match');
    return errs;
  };

  const runField = (name: string, val: string, all: Record<string, string>): string => {
    const field = FIELDS.find(f => f.name === name);
    if (!field) {
      if (name === 'password') return validatePassword(val);
      if (name === 'confirmPwd') return val !== all.password ? (val ? 'Passwords do not match' : 'Required') : '';
    }
    return field?.rule(val, all) ?? '';
  };

  const touch = (name: string) => {
    setTouched(p => ({ ...p, [name]: true }));
    if (mode === 'blur') {
      const allVals: Record<string, string> = { ...values, password, confirmPwd };
      setErrors(p => ({ ...p, [name]: runField(name, allVals[name] ?? '', allVals) }));
    }
  };

  const change = (name: string, val: string) => {
    const next = { ...values, [name]: val };
    if (name === 'password') {
      if (mode === 'change') {
        setErrors(p => ({ ...p, password: validatePassword(val) }));
      }
    } else {
      setValues(next);
      if (mode === 'change') {
        const allVals = { ...next, password, confirmPwd };
        setErrors(p => ({ ...p, [name]: runField(name, val, allVals) }));
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempts(a => a + 1);
    setTouched(Object.fromEntries([...FIELDS.map(f => f.name), 'password', 'confirmPwd'].map(n => [n, true])));

    const allVals = { ...values, password, confirmPwd };
    const newErrors: Errors = {};

    FIELDS.forEach(f => {
      const err = f.rule(values[f.name] ?? '', allVals);
      if (err) newErrors[f.name] = err;
    });
    newErrors.password    = validatePassword(password);
    newErrors.confirmPwd  = confirmPwd !== password ? (confirmPwd ? 'Passwords do not match' : 'Required') : '';

    // Remove empty strings
    Object.keys(newErrors).forEach(k => { if (!newErrors[k]) delete newErrors[k]; });

    setErrors(newErrors);
    const cross = validateCross(allVals, password, confirmPwd);
    setCrossErrors(cross);

    if (Object.keys(newErrors).length > 0 || cross.length > 0) {
      addToast('error', `${Object.keys(newErrors).length + cross.length} validation error(s) — please fix and resubmit`);
      setSubmitState('idle');
      return;
    }

    setSubmitState('loading');
    try {
      await new Promise(r => setTimeout(r, 1000));
      await api.post('/api/form-submissions', { ...values, submittedAt: new Date().toISOString(), type: 'validation-lab' });
      await api.post('/api/activities', { action: 'Validation Lab form submitted', status: 'success' });
      setSubmitState('success');
      addToast('success', 'Form submitted successfully');
    } catch {
      setSubmitState('error');
      addToast('error', 'Submission failed — server error');
    }
  };

  const reset = () => {
    setValues(emptyValues());
    setPassword('');
    setConfirmPwd('');
    setErrors({});
    setTouched({});
    setCrossErrors([]);
    setSubmitState('idle');
    addToast('info', 'Form reset');
  };

  const showErr = (name: string) => (touched[name]) && errors[name];

  const pwdStrength = (() => {
    const passing = PASSWORD_RULES.filter(r => r.check(password)).length;
    if (!password) return null;
    if (passing <= 2) return { label: 'Very weak', pct: 16,  color: 'var(--error)' };
    if (passing <= 3) return { label: 'Weak',      pct: 33,  color: 'var(--error)' };
    if (passing <= 4) return { label: 'Fair',       pct: 60,  color: 'var(--warning)' };
    if (passing <= 5) return { label: 'Strong',     pct: 85,  color: 'var(--success)' };
    return                    { label: 'Very strong', pct: 100, color: 'var(--success)' };
  })();

  return (
    <div data-testid="page-validation">
      <div className="page-header">
        <h1>Validation Lab</h1>
        <p>Complex field-level and cross-field validation — intentionally designed to challenge testing agents</p>
      </div>

      {/* Validation mode selector */}
      <div className="card mb-16">
        <div className="card-header">
          <span className="card-title">Validation Strategy</span>
          {attempts > 0 && (
            <span className="badge badge-info">{attempts} submit attempt{attempts !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="card-body">
          <p className="text-muted text-sm mb-12">
            Choose when validation runs. The agent must discover which mode is active and adapt accordingly.
          </p>
          <div className="check-group check-group-inline">
            {(['blur', 'change', 'submit'] as const).map(m => (
              <label key={m} className="radio-label">
                <input
                  type="radio"
                  name="val-mode"
                  value={m}
                  checked={mode === m}
                  onChange={() => { setMode(m); setErrors({}); setTouched({}); }}
                  data-testid={`validation-mode-${m}`}
                />
                On {m === 'blur' ? 'field blur' : m === 'change' ? 'every keystroke' : 'form submit'}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Error summary (shown after submit attempt) */}
      {attempts > 0 && (Object.keys(errors).length > 0 || crossErrors.length > 0) && (
        <div className="alert alert-error mb-16" role="alert" data-testid="error-summary">
          <div className="alert-msg">
            <strong>Please fix the following errors:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12 }}>
              {Object.entries(errors).map(([k, v]) => (
                <li key={k}>{FIELDS.find(f => f.name === k)?.label ?? k}: {v}</li>
              ))}
              {crossErrors.map((e, i) => <li key={`cross-${i}`}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {submitState === 'success' && (
        <div className="alert alert-success mb-16" role="alert" data-testid="submit-success">
          <span className="alert-msg">Form submitted successfully! Reset to try again.</span>
        </div>
      )}
      {submitState === 'error' && (
        <div className="alert alert-error mb-16" role="alert" data-testid="submit-error">
          <span className="alert-msg">Server error — submission failed. You can retry.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate data-testid="validation-form">

        {/* ── Standard fields ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Identity Fields</span></div>
          <div className="card-body">
            <div className="form-cols-2">
              {FIELDS.slice(0, 2).map(f => (
                <div className="form-row" key={f.name}>
                  <label className="field-label" htmlFor={`vl-${f.name}`}>
                    {f.label}{f.required && <span className="required-mark"> *</span>}
                  </label>
                  <input
                    id={`vl-${f.name}`}
                    type={f.type}
                    className={`field${showErr(f.name) ? ' field-error' : ''}`}
                    value={values[f.name] ?? ''}
                    onChange={e => change(f.name, e.target.value)}
                    onBlur={() => touch(f.name)}
                    data-testid={`vl-${f.name}`}
                    aria-describedby={`vl-${f.name}-hint`}
                    aria-invalid={!!showErr(f.name)}
                  />
                  <div id={`vl-${f.name}-hint`} className="field-hint">{f.hint}</div>
                  {showErr(f.name) && (
                    <span className="field-error-msg" role="alert" data-testid={`vl-${f.name}-error`}>
                      {errors[f.name]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="form-cols-2">
              {FIELDS.slice(2, 4).map(f => (
                <div className="form-row" key={f.name}>
                  <label className="field-label" htmlFor={`vl-${f.name}`}>
                    {f.label}{f.required && <span className="required-mark"> *</span>}
                  </label>
                  <input
                    id={`vl-${f.name}`}
                    type={f.type}
                    className={`field${showErr(f.name) ? ' field-error' : ''}`}
                    value={values[f.name] ?? ''}
                    onChange={e => change(f.name, e.target.value)}
                    onBlur={() => touch(f.name)}
                    data-testid={`vl-${f.name}`}
                    aria-invalid={!!showErr(f.name)}
                  />
                  <div className="field-hint">{f.hint}</div>
                  {showErr(f.name) && (
                    <span className="field-error-msg" role="alert" data-testid={`vl-${f.name}-error`}>
                      {errors[f.name]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="form-cols-3">
              {FIELDS.slice(4, 7).map(f => (
                <div className="form-row" key={f.name}>
                  <label className="field-label" htmlFor={`vl-${f.name}`}>
                    {f.label}{f.required && <span className="required-mark"> *</span>}
                  </label>
                  <input
                    id={`vl-${f.name}`}
                    type={f.type}
                    className={`field${showErr(f.name) ? ' field-error' : ''}`}
                    value={values[f.name] ?? ''}
                    onChange={e => change(f.name, e.target.value)}
                    onBlur={() => touch(f.name)}
                    data-testid={`vl-${f.name}`}
                    aria-invalid={!!showErr(f.name)}
                  />
                  <div className="field-hint">{f.hint}</div>
                  {showErr(f.name) && (
                    <span className="field-error-msg" role="alert" data-testid={`vl-${f.name}-error`}>
                      {errors[f.name]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Credit card (Luhn) ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Credit Card — Luhn Algorithm Validation</span></div>
          <div className="card-body">
            {(() => {
              const f = FIELDS[7];
              return (
                <div className="form-row">
                  <label className="field-label" htmlFor={`vl-${f.name}`}>{f.label}</label>
                  <input
                    id={`vl-${f.name}`}
                    type="text"
                    maxLength={19}
                    className={`field${showErr(f.name) ? ' field-error' : ''}`}
                    value={values[f.name] ?? ''}
                    onChange={e => {
                      // Auto-space every 4 digits
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const spaced = raw.replace(/(.{4})/g, '$1 ').trim();
                      change(f.name, spaced);
                    }}
                    onBlur={() => touch(f.name)}
                    placeholder="4111 1111 1111 1111"
                    data-testid={`vl-${f.name}`}
                    aria-invalid={!!showErr(f.name)}
                  />
                  <div className="field-hint">{f.hint}</div>
                  {showErr(f.name) && (
                    <span className="field-error-msg" role="alert" data-testid={`vl-${f.name}-error`}>
                      {errors[f.name]}
                    </span>
                  )}
                  {touched[f.name] && !errors[f.name] && values[f.name].replace(/\s/g, '').length === 16 && (
                    <span className="field-hint" style={{ color: 'var(--success)' }} data-testid="vl-creditCard-valid">
                      Valid card number
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Password with live rules ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Password — Progressive Strength Rules</span></div>
          <div className="card-body">
            <div className="form-cols-2">
              <div className="form-row">
                <label className="field-label" htmlFor="vl-password">
                  Password <span className="required-mark">*</span>
                </label>
                <input
                  id="vl-password"
                  type="password"
                  className={`field${showErr('password') ? ' field-error' : ''}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); change('password', e.target.value); }}
                  onBlur={() => touch('password')}
                  data-testid="vl-password"
                  aria-invalid={!!showErr('password')}
                />
                {/* Strength bar */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${pwdStrength?.pct ?? 0}%`, background: pwdStrength?.color, transition: 'width .2s, background .2s' }} data-testid="pwd-strength-bar" />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: pwdStrength?.color }} data-testid="pwd-strength-label">
                      {pwdStrength?.label}
                    </span>
                  </div>
                )}
                {showErr('password') && (
                  <span className="field-error-msg" role="alert" data-testid="vl-password-error">{errors.password}</span>
                )}
              </div>

              <div className="form-row">
                <label className="field-label" htmlFor="vl-confirmPwd">
                  Confirm Password <span className="required-mark">*</span>
                </label>
                <input
                  id="vl-confirmPwd"
                  type="password"
                  className={`field${showErr('confirmPwd') ? ' field-error' : ''}`}
                  value={confirmPwd}
                  onChange={e => {
                    setConfirmPwd(e.target.value);
                    if (mode === 'change') setErrors(p => ({ ...p, confirmPwd: e.target.value !== password ? 'Passwords do not match' : '' }));
                  }}
                  onBlur={() => {
                    setTouched(p => ({ ...p, confirmPwd: true }));
                    if (mode === 'blur') setErrors(p => ({ ...p, confirmPwd: confirmPwd !== password ? 'Passwords do not match' : '' }));
                  }}
                  data-testid="vl-confirmPwd"
                  aria-invalid={!!showErr('confirmPwd')}
                />
                {showErr('confirmPwd') && (
                  <span className="field-error-msg" role="alert" data-testid="vl-confirmPwd-error">{errors.confirmPwd}</span>
                )}
                {touched.confirmPwd && !errors.confirmPwd && confirmPwd && password === confirmPwd && (
                  <span className="field-hint" style={{ color: 'var(--success)' }} data-testid="pwd-match-ok">Passwords match</span>
                )}
              </div>
            </div>

            {/* Live password rule checklist */}
            {password && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }} data-testid="pwd-rules-checklist">
                <div className="section-title" style={{ marginBottom: 10 }}>Password requirements</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PASSWORD_RULES.map(r => {
                    const ok = r.check(password);
                    return (
                      <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }} data-testid={`pwd-rule-${r.id}`}>
                        <span style={{ color: ok ? 'var(--success)' : 'var(--error)', fontWeight: 700, fontSize: 14, lineHeight: 1 }}>
                          {ok ? '✓' : '✕'}
                        </span>
                        <span style={{ color: ok ? 'var(--success)' : 'var(--text-muted)' }}>{r.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Date range validation ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Date Range — End must be after Start</span></div>
          <div className="card-body">
            <div className="form-cols-2">
              <div className="form-row">
                <label className="field-label" htmlFor="vl-startDate">
                  Start Date <span className="required-mark">*</span>
                </label>
                <input
                  id="vl-startDate"
                  type="date"
                  className={`field${showErr('startDate') ? ' field-error' : ''}`}
                  value={values.startDate ?? ''}
                  onChange={e => {
                    change('startDate', e.target.value);
                    if (mode === 'change' && values.endDate && e.target.value > values.endDate) {
                      setErrors(p => ({ ...p, endDate: 'End date must be after start date' }));
                    }
                  }}
                  onBlur={() => touch('startDate')}
                  data-testid="vl-startDate"
                />
                {showErr('startDate') && (
                  <span className="field-error-msg" role="alert" data-testid="vl-startDate-error">{errors.startDate}</span>
                )}
              </div>
              <div className="form-row">
                <label className="field-label" htmlFor="vl-endDate">
                  End Date <span className="required-mark">*</span>
                </label>
                <input
                  id="vl-endDate"
                  type="date"
                  className={`field${showErr('endDate') ? ' field-error' : ''}`}
                  value={values.endDate ?? ''}
                  min={values.startDate || undefined}
                  onChange={e => {
                    change('endDate', e.target.value);
                    if (mode === 'change') {
                      if (!e.target.value) setErrors(p => ({ ...p, endDate: 'Required' }));
                      else if (values.startDate && e.target.value <= values.startDate) setErrors(p => ({ ...p, endDate: 'End date must be after start date' }));
                      else setErrors(p => ({ ...p, endDate: '' }));
                    }
                  }}
                  onBlur={() => {
                    setTouched(p => ({ ...p, endDate: true }));
                    if (!values.endDate) setErrors(p => ({ ...p, endDate: 'Required' }));
                    else if (values.startDate && values.endDate <= values.startDate) setErrors(p => ({ ...p, endDate: 'End date must be after start date' }));
                    else setErrors(p => ({ ...p, endDate: '' }));
                  }}
                  data-testid="vl-endDate"
                />
                {showErr('endDate') && (
                  <span className="field-error-msg" role="alert" data-testid="vl-endDate-error">{errors.endDate}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Numeric constraints ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Numeric Constraints</span></div>
          <div className="card-body">
            <div className="form-cols-3">
              {[
                { name: 'quantity', label: 'Quantity', hint: '1–999, integers only', min: 1, max: 999 },
                { name: 'discount', label: 'Discount (%)', hint: '0–100, up to 2 decimal places', min: 0, max: 100 },
                { name: 'score',    label: 'Score',    hint: 'Multiple of 5, 0–100',   min: 0, max: 100 },
              ].map(f => {
                const err = touched[f.name] && errors[f.name];
                return (
                  <div className="form-row" key={f.name}>
                    <label className="field-label" htmlFor={`vl-${f.name}`}>{f.label}</label>
                    <input
                      id={`vl-${f.name}`}
                      type="number"
                      min={f.min}
                      max={f.max}
                      step={f.name === 'score' ? 5 : f.name === 'discount' ? 0.01 : 1}
                      className={`field${err ? ' field-error' : ''}`}
                      value={values[f.name] ?? ''}
                      onChange={e => {
                        change(f.name, e.target.value);
                        if (mode === 'change') {
                          const n = Number(e.target.value);
                          let fieldErr = '';
                          if (e.target.value && (isNaN(n) || n < f.min || n > f.max)) fieldErr = `Must be ${f.min}–${f.max}`;
                          if (f.name === 'quantity' && e.target.value && !Number.isInteger(n)) fieldErr = 'Must be a whole number';
                          if (f.name === 'score'    && e.target.value && n % 5 !== 0) fieldErr = 'Must be a multiple of 5';
                          setErrors(p => ({ ...p, [f.name]: fieldErr }));
                        }
                      }}
                      onBlur={() => {
                        setTouched(p => ({ ...p, [f.name]: true }));
                        const n = Number(values[f.name]);
                        let fieldErr = '';
                        if (values[f.name] && (isNaN(n) || n < f.min || n > f.max)) fieldErr = `Must be ${f.min}–${f.max}`;
                        if (f.name === 'quantity' && values[f.name] && !Number.isInteger(n)) fieldErr = 'Must be a whole number';
                        if (f.name === 'score'    && values[f.name] && n % 5 !== 0) fieldErr = 'Must be a multiple of 5';
                        setErrors(p => ({ ...p, [f.name]: fieldErr }));
                      }}
                      data-testid={`vl-${f.name}`}
                    />
                    <div className="field-hint">{f.hint}</div>
                    {err && <span className="field-error-msg" role="alert" data-testid={`vl-${f.name}-error`}>{errors[f.name]}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Agreement ── */}
        <div className="card mb-16">
          <div className="card-header"><span className="card-title">Agreements</span></div>
          <div className="card-body">
            <div className="check-group">
              {[
                { name: 'terms',   label: 'I have read and accept the Terms of Service', required: true },
                { name: 'privacy', label: 'I agree to the Privacy Policy', required: true },
                { name: 'ageConfirm', label: 'I confirm I am 18 years of age or older', required: true },
                { name: 'marketing', label: 'I agree to receive marketing communications (optional)', required: false },
              ].map(f => {
                const checked = values[f.name] === 'true';
                const err = touched[f.name] && errors[f.name];
                return (
                  <div key={f.name}>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          const newChecked = e.target.checked;
                          // Update value, mark touched, and validate in one shot
                          // to avoid stale-closure reads
                          setValues(prev => ({ ...prev, [f.name]: String(newChecked) }));
                          setTouched(p => ({ ...p, [f.name]: true }));
                          if (f.required) {
                            setErrors(p => ({ ...p, [f.name]: !newChecked ? 'Required' : '' }));
                          }
                        }}
                        data-testid={`vl-${f.name}`}
                        aria-invalid={!!err}
                      />
                      {f.label}{f.required && <span className="required-mark"> *</span>}
                    </label>
                    {err && <span className="field-error-msg" role="alert" style={{ marginLeft: 24 }} data-testid={`vl-${f.name}-error`}>{errors[f.name]}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="btn-row">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitState === 'loading'}
            data-testid="vl-submit"
          >
            {submitState === 'loading' ? <><span className="btn-spinner" /> Submitting…</> : 'Submit'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={reset} data-testid="vl-reset">
            Reset Form
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              // Pre-fill with known-valid values for quick testing
              setValues({
                fullName: 'Jane Smith', username: 'janesmith', email: 'jane@example.com',
                phone: '+1 555 000 1234', age: '28', website: 'https://janesmith.dev',
                postalCode: '10001', creditCard: '4111 1111 1111 1111',
                startDate: '2025-01-01', endDate: '2025-06-30',
                quantity: '5', discount: '10', score: '85',
                terms: 'true', privacy: 'true', ageConfirm: 'true', marketing: 'false',
              });
              setPassword('SecurePass12!');
              setConfirmPwd('SecurePass12!');
              setErrors({}); setTouched({}); setSubmitState('idle');
              addToast('info', 'Form pre-filled with valid values');
            }}
            data-testid="vl-prefill"
          >
            Pre-fill valid values
          </button>
        </div>
      </form>
    </div>
  );
}
