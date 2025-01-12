import { requireNodeEnvVar } from '../server/utils';

export type SubscriptionStatus = 'past_due' | 'cancel_at_period_end' | 'active' | 'deleted';

export enum PaymentPlanId {
  Free = 'free',
  Premium = 'premium',
  Pro = 'pro',
  Enterprise = 'enterprise'
}

export interface PaymentPlan {
  // Returns the id under which this payment plan is identified on your payment processor.
  getPaymentProcessorPlanId: () => string;
  effect: PaymentPlanEffect;
  // Group and player limits for golf management
  maxGroups: number;
  maxPlayersPerGroup: number;
  // Monthly price in USD
  price: number;
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits'; amount: number };

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Free]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_FREE_PLAN_ID'),
    effect: { kind: 'subscription' },
    maxGroups: 1,
    maxPlayersPerGroup: 8,
    price: 0
  },
  [PaymentPlanId.Premium]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PREMIUM_PLAN_ID'),
    effect: { kind: 'subscription' },
    maxGroups: 1,
    maxPlayersPerGroup: 24,
    price: 15
  },
  [PaymentPlanId.Pro]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_PRO_PLAN_ID'),
    effect: { kind: 'subscription' },
    maxGroups: 5,
    maxPlayersPerGroup: Number.MAX_SAFE_INTEGER,
    price: 30
  },
  [PaymentPlanId.Enterprise]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_ENTERPRISE_PLAN_ID'),
    effect: { kind: 'subscription' },
    maxGroups: Number.MAX_SAFE_INTEGER,
    maxPlayersPerGroup: Number.MAX_SAFE_INTEGER,
    price: 50
  }
};

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Free]: 'Free',
    [PaymentPlanId.Premium]: 'Premium',
    [PaymentPlanId.Pro]: 'Pro',
    [PaymentPlanId.Enterprise]: 'Enterprise'
  };
  return planToName[planId];
}

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === 'subscription');
}
