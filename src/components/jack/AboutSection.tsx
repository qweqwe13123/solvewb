import { FadeIn } from "./FadeIn";
import { AnimatedText } from "./AnimatedText";
import { ContactButton } from "./ContactButton";

const OrbSphere = ({ from, to }: { from: string; to: string }) => (
  <svg viewBox="0 0 200 200" className="w-full h-auto">
    <defs>
      <radialGradient id={`g-${from}`} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="35%" stopColor={from} stopOpacity="0.85" />
        <stop offset="100%" stopColor={to} stopOpacity="0.95" />
      </radialGradient>
      <radialGradient id={`h-${from}`} cx="35%" cy="25%" r="25%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="88" fill={`url(#g-${from})`} />
    <ellipse cx="78" cy="70" rx="32" ry="22" fill={`url(#h-${from})`} />
  </svg>
);

const GlassPrism = () => (
  <svg viewBox="0 0 200 200" className="w-full h-auto">
    <defs>
      <linearGradient id="prism" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BBCCD7" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#7689a0" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#1a2230" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    <polygon
      points="100,20 175,150 25,150"
      fill="url(#prism)"
      stroke="#ffffff"
      strokeOpacity="0.3"
      strokeWidth="1"
    />
    <polygon points="100,20 175,150 100,110" fill="#ffffff" fillOpacity="0.08" />
  </svg>
);

const NetworkNodes = () => (
  <svg viewBox="0 0 200 200" className="w-full h-auto">
    <defs>
      <radialGradient id="node" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#4f7fa8" />
      </radialGradient>
    </defs>
    <g stroke="#8aa9c4" strokeOpacity="0.5" strokeWidth="1">
      <line x1="40" y1="50" x2="150" y2="80" />
      <line x1="40" y1="50" x2="80" y2="150" />
      <line x1="150" y1="80" x2="160" y2="160" />
      <line x1="80" y1="150" x2="160" y2="160" />
      <line x1="150" y1="80" x2="80" y2="150" />
    </g>
    <circle cx="40" cy="50" r="10" fill="url(#node)" />
    <circle cx="150" cy="80" r="14" fill="url(#node)" />
    <circle cx="80" cy="150" r="12" fill="url(#node)" />
    <circle cx="160" cy="160" r="9" fill="url(#node)" />
  </svg>
);

export function AboutSection() {
  return (
    <section
      className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden px-5 py-16 max-lg:px-4 sm:px-8 sm:py-20 lg:min-h-screen lg:px-10 lg:py-20"
      style={{ background: "#070B26", fontFamily: "'Kanit', sans-serif" }}
    >
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] hidden w-[120px] lg:block sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <OrbSphere from="#5b8def" to="#11224a" />
      </FadeIn>
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] hidden w-[100px] lg:block sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <GlassPrism />
      </FadeIn>
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] hidden w-[120px] lg:block sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <OrbSphere from="#a8c5e0" to="#2b3a55" />
      </FadeIn>
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] hidden w-[130px] lg:block sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <NetworkNodes />
      </FadeIn>

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn
          as="h2"
          delay={0}
          y={40}
          className="hero-heading text-center text-5xl font-black uppercase leading-none tracking-tight max-lg:sm:text-6xl lg:text-[clamp(3rem,12vw,160px)]"
        >
          Who We Are
        </FadeIn>
        <AnimatedText
          text="We build digital systems that help businesses scale. From premium websites and mobile applications to automation, customer acquisition, and operational infrastructure, we create solutions designed to increase efficiency, strengthen brands, and drive long-term growth. If you don't see the exact service you're looking for on our Services page, let's talk. We're always open to exploring new opportunities and finding the right solution for your business."
          className="max-w-[760px] px-1 text-center text-base font-medium leading-relaxed text-[#D7E2EA] max-lg:max-w-[22rem] lg:text-[clamp(1rem,2vw,1.35rem)]"
        />
      </div>
      <div className="relative z-10 mt-16 sm:mt-20 md:mt-24">
        <ContactButton />
      </div>
    </section>
  );
}
