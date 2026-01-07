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

// Credits-based pricing configuration - Value Leader Pricing
export const CREDIT_PACKAGES = {
  starter: {
    name: 'Starter',
    credits: 25,
    price: 3,
    pricePerCredit: 0.12,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_1Sn1FyQgLWTUHkxnYesiQ5QP',
    popular: false,
  },
  standard: {
    name: 'Standard',
    credits: 75,
    price: 7,
    pricePerCredit: 0.09,
    priceId: import.meta.env.VITE_STRIPE_STANDARD_PRICE_ID || 'price_1Sn1GHQgLWTUHkxnRN2Lu6gq',
    popular: false,
  },
  pro: {
    name: 'Pro',
    credits: 150,
    price: 12,
    pricePerCredit: 0.08,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_1Sn1GWQgLWTUHkxnOSTGV4Ga',
    popular: true,
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
