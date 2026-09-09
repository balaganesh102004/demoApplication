import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconMenu, IconSearch, IconBell, IconHelp, IconChevronDown } from './icons';
import { api } from '../api';

const PAGES = [
  { path: '/dashboard',    label: 'Dashboard' },
  { path: '/forms',        label: 'Form Playground' },
  { path: '/controls',     label: 'Controls Lab' },
  { path: '/navigation',   label: 'Navigation Lab' },
  { path: '/table',        label: 'Data Table' },
  { path: '/overlays',     label: 'Modal & Overlay Lab' },
  { path: '/drag-drop',    label: 'Drag & Drop Lab' },
  { path: '/files',        label: 'File & Media Lab' },
  { path: '/accessibility', label: 'Accessibility Lab' },
  { path: '/state',        label: 'State Playground' },
  { path: '/scenarios',    label: 'Test Scenarios' },
  { path: '/coverage',     label: 'Interaction Coverage' },
  { path: '/about',        label: 'About' },
];

export function Header() {
  const { theme, setTheme, user, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const results = searchQuery.trim()
    ? PAGES.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleTheme = async (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    await api.patch('/api/settings', { theme: t });
  };

  return (
    <header className="header" data-testid="header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label="Toggle sidebar"
          data-testid="sidebar-toggle"
        >
          <span className="nav-icon"><IconMenu /></span>
        </button>
        <a href="/dashboard" className="header-logo" data-testid="app-logo">
          <span className="header-logo-mark">UI</span>
          <span>Testing Playground</span>
        </a>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="search-wrapper hdr-dropdown-wrap">
          <button
            className={`header-btn${searchOpen ? ' active' : ''}`}
            onClick={() => { setSearchOpen(v => !v); setNotifOpen(false); setUserMenuOpen(false); }}
            aria-label="Search"
            data-testid="search-toggle"
          >
            <span className="nav-icon" style={{ width: 16, height: 16 }}><IconSearch /></span>
            <span>Search</span>
          </button>
          {searchOpen && (
            <div className="search-box" data-testid="search-dropdown">
              <input
                type="search"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                data-testid="global-search"
                aria-label="Global search"
              />
              <div className="search-result-list">
                {searchQuery.trim() === '' && (
                  <div className="search-empty">Type to search pages...</div>
                )}
                {searchQuery.trim() !== '' && results.length === 0 && (
                  <div className="search-empty">No results for "{searchQuery}"</div>
                )}
                {results.map(r => (
                  <a
                    key={r.path}
                    href={r.path}
                    className="search-result-item"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  >
                    {r.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="theme-toggle-group" data-testid="theme-selector">
          <button className={`theme-toggle-btn${theme === 'light'  ? ' active' : ''}`} onClick={() => handleTheme('light')}  aria-label="Light theme"  data-testid="theme-light">Light</button>
          <button className={`theme-toggle-btn${theme === 'dark'   ? ' active' : ''}`} onClick={() => handleTheme('dark')}   aria-label="Dark theme"   data-testid="theme-dark">Dark</button>
          <button className={`theme-toggle-btn${theme === 'system' ? ' active' : ''}`} onClick={() => handleTheme('system')} aria-label="System theme" data-testid="theme-system">System</button>
        </div>

        {/* Notifications */}
        <div className="hdr-dropdown-wrap">
          <button
            className={`header-btn${notifOpen ? ' active' : ''}`}
            onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); setSearchOpen(false); }}
            aria-label="Notifications"
            data-testid="notifications-toggle"
          >
            <span className="nav-icon" style={{ width: 16, height: 16 }}><IconBell /></span>
          </button>
          {notifOpen && (
            <div className="hdr-dropdown" data-testid="notifications-dropdown">
              <div className="hdr-dropdown-header">Notifications</div>
              <div className="hdr-dropdown-item" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className="header-btn" aria-label="Help" data-testid="help-button">
          <span className="nav-icon" style={{ width: 16, height: 16 }}><IconHelp /></span>
        </button>

        {/* User */}
        <div className="hdr-dropdown-wrap">
          <button
            className={`header-btn${userMenuOpen ? ' active' : ''}`}
            onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); setSearchOpen(false); }}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            data-testid="user-menu"
          >
            <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{user.name.charAt(0)}</span>
            <span>{user.name}</span>
            <span className="nav-icon" style={{ width: 14, height: 14 }}><IconChevronDown /></span>
          </button>
          {userMenuOpen && (
            <div className="hdr-dropdown" data-testid="user-dropdown">
              <div className="hdr-dropdown-user">
                <div className="hdr-dropdown-user-name">{user.name}</div>
                <div className="hdr-dropdown-user-email">{user.email}</div>
                <span className="hdr-dropdown-user-role">{user.role}</span>
              </div>
              <a href="#profile"      className="hdr-dropdown-item">Profile</a>
              <a href="#settings"     className="hdr-dropdown-item">Settings</a>
              <a href="#preferences"  className="hdr-dropdown-item">Preferences</a>
              <div className="hdr-dropdown-divider" />
              <button className="hdr-dropdown-item" data-testid="sign-out">Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
