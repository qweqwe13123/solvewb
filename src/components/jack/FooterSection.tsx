import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { CONTACT_EMAIL, TELEGRAM_URL } from "@/lib/contact";

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90">
        {title}
      </h3>
      <div className="flex flex-col gap-3 text-[13px] leading-relaxed text-white/55">
        {children}
      </div>
    </div>
  );
}

export function FooterSection() {
  return (
    <footer
      id="contact"
      className="relative z-10 border-t border-white/[0.06] px-5 pb-8 pt-16 sm:px-8 sm:pt-20 md:px-10"
      style={{ background: "#141414", fontFamily: "'Kanit', sans-serif" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 max-lg:gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(140px,1fr)_repeat(2,minmax(0,1fr))_minmax(200px,1.2fr)] lg:gap-8 xl:gap-10">
          <div className="lg:pt-1">
            <Link
              to="/"
              className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold lowercase tracking-tight text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              solver.
            </Link>
          </div>

          <FooterColumn title="Contact">
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:bg-white/5 hover:text-white"
                aria-label={`Email ${CONTACT_EMAIL}`}
              >
                <Mail className="h-5 w-5" />
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-white">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#229ED9] transition hover:border-[#229ED9]/50 hover:bg-white/5"
                aria-label="Chat on Telegram"
              >
                <TelegramIcon className="h-5 w-5" />
              </a>
              <span className="text-white/45">Telegram</span>
            </div>
          </FooterColumn>

          <FooterColumn title="Legal">
            <Link to="/privacy-policy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms-of-use" className="transition hover:text-white">
              Terms of Use
            </Link>
            <Link to="/refund-policy" className="transition hover:text-white">
              Refund Policy
            </Link>
          </FooterColumn>

          <div className="flex flex-col items-start gap-6 max-lg:col-span-2 sm:col-span-2 lg:col-span-1 lg:items-end lg:text-right">
            <h3 className="max-w-[220px] text-[13px] font-semibold uppercase leading-[1.35] tracking-[0.08em] text-white/90 lg:ml-auto">
              Let&apos;s Build
              <br />
              Something
              <br />
              Exceptional
            </h3>
            <Link
              to="/contact"
              className="rounded-full bg-black px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
            >
              Start Your Project
            </Link>
          </div>
        </div>

        <p
          className="mt-16 text-center text-[13px] text-white/40 sm:mt-20"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Designed by Solver Company.
        </p>
      </div>
    </footer>
  );
}
