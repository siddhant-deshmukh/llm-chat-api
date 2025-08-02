import { db } from '@src/db';
import { eq, and, sql } from 'drizzle-orm';
import { Router, Request, Response } from 'express';
import { stripe, STRIPE_CONFIG } from '@src/config/stripe';
import { users, payments } from '@src/db/schema';
import { authenticateToken } from '@src/middleware/auth.middleware';
import Stripe from 'stripe';

const router = Router();

const plan = {
  id: 1,
  // startDate: new Date(),
  // endDate: new Date(),
}

router.post('/subscribe/pro', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!; // From authenticateToken middleware

    // Check if user already has active subscription
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = user[0];
    const now = new Date();

    // Check if user already has active subscription
    if (currentUser.subscriptionExpiring && currentUser.subscriptionExpiring > now) {
      return res.status(400).json({
        error: 'User already has active subscription',
        expiresAt: currentUser.subscriptionExpiring
      });
    }

    // Get Pro subscription plan (assuming 28 days for Pro)
    // const proSubscription = await db.select()
    //   .from(subscriptions)
    //   .where(eq(subscriptions.id, 1)) // Assuming Pro plan has ID 1
    //   .limit(1);

    // if (!proSubscription.length) {
    //   return res.status(500).json({ error: 'Pro subscription plan not configured' });
    // }

    // const plan = proSubscription[0];


    // Create or get Stripe customer
    let customerId = currentUser.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId.toString(),
          name: currentUser.name,
          mobileNo: currentUser.mobileNo,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.proPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment
      success_url: `http://${req.headers.host}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://${req.headers.host}/cancel`,
      metadata: {
        userId: userId.toString(),
        subscriptionId: plan.id.toString(),
      },
    });

    // Create pending payment record
    await db.insert(payments).values({
      userId,
      amount: 0,
      // subscribedFor: `${plan.startDate.toDateString()} to ${plan.endDate.toDateString()}`,
      stripeSubscriptionId: session.id,
      currency: 'INR',
      // expiringAt: plan.endDate,
      createdAt: new Date(),
      status: 'pending',
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {
    console.error('Subscribe Pro Error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

router.get('/subscription/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = user[0];
    const now = new Date();

    let tier: 'Basic' | 'Pro' = 'Basic';
    let isActive = false;
    let expiresAt: Date | null = null;

    if (currentUser.subscriptionExpiring && currentUser.subscriptionExpiring > now) {
      tier = 'Pro';
      isActive = true;
      expiresAt = currentUser.subscriptionExpiring;
    }

    res.json({
      success: true,
      subscription: {
        tier,
        isActive,
        expiresAt,
        userId,
      },
    });

  } catch (error) {
    console.error('Subscription Status Error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

export default router;