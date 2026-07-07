import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@/validation/login.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AxiosError } from 'axios';

/**
 * Login page — fully functional against the mock backend (Week 1 deliverable).
 * Email + password form, Zod validation, loading + error states, no blank screens.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from =
    (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        setServerError(
          err.response?.data?.message ??
            'Invalid credentials. Please check your email and password.',
        );
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h3 font-bold text-text-primary">Sign in</h1>
        <p className="mt-1 text-caption text-text-secondary">
          Use your EAOP credentials to access the platform.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="inspector@eaop.local"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-caption text-status-critical">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-caption text-status-critical">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-sm border border-[rgba(229,72,77,0.4)] bg-[rgba(229,72,77,0.1)] px-3 py-2 text-caption text-status-critical"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="rounded-sm border border-border-default bg-bg-surface-raised p-3 text-caption text-text-secondary">
        <p className="mb-1 font-semibold text-text-primary">Demo accounts (seed)</p>
        <ul className="space-y-0.5 font-mono text-[11px]">
          <li>admin@eaop.local / password123</li>
          <li>plant.manager@eaop.local / password123</li>
          <li>supervisor@eaop.local / password123</li>
          <li>inspector@eaop.local / password123</li>
          <li>technician@eaop.local / password123</li>
        </ul>
      </div>

      <p className="text-center text-caption text-text-muted">
        <Link to="/dashboard" className="text-status-info hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  );
}
