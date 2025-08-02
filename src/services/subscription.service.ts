import Stripe from 'stripe';
import { eq, sql } from 'drizzle-orm';
import { Request, Response } from 'express';

import { db } from '@src/db';
import { payments, users } from '@src/db/schema';
import { stripe, STRIPE_CONFIG } from '@src/config/stripe';

export const webHookController = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = STRIPE_CONFIG.webhookSecret;

  let event: Stripe.Event;

  try {
    
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    
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



async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : 0;


  await db.update(payments)
    .set({ status: 'completed' })
    .where(eq(payments.stripeSubscriptionId, session.id));

  
  await db.update(users)
    .set({
      subscriptionExpiring: sql`COALESCE(${users.subscriptionExpiring}, CURRENT_TIMESTAMP) + INTERVAL '1 day'`,
    })
    .where(eq(users.id, userId));
}


async function handlePaymentSucceeded(session: Stripe.PaymentIntent) {
  
  const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : 0;
  

  await db.update(payments)
    .set({ status: 'completed' })
    .where(eq(payments.stripeSubscriptionId, session.id));

  
  await db.update(users)
    .set({
      subscriptionExpiring: sql`${users.subscriptionExpiring} + INTERVAL '1 day'`,
    })
    .where(eq(users.id, userId));
}


async function handlePaymentFailed(paymentIntent: any) {
  
  await db.update(payments)
    .set({ status: 'failed' })
    .where(eq(payments.stripeSubscriptionId, paymentIntent.id));

  console.log('Payment failed:', paymentIntent.id);
}