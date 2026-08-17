import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/course/")({
  beforeLoad: () => {
    throw redirect({ to: "/courses", search: { checkout: undefined, session_id: undefined } });
  },
});
