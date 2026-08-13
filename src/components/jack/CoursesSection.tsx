import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

const COURSES = [
  {
    n: "01",
    category: "AI & Automation",
    name: "AI Automation Masterclass",
    desc: "Design and deploy AI agents, automations, and no-code systems that remove hours of manual work from your business.",
    meta: "6 modules · Beginner to advanced",
    price: "$149",
  },
  {
    n: "02",
    category: "Development",
    name: "Modern Web Development",
    desc: "Go from idea to live product: build fast, responsive websites and web apps with modern tooling and clean architecture.",
    meta: "8 modules · Project-based",
    price: "$249",
  },
  {
    n: "03",
    category: "Operations",
    name: "Digital Systems & CRM",
    desc: "Build your company's operating system: unified CRMs, sales pipelines, and workflows that scale without chaos.",
    meta: "5 modules · Templates included",
    price: "$199",
  },
  {
    n: "04",
    category: "Design",
    name: "Brand & Conversion Design",
    desc: "Create premium visual identities and conversion-focused landing pages that build trust and turn visitors into customers.",
    meta: "7 modules · Portfolio project",
    price: "$179",
  },
];

export function CoursesSection() {
  return (
    <section
      id="courses"
      className="relative z-10 px-4 py-16 sm:px-8 sm:py-24 md:px-10 md:py-32"
      style={{ background: "#070B26", fontFamily: "'Kanit', sans-serif" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12 text-center sm:mb-16"
      >
        <h2 className="hero-heading font-black uppercase leading-none tracking-tight max-lg:text-5xl max-lg:sm:text-6xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,10vw,130px)]">
          COURSES
        </h2>
        <p className="mx-auto mt-6 max-w-2xl font-light leading-relaxed text-[#D7E2EA]/70 max-lg:text-[15px] lg:text-lg">
          Practical, project-based training built from real client work — so you can
          master the same systems we use to grow businesses.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:gap-8">
        {COURSES.map((course, i) => (
          <motion.article
            key={course.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#D7E2EA]/15 bg-[#0D1329] p-7 transition-colors duration-300 hover:border-[#D7E2EA]/35 sm:rounded-[36px] sm:p-9"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <span
                  className="hero-heading font-black leading-none text-[#D7E2EA]/20"
                  style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
                >
                  {course.n}
                </span>
                <span className="mt-1 rounded-full border border-[#D7E2EA]/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#D7E2EA]/70">
                  {course.category}
                </span>
              </div>

              <h3
                className="mt-8 font-medium uppercase leading-tight tracking-tight text-[#D7E2EA]"
                style={{ fontSize: "clamp(1.3rem, 2.6vw, 2rem)" }}
              >
                {course.name}
              </h3>
              <p className="mt-4 max-w-md font-light leading-relaxed text-[#D7E2EA]/60 max-lg:text-[15px]">
                {course.desc}
              </p>
            </div>

            <div className="mt-8 flex items-end justify-between gap-4 border-t border-[#D7E2EA]/10 pt-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#D7E2EA]/50">
                  {course.meta}
                </div>
                <div className="mt-2 text-2xl font-semibold text-[#D7E2EA]">{course.price}</div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#D7E2EA] px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-[#070B26] transition-transform hover:scale-[1.04]"
              >
                Enroll →
              </Link>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-14 flex justify-center sm:mt-20">
        <Link
          to="/contact"
          className="inline-flex items-center gap-3 rounded-full border-2 border-[#D7E2EA]/30 px-8 py-4 font-medium uppercase tracking-wider text-[#D7E2EA] transition-colors hover:border-[#D7E2EA] hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-5"
        >
          Request a custom course →
        </Link>
      </div>
    </section>
  );
}
