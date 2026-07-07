import { Construction } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';

interface PagePlaceholderProps {
  title: string;
  description: string;
  week: string;
  bullets?: string[];
  children?: ReactNode;
}

/**
 * Generic placeholder shell for routes that exist on Day 1 but whose
 * feature implementation lands in later weeks (per the Implementation Plan).
 */
export function PagePlaceholder({
  title,
  description,
  week,
  bullets = [],
  children,
}: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-h2 font-bold text-text-primary">{title}</h2>
          <p className="mt-1 text-body text-text-secondary">{description}</p>
        </div>
        <Badge variant="warning">
          <Construction className="h-3 w-3" /> Builds in {week}
        </Badge>
      </div>

      <div className="rounded-sm border border-border-default bg-bg-surface p-6">
        <h3 className="font-mono text-caption uppercase tracking-wider text-text-secondary">
          Planned scope
        </h3>
        <ul className="mt-3 space-y-1.5 text-body text-text-primary">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-sm bg-status-info" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {children}
    </div>
  );
}
