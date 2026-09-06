export function ProsePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-x max-w-3xl py-14">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="font-display text-4xl leading-tight balance sm:text-5xl">{title}</h1>
      {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
      <div className="prose prose-velvea mt-8 max-w-none prose-headings:font-display prose-h2:text-2xl">
        {children}
      </div>
    </div>
  );
}
