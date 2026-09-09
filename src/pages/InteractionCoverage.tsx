const ROWS = [
  { component: 'Button',        interactions: 'Click, keyboard Enter/Space',              states: 'Default, hover, focus, disabled, loading' },
  { component: 'Checkbox',      interactions: 'Click, keyboard Space',                    states: 'Checked, unchecked, disabled, group, select-all' },
  { component: 'Radio',         interactions: 'Click, keyboard arrows',                   states: 'Selected, unselected, disabled' },
  { component: 'Toggle',        interactions: 'Click, keyboard Space',                    states: 'On, off, disabled, confirmation' },
  { component: 'Text Input',    interactions: 'Type, clear, focus, blur, paste',          states: 'Empty, filled, valid, invalid, disabled' },
  { component: 'Select',        interactions: 'Click, open, keyboard arrows+Enter',       states: 'Closed, open, selected, disabled, dependent' },
  { component: 'Textarea',      interactions: 'Type, resize, character count',            states: 'Empty, filled, max-length' },
  { component: 'Range Slider',  interactions: 'Drag, click, keyboard arrows',             states: 'Min, max, intermediate' },
  { component: 'Date Input',    interactions: 'Click, type, keyboard',                    states: 'Empty, filled, invalid range' },
  { component: 'Tabs',          interactions: 'Click, keyboard arrows',                   states: 'Active, inactive, disabled' },
  { component: 'Accordion',     interactions: 'Click header, keyboard Enter',             states: 'Expanded, collapsed' },
  { component: 'Dropdown Menu', interactions: 'Click trigger, select item, keyboard',    states: 'Open, closed, item selected' },
  { component: 'Tooltip',       interactions: 'Hover, keyboard focus',                   states: 'Visible, hidden' },
  { component: 'Popover',       interactions: 'Click, close, Escape',                    states: 'Open, closed' },
  { component: 'Modal',         interactions: 'Open, close via X/outside/Escape',        states: 'Open, closed, with form' },
  { component: 'Drawer',        interactions: 'Open, close',                             states: 'Open, closed' },
  { component: 'Toast',         interactions: 'Trigger, dismiss, auto-dismiss',          states: 'Success, error, warning, info, persistent' },
  { component: 'Data Table',    interactions: 'Search, filter, sort, select, page',      states: 'Loading, empty, filtered, sorted, selected' },
  { component: 'Kanban Board',  interactions: 'Add column, add card, move card, remove', states: 'Empty, populated' },
  { component: 'File Upload',   interactions: 'Select, upload, retry, remove',           states: 'Pending, uploading, success, error' },
  { component: 'Form',          interactions: 'Type, blur, submit, reset',               states: 'Pristine, dirty, valid, invalid, submitting, success' },
];

export function InteractionCoverage() {
  return (
    <div data-testid="page-coverage">
      <div className="page-header">
        <h1>Interaction Coverage</h1>
        <p>Complete inventory of all interactive components, interactions, and states</p>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-label">Components</div>
          <div className="stat-value">{ROWS.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Interaction Types</div>
          <div className="stat-value">50+</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Testable States</div>
          <div className="stat-value">100+</div>
        </div>
      </div>

      <div className="tbl-wrap coverage-wrap">
        <table className="tbl" data-testid="coverage-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Interactions</th>
              <th>States</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.component}>
                <td style={{ fontWeight: 500, color: "var(--text-strong)", whiteSpace: "nowrap" }}>{row.component}</td>
                <td style={{ fontSize: 12 }}>{row.interactions}</td>
                <td style={{ fontSize: 12 }}>{row.states}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
