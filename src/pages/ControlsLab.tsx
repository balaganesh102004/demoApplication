import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function ControlsLab() {
  const { addToast } = useApp();
  const [checks, setChecks] = useState({ single: false, opt1: false, opt2: false, opt3: false });
  const [radio, setRadio] = useState('option1');
  const [toggles, setToggles] = useState({ basic: false, confirmation: false });
  const [slider, setSlider] = useState(50);
  const [rangeMin, setRangeMin] = useState(25);
  const [rangeMax, setRangeMax] = useState(75);
  const [activeTab, setActiveTab] = useState('tab1');
  const [openAccordions, setOpenAccordions] = useState<string[]>(['acc1']);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleAccordion = (id: string) =>
    setOpenAccordions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const selectAll = () => setChecks(p => ({ ...p, opt1: true, opt2: true, opt3: true }));

  const handleConfirmToggle = () => {
    if (!toggles.confirmation) {
      if (!window.confirm('Enable this toggle?')) return;
    }
    setToggles(p => ({ ...p, confirmation: !p.confirmation }));
  };

  return (
    <div data-testid="page-controls">
      <div className="page-header">
        <h1>Controls Lab</h1>
        <p>Every interactive control type, with multiple states</p>
      </div>

      <div className="controls-layout">

        {/* Buttons */}
        <div className="card">
          <div className="card-header"><span className="card-title">Buttons</span></div>
          <div className="card-body">
            <div className="btn-row">
              <button className="btn btn-primary"   onClick={() => addToast('info', 'Primary clicked')}   data-testid="btn-primary">Primary</button>
              <button className="btn btn-secondary" onClick={() => addToast('info', 'Secondary clicked')} data-testid="btn-secondary">Secondary</button>
              <button className="btn btn-ghost"     onClick={() => addToast('info', 'Ghost clicked')}     data-testid="btn-ghost">Ghost</button>
              <button className="btn btn-danger"    onClick={() => addToast('warning', 'Danger!')}        data-testid="btn-danger">Danger</button>
              <button className="btn btn-success"   onClick={() => addToast('success', 'Success!')}       data-testid="btn-success">Success</button>
            </div>
            <div className="btn-row mt-8">
              <button className="btn btn-primary btn-sm"  onClick={() => addToast('info', 'Small')}   data-testid="btn-sm">Small</button>
              <button className="btn btn-primary btn-xs"  onClick={() => addToast('info', 'XSmall')}  data-testid="btn-xs">Extra Small</button>
              <button className="btn btn-primary" disabled                                             data-testid="btn-disabled">Disabled</button>
              <button className="btn btn-primary" disabled data-testid="btn-loading"><span className="btn-spinner" /> Loading</button>
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="card">
          <div className="card-header"><span className="card-title">Checkboxes</span></div>
          <div className="card-body">
            <div className="check-group">
              <label className="check-label">
                <input type="checkbox" checked={checks.single} onChange={() => setChecks(p => ({ ...p, single: !p.single }))} data-testid="checkbox-single" />
                Single checkbox (currently: {checks.single ? 'checked' : 'unchecked'})
              </label>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                  <span>Group</span>
                  <button className="btn btn-ghost btn-xs" onClick={selectAll} data-testid="select-all-checkboxes">Select all</button>
                </div>
                <div className="check-group">
                  <label className="check-label"><input type="checkbox" checked={checks.opt1} onChange={() => setChecks(p => ({ ...p, opt1: !p.opt1 }))} data-testid="checkbox-opt1" /> Option 1</label>
                  <label className="check-label"><input type="checkbox" checked={checks.opt2} onChange={() => setChecks(p => ({ ...p, opt2: !p.opt2 }))} data-testid="checkbox-opt2" /> Option 2</label>
                  <label className="check-label"><input type="checkbox" checked={checks.opt3} onChange={() => setChecks(p => ({ ...p, opt3: !p.opt3 }))} data-testid="checkbox-opt3" /> Option 3</label>
                </div>
              </div>
              <label className="check-label" style={{ opacity: .5 }}>
                <input type="checkbox" disabled defaultChecked data-testid="checkbox-disabled" />
                Disabled (checked)
              </label>
            </div>
          </div>
        </div>

        {/* Radio */}
        <div className="card">
          <div className="card-header"><span className="card-title">Radio Buttons</span></div>
          <div className="card-body">
            <div className="radio-group">
              {['option1', 'option2', 'option3'].map(v => (
                <label className="radio-label" key={v}>
                  <input type="radio" name="controls-radio" value={v} checked={radio === v}
                    onChange={() => setRadio(v)} data-testid={`radio-${v}`} />
                  {v.replace('option', 'Option ')}
                </label>
              ))}
              <label className="radio-label" style={{ opacity: .5 }}>
                <input type="radio" name="controls-radio-dis" disabled data-testid="radio-disabled" />
                Disabled option
              </label>
            </div>
            <p className="text-muted text-sm mt-8">Selected: {radio}</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="card">
          <div className="card-header"><span className="card-title">Toggles</span></div>
          <div className="card-body" style={{ padding: '4px 18px' }}>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Basic toggle</div>
                <div className="toggle-desc">Currently {toggles.basic ? 'on' : 'off'}</div>
              </div>
              <button role="switch" aria-checked={toggles.basic} className="toggle-switch"
                onClick={() => setToggles(p => ({ ...p, basic: !p.basic }))} data-testid="toggle-basic">
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Disabled toggle</div>
              </div>
              <button role="switch" aria-checked={true} className="toggle-switch" disabled data-testid="toggle-disabled">
                <span className="toggle-thumb" />
              </button>
            </div>
            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-title">Confirmation toggle</div>
                <div className="toggle-desc">Asks for confirmation before enabling</div>
              </div>
              <button role="switch" aria-checked={toggles.confirmation} className="toggle-switch"
                onClick={handleConfirmToggle} data-testid="toggle-confirmation">
                <span className="toggle-thumb" />
              </button>
            </div>
            {toggles.basic && (
              <div className="alert alert-info mt-8" data-testid="toggle-result">Basic toggle is on</div>
            )}
          </div>
        </div>

        {/* Sliders */}
        <div className="card">
          <div className="card-header"><span className="card-title">Sliders</span></div>
          <div className="card-body">
            <div className="form-row">
              <label className="field-label">Single value</label>
              <div className="range-wrap">
                <input type="range" min={0} max={100} value={slider} onChange={e => setSlider(+e.target.value)} data-testid="slider-single" />
                <span className="range-val">{slider}</span>
              </div>
            </div>
            <div className="form-row">
              <label className="field-label">Range (min / max)</label>
              <div className="range-wrap">
                <input type="range" min={0} max={100} value={rangeMin} onChange={e => setRangeMin(+e.target.value)} data-testid="slider-range-min" />
                <span className="range-val">{rangeMin}</span>
              </div>
              <div className="range-wrap mt-4">
                <input type="range" min={0} max={100} value={rangeMax} onChange={e => setRangeMax(+e.target.value)} data-testid="slider-range-max" />
                <span className="range-val">{rangeMax}</span>
              </div>
              <span className="field-hint">Range: {rangeMin}–{rangeMax}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="card-header"><span className="card-title">Tabs</span></div>
          <div className="card-body">
            <div className="tabs-bar" role="tablist">
              <button role="tab" aria-selected={activeTab === 'tab1'} className={`tab-btn${activeTab === 'tab1' ? ' active' : ''}`}
                onClick={() => setActiveTab('tab1')} data-testid="tab-1">Tab 1</button>
              <button role="tab" aria-selected={activeTab === 'tab2'} className={`tab-btn${activeTab === 'tab2' ? ' active' : ''}`}
                onClick={() => setActiveTab('tab2')} data-testid="tab-2">
                Tab 2 <span className="badge badge-num">5</span>
              </button>
              <button role="tab" aria-selected={activeTab === 'tab3'} className={`tab-btn${activeTab === 'tab3' ? ' active' : ''}`}
                onClick={() => setActiveTab('tab3')} data-testid="tab-3">Tab 3</button>
              <button role="tab" className="tab-btn" disabled data-testid="tab-disabled">Disabled</button>
            </div>
            <div className="tab-panel" role="tabpanel" data-testid="tab-content">
              {activeTab === 'tab1' && <p className="text-sm">Content for Tab 1.</p>}
              {activeTab === 'tab2' && <p className="text-sm">Content for Tab 2 — this one has a badge.</p>}
              {activeTab === 'tab3' && <p className="text-sm">Content for Tab 3.</p>}
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="card">
          <div className="card-header"><span className="card-title">Accordion</span></div>
          <div className="card-body">
            <div className="accordion">
              {[1, 2, 3].map(n => {
                const id = `acc${n}`;
                const open = openAccordions.includes(id);
                return (
                  <div key={id} className={`accordion-item${open ? ' open' : ''}`}>
                    <button className="accordion-trigger" onClick={() => toggleAccordion(id)}
                      aria-expanded={open} data-testid={`accordion-${n}`}>
                      <span>Accordion Item {n}</span>
                      <svg className="accordion-chevron" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    {open && (
                      <div className="accordion-body" data-testid={`accordion-content-${n}`}>
                        This is the content for accordion item {n}. It was expanded by clicking the header.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dropdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">Dropdown Menu</span></div>
          <div className="card-body">
            <div className="dropdown-wrap">
              <button className="btn btn-secondary" onClick={() => setDropdownOpen(v => !v)}
                aria-expanded={dropdownOpen} data-testid="dropdown-trigger">
                {selectedOption || 'Select an option'}
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu" data-testid="dropdown-menu">
                  {['Option A', 'Option B', 'Option C', 'Option D'].map(opt => (
                    <button key={opt} className={`dropdown-menu-item${selectedOption === opt ? ' selected' : ''}`}
                      onClick={() => { setSelectedOption(opt); setDropdownOpen(false); addToast('info', `Selected: ${opt}`); }}
                      data-testid={`dropdown-${opt.toLowerCase().replace(' ', '-')}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedOption && <p className="text-muted text-sm mt-8">Selected: <strong>{selectedOption}</strong></p>}
          </div>
        </div>

        {/* Tooltip & Popover */}
        <div className="card">
          <div className="card-header"><span className="card-title">Tooltip &amp; Popover</span></div>
          <div className="card-body">
            <div className="btn-row">
              <div className="tooltip-wrap">
                <button className="btn btn-secondary"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                  onFocus={() => setTooltipVisible(true)}
                  onBlur={() => setTooltipVisible(false)}
                  data-testid="tooltip-trigger">
                  Hover for tooltip
                </button>
                {tooltipVisible && <div className="tooltip-bubble" role="tooltip" data-testid="tooltip">This is a tooltip</div>}
              </div>

              <div className="popover-wrap">
                <button className="btn btn-secondary" onClick={() => setPopoverOpen(v => !v)} data-testid="popover-trigger">
                  Toggle popover
                </button>
                {popoverOpen && (
                  <div className="popover-panel" data-testid="popover">
                    <div className="popover-header">
                      Popover title
                      <button className="popover-close" onClick={() => setPopoverOpen(false)}>×</button>
                    </div>
                    <div className="popover-body">
                      <p className="text-sm mb-12">This popover has interactive content inside it.</p>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => { addToast('success', 'Popover action triggered'); setPopoverOpen(false); }}
                        data-testid="popover-action">
                        Confirm action
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
