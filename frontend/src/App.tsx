import { AppRouter } from './routes/AppRouter';

/**
 * EAOP App root.
 *
 * The router owns all route definitions and the layout selection
 * (AuthLayout for /login, AppShell for everything else).
 */
export default function App() {
  return <AppRouter />;
}
