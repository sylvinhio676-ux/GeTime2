import React from "react";

function getPageRange(current, total) {
  const maxButtons = 5;
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + maxButtons - 1);
  if (end - start < maxButtons - 1) {
    start = Math.max(1, end - maxButtons + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(page, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border/60 bg-muted/40">
      <span className="text-xs font-semibold text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-card"
        >
          Précédent
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-bold border ${
              p === page
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-card"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-card"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
