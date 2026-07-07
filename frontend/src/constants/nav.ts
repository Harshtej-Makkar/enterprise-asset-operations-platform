import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  AlertTriangle,
  KanbanSquare,
  FileText,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

/**
 * Sidebar navigation entries — order per doc 07 §17.
 * All 9 items present from day one, per FSMOD §5 + ImpPlan Week 1.
 */
export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Roles allowed to see this entry. Empty = visible to all authenticated users. */
  roles?: ReadonlyArray<string>;
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Assets', to: '/assets', icon: Boxes },
  { label: 'Inspections', to: '/inspections', icon: ClipboardCheck },
  { label: 'Defects', to: '/defects', icon: AlertTriangle },
  { label: 'Work Orders', to: '/work-orders', icon: KanbanSquare },
  { label: 'Reports', to: '/reports', icon: FileText },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Audit Log', to: '/audit-log', icon: ScrollText },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export const SIDEBAR_FOOTER: NavItem = {
  label: 'Logout',
  to: '/login',
  icon: LogOut,
};
