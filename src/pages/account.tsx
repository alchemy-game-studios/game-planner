import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { useAuth, User } from '@/context/auth-context';
import { useBreadcrumbs } from '@/context/breadcrumb-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User as UserIcon, CreditCard, Coins, Check, ExternalLink } from 'lucide-react';

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($displayName: String!) {
    updateProfile(displayName: $displayName) {
      id
      displayName
    }
  }
`;

const CREATE_SUBSCRIPTION_CHECKOUT = gql`
  mutation CreateSubscriptionCheckout($tier: String!) {
    createSubscriptionCheckout(tier: $tier) {
      url
    }
  }
`;

const PURCHASE_CREDITS = gql`
  mutation PurchaseCredits($packageId: String!) {
    purchaseCredits(packageId: $packageId) {
      url
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

// Tier configurations (matching backend)
const TIERS = {
  free: { name: 'Free', price: '$0', entities: 50, credits: 100, color: 'bg-gray-600' },
  creative: { name: 'Creative', price: '$9.99/mo', entities: 500, credits: 1000, color: 'bg-blue-600' },
  studio: { name: 'Studio', price: '$29.99/mo', entities: 'Unlimited', credits: 5000, color: 'bg-purple-600' }
};

const CREDIT_PACKAGES = [
  { id: 'credits_100', amount: 100, price: '$4.99' },
  { id: 'credits_500', amount: 500, price: '$19.99' },
  { id: 'credits_1000', amount: 1000, price: '$34.99' }
];

export default function AccountPage() {
  const { user, loading, refetch } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clear, push } = useBreadcrumbs();

  const [displayName, setDisplayName] = useState('');
  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [createSubscriptionCheckout] = useMutation(CREATE_SUBSCRIPTION_CHECKOUT);
  const [purchaseCredits] = useMutation(PURCHASE_CREDITS);
  const [cancelSubscription] = useMutation(CANCEL_SUBSCRIPTION);

  const success = searchParams.get('success');
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

  useEffect(() => {
    // Refetch user data after successful payment
    if (success) {
      refetch();
    }
  }, [success, refetch]);

  if (loading || !user) {
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

  const handleUpgrade = async (tier: string) => {
    try {
      const { data } = await createSubscriptionCheckout({ variables: { tier } });
      if (data?.createSubscriptionCheckout?.url) {
        window.location.href = data.createSubscriptionCheckout.url;
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
    }
  };

  const handlePurchaseCredits = async (packageId: string) => {
    try {
      const { data } = await purchaseCredits({ variables: { packageId } });
      if (data?.purchaseCredits?.url) {
        window.location.href = data.purchaseCredits.url;
      }
    } catch (err) {
      console.error('Error purchasing credits:', err);
    }
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

  const currentTier = TIERS[user.subscriptionTier as keyof typeof TIERS] || TIERS.free;
  const entityLimit = user.limits.maxEntities === -1 ? 'Unlimited' : user.limits.maxEntities;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

      {success && (
        <div className="mb-6 p-4 rounded bg-green-500/10 border border-green-500/30 text-green-400">
          {success === 'subscription' ? 'Subscription activated successfully!' : 'Credits purchased successfully!'}
        </div>
      )}

      {canceled && (
        <div className="mb-6 p-4 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
          Payment was canceled. No changes were made.
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
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
                <Badge className={currentTier.color}>{currentTier.name}</Badge>
                {user.subscriptionStatus === 'canceled' && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                    Canceling
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {currentTier.price} - {entityLimit} entities, {currentTier.credits} monthly credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center p-4 bg-zinc-800 rounded">
                  <p className="text-2xl font-bold text-white">{user.entityCount}</p>
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
                  {user.subscriptionTier !== key && key !== 'free' && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleUpgrade(key)}
                    >
                      {key === 'studio' || (key === 'creative' && user.subscriptionTier === 'free')
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
                <div className="text-center p-6 bg-zinc-800 rounded">
                  <p className="text-4xl font-bold text-white">{user.credits}</p>
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
      </Tabs>
    </div>
  );
}
