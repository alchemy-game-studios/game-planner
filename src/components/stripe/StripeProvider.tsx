import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import type { StripeElementsOptions } from '@stripe/stripe-js';

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#F28C28', // ck-ember
        colorBackground: '#1B1F2A', // ck-indigo
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        borderRadius: '6px',
      },
      rules: {
        '.Input': {
          backgroundColor: '#0f1117',
          border: '1px solid #374151',
        },
        '.Input:focus': {
          borderColor: '#F28C28',
          boxShadow: '0 0 0 1px #F28C28',
        },
        '.Label': {
          color: '#9ca3af',
        },
      },
    },
  };

  if (!stripePromise) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Stripe is not configured. Please add VITE_STRIPE_PUBLIC_KEY to your environment.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
