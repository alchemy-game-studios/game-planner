import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StripeProvider } from './StripeProvider';
import { PaymentForm } from './PaymentForm';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientSecret: string | null;
  title: string;
  description: string;
  submitLabel: string;
  returnTab: 'credits' | 'subscription';
  showSuccess: boolean;
  onSuccess: (returnTab: 'credits' | 'subscription', paymentIntentId: string) => Promise<void>;
}

export function PaymentModal({
  open,
  onOpenChange,
  clientSecret,
  title,
  description,
  submitLabel,
  returnTab,
  showSuccess,
  onSuccess,
}: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (paymentIntentId: string) => {
    // Fire and forget - parent handles success state and closing
    onSuccess(returnTab, paymentIntentId);
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing while showing success message
    if (!newOpen && showSuccess) {
      return;
    }
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border border-zinc-700 max-h-[90vh] overflow-y-auto shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-foreground font-medium">
              {returnTab === 'subscription' ? 'Upgrade successful!' : 'Purchase successful!'}
            </p>
          </div>
        ) : clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            <PaymentForm
              onSuccess={handleSuccess}
              onError={setError}
              submitLabel={submitLabel}
              returnTab={returnTab}
            />
          </StripeProvider>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Loading payment form...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
