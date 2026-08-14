import type { ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description ? (
        <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div>
      <div className="relative rounded-md border border-border px-4 pt-4 pb-2">
        <span className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground">
          {label}
        </span>
        {children}
      </div>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-transparent text-[17px] outline-none placeholder:text-muted-foreground"
    />
  );
}

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-xl border border-border p-10 text-center">
      <p className="text-[15px] text-muted-foreground">{title}</p>
    </div>
  );
}
