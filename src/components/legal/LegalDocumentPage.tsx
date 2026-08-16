type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
  list?: readonly string[];
  email?: string;
  website?: string;
};

type LegalDocument = {
  title: string;
  updated: string;
  sections: readonly LegalSection[];
};

const BG = "#121212";
const BORDER = "rgba(255, 255, 255, 0.12)";
const MUTED = "rgba(255, 255, 255, 0.45)";
const BODY = "rgba(255, 255, 255, 0.82)";

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <main
      className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14"
      style={{ fontFamily: "'Inter', sans-serif", color: "#fff" }}
    >
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[2.25rem] sm:leading-tight">
        {document.title}
      </h1>
      <p className="mt-3 text-sm" style={{ color: MUTED }}>
        Last updated: {document.updated}
      </p>

      <hr className="my-8 border-0" style={{ borderTop: `1px solid ${BORDER}` }} />

      <p className="mb-2 text-base font-semibold text-white">{document.title} — Solver Company</p>
      <p className="mb-6 text-sm" style={{ color: MUTED }}>
        Last updated: {document.updated}
      </p>

      <hr className="mb-10 border-0" style={{ borderTop: `1px solid ${BORDER}` }} />

      <div className="flex flex-col gap-10">
        {document.sections.map((section, index) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-lg font-bold text-white">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p} className="mb-4 text-[15px] leading-[1.75]" style={{ color: BODY }}>
                {p}
              </p>
            ))}
            {section.list ? (
              <ul
                className="mb-4 list-disc space-y-2 pl-5 text-[15px] leading-[1.75]"
                style={{ color: BODY }}
              >
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.email ? (
              <p className="text-[15px] leading-[1.75]" style={{ color: BODY }}>
                Email:{" "}
                <a
                  href={`mailto:${section.email}`}
                  className="text-white underline-offset-2 hover:underline"
                >
                  {section.email}
                </a>
              </p>
            ) : null}
            {section.website ? (
              <p className="text-[15px] leading-[1.75]" style={{ color: BODY }}>
                Website:{" "}
                <a
                  href={`https://${section.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline-offset-2 hover:underline"
                >
                  {section.website}
                </a>
              </p>
            ) : null}
            {index < document.sections.length - 1 ? (
              <hr className="mt-10 border-0" style={{ borderTop: `1px solid ${BORDER}` }} />
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
