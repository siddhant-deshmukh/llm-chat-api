import { db } from '@src/db';
import { eq } from 'drizzle-orm';
import { Router, Request, Response } from 'express';
import { stripe, STRIPE_CONFIG } from '@src/config/stripe';
import { users, payments } from '@src/db/schema';
import { authenticateToken } from '@src/middleware/auth.middleware';
import { RouteError } from '@src/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

const router = Router();

const plan = {
  id: 1,
  // startDate: new Date(),
  // endDate: new Date(),
}

router.post('/subscribe/pro', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.userId!;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found');
  }

  const currentUser = user[0];
  const now = new Date();

  //* Already has the subscription
  if (currentUser.subscriptionExpiring && currentUser.subscriptionExpiring > now) {
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, 'User already has active subscription');
  }

  //* Adding Customer Id got from Stripe into this
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
    mode: 'payment',
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
});

router.get('/subscription/status', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.userId!;

  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user.length) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, 'User not found');
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
});

export default router;