import Link from "next/link";
import type { PaginatedResult } from "@/lib/pagination";

type PaginationControlsProps = {
  pagination: Pick<PaginatedResult<unknown>, "page" | "pageCount" | "total">;
  basePath: string;
  pageParam?: string;
  query?: URLSearchParams;
};

function pageHref(
  basePath: string,
  query: URLSearchParams,
  page: number,
  pageParam: string,
) {
  const nextQuery = new URLSearchParams(query);

  if (page <= 1) {
    nextQuery.delete(pageParam);
  } else {
    nextQuery.set(pageParam, String(page));
  }

  const serialized = nextQuery.toString();

  return serialized ? `${basePath}?${serialized}` : basePath;
}

export function PaginationControls({
  pagination,
  basePath,
  pageParam = "pagina",
  query,
}: PaginationControlsProps) {
  if (pagination.pageCount <= 1 && pagination.total === 0) {
    return null;
  }

  const params = query ?? new URLSearchParams();
  const hasPrevious = pagination.page > 1;
  const hasNext = pagination.page < pagination.pageCount;

  return (
    <nav className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-black p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="font-semibold text-zinc-400">
        Pagina {pagination.page} de {pagination.pageCount} - {pagination.total}{" "}
        registros
      </p>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Link
            href={pageHref(basePath, params, pagination.page - 1, pageParam)}
            className="rounded-md border border-white/10 px-3 py-2 font-bold text-zinc-200 transition hover:border-lime-300 hover:text-lime-200"
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded-md border border-white/5 px-3 py-2 font-bold text-zinc-700">
            Anterior
          </span>
        )}
        {hasNext ? (
          <Link
            href={pageHref(basePath, params, pagination.page + 1, pageParam)}
            className="rounded-md border border-white/10 px-3 py-2 font-bold text-zinc-200 transition hover:border-lime-300 hover:text-lime-200"
          >
            Siguiente
          </Link>
        ) : (
          <span className="rounded-md border border-white/5 px-3 py-2 font-bold text-zinc-700">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
