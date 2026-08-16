import { UseCaseCard, type UseCase } from "./UseCaseCard";

const USE_CASES: UseCase[] = [
  {
    title: "Ecommerce",
    description:
      "We create modern, high-converting websites that increase customer engagement, strengthen brand trust, and help businesses drive more sales.",
  },
  {
    title: "Tech",
    description:
      "Leverage the power of high-performance 3D websites to elevate your digital presence and create unforgettable user experiences.",
  },
  {
    title: "Creative",
    description:
      "We craft unique digital experiences that help brands stand out, capture attention, and leave a lasting impression on their audience.",
  },
  {
    title: "Storytelling",
    description:
      "Tell your brand's story through immersive experiences, thoughtful animations, and modern digital solutions that keep users engaged.",
  },
];

const STAGGER_PT_DESKTOP = [
  "pt-0",
  "pt-5 md:pt-6",
  "pt-10 md:pt-12",
  "pt-[3.25rem] md:pt-16",
] as const;

function StaggeredRow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mx-auto flex w-max max-w-full flex-row items-start justify-center gap-5 px-2 sm:gap-6 md:gap-7 lg:gap-8 ${className}`}
    >
      {USE_CASES.map((useCase, i) => (
        <div
          key={useCase.title}
          className={`w-[min(100%,300px)] shrink-0 sm:w-[320px] ${STAGGER_PT_DESKTOP[i]}`}
        >
          <UseCaseCard useCase={useCase} delay={0.06 + i * 0.08} />
        </div>
      ))}
    </div>
  );
}

export function UseCasesSection() {
  return (
    <section
      className="relative overflow-hidden px-4 py-12 max-lg:overflow-x-hidden sm:px-6 sm:py-14 md:px-8 md:py-16"
      style={{ background: "#070B26", fontFamily: "'Kanit', sans-serif" }}
      aria-label="Use cases"
    >
      <div className="mx-auto flex max-w-[min(100%,360px)] flex-col gap-8 lg:hidden">
        {USE_CASES.map((useCase, i) => (
          <UseCaseCard key={useCase.title} useCase={useCase} delay={0.06 + i * 0.08} />
        ))}
      </div>

      <StaggeredRow className="hidden lg:flex" />
    </section>
  );
}
