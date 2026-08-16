import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";
import { syncCheckoutSessionFn } from "@/lib/stripe-checkout.functions";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Checkout success — Solver" },
      { name: "description", content: "Your Solver checkout is complete." },
    ],
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  useGlobalVideoUnlock();
  const { session_id } = Route.useSearch();
  const syncSession = useServerFn(syncCheckoutSessionFn);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncFailed, setSyncFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleSyncAndRedirect() {
      if (!session_id) {
        if (active) {
          setSyncFailed(true);
          setIsSyncing(false);
        }
        return;
      }

      let synced = false;
      for (let attempt = 0; attempt < 6; attempt++) {
          try {
            const res = await syncSession({ data: { sessionId: session_id } });
            if (res && res.ok) {
              synced = true;
              break;
            }
          } catch (err) {
            console.warn(`Session sync attempt ${attempt + 1} error:`, err);
          }
          if (attempt < 5) {
            await new Promise((r) => setTimeout(r, 800));
          }
        }

      if (active) {
        setIsSyncing(false);
        if (synced) {
          window.location.replace("/c");
        } else {
          setSyncFailed(true);
        }
      }
    }

    void handleSyncAndRedirect();

    return () => {
      active = false;
    };
  }, [session_id, syncSession]);

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6 sm:py-14"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 50% 0%, #faf6f0 0%, #efe6d8 45%, #e8dece 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <SiteHeader variant="light" showDesktopCta={false} />

      <div className="mx-auto mt-10 max-w-3xl rounded-[24px] border border-[#e8e2d9] bg-white/95 p-6 text-center shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-10 sm:text-left">
        <div className="flex items-center justify-center gap-3 text-sm text-[#8a8178] sm:justify-start">
          <BadgeCheck className="h-5 w-5 text-emerald-600" />
          Payment complete
        </div>
        <h1 className="mt-3 text-3xl font-medium leading-tight text-[#2c2824]">
          You&apos;re in! Setting up your community access...
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#6f665c]">
          {syncFailed
            ? "Payment was received, but access is still being prepared. You can retry safely or contact support if this continues."
            : "Your subscription is being activated securely. We&apos;ll take you to the community as soon as Pro access is ready."}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <a
            href={syncFailed ? `/checkout/success?session_id=${encodeURIComponent(session_id ?? "")}` : "/c"}
            className="inline-flex items-center gap-2 rounded-full bg-[#2c2824] px-8 py-3.5 text-base font-semibold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#1f1b17]"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {syncFailed ? "Retry activation" : "Entering community..."}
              </>
            ) : (
              <>
                {syncFailed ? "Retry activation" : "Enter community now"}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </a>
          <Link
            to="/account/billing"
            className="inline-flex items-center gap-2 rounded-full border border-[#e0d9cf] px-6 py-3.5 text-sm text-[#2c2824] transition-colors hover:bg-[#f7f3ee]"
          >
            Billing & Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
