import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  IconGrid, IconForm, IconSliders, IconCompass, IconTable,
  IconLayers, IconMove, IconUpload, IconShield, IconAccessibility,
  IconZap, IconTarget, IconBarChart, IconInfo,
} from './icons';

const NAV = [
  { path: '/dashboard',     label: 'Dashboard',           Icon: IconGrid },
  { path: '/forms',         label: 'Form Playground',     Icon: IconForm },
  { path: '/controls',      label: 'Controls Lab',        Icon: IconSliders },
  { path: '/navigation',    label: 'Navigation Lab',      Icon: IconCompass },
  { path: '/table',         label: 'Data Table',          Icon: IconTable },
  { path: '/overlays',      label: 'Modal & Overlay',     Icon: IconLayers },
  { path: '/drag-drop',     label: 'Drag & Drop',         Icon: IconMove },
  { path: '/files',         label: 'File & Media',        Icon: IconUpload },
  { path: '/validation',    label: 'Validation Lab',      Icon: IconShield },
  { path: '/accessibility', label: 'Accessibility',       Icon: IconAccessibility },
  { path: '/state',         label: 'State Playground',    Icon: IconZap },
  { path: '/scenarios',     label: 'Test Scenarios',      Icon: IconTarget },
  { path: '/coverage',      label: 'Coverage',            Icon: IconBarChart },
  { path: '/about',         label: 'About',               Icon: IconInfo },
];

export function Sidebar() {
  const { sidebarCollapsed } = useApp();
  const { pathname } = useLocation();

  return (
    <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`} data-testid="sidebar">
      {!sidebarCollapsed && (
        <div className="sidebar-section-label">Navigation</div>
      )}
      <nav aria-label="Main navigation">
        <ul className="sidebar-nav">
          {NAV.map(({ path, label, Icon }) => {
            const active = pathname === path || (path === '/dashboard' && pathname === '/');
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link${active ? ' active' : ''}`}
                  data-testid={`nav-${path.slice(1) || 'dashboard'}`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <span className="nav-icon"><Icon /></span>
                  <span className="nav-label">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
