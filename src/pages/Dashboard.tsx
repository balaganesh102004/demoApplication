import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';

type DashState = 'loading' | 'success' | 'error' | 'empty';

interface Activity { id: number; action: string; status: string; createdAt: string; }
interface UserRow   { id: number; name: string; status: string; }

export function Dashboard() {
  const { addToast } = useApp();
  const [activities, setActivities]   = useState<Activity[]>([]);
  const [userCount,  setUserCount]    = useState(0);
  const [demoState,  setDemoState]    = useState<DashState>('success');
  const [alertVisible, setAlertVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [acts, users] = await Promise.all([
        api.get<Activity[]>('/api/activities'),
        api.get<UserRow[]>('/api/users'),
      ]);
      setActivities(acts);
      setUserCount(users.length);
    } catch {
      addToast('error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const logActivity = async (action: string, status = 'info') => {
    await api.post('/api/activities', { action, status });
    load();
  };

  return (
    <div data-testid="page-dashboard">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of the testing environment</p>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { load(); addToast('info', 'Dashboard refreshed'); }}
            data-testid="refresh-dashboard"
          >
            Refresh
          </button>
        </div>
      </div>

      {alertVisible && (
        <div className="alert alert-info" role="alert" data-testid="dashboard-alert">
          <span className="alert-msg">Welcome to the UI Testing Playground — a deterministic environment for AI browser-testing agents.</span>
          <button className="alert-close" onClick={() => setAlertVisible(false)} aria-label="Dismiss alert" data-testid="alert-close">×</button>
        </div>
      )}

      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" data-testid="stat-users">{loading ? '—' : userCount}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Activities Logged</div>
          <div className="stat-value" data-testid="stat-activities">{loading ? '—' : activities.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Test Scenarios</div>
          <div className="stat-value">24</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Components Covered</div>
          <div className="stat-value">15</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* State control demo */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">UI State Demo</span>
          </div>
          <div className="card-body">
            <p className="text-muted text-sm mb-12">Trigger different UI states to test agent behaviour.</p>
            <div className="state-demo-controls">
              {(['loading', 'success', 'error', 'empty'] as DashState[]).map(s => (
                <button
                  key={s}
                  className={`btn btn-sm${demoState === s ? ' btn-primary' : ' btn-secondary'}`}
                  onClick={() => setDemoState(s)}
                  data-testid={`state-${s}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="state-display-area" data-testid="state-display">
              {demoState === 'loading' && <span>Loading…</span>}
              {demoState === 'success' && <span className="state-success">Data loaded successfully</span>}
              {demoState === 'error'   && <span className="state-error">Failed to load data</span>}
              {demoState === 'empty'   && <span>No data available</span>}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => logActivity('Dashboard viewed', 'info')}
              data-testid="log-activity"
            >
              Log entry
            </button>
          </div>
          <div className="card-body">
            {activities.length === 0 ? (
              <p className="text-muted text-sm">No activity yet. Interact with the app to generate entries.</p>
            ) : (
              <div className="activity-list" data-testid="activity-list">
                {activities.slice(0, 8).map(a => (
                  <div key={a.id} className="activity-item" data-testid={`activity-${a.id}`}>
                    <span className={`activity-dot dot-${a.status === 'success' ? 'success' : a.status === 'error' ? 'error' : 'info'}`} />
                    <span className="activity-text">{a.action}</span>
                    <span className="activity-time">{new Date(a.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress overview */}
        <div className="card">
          <div className="card-header"><span className="card-title">Coverage Overview</span></div>
          <div className="card-body">
            <div className="progress-list">
              {[
                { label: 'Form Interactions', pct: 85 },
                { label: 'Navigation Paths', pct: 92 },
                { label: 'Data Operations',  pct: 78 },
                { label: 'Accessibility',    pct: 70 },
              ].map(item => (
                <div className="progress-row" key={item.label}>
                  <div className="progress-row-header">
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{item.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-btn" onClick={() => logActivity('Test suite started', 'info')} data-testid="quick-run">Run Test Suite</button>
              <button className="quick-action-btn" onClick={() => logActivity('Data exported', 'success')} data-testid="quick-export">Export Data</button>
              <button className="quick-action-btn" onClick={() => addToast('info', 'Opening reports…')} data-testid="quick-reports">View Reports</button>
              <button className="quick-action-btn" onClick={() => addToast('warning', 'Scheduled for midnight')} data-testid="quick-schedule">Schedule Run</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
