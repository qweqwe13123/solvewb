import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, CreditCard, LoaderCircle, RefreshCw } from "lucide-react";

import { FooterSection } from "@/components/jack/FooterSection";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import {
  cancelMySubscription,
  createBillingPortalSession,
  getMyBillingInfo,
  resumeMySubscription,
} from "@/lib/api/billing.functions";
import { PLANS } from "@/lib/stripe-config";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

type BillingInfo = Awaited<ReturnType<typeof getMyBillingInfo>>;

export const Route = createFileRoute("/account/billing")({
  head: () => ({
    meta: [
      { title: "Billing — Solver" },
      { name: "description", content: "Manage your Solver subscription and billing history." },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  useGlobalVideoUnlock();
  const [status, setStatus] = useState<
    | { kind: "checking" }
    | { kind: "needs-auth" }
    | { kind: "loading" }
    | { kind: "ready"; data: BillingInfo }
    | { kind: "error"; message: string }
  >({ kind: "checking" });

  async function loadBilling() {
    try {
      setStatus({ kind: "loading" });
      const data = await getMyBillingInfo();
      setStatus({ kind: "ready", data });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to load billing info.",
      });
    }
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        setStatus({ kind: "needs-auth" });
        return;
      }
      void loadBilling();
    });

    return () => {
      active = false;
    };
  }, []);

  const subscription = status.kind === "ready" ? status.data.subscription : null;
  const payments = status.kind === "ready" ? status.data.payments : [];
  const profile = status.kind === "ready" ? status.data.profile : null;

  async function openPortal() {
    try {
      const { url } = await createBillingPortalSession();
      window.location.assign(url);
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to open billing portal.",
      });
    }
  }

  async function handleCancelOrResume() {
    if (!subscription) return;
    try {
      if (subscription.cancel_at_period_end) {
        await resumeMySubscription();
      } else {
        await cancelMySubscription();
      }
      await loadBilling();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Unable to update subscription.",
      });
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 0%, #faf6f0 0%, #efe6d8 45%, #e8dece 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <SiteHeader
        variant="light"
        showDesktopCta={false}
        backLink={
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#8a8178] hover:text-[#2c2824]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        }
      />

      <div className="mx-auto mt-10 max-w-6xl space-y-8 lg:mt-14">
        <div className="max-w-3xl">
          <p className="text-sm text-[#a39a90]">Billing</p>
          <h1 className="mt-2 text-3xl font-medium leading-tight text-[#2c2824] sm:text-4xl">
            Manage your plan, payments, and billing portal.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6f665c]">
            {profile?.email ? `Signed in as ${profile.email}. ` : ""}
            All subscription and payment data is synced from Stripe through the webhook.
          </p>
        </div>

        {status.kind === "checking" || status.kind === "loading" ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-[#e8e2d9] bg-white/90 text-[#8a8178] shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)]">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Loading billing data...
          </div>
        ) : null}

        {status.kind === "needs-auth" ? (
          <div className="rounded-[24px] border border-[#e8e2d9] bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-8">
            <p className="text-sm text-[#8a8178]">You need to sign in to see billing data.</p>
            <Link
              to="/auth"
              search={{ redirect: "/account/billing" }}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[#2c2824] px-6 py-3 text-sm text-white transition-colors hover:bg-[#1f1b17]"
            >
              Sign in with magic link
            </Link>
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div className="rounded-[24px] border border-[#e8e2d9] bg-white/90 p-6 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-8">
            <p className="text-sm text-red-600">{status.message}</p>
            <button
              type="button"
              onClick={loadBilling}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#e0d9cf] px-5 py-2.5 text-sm text-[#2c2824]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : null}

        {status.kind === "ready" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-[24px] border border-[#e8e2d9] bg-white/95 p-6 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-8">
              <div className="flex items-center gap-3 text-sm text-[#8a8178]">
                <CreditCard className="h-4 w-4" />
                Subscription
              </div>

              {subscription ? (
                <>
                  <h2 className="mt-4 text-2xl font-medium text-[#2c2824]">
                    {PLANS[subscription.plan].name}
                  </h2>
                  <p className="mt-2 text-sm text-[#6f665c]">
                    Status:{" "}
                    <span className="font-medium text-[#2c2824]">{subscription.status}</span>
                  </p>
                  <p className="mt-2 text-sm text-[#6f665c]">
                    Billing:{" "}
                    <span className="font-medium text-[#2c2824]">
                      {subscription.billing_period}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-[#6f665c]">
                    Next renewal:{" "}
                    <span className="font-medium text-[#2c2824]">
                      {subscription.current_period_end
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={openPortal}
                      className="rounded-full bg-[#2c2824] px-5 py-3 text-sm text-white transition-colors hover:bg-[#1f1b17]"
                    >
                      Open billing portal
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelOrResume}
                      className="rounded-full border border-[#e0d9cf] px-5 py-3 text-sm text-[#2c2824]"
                    >
                      {subscription.cancel_at_period_end ? "Resume plan" : "Cancel at period end"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-4 text-2xl font-medium text-[#2c2824]">
                    No active subscription
                  </h2>
                  <p className="mt-2 text-sm text-[#6f665c]">
                    You can start a new subscription from the checkout page.
                  </p>
                  <Link
                    to="/api/stripe/checkout"
                    search={{ plan: "starter", period: "monthly" }}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-[#2c2824] px-5 py-3 text-sm text-white transition-colors hover:bg-[#1f1b17]"
                  >
                    Go to checkout
                  </Link>
                </>
              )}
            </section>

            <section className="rounded-[24px] border border-[#e8e2d9] bg-white/95 p-6 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-8">
              <div className="flex items-center gap-3 text-sm text-[#8a8178]">
                <CalendarClock className="h-4 w-4" />
                Payment history
              </div>

              <div className="mt-5 divide-y divide-[#ece7e0]">
                {payments.length ? (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-[#2c2824]">
                          {payment.description ?? "Stripe payment"}
                        </p>
                        <p className="mt-1 text-xs text-[#8a8178]">
                          {payment.paid_at
                            ? new Date(payment.paid_at).toLocaleDateString()
                            : new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#2c2824]">
                          ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                        </p>
                        <p className="mt-1 text-xs text-[#8a8178]">{payment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-sm text-[#8a8178]">No payments found yet.</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <div className="mt-16">
        <FooterSection />
      </div>
    </div>
  );
}
