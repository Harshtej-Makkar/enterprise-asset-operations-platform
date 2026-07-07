import { NavLink } from 'react-router-dom';
import { Factory } from 'lucide-react';
import { NAV_ITEMS, SIDEBAR_FOOTER } from '@/constants/nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  /** When true, render as an icon-rail (used inside the mobile Sheet) */
  collapsed?: boolean;
  /** Callback fired when a nav item is clicked (used to close mobile drawer) */
  onNavigate?: () => void;
}

/**
 * Persistent sidebar (doc 13 §9: 280px expanded / 72px collapsed).
 * Lists all 9 modules from day one per FSMOD §5 / ImpPlan Week 1.
 */
export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border-default bg-bg-sidebar text-text-primary',
        collapsed ? 'w-[72px]' : 'w-[280px]',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-16 items-center gap-2 border-b border-border-default px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-signal text-text-inverse">
          <Factory className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-caption uppercase tracking-wider text-text-secondary">
              EAOP
            </span>
            <span className="text-caption font-semibold text-text-primary">
              Asset Operations
            </span>
          </div>
        )}
      </div>

      {/* Module links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 eaop-scroll">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2 text-body font-medium transition-colors',
                  'hover:bg-bg-surface hover:text-text-primary',
                  isActive
                    ? 'bg-bg-surface text-text-primary border-l-2 border-status-info'
                    : 'text-text-secondary',
                  collapsed && 'justify-center px-0',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User summary + logout */}
      <div
        className={cn(
          'border-t border-border-default p-3',
          collapsed && 'flex flex-col items-center gap-2',
        )}
      >
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="truncate text-caption font-semibold text-text-primary">
              {user.fullName}
            </p>
            <p className="truncate font-mono text-[11px] uppercase tracking-wider text-text-muted">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-body font-medium text-text-secondary transition-colors',
            'hover:bg-bg-surface hover:text-status-critical',
            collapsed && 'justify-center px-0',
          )}
        >
          <SIDEBAR_FOOTER.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{SIDEBAR_FOOTER.label}</span>}
        </button>
      </div>
    </aside>
  );
}
