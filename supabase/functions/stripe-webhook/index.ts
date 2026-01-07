import Stripe from 'npm:stripe@13.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2.38.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

// Map credits to package name
function getPackageName(credits: number): string {
  if (credits >= 150) return 'Pro';
  if (credits >= 75) return 'Standard';
  return 'Starter';
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Get metadata from session
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0', 10);

        if (!userId || credits <= 0) {
          return new Response('Invalid metadata', { status: 400 });
        }

        // Add credits to user's profile
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('credits, total_credits_purchased')
          .eq('id', userId)
          .single();

        if (fetchError) {
          return new Response(`Error fetching profile: ${fetchError.message}`, { status: 500 });
        }

        const currentCredits = profile?.credits || 0;
        const totalPurchased = profile?.total_credits_purchased || 0;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            credits: currentCredits + credits,
            total_credits_purchased: totalPurchased + credits,
            stripe_customer_id: session.customer as string,
          })
          .eq('id', userId);

        if (updateError) {
          return new Response(`Error updating profile: ${updateError.message}`, { status: 500 });
        }

        // Record purchase in history
        await supabase.from('purchase_history').insert({
          user_id: userId,
          stripe_session_id: session.id,
          credits_purchased: credits,
          amount_cents: session.amount_total || 0,
          currency: session.currency || 'usd',
          package_name: getPackageName(credits),
          purchased_at: new Date(session.created * 1000).toISOString(),
        });

        break;
      }

      case 'payment_intent.payment_failed': {
        // Handle failed payment if needed
        break;
      }

      default:
        // Ignore other events
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});
