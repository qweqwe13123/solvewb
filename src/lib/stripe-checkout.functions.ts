import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHostedCheckoutUrl } from "@/lib/stripe-checkout.server";
import type { BillingPeriod, PlanId } from "@/lib/stripe-config";

const checkoutInputSchema = z.object({
  plan: z.enum(["starter", "pro", "ultra"]).default("starter"),
  period: z.enum(["monthly", "annually"]).default("monthly"),
});

export const getCheckoutUrlFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => checkoutInputSchema.parse(data || {}))
  .handler(async ({ data }) => {
    const url = await createHostedCheckoutUrl({
      plan: data.plan as PlanId,
      period: data.period as BillingPeriod,
    });
    return { url };
  });
