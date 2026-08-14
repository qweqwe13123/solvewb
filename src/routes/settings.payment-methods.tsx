import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/payment-methods")({
  head: () => ({
    meta: [
      { title: "Payment Methods — AI Video Bootcamp" },
      { name: "description", content: "Add or remove the cards used for your memberships." },
      { property: "og:title", content: "Payment Methods" },
      {
        property: "og:description",
        content: "Add or remove the cards used for your memberships.",
      },
    ],
  }),
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  return (
    <SettingsCard title="Payment methods" description="Cards used to pay for your memberships.">
      <div className="space-y-6">
        <div className="grid min-h-48 place-items-center rounded-xl border border-border p-10 text-center">
          <div>
            <CreditCard className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 text-[15px] text-muted-foreground">No payment methods yet</p>
          </div>
        </div>
        <button className="rounded-lg bg-join px-6 py-3 text-sm font-semibold tracking-wide text-join-foreground uppercase transition-opacity hover:opacity-90">
          Add payment method
        </button>
      </div>
    </SettingsCard>
  );
}
