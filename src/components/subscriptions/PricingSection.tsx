import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getCheckoutUrlFn } from "@/lib/stripe-checkout.functions";
import { useSession } from "@/hooks/useSession";

type Billing = "monthly" | "annually";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  recommended?: boolean;
  features: readonly string[];
};

const PLANS: readonly Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    features: [
      "Monthly strategy check-in",
      "Email support (48h response)",
      "Small updates & bug fixes",
      "1 active request at a time",
    ],
  },
  {
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
  },
  {
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
  },
] as const;

function displayPrice(monthlyPrice: number, billing: Billing) {
  if (billing === "monthly") return monthlyPrice;
  return Math.round(monthlyPrice * 0.8);
}

function CheckoutButton({
  planId,
  billing,
  recommended,
}: {
  planId: string;
  billing: Billing;
  recommended?: boolean;
}) {
  const getCheckout = useServerFn(getCheckoutUrlFn);
  const { user, loading: sessionLoading } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function startCheckout() {
    if (isRedirecting || sessionLoading) return;
    setIsRedirecting(true);
    try {
      const result = await getCheckout({
        data: {
          plan: planId,
          period: billing,
          userId: user?.id,
          email: user?.email,
        },
      });
      if (!result?.url) throw new Error("Checkout URL was not created.");
      window.location.assign(result.url);
    } catch {
      setIsRedirecting(false);
      window.location.assign(`/api/stripe/checkout?plan=${planId}&period=${billing}`);
    }
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={isRedirecting || sessionLoading}
      className={`mt-6 flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70 ${
        recommended
          ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          : "border border-[#d1d5db] bg-white text-[#111] hover:bg-[#fafafa]"
      }`}
    >
      {isRedirecting ? "Opening secure checkout…" : "Continue to secure checkout"}
    </button>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1
            className="flex flex-wrap items-center justify-center gap-2 text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl lg:text-[2.75rem] lg:leading-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Find the right
            <Sparkles className="h-7 w-7 text-[#2563eb] sm:h-8 sm:w-8" aria-hidden />
            plan for you.
          </h1>
          <p className="mt-4 text-base text-[#6b7280] sm:text-lg">
            Choose a plan that fits your needs and start building today.
          </p>

          <div className="mt-8 inline-flex items-center rounded-full border border-[#e5e7eb] bg-[#f9fafb] p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "monthly" ? "bg-white text-[#111] shadow-sm" : "text-[#6b7280]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annually")}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billing === "annually" ? "bg-white text-[#111] shadow-sm" : "text-[#6b7280]"
              }`}
            >
              Annually
              <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#16a34a]">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {PLANS.map((plan) => {
            const price = displayPrice(plan.monthlyPrice, billing);

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#f3f4f6] ${
                  plan.recommended ? "border-[#2563eb]/30 shadow-md" : "border-[#e5e7eb]"
                }`}
              >
                {plan.recommended ? (
                  <div className="bg-[#2563eb] py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    Recommended
                  </div>
                ) : null}

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h2 className="text-lg font-semibold text-[#111]">{plan.name}</h2>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight text-[#111] sm:text-[2.75rem]">
                      ${price}
                    </span>
                    <span className="mb-1.5 text-sm text-[#6b7280]">/month</span>
                  </div>
                  {billing === "annually" ? (
                    <p className="mt-1 text-xs text-[#9ca3af]">Billed annually</p>
                  ) : null}

                  <CheckoutButton
                    planId={plan.id}
                    billing={billing}
                    recommended={plan.recommended}
                  />

                  <div className="my-6 h-px bg-[#e5e7eb]" />

                  <p className="text-sm font-medium text-[#374151]">Plan highlights:</p>
                  <ul className="mt-4 flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-[#4b5563]">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#22c55e]">
                          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
