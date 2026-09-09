import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="not-found" data-testid="page-not-found">
      <div className="not-found-code">404</div>
      <h1>Page not found</h1>
      <p className="not-found-msg">The page you're looking for doesn't exist or has been moved.</p>
      <div className="btn-row" style={{ justifyContent: 'center' }}>
        <Link to="/dashboard" className="btn btn-primary" data-testid="back-to-dashboard">Back to Dashboard</Link>
        <Link to="/scenarios" className="btn btn-secondary" data-testid="back-to-home">Test Scenarios</Link>
      </div>
      <div className="card" style={{ marginTop: 32, maxWidth: 360 }}>
        <div className="card-header"><span className="card-title">Quick Links</span></div>
        <div className="card-body">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <Link to="/forms"    data-testid="link-forms">Form Playground</Link>
            <Link to="/controls" data-testid="link-controls">Controls Lab</Link>
            <Link to="/table"    data-testid="link-table">Data Table</Link>
            <Link to="/coverage" data-testid="link-coverage">Interaction Coverage</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
