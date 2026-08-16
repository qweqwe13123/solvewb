import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getCheckoutUrlFn } from "@/lib/stripe-checkout.functions";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";
import { useSession } from "@/hooks/useSession";

const PLAN_IDS = ["starter", "pro", "ultra"] as const;

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: PLAN_IDS.includes(search.plan as (typeof PLAN_IDS)[number])
      ? (search.plan as (typeof PLAN_IDS)[number])
      : "starter",
    period: search.period === "annually" ? "annually" : "monthly",
  }),
  component: CheckoutRedirectPage,
});

function CheckoutRedirectPage() {
  useGlobalVideoUnlock();
  const { plan, period } = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const getCheckout = useServerFn(getCheckoutUrlFn);
  const [directUrl, setDirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    let isMounted = true;
    async function redirect() {
      try {
        const res = await getCheckout({
          data: {
            plan,
            period,
            userId: user?.id,
            email: user?.email,
          },
        });
        if (isMounted && res?.url) {
          setDirectUrl(res.url);
          window.location.href = res.url;
        }
      } catch {
        if (isMounted) {
          const fallbackUrl = `/api/stripe/checkout?plan=${plan}&period=${period}`;
          setDirectUrl(fallbackUrl);
          window.location.href = fallbackUrl;
        }
      }
    }
    redirect();
    return () => {
      isMounted = false;
    };
  }, [getCheckout, period, plan, sessionLoading, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center font-sans text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-accent text-foreground">
          <Loader2 className="size-7 animate-spin" />
        </div>
        <h1 className="mt-5 text-xl font-bold">Redirecting to Stripe checkout...</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your secure Stripe checkout session for the $49/month plan.
        </p>
        {directUrl ? (
          <div className="mt-6">
            <a
              href={directUrl}
              className="inline-flex items-center justify-center rounded-lg bg-join px-5 py-2.5 text-sm font-semibold tracking-wide text-join-foreground uppercase shadow-sm transition-opacity hover:opacity-90"
            >
              Click here if not redirected
            </a>
          </div>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>100% Secure Checkout with Stripe</span>
        </div>
      </div>
      <Link
        to="/courses"
        className="mt-6 text-sm font-medium text-muted-foreground underline hover:text-foreground"
      >
        ← Return to Courses
      </Link>
    </div>
  );
}
