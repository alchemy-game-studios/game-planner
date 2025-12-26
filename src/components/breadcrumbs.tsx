import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const { breadcrumbs, navigateTo, canGoBack } = useBreadcrumbs();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

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
    <div className="fixed top-0 left-0 right-0 z-[60] flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        disabled={isHome && !canGoBack}
        className="text-gray-400 hover:text-white disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="h-4 w-px bg-gray-600" />

      <button
        onClick={handleHome}
        className={`transition-colors ${isHome ? 'text-white' : 'text-gray-400 hover:text-white'}`}
      >
        <Home className="h-4 w-4" />
      </button>

      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className={`text-sm transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-white font-medium cursor-default'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-gray-500 capitalize">{item.type}:</span>{' '}
            {item.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
