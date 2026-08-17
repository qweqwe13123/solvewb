import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { createHostedCheckoutUrl } from "@/lib/stripe-checkout.server";

const PLAN_IDS = ["starter", "pro", "ultra"] as const;

const checkoutSearchSchema = z.object({
  plan: z.enum(PLAN_IDS),
  period: z.enum(["monthly", "annually"]),
  priceId: z
    .string()
    .regex(/^price_/)
    .optional(),
});

export const Route = createFileRoute("/api/stripe/checkout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const rawPlan = url.searchParams.get("plan");
          const rawPeriod = url.searchParams.get("period");
          const rawPriceId = url.searchParams.get("priceId");
          const parsedSearch = checkoutSearchSchema.safeParse({
            plan: rawPlan,
            period: rawPeriod,
            priceId: rawPriceId || undefined,
          });
          const plan = (
            rawPlan && PLAN_IDS.includes(rawPlan as any) ? rawPlan : "starter"
          ) as (typeof PLAN_IDS)[number];
          const period = rawPeriod === "annually" ? "annually" : "monthly";

          const checkoutUrl = await createHostedCheckoutUrl({
            plan,
            period,
            priceId: parsedSearch.success ? parsedSearch.data.priceId : undefined,
          });

          return Response.redirect(checkoutUrl, 303);
        } catch (error) {
          console.error("Error creating Stripe checkout session in API:", error);
          return Response.redirect("https://www.solverwebsite.com/courses", 303);
        }
      },
    },
  },
});
