import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { REVIEWS, REVIEW_STATS, type Review } from "@/data/reviews";

const AVATAR_COLORS = [
  "#5B8DEF",
  "#FF9F0A",
  "#30D158",
  "#BF5AF2",
  "#FF453A",
  "#64D2FF",
  "#AC8E68",
  "#FF375F",
  "#FFD60A",
  "#0A84FF",
];

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={starSize}
          fill={star <= rating ? "#FF9500" : "none"}
          stroke={star <= rating ? "#FF9500" : "#C7C7CC"}
          strokeWidth="1.5"
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.51.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function RatingHistogram() {
  const maxCount = Math.max(...REVIEW_STATS.distribution.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      {REVIEW_STATS.distribution.map(({ stars, count }) => (
        <div key={stars} className="flex items-center gap-2">
          <button
            type="button"
            className="flex w-8 shrink-0 items-center gap-0.5 text-[11px] text-[#86868B] hover:text-[#1D1D1F]"
          >
            {stars}
            <svg viewBox="0 0 20 20" className="h-2.5 w-2.5" fill="#86868B">
              <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.51.94-5.5-4-3.9 5.53-.8L10 1.5z" />
            </svg>
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E5E5EA]">
            <div
              className="h-full rounded-full bg-[#86868B]"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <article className="flex h-full w-[min(88vw,340px)] shrink-0 snap-start flex-col rounded-2xl border border-[#E5E5EA] bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] max-lg:w-[min(88vw,320px)] sm:w-[360px] sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-3">
        <StarRating rating={review.rating} size="sm" />
        <span className="text-[11px] text-[#86868B]">{review.date}</span>
      </div>

      <p className="mb-4 flex-1 text-[14px] leading-[1.55] text-[#1D1D1F]">{review.body}</p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {review.services.map((service) => (
          <span
            key={service}
            className="rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#636366]"
          >
            {service}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-[#F2F2F7] pt-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white"
          style={{ background: avatarColor }}
        >
          {review.authorInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#1D1D1F]">{review.authorInitials}</p>
          <p className="truncate text-[12px] text-[#86868B]">{review.location}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#007AFF]">
          <Check className="h-3 w-3" strokeWidth={3} />
          Verified
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-[#F2F2F7] p-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
          Response from Solver
        </p>
        <p className="text-[13px] leading-[1.5] text-[#3A3A3C]">{review.response}</p>
      </div>
    </article>
  );
}

export function ReviewsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === "left" ? -el.clientWidth * 0.85 : el.clientWidth * 0.85;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative z-10 overflow-hidden rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-28 md:py-32"
      style={{
        background: "#F5F5F7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#1D1D1F] to-[#3A3A3C] shadow-md">
            <span
              className="text-lg font-semibold text-white"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              S
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86868B]">
              Solver
            </p>
            <p className="text-[13px] text-[#636366]">Client Experience</p>
          </div>
        </div>

        <h2
          className="mb-10 text-[#1D1D1F]"
          style={{
            fontFamily: "'Kanit', sans-serif",
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Ratings &amp; Reviews
        </h2>

        <div className="mb-12 flex flex-col gap-8 rounded-2xl border border-[#E5E5EA] bg-white p-5 max-lg:p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8 md:mb-14">
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="text-center sm:text-left">
              <p
                className="font-semibold leading-none text-[#1D1D1F]"
                style={{ fontSize: "clamp(3.5rem, 10vw, 4.5rem)" }}
              >
                {REVIEW_STATS.average.toFixed(1)}
              </p>
              <p className="mt-2 text-[13px] text-[#86868B]">out of 5</p>
            </div>
            <div>
              <StarRating rating={5} />
              <p className="mt-2 text-[13px] text-[#86868B]">{REVIEW_STATS.total} Ratings</p>
            </div>
          </div>
          <RatingHistogram />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-[#1D1D1F]">Most Helpful Reviews</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D1D1D6] bg-white text-[#1D1D1F] transition hover:bg-[#F2F2F7]"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D1D1D6] bg-white text-[#1D1D1F] transition hover:bg-[#F2F2F7]"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="reviews-scroll -mx-5 flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scroll-smooth sm:-mx-8 sm:px-8 md:-mx-10 md:px-10"
        >
          {REVIEWS.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>

        <p className="mt-8 text-center text-[11px] text-[#AEAEB2]">
          Verified Client · Completed Project · All reviews submitted after project delivery
        </p>
      </motion.div>

      <style>{`
        .reviews-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .reviews-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
