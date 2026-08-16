const GLOW_LETTERS = new Set(["o", "l", "v", "e"]);

function BrandLetter({ char, index }: { char: string; index: number }) {
  const lower = char.toLowerCase();
  const glow = GLOW_LETTERS.has(lower);

  if (char === "®") {
    return (
      <span className="align-super text-[0.18em] font-normal text-white/50" aria-hidden>
        ®
      </span>
    );
  }

  if (glow) {
    return (
      <span
        className="relative inline-block"
        style={{
          background: "linear-gradient(180deg, #60a5fa 0%, #ffffff 55%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 0 28px rgba(96, 165, 250, 0.45))",
        }}
      >
        {char}
      </span>
    );
  }

  return (
    <span
      className="text-white"
      style={{ textShadow: index === 0 ? "0 0 40px rgba(255,255,255,0.08)" : undefined }}
    >
      {char}
    </span>
  );
}

export function SolverBrandMark() {
  const word = "Solver";

  return (
    <section
      className="relative overflow-hidden px-4 py-20 sm:py-28 md:py-32"
      style={{ background: "#0a0a0a" }}
      aria-label="Solver brand"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(37, 99, 235, 0.25) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <h2
        className="relative mx-auto max-w-5xl text-center text-[clamp(3.5rem,16vw,11rem)] font-bold leading-[0.9] tracking-[-0.04em]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {word.split("").map((char, i) => (
          <BrandLetter key={`${char}-${i}`} char={char} index={i} />
        ))}
        <BrandLetter char="®" index={word.length} />
      </h2>
    </section>
  );
}
