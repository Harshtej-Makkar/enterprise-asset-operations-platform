import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { NAV_ITEMS } from '@/constants/nav';

interface TopBarProps {
  onOpenMobileNav?: () => void;
}

/**
 * Top bar (64px per doc 13 §9). Contains:
 *   - mobile menu trigger
 *   - page title (derived from current route)
 *   - global search placeholder
 *   - notifications bell with unread count
 *   - user avatar + dropdown
 */
export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const currentNav = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = currentNav?.label ?? 'EAOP';

  const initials = user
    ? user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border-default bg-bg-primary px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-mono text-caption uppercase tracking-wider text-text-secondary md:text-body">
          {pageTitle}
        </h1>
      </div>

      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input className="pl-9" placeholder="Search assets, inspections, work orders…" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
          asChild
        >
          <a href="/notifications">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge
                variant="signal"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="User menu">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-body font-semibold text-text-primary">
                      {user.fullName}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <a href="/settings">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={logout} className="text-status-critical">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
