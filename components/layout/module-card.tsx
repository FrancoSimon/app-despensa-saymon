import Link from "next/link";

type ModuleCardProps = {
  title: string;
  description: string;
  href?: string;
  meta?: string;
};

export function ModuleCard({ title, description, href, meta }: ModuleCardProps) {
  const content = (
    <article className="rounded-lg border border-white/10 bg-black p-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {meta ? (
          <span className="rounded-full bg-lime-300 px-2.5 py-1 text-xs font-black text-black">
            {meta}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      {content}
    </Link>
  );
}
