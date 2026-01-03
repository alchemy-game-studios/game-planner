import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface MentionToastData {
  id: string;
  entityName: string;
  relationDescription: string;
  onUndo: () => void;
}

interface MentionToastProps {
  toast: MentionToastData;
  onDismiss: (id: string) => void;
}

function MentionToast({ toast, onDismiss }: MentionToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="flex items-center gap-2 bg-ck-charcoal border border-ck-indigo rounded-lg px-3 py-2 shadow-lg animate-in slide-in-from-bottom-2">
      <span className="text-sm text-foreground">
        <span className="font-medium text-secondary">{toast.entityName}</span>
        {' '}added to {toast.relationDescription}
      </span>
      <button
        onClick={() => {
          toast.onUndo();
          onDismiss(toast.id);
        }}
        className="text-xs text-muted-foreground hover:text-foreground underline"
      >
        Undo
      </button>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-0.5 hover:bg-ck-indigo rounded"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

interface MentionToastContainerProps {
  toasts: MentionToastData[];
  onDismiss: (id: string) => void;
}

export function MentionToastContainer({ toasts, onDismiss }: MentionToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <MentionToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
