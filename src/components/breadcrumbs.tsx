import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';

export function Breadcrumbs() {
  const { breadcrumbs, navigateTo, canGoBack } = useBreadcrumbs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Hide breadcrumbs on home page (both landing and dashboard)
  if (isHome) {
    return null;
  }

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      // Navigate to previous item
      const prevItem = breadcrumbs[breadcrumbs.length - 2];
      navigateTo(breadcrumbs.length - 2);
      navigate(prevItem.path);
    } else if (breadcrumbs.length === 1) {
      // Go home
      navigateTo(-1);
      navigate('/');
    } else {
      // Use browser history
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigateTo(-1);
    navigate('/');
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === breadcrumbs.length - 1) return; // Don't navigate to current
    const item = breadcrumbs[index];
    navigateTo(index);
    navigate(item.path);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-black">
      <div className="flex items-center gap-2">
        {/* Logo */}
        <button
          onClick={handleHome}
          className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/images/logo.png"
            alt="CanonKiln"
            className="h-8 w-auto"
          />
        </button>

        <div className="h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={isHome && !canGoBack}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.id}>
            <ChevronRight className="h-4 w-4 text-border" />
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`text-sm transition-colors ${
                index === breadcrumbs.length - 1
                  ? 'text-foreground font-medium cursor-default'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-muted-foreground capitalize">{item.type}:</span>{' '}
              {item.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      <UserMenu />
      </div>
      {/* Gradient underline */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
    </div>
  );
}
