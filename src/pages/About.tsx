export function About() {
  const stack = ['React 19', 'TypeScript 6', 'Vite 8', 'React Router 7', 'Express (backend)', 'JSON file persistence'];

  const sections: { title: string; items: string[] }[] = [
    { title: 'Interaction Types', items: ['Forms with full validation', 'Data tables — search, filter, sort, paginate', 'Modal dialogs, drawers, toasts', 'Kanban board (persisted)', 'File upload with progress & retry', 'State-dependent conditional UI', 'Accessibility patterns'] },
    { title: 'Design Principles', items: ['Discoverability — semantic HTML, meaningful labels', 'Determinism — no random behaviour', 'State richness — every control has multiple states', 'Error recovery — make mistakes, correct, resubmit', 'Full keyboard support'] },
    { title: 'For Testing Agents', items: ['All data persisted via REST API (no mock/hardcoded)', 'data-testid on every important element', 'Also testable by text, role, label, semantic tag', '"Reset Test Environment" returns to baseline', 'Server runs on localhost:3001, proxied via Vite'] },
  ];

  return (
    <div data-testid="page-about">
      <div className="page-header">
        <h1>About</h1>
        <p>UI Testing Playground — a deterministic benchmark environment for AI browser-testing agents</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Technology Stack</span></div>
          <div className="card-body">
            <ul style={{ listStyle: 'disc', paddingLeft: 18, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {stack.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>

        {sections.map(sec => (
          <div className="card" key={sec.title}>
            <div className="card-header"><span className="card-title">{sec.title}</span></div>
            <div className="card-body">
              <ul style={{ listStyle: 'disc', paddingLeft: 18, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sec.items.map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          </div>
        ))}

        <div className="card">
          <div className="card-header"><span className="card-title">API Endpoints</span></div>
          <div className="card-body">
            <div style={{ fontSize: 12, fontFamily: 'var(--mono)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'GET  /api/users',
                'POST /api/users',
                'PATCH /api/users/:id',
                'DELETE /api/users/:id',
                'GET  /api/kanban/columns',
                'POST /api/kanban/columns',
                'GET  /api/kanban/cards',
                'POST /api/kanban/cards',
                'PATCH /api/kanban/cards/:id',
                'GET  /api/activities',
                'GET  /api/files',
                'POST /api/files',
                'POST /api/files/:id/upload',
                'GET  /api/settings',
                'PATCH /api/settings',
                'POST /api/settings/reset',
              ].map(e => <code key={e} style={{ display: 'block' }}>{e}</code>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
