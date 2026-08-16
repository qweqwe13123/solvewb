export function HeroScrollHint() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <span className="relative flex h-11 w-[26px] items-center justify-center rounded-full border border-white/35 bg-black/20 backdrop-blur-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 animate-scroll-chevron text-white/70"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}
