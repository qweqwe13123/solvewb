/**
 * Stripe plan configuration. Price IDs were created via scripts/create-stripe.mjs
 * (which runs `stripe.products.create` and `stripe.prices.create`) and pasted here.
 * This file is client-safe — it contains only product metadata, no secret keys.
 */

export type PlanId = "starter" | "pro" | "ultra";
export type BillingPeriod = "monthly" | "annually";

export type PlanConfig = {
  id: PlanId;
  name: string;
  monthlyPrice: number; // displayed price in $
  recommended?: boolean;
  features: readonly string[];
  prices: Record<BillingPeriod, string>; // Stripe price IDs
};

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    features: [
      "Monthly strategy check-in",
      "Email support (48h response)",
      "Small updates & bug fixes",
      "1 active request at a time",
    ],
    prices: {
      monthly: "price_1U59iYFqPpInUxok9re7Gx6u",
      annually: "price_1U59iZFqPpInUxokEvGLwRxC",
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 200,
    recommended: true,
    features: [
      "Everything in Starter",
      "Priority support & faster turnaround",
      "Weekly sync call",
      "3 active requests at a time",
      "Landing page & funnel tweaks",
    ],
    prices: {
      monthly: "price_1U59iaFqPpInUxokHFLRTMc0",
      annually: "price_1U59ibFqPpInUxokyI32eDkM",
    },
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    monthlyPrice: 400,
    features: [
      "Everything in Pro",
      "Dedicated Solver team lead",
      "Same-day response window",
      "Unlimited active requests",
      "Custom automation & integrations",
    ],
    prices: {
      monthly: "price_1U59icFqPpInUxokXOEPo3Jk",
      annually: "price_1U59idFqPpInUxokH6lFGlXA",
    },
  },
};

export const PLAN_LIST: PlanConfig[] = [PLANS.starter, PLANS.pro, PLANS.ultra];

export function displayPrice(monthlyPrice: number, billing: BillingPeriod): number {
  if (billing === "monthly") return monthlyPrice;
  return Math.round(monthlyPrice * 0.8);
}

export function priceIdToPlanId(priceId: string): { plan: PlanId; period: BillingPeriod } | null {
  for (const plan of PLAN_LIST) {
    if (plan.prices.monthly === priceId) return { plan: plan.id, period: "monthly" };
    if (plan.prices.annually === priceId) return { plan: plan.id, period: "annually" };
  }
  return null;
}

export const BRAND = {
  name: "Solver",
  supportEmail: "manager@solverwebsite.com",
  websiteUrl: "https://www.solverwebsite.com",
  tagline: "Web Design & Business Automation for Growing Companies",
  color: "#111827",
  fromEmail: "Solver <noreply@mail.solverwebsite.com>",
} as const;
