import { stripe, STRIPE_CONFIG } from '@src/config/stripe';
import { db } from '@src/db';
import { payments, users } from '@src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

export const webHookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = STRIPE_CONFIG.webhookSecret;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook handling failed' });
  }
}


// Helper function to handle successful checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : 0;

  await db.update(payments)
    .set({ status: 'completed' })
    .where(eq(payments.stripeSubscriptionId, session.id));

  // Update user subscription expiration
  await db.update(users)
    .set({
      subscriptionExpiring: sql`${users.subscriptionExpiring} + INTERVAL '1 day'`,
    })
    .where(eq(users.id, userId));
}

// Helper function to handle successful payment
async function handlePaymentSucceeded(paymentIntent: any) {
  // Additional logic if needed
  console.log('Payment succeeded:', paymentIntent.id);
}

// Helper function to handle failed payment
async function handlePaymentFailed(paymentIntent: any) {
  // Update payment status to failed
  await db.update(payments)
    .set({ status: 'failed' })
    .where(eq(payments.stripeSubscriptionId, paymentIntent.id));

  console.log('Payment failed:', paymentIntent.id);
}