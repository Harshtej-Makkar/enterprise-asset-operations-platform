import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';

import LoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFoundPage';

import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import AssetListPage from '@/features/assets/pages/AssetListPage';
import AssetDetailPage from '@/features/assets/pages/AssetDetailPage';
import InspectionListPage from '@/features/inspections/pages/InspectionListPage';
import NewInspectionPage from '@/features/inspections/pages/NewInspectionPage';
import InspectionDetailPage from '@/features/inspections/pages/InspectionDetailPage';
import DefectListPage from '@/features/defects/pages/DefectListPage';
import DefectDetailPage from '@/features/defects/pages/DefectDetailPage';
import WorkOrderBoardPage from '@/features/work-orders/pages/WorkOrderBoardPage';
import WorkOrderDetailPage from '@/features/work-orders/pages/WorkOrderDetailPage';
import ReportsPage from '@/features/reports/pages/ReportsPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import AuditLogPage from '@/features/audit/pages/AuditLogPage';
import SettingsPage from '@/features/settings/pages/SettingsPage';

/**
 * EAOP route map — mirrors doc 07 §4 verbatim.
 * 16 routes total; all module links exist on Day 1 even if their feature
 * implementation lands in later weeks (Implementation Plan §4).
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public auth layout */}
      <Route
        element={
          <PublicOnlyRoute>
            <AuthLayout />
          </PublicOnlyRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Authenticated app shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/assets" element={<AssetListPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />

        <Route path="/inspections" element={<InspectionListPage />} />
        <Route path="/inspections/new" element={<NewInspectionPage />} />
        <Route path="/inspections/:id" element={<InspectionDetailPage />} />

        <Route path="/defects" element={<DefectListPage />} />
        <Route path="/defects/:id" element={<DefectDetailPage />} />

        <Route path="/work-orders" element={<WorkOrderBoardPage />} />
        <Route path="/work-orders/:id" element={<WorkOrderDetailPage />} />

        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit-log" element={<AuditLogPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
