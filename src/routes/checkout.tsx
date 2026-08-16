import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSession } from "@/hooks/useSession";
import { getCheckoutUrlFn } from "@/lib/stripe-checkout.functions";

const PLAN_IDS = ["starter", "pro", "ultra"] as const;

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: PLAN_IDS.includes(search.plan as (typeof PLAN_IDS)[number])
      ? (search.plan as (typeof PLAN_IDS)[number])
      : "starter",
    period: search.period === "annually" ? "annually" : "monthly",
  }),
  component: LegacyCheckoutRedirect,
});

/**
 * Compatibility route for old /checkout links. New pricing buttons call the
 * server function directly and never render this route. Keeping this route
 * invisible prevents bookmarked/legacy links from showing an intermediate UI.
 */
function LegacyCheckoutRedirect() {
  const { plan, period } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const getCheckout = useServerFn(getCheckoutUrlFn);

  useEffect(() => {
    if (sessionLoading) return;
    let active = true;

    void getCheckout({
      data: {
        plan,
        period,
        userId: user?.id,
        email: user?.email,
      },
    })
      .then((result) => {
        if (active && result?.url) window.location.replace(result.url);
      })
      .catch(() => {
        if (active) {
          window.location.replace(`/api/stripe/checkout?plan=${plan}&period=${period}`);
        }
      });

    return () => {
      active = false;
    };
  }, [getCheckout, period, plan, sessionLoading, user]);

  return null;
}
