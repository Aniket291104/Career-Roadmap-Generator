import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'mock_stripe_key';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any, // specify standard tested api version
  typescript: true,
});

export const getStripeWebhookSecret = (): string => {
  return process.env.STRIPE_WEBHOOK_SECRET || 'mock_stripe_webhook_secret';
};
