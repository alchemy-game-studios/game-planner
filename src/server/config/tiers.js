// Subscription tier definitions and limits

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    limits: {
      maxEntities: 50,
      maxUniverses: 1,
      maxProducts: 0,
      monthlyCredits: 100,
    }
  },
  creative: {
    name: 'Creative',
    price: 499, // $4.99 in cents
    stripePriceId: process.env.STRIPE_PRICE_CREATIVE,
    limits: {
      maxEntities: 500,
      maxUniverses: 5,
      maxProducts: 3,
      monthlyCredits: 1000,
    }
  },
  studio: {
    name: 'Studio',
    price: 2999, // $29.99 in cents
    stripePriceId: process.env.STRIPE_PRICE_STUDIO,
    limits: {
      maxEntities: Infinity,
      maxUniverses: Infinity,
      maxProducts: Infinity,
      monthlyCredits: 5000,
    }
  }
};

export const CREDIT_PACKAGES = [
  {
    id: 'credits_100',
    amount: 100,
    price: 1000, // $10.00
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_100
  },
  {
    id: 'credits_500',
    amount: 500,
    price: 1999, // $19.99
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_500
  },
  {
    id: 'credits_1000',
    amount: 1000,
    price: 3499, // $34.99
    stripePriceId: process.env.STRIPE_PRICE_CREDITS_1000
  }
];

// Helper to get tier limits
export function getTierLimits(tier) {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  if (!tierConfig) {
    return SUBSCRIPTION_TIERS.free.limits;
  }
  return tierConfig.limits;
}

// Helper to format price for display
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper to get credit package by ID
export function getCreditPackage(packageId) {
  return CREDIT_PACKAGES.find(p => p.id === packageId);
}
