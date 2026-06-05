"use client";

import type { BestSellerRow } from "@/lib/reports/types";

type CsvExportButtonProps = {
  rows: BestSellerRow[];
  fileName: string;
};

function escapeCsv(value: string | number) {
  const text = String(value);

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function CsvExportButton({ rows, fileName }: CsvExportButtonProps) {
  function downloadCsv() {
    const csv = [
      ["Producto", "Cantidad", "Total"],
      ...rows.map((row) => [row.productName, row.quantity, row.total]),
    ]
      .map((line) => line.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadCsv}
      disabled={rows.length === 0}
      className="rounded-md border border-white/15 px-3 py-2 text-xs font-black text-white transition hover:border-lime-300 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}
