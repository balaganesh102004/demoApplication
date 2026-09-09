import { createContext, useContext, useState, type ReactNode, useCallback, useEffect } from 'react';
import type { Theme, Toast, ToastType, User } from '../types';
import { api } from '../api';

interface AppCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  user: User;
  toasts: Toast[];
  addToast: (type: ToastType, message: string, persistent?: boolean) => void;
  removeToast: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  resetApp: () => Promise<void>;
}

const Ctx = createContext<AppCtx | undefined>(undefined);

const DEFAULT_USER: User = { name: 'Test User', email: 'testuser@example.com', role: 'Administrator' };

function applyTheme(theme: Theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, _setTheme] = useState<Theme>('system');
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    api.get<{ theme: Theme; user: User }>('/api/settings').then(data => {
      _setTheme(data.theme ?? 'system');
      applyTheme(data.theme ?? 'system');
      setUser(data.user ?? DEFAULT_USER);
    }).catch(() => { /* server not ready yet */ });
  }, []);

  const setTheme = useCallback((t: Theme) => {
    _setTheme(t);
    applyTheme(t);
  }, []);

  // re-apply on system pref change
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const addToast = useCallback((type: ToastType, message: string, persistent = false) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message, persistent }]);
    if (!persistent) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const resetApp = useCallback(async () => {
    await api.post('/api/settings/reset', {});
    setToasts([]);
  }, []);

  return (
    <Ctx.Provider value={{ theme, setTheme, user, toasts, addToast, removeToast, sidebarCollapsed, setSidebarCollapsed, resetApp }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
