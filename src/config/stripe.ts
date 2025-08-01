import ENV from '@src/common/constants/ENV';
import Stripe from 'stripe';



export const stripe = new Stripe(ENV.StripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

export const STRIPE_CONFIG = {
  webhookSecret: ENV.StripeWebhookSecret!,
  proPriceId: ENV.StripeProPriceId!,
};