import { useAuth } from '@/context/auth-context';
import LandingPage from './landing';
import DashboardPage from './dashboard';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ck-charcoal">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <LandingPage />;
}
