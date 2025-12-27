import React, { createContext, useContext, useState, useCallback } from 'react';

interface BreadcrumbItem {
  id: string;
  name: string;
  type: string;
  path: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  push: (item: BreadcrumbItem) => void;
  pop: () => BreadcrumbItem | undefined;
  navigateTo: (index: number) => BreadcrumbItem[];
  clear: () => void;
  canGoBack: boolean;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  const push = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs(prev => {
      // Check if we're navigating to an item already in the breadcrumb trail
      const existingIndex = prev.findIndex(b => b.id === item.id);
      if (existingIndex !== -1) {
        // Trim to that point instead of adding duplicate
        return prev.slice(0, existingIndex + 1);
      }
      return [...prev, item];
    });
  }, []);

  const pop = useCallback(() => {
    let popped: BreadcrumbItem | undefined;
    setBreadcrumbs(prev => {
      if (prev.length === 0) return prev;
      popped = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return popped;
  }, []);

  const navigateTo = useCallback((index: number) => {
    let removed: BreadcrumbItem[] = [];
    setBreadcrumbs(prev => {
      if (index < 0 || index >= prev.length) return prev;
      removed = prev.slice(index + 1);
      return prev.slice(0, index + 1);
    });
    return removed;
  }, []);

  const clear = useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  const canGoBack = breadcrumbs.length > 0;

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, push, pop, navigateTo, clear, canGoBack }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}
