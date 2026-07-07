import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <span className="font-mono text-caption uppercase tracking-widest text-text-muted">
        Error 404
      </span>
      <h2 className="text-h2 font-bold text-text-primary">Page not found</h2>
      <p className="max-w-md text-body text-text-secondary">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-2">
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
