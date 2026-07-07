import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Profile, preferences, password. Admin surfaces (user management, checklist template editor) are minimal stubs per PRD §8."
      week="Stub"
      bullets={[
        'Profile (display name, email)',
        'Change password',
        'Admin user management — out of scope (low priority per PRD)',
        'Checklist template editor — out of scope (low priority per PRD)',
      ]}
    />
  );
}
