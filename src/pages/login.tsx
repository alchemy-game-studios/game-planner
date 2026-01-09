import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBreadcrumbs } from '@/context/breadcrumb-context';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clear } = useBreadcrumbs();

  const error = searchParams.get('error');

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    // Redirect to home if already logged in
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Sign in to Game Planner</CardTitle>
          <CardDescription className="text-gray-400">
            Connect your account to start building worlds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error === 'auth_failed' ? 'Authentication failed. Please try again.' : error}
            </div>
          )}

          <Button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-100"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
