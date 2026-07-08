import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/api';

/** Query key root — invalidate after any mutation. */
export const NOTIFICATIONS_KEY = ['notifications'] as const;

/**
 * Hook: list the current user's notifications.
 * Polls every 60s per PRD §6 (no websockets in the demo).
 */
export function useNotifications(params?: { read?: 'true' | 'false'; limit?: number }) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list', params ?? {}],
    queryFn: () => notificationService.list(params),
    refetchInterval: 60_000,
  });
}

/**
 * Hook: bell-badge unread count only. Cheaper than fetching the full
 * list and counting client-side. Polled on the same 60s cadence.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 60_000,
  });
}

/** Hook: mark a single notification as read. Invalidates both the list and the badge count. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

/** Hook: mark every notification as read in one call. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
