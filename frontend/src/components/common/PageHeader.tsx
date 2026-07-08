import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Optional right-aligned action area (buttons, filters, etc.) */
  actions?: ReactNode;
  /** Optional eyebrow text above the title (e.g. breadcrumb module) */
  eyebrow?: ReactNode;
}

/**
 * Standard page header: title + description + optional action slot.
 * Used at the top of every feature page in EAOP.
 */
export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border-default pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="mb-1 font-mono text-caption uppercase tracking-wider text-text-secondary">
            {eyebrow}
          </div>
        )}
        <h1 className="text-h1 font-bold text-text-primary">{title}</h1>
        {description && <p className="mt-2 text-body text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
