import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHostedCheckoutUrl } from "@/lib/stripe-checkout.server";
import type { BillingPeriod, PlanId } from "@/lib/stripe-config";

const checkoutInputSchema = z.object({
  plan: z.enum(["starter", "pro", "ultra"]).default("starter"),
  period: z.enum(["monthly", "annually"]).default("monthly"),
  userId: z.string().optional(),
  email: z.string().optional(),
  checkoutAttemptId: z.string().min(8).max(100).optional(),
  priceId: z
    .string()
    .regex(/^price_/)
    .optional(),
});

export const getCheckoutUrlFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutInputSchema.parse(data || {}))
  .handler(async ({ data }) => {
    const url = await createHostedCheckoutUrl({
      plan: data.plan as PlanId,
      period: data.period as BillingPeriod,
      userId: data.userId,
      email: data.email,
      checkoutAttemptId: data.checkoutAttemptId,
      priceId: data.priceId,
    });
    return { url };
  });

import { syncCheckoutSession } from "@/lib/stripe-webhook.server";

export const syncCheckoutSessionFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const parsed = z.object({ sessionId: z.string().optional() }).safeParse(data || {});
    return parsed.success ? parsed.data : {};
  })
  .handler(async ({ data }) => {
    if (!data.sessionId) return { ok: false };
    try {
      return await syncCheckoutSession(data.sessionId);
    } catch (error) {
      console.warn("Failed to sync checkout session:", error);
      return { ok: false };
    }
  });
