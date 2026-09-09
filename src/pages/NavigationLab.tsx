import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export function NavigationLab() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  return (
    <div data-testid="page-navigation">
      <div className="page-header">
        <h1>Navigation Lab</h1>
        <p>Tests for links, programmatic navigation, query params, breadcrumbs, and anchors</p>
      </div>

      <div className="section">
        <div className="section-title">Internal Links</div>
        <div className="card">
          <div className="card-body">
            <nav style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/dashboard"  data-testid="link-dashboard">Dashboard</Link>
              <Link to="/forms"      data-testid="link-forms">Form Playground</Link>
              <Link to="/table"      data-testid="link-table">Data Table</Link>
              <Link to="/controls"   data-testid="link-controls">Controls Lab</Link>
              <Link to="/scenarios"  data-testid="link-scenarios">Test Scenarios</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Programmatic Navigation</div>
        <div className="card">
          <div className="card-body">
            <div className="btn-row">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')} data-testid="nav-dashboard">Go to Dashboard</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}           data-testid="nav-back">Go Back</button>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(1)}            data-testid="nav-forward">Go Forward</button>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Query Parameters</div>
        <div className="card">
          <div className="card-body">
            <div className="tabs-bar">
              {['overview', 'details', 'settings'].map(tab => (
                <button key={tab} className={`tab-btn${currentTab === tab ? ' active' : ''}`}
                  onClick={() => setSearchParams({ tab })} data-testid={`tab-${tab}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-sm">Current tab: <strong data-testid="current-tab">{currentTab}</strong></p>
            <div className="url-display">{location.pathname}{location.search}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Breadcrumb Navigation</div>
        <div className="card">
          <div className="card-body">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="breadcrumb-sep">/</span>
              <Link to="/navigation">Navigation Lab</Link>
              <span className="breadcrumb-sep">/</span>
              <span className="breadcrumb-current">Current Page</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">Anchor Navigation</div>
        <div className="card">
          <div className="card-body">
            <nav style={{ display: 'flex', gap: 16 }}>
              <a href="#section1" data-testid="anchor-section1">Section 1</a>
              <a href="#section2" data-testid="anchor-section2">Section 2</a>
              <a href="#section3" data-testid="anchor-section3">Section 3</a>
            </nav>
            <div className="divider" />
            {[1, 2, 3].map(n => (
              <div key={n} id={`section${n}`} style={{ padding: '24px 0', borderBottom: '1px solid var(--border)' }}>
                <h3>Section {n}</h3>
                <p className="text-sm text-muted mt-4">Content for section {n}. Clicking the anchor above scrolls here.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">External Link</div>
        <div className="card">
          <div className="card-body">
            <a href="https://example.com" target="_blank" rel="noopener noreferrer" data-testid="external-link">
              example.com (opens in new tab)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
