import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Stripe key required for payment functionality

// Lazy load Stripe to improve initial page load
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Credits-based pricing configuration
export const CREDIT_PACKAGES = {
  starter: {
    name: 'Starter',
    credits: 20,
    price: 5,
    pricePerCredit: 0.25,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    popular: false,
  },
  standard: {
    name: 'Standard',
    credits: 50,
    price: 10,
    pricePerCredit: 0.20,
    priceId: import.meta.env.VITE_STRIPE_STANDARD_PRICE_ID,
    popular: true,
  },
  pro: {
    name: 'Pro',
    credits: 100,
    price: 15,
    pricePerCredit: 0.15,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    popular: false,
  },
};

// Legacy PRICING export for backwards compatibility
export const PRICING = {
  starter: CREDIT_PACKAGES.starter,
  standard: CREDIT_PACKAGES.standard,
  pro: CREDIT_PACKAGES.pro,
};

// Create checkout session via Supabase Edge Function
export const createCheckoutSession = async (priceId, userId, userEmail) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        priceId,
        userId,
        userEmail,
        successUrl: `${window.location.origin}/settings?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    }
  );

  const { url, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  return url;
};

// Redirect to Stripe Customer Portal
export const redirectToCustomerPortal = async (customerId) => {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    }
  );

  const { url, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  window.location.href = url;
};
