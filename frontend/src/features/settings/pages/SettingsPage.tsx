import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Lock, Bell, ShieldAlert, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { userService } from '@/services/api';
import {
  profileSchema,
  passwordSchema,
  preferencesSchema,
  type ProfileFormValues,
  type PasswordFormValues,
  type PreferencesFormValues,
} from '@/validation';

export default function SettingsPage() {
  const { user, setUser } = useAuthContext();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { emailNotifications: true },
  });

  // Seed forms from current user on mount / user change
  useEffect(() => {
    if (user) {
      profileForm.reset({ fullName: user.fullName, email: user.email });
      preferencesForm.reset({
        emailNotifications: user.preferences?.emailNotifications ?? true,
      });
    }
  }, [user, profileForm, preferencesForm]);

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    const updated = await userService.updateProfile({ fullName: values.fullName });
    setUser({ ...user!, fullName: updated.fullName });
    alert('Profile updated.');
  });

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    await userService.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    passwordForm.reset();
    alert('Password changed.');
  });

  const onPreferencesSubmit = preferencesForm.handleSubmit(async (values) => {
    await userService.updatePreferences({ emailNotifications: values.emailNotifications });
    setUser({
      ...user!,
      preferences: { emailNotifications: values.emailNotifications },
    });
    alert('Preferences saved.');
  });

  if (!user) return null;

  const fieldError = (errors: Record<string, any>, key: string) =>
    errors[key]?.message as string | undefined;

  const fieldClass =
    'h-10 w-full rounded-sm border border-border-default bg-bg-surface-raised px-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-border-focus disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Settings</h2>
        <p className="mt-1 text-body text-text-secondary">Profile, password, preferences.</p>
      </div>

      {/* ── Profile ─────────────────────────────────── */}
      <Card title="Profile" icon={<Save className="h-5 w-5" />}>
        <form onSubmit={onProfileSubmit} className="space-y-4">
          <Field label="Display name" error={fieldError(profileForm.formState.errors, 'fullName')}>
            <input
              className={fieldClass}
              {...profileForm.register('fullName')}
              placeholder="Enter your full name"
            />
          </Field>
          <Field label="Email" error={fieldError(profileForm.formState.errors, 'email')}>
            <input
              className={fieldClass}
              {...profileForm.register('email')}
              disabled
            />
            <p className="mt-1 text-caption text-text-muted">Email cannot be changed. Contact an admin if needed.</p>
          </Field>
          <Button type="submit" size="sm" disabled={profileForm.formState.isSubmitting}>
            Save profile
          </Button>
        </form>
      </Card>

      {/* ── Password ────────────────────────────────── */}
      <Card title="Change password" icon={<Lock className="h-5 w-5" />}>
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <Field label="Current password" error={fieldError(passwordForm.formState.errors, 'currentPassword')}>
            <input
              type="password"
              className={fieldClass}
              {...passwordForm.register('currentPassword')}
              placeholder="Enter current password"
            />
          </Field>
          <Field label="New password" error={fieldError(passwordForm.formState.errors, 'newPassword')}>
            <input
              type="password"
              className={fieldClass}
              {...passwordForm.register('newPassword')}
              placeholder="At least 6 characters"
            />
          </Field>
          <Field label="Confirm new password" error={fieldError(passwordForm.formState.errors, 'confirmPassword')}>
            <input
              type="password"
              className={fieldClass}
              {...passwordForm.register('confirmPassword')}
              placeholder="Re-enter new password"
            />
          </Field>
          <Button type="submit" size="sm" disabled={passwordForm.formState.isSubmitting}>
            Update password
          </Button>
        </form>
      </Card>

      {/* ── Preferences ─────────────────────────────── */}
      <Card title="Notification preferences" icon={<Bell className="h-5 w-5" />}>
        <form onSubmit={onPreferencesSubmit} className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-5 w-5 rounded-sm border-border-default text-status-info focus:ring-border-focus"
              {...preferencesForm.register('emailNotifications')}
            />
            <span className="text-body text-text-primary">Email notifications</span>
          </label>
          <p className="text-caption text-text-muted">
            Receive email notifications when defects are created/approved, work orders are assigned, or inspections are due.
          </p>
          <Button type="submit" size="sm" disabled={preferencesForm.formState.isSubmitting}>
            Save preferences
          </Button>
        </form>
      </Card>

      {/* ── Disabled stubs ──────────────────────────── */}
      <Card title="Admin: user management" icon={<ShieldAlert className="h-5 w-5" />}>
        <p className="text-body text-text-muted">
          User management is out of scope per PRD §8 (low priority). Will be added in a future release.
        </p>
      </Card>

      <Card title="Admin: checklist template editor" icon={<Cog className="h-5 w-5" />}>
        <p className="text-body text-text-muted">
          Checklist template editor is out of scope per PRD §8 (low priority). Will be added in a future release.
        </p>
      </Card>
    </div>
  );
}

/* ── Internal helpers ────────────────────────────────── */

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border-default bg-bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-text-secondary">{icon}</span>
        <h3 className="text-h3 font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-caption font-medium text-text-secondary mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-caption text-status-critical">{error}</p>}
    </div>
  );
}