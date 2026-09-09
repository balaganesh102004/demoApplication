import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'default' | 'sm' | 'xs';
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size, loading, icon, children, disabled, className = '', ...rest }: Props) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span className="nav-icon" style={{ width: 15, height: 15 }}>{icon}</span>}
      {children}
    </button>
  );
}
