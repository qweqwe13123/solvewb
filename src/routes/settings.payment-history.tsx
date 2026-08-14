import { createFileRoute } from "@tanstack/react-router";
import { SettingsCard, EmptyState } from "@/components/settings/SettingsCard";

export const Route = createFileRoute("/settings/payment-history")({
  head: () => ({
    meta: [
      { title: "Payment History — AI Video Bootcamp" },
      { name: "description", content: "Review your past membership charges and receipts." },
      { property: "og:title", content: "Payment History" },
      {
        property: "og:description",
        content: "Review your past membership charges and receipts.",
      },
    ],
  }),
  component: PaymentHistoryPage,
});

function PaymentHistoryPage() {
  return (
    <SettingsCard title="Payment history" description="All charges and receipts for your account.">
      <EmptyState title="Your payments will show here" />
    </SettingsCard>
  );
}
