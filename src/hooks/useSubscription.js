import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/stripe';

const INITIAL_FREE_CREDITS = 1;

export function useSubscription() {
  const { user, profile, refreshProfile, canCreateApplication, getRemainingCredits } = useAuth();

  // Start checkout for credit purchase
  const startCheckout = async (priceId) => {
    if (!user) {
      throw new Error('Please sign in to purchase credits');
    }

    try {
      const url = await createCheckoutSession(priceId, user.id, user.email);
      window.location.href = url;
    } catch (error) {
      throw error;
    }
  };

  // Get credits info
  const getCreditsInfo = () => {
    if (!profile) return null;

    const credits = profile.credits || 0;
    const totalPurchased = profile.total_credits_purchased || 0;
    const totalReceived = totalPurchased + INITIAL_FREE_CREDITS;
    const used = totalReceived - credits;

    return {
      credits,
      totalPurchased,
      totalReceived,
      used,
    };
  };

  // All features are available (no tier restrictions)
  const hasAccess = () => true;

  return {
    canCreateApplication,
    getRemainingCredits,
    getCreditsInfo,
    hasAccess,
    startCheckout,
    refreshProfile,
  };
}
