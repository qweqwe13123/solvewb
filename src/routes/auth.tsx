import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalVideoUnlock } from "@/hooks/use-global-video-unlock";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    const redirect =
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : "/account/billing";
    const provider = typeof search.provider === "string" ? search.provider : undefined;
    const code = typeof search.code === "string" ? search.code : undefined;
    const error = typeof search.error === "string" ? search.error : undefined;
    return { redirect, provider, code, error };
  },
  head: () => ({
    meta: [
      { title: "Auth — Solver" },
      { name: "description", content: "Sign in to Solver with Google or a magic link." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  useGlobalVideoUnlock();
  const { redirect: redirectTarget, provider, code, error: authError } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(authError || null);

  const isEmbedded = typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    let active = true;

    // Check if session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return;
      window.location.replace(redirectTarget);
    });

    // Listen for auth state changes (e.g., when signed in via popup tab)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) {
        window.location.replace(redirectTarget);
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [redirectTarget]);

  // Handle PKCE auth code exchange if returned from OAuth redirect
  useEffect(() => {
    if (code) {
      setStatus("sending");
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else if (data.session) {
          window.location.replace(redirectTarget);
        }
      });
    }
  }, [code, redirectTarget]);

  async function startGoogleSignIn() {
    setStatus("sending");
    setMessage(null);
    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/auth?redirect=${encodeURIComponent(redirectTarget)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  // Auto-start Google OAuth if opened in a popup with ?provider=google
  useEffect(() => {
    if (provider === "google" && !isEmbedded) {
      void startGoogleSignIn();
    }
  }, [provider, isEmbedded]);

  function handleGoogleClick() {
    if (isEmbedded) {
      const popupUrl = `${window.location.origin}/auth?provider=google&redirect=${encodeURIComponent(redirectTarget)}`;
      const win = window.open(popupUrl, "_blank", "noopener,width=500,height=650");
      if (!win) {
        setStatus("error");
        setMessage("Couldn't open sign-in tab. Please allow popups for this site and try again.");
      }
      return;
    }
    void startGoogleSignIn();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }

    setStatus("sending");
    setMessage(null);

    const emailRedirectTo =
      typeof window === "undefined" ? undefined : `${window.location.origin}${redirectTarget}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage(`We sent a magic link to ${trimmed}. Open the email to finish signing in.`);
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

      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-8 lg:mt-16 lg:flex-row lg:items-start">
        <div className="flex-1">
          <p className="text-sm text-[#a39a90]">Sign in</p>
          <h1 className="mt-3 max-w-xl text-3xl font-medium leading-tight text-[#2c2824] sm:text-4xl">
            Sign in to continue to billing, checkout, and account management.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#8a8178]">
            Sign in with your Google account or receive a magic link via email.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl rounded-[24px] border border-[#e8e2d9] bg-white/95 p-6 shadow-[0_24px_80px_-36px_rgba(61,56,50,0.22)] sm:p-8"
        >
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={status === "sending"}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#e0d9cf] bg-white px-6 py-3 text-sm font-medium text-[#2c2824] transition-colors hover:bg-[#f7f3ee] disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
              />
            </svg>
            {status === "sending" ? "Redirecting..." : "Continue with Google"}
          </button>

          {isEmbedded ? (
            <p className="mt-2 text-center text-xs text-[#8a8178]">
              Google sign-in will open in a new tab.
            </p>
          ) : null}

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-[#a39a90]">
            <span className="h-px flex-1 bg-[#e8e2d9]" />
            or continue with email
            <span className="h-px flex-1 bg-[#e8e2d9]" />
          </div>

          <div className="flex items-center gap-3 text-sm text-[#8a8178]">
            <Mail className="h-4 w-4" />
            Email address
          </div>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="mt-3 w-full border-0 border-b border-[#e0d9cf] bg-transparent py-2 text-lg text-[#2c2824] placeholder:text-[#c4bcb2] focus:border-[#2c2824] focus:outline-none"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#2c2824] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1f1b17] disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send magic link"}
          </button>

          {message ? (
            <p className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-[#4a4540]"}`}>
              {message}
            </p>
          ) : null}

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f7f3ee] p-4 text-sm text-[#6f665c]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2c2824]" />
            We use Supabase magic links and Google sign-in so you can get into your account securely without a password.
          </div>
        </form>
      </div>
    </div>
  );
}
