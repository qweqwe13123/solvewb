import { createFileRoute } from "@tanstack/react-router";
import { ContactExperience } from "@/components/contact/ContactExperience";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Solver" },
      { name: "description", content: "Choose how to connect with Solver — Telegram or leave a request." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  useGlobalVideoUnlock();
  return <ContactExperience />;
}
