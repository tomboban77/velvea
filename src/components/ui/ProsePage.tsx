import { PageHeader } from "./PageHeader";

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
    <div>
      <PageHeader eyebrow={eyebrow} title={title} lede={intro} />
      <div className="container-x py-12 lg:py-16">
        <div className="prose prose-velvea max-w-3xl prose-headings:font-display prose-h2:text-2xl prose-p:leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
