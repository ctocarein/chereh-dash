import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: PaginationProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-3)" }}>
      <span>Page {page} sur {lastPage}</span>
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: "7px",
            color: page === 1 ? "var(--text-3)" : "var(--text)",
            fontSize: "0.78rem",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={13} /> Précédent
        </button>
        <button
          onClick={() => onChange(Math.min(lastPage, page + 1))}
          disabled={page === lastPage}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "5px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: "7px",
            color: page === lastPage ? "var(--text-3)" : "var(--text)",
            fontSize: "0.78rem",
            cursor: page === lastPage ? "not-allowed" : "pointer",
            opacity: page === lastPage ? 0.5 : 1,
          }}
        >
          Suivant <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
