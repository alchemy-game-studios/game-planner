import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useAuth, User } from '@/context/auth-context';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, CreditCard, Coins, Check, Loader2, History, ExternalLink } from 'lucide-react';
import { PaymentModal } from '@/components/stripe/PaymentModal';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($displayName: String!) {
    updateProfile(displayName: $displayName) {
      id
      displayName
    }
  }
`;

// Stripe Elements mutations (embedded checkout)
const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription($tier: String!) {
    createSubscription(tier: $tier) {
      clientSecret
      subscriptionId
      status
    }
  }
`;

const CREATE_CREDIT_PAYMENT_INTENT = gql`
  mutation CreateCreditPaymentIntent($packageId: String!) {
    createCreditPaymentIntent(packageId: $packageId) {
      clientSecret
      paymentIntentId
    }
  }
`;

const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      subscriptionStatus
    }
  }
`;

const CONFIRM_SUBSCRIPTION = gql`
  mutation ConfirmSubscription($paymentIntentId: String!, $tier: String!) {
    confirmSubscription(paymentIntentId: $paymentIntentId, tier: $tier) {
      id
      subscriptionTier
      subscriptionStatus
    }
  }
`;

const GET_BILLING_HISTORY = gql`
  query GetBillingHistory($limit: Int, $cursor: String) {
    billingHistory(limit: $limit, cursor: $cursor) {
      items {
        id
        date
        description
        amount
        status
        invoiceUrl
      }
      hasMore
      nextCursor
    }
  }
`;

// Tier configurations (matching backend)
const TIERS = {
  free: { name: 'Free', price: '$0', entities: 50, credits: 100, color: 'bg-gray-600' },
  creative: { name: 'Creative', price: '$4.99/mo', entities: 500, credits: 1000, color: 'bg-blue-600' },
  studio: { name: 'Studio', price: '$29.99/mo', entities: 'Unlimited', credits: 5000, color: 'bg-purple-600' }
};

const CREDIT_PACKAGES = [
  { id: 'credits_100', amount: 100, price: '$10.00' },
  { id: 'credits_500', amount: 500, price: '$19.99' },
  { id: 'credits_1000', amount: 1000, price: '$34.99' }
];

export default function AccountPage() {
  const { user, loading, refetch } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clear, push } = useBreadcrumbs();

  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [createSubscription] = useMutation(CREATE_SUBSCRIPTION);
  const [createCreditPaymentIntent] = useMutation(CREATE_CREDIT_PAYMENT_INTENT);
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);
  const [confirmSubscription] = useMutation(CONFIRM_SUBSCRIPTION);

  // Billing history query - only load when History tab is active
  const { data: billingData, loading: billingLoading, fetchMore: fetchMoreBilling, refetch: refetchBilling } = useQuery(GET_BILLING_HISTORY, {
    variables: { limit: 10 },
    skip: !user || activeTab !== 'history',
    fetchPolicy: 'network-only',
  });
  const [loadingMore, setLoadingMore] = useState(false);

  // Animation state for success feedback
  const [justUpdated, setJustUpdated] = useState<'credits' | 'subscription' | null>(null);

  // Track pending subscription tier for confirmation after payment
  const [pendingTier, setPendingTier] = useState<string | null>(null);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    clientSecret: string | null;
    title: string;
    description: string;
    submitLabel: string;
    paymentType: 'credits' | 'subscription';
    showSuccess: boolean;
  }>({
    open: false,
    clientSecret: null,
    title: '',
    description: '',
    submitLabel: 'Pay',
    paymentType: 'credits',
    showSuccess: false,
  });

  const canceled = searchParams.get('canceled');

  useEffect(() => {
    clear();
    push({ id: 'account', name: 'Account', type: 'account', path: '/account' });
  }, [clear, push]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  
  // Only show loading on initial load, not during refetch
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ variables: { displayName } });
      await refetch();
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (tier: string) => {
    const tierInfo = TIERS[tier as keyof typeof TIERS];
    setUpgrading(true);
    try {
      const { data } = await createSubscription({ variables: { tier } });
      const clientSecret = data?.createSubscription?.clientSecret;

      if (clientSecret) {
        setPendingTier(tier);
        setUpgrading(false);
        setPaymentModal({
          open: true,
          clientSecret: clientSecret,
          title: `Subscribe to ${tierInfo.name}`,
          description: `${tierInfo.price} - ${tierInfo.entities} entities, ${tierInfo.credits} monthly credits`,
          submitLabel: 'Subscribe',
          paymentType: 'subscription',
        });
      } else {
        setUpgrading(false);
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      setUpgrading(false);
    }
  };

  const handlePurchaseCredits = async (packageId: string) => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    try {
      const { data } = await createCreditPaymentIntent({ variables: { packageId } });
      if (data?.createCreditPaymentIntent?.clientSecret) {
        setPaymentModal({
          open: true,
          clientSecret: data.createCreditPaymentIntent.clientSecret,
          title: `Purchase ${pkg?.amount} Credits`,
          description: `One-time payment of ${pkg?.price}`,
          submitLabel: 'Purchase',
          paymentType: 'credits',
        });
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
    }
  };

  const handlePaymentSuccess = async (returnTab: 'credits' | 'subscription', paymentIntentId: string) => {
    if (returnTab === 'subscription' && pendingTier) {
      // Confirm subscription synchronously - creates the subscription and updates user
      await confirmSubscription({ variables: { paymentIntentId, tier: pendingTier } });
      setPendingTier(null);
    }

    // Show success message in modal
    setPaymentModal((prev) => ({ ...prev, showSuccess: true }));

    // Auto-close modal after 2 seconds, then refresh data
    setTimeout(async () => {
      setPaymentModal((prev) => ({ ...prev, open: false, showSuccess: false }));
      // Refetch AFTER modal closes
      await refetch();
      setJustUpdated(returnTab);
      setTimeout(() => setJustUpdated(null), 2000);
    }, 2000);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.')) {
      return;
    }
    try {
      await cancelSubscription();
      await refetch();
    } catch (err) {
      console.error('Error canceling subscription:', err);
    }
  };

  const handleLoadMoreBilling = async () => {
    if (!billingData?.billingHistory?.nextCursor) return;
    setLoadingMore(true);
    try {
      await fetchMoreBilling({
        variables: {
          cursor: billingData.billingHistory.nextCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            billingHistory: {
              ...fetchMoreResult.billingHistory,
              items: [...prev.billingHistory.items, ...fetchMoreResult.billingHistory.items],
            },
          };
        },
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const currentTier = TIERS[user.subscriptionTier as keyof typeof TIERS] || TIERS.free;
  const rawMaxEntities = user.limits?.maxEntities;
  const maxEntities = typeof rawMaxEntities === 'object' ? (rawMaxEntities as any).low : rawMaxEntities;
  const entityLimit = maxEntities === -1 ? 'Unlimited' : (maxEntities ?? currentTier.entities);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

      {canceled && (
        <div className="mb-6 p-4 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
          Payment was canceled. No changes were made.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="credits" className="gap-2">
            <Coins className="w-4 h-4" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Profile</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl text-white">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{user.displayName}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={displayName === user.displayName}
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm text-gray-400">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Current Plan
                <Badge className={`${currentTier.color} transition-all duration-700 ${justUpdated === 'subscription' ? 'ring-2 ring-ck-ember scale-110' : ''}`}>
                  {currentTier.name}
                </Badge>
                {user.subscriptionStatus === 'canceled' && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    Canceling
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {entityLimit} entities, {currentTier.credits} monthly credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center p-4 bg-zinc-800 rounded">
                  <p className="text-2xl font-bold text-white">{typeof user.entityCount === 'object' ? (user.entityCount as any).low : user.entityCount}</p>
                  <p className="text-sm text-gray-400">/ {entityLimit} entities</p>
                </div>
                {user.subscriptionTier !== 'free' && user.subscriptionStatus === 'active' && (
                  <Button variant="outline" onClick={handleCancelSubscription}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(TIERS).map(([key, tier]) => (
              <Card
                key={key}
                className={`bg-zinc-900 border-zinc-800 ${
                  user.subscriptionTier === key ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {tier.name}
                    {user.subscriptionTier === key && <Check className="w-4 h-4 text-green-500" />}
                  </CardTitle>
                  <CardDescription className="text-xl font-bold text-white">
                    {tier.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-gray-400 text-sm">{tier.entities} entities</p>
                  <p className="text-gray-400 text-sm">{tier.credits} monthly credits</p>
                  {user.subscriptionTier !== key && key === 'free' && user.subscriptionTier !== 'free' && (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={handleCancelSubscription}
                    >
                      Downgrade
                    </Button>
                  )}
                  {user.subscriptionTier !== key && key !== 'free' && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleUpgrade(key)}
                      disabled={upgrading}
                    >
                      {upgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : key === 'studio' || (key === 'creative' && user.subscriptionTier === 'free')
                        ? 'Upgrade'
                        : 'Switch'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits">
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Credit Balance</CardTitle>
              <CardDescription>
                Credits are used for AI generation features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-center p-6 bg-zinc-800 rounded transition-all duration-700 ${justUpdated === 'credits' ? 'scale-110' : ''}`}>
                  <p className={`text-4xl font-bold transition-all duration-700 ${justUpdated === 'credits' ? 'text-ck-ember scale-110' : 'text-white'}`}>
                    {typeof user.credits === 'object' ? (user.credits as any).low : user.credits}
                  </p>
                  <p className="text-sm text-gray-400">credits available</p>
                </div>
                {user.creditsResetAt && (
                  <div className="text-sm text-gray-400">
                    <p>Resets on</p>
                    <p className="text-white">
                      {new Date(user.creditsResetAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <h3 className="text-lg font-medium text-white mb-4">Purchase Credits</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">{pkg.amount} Credits</CardTitle>
                  <CardDescription className="text-xl font-bold text-white">
                    {pkg.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchaseCredits(pkg.id)}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Billing History</CardTitle>
              <CardDescription>
                Your past payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : !billingData?.billingHistory?.items?.length ? (
                <p className="text-gray-400 text-center py-8">No billing history yet</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {billingData.billingHistory.items.map((item: {
                      id: string;
                      date: string;
                      description: string;
                      amount: number;
                      status: string;
                      invoiceUrl: string | null;
                    }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.description}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(item.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white font-medium">{formatAmount(item.amount)}</p>
                            <Badge
                              variant={item.status === 'paid' ? 'default' : 'outline'}
                              className={item.status === 'paid' ? 'bg-green-600' : ''}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          {item.invoiceUrl && (
                            <a
                              href={item.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {billingData.billingHistory.hasMore && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={handleLoadMoreBilling}
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => setPaymentModal((prev) => ({ ...prev, open }))}
        clientSecret={paymentModal.clientSecret}
        title={paymentModal.title}
        description={paymentModal.description}
        submitLabel={paymentModal.submitLabel}
        returnTab={paymentModal.paymentType}
        showSuccess={paymentModal.showSuccess}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
