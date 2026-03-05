"use client";

import { useState } from "react";
import { useIdentities } from "@/hooks/useApi";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useIdentities(page);

  const columns = [
    { key: "first_name", label: "Prénom" },
    { key: "last_name",  label: "Nom" },
    { key: "email",      label: "Email" },
    {
      key: "roles",
      label: "Rôles",
      render: (val: unknown) =>
        Array.isArray(val)
          ? <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{val.map((r) => <Badge key={r} variant="brand">{r}</Badge>)}</div>
          : "—",
    },
    {
      key: "created_at",
      label: "Inscription",
      render: (val: unknown) => (
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <Search size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un patient…"
            style={{
              width: "100%",
              paddingLeft: "34px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "0.82rem",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>
        {data?.meta && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
            {data.meta.total} patient(s)
          </span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
        emptyMessage="Aucun patient trouvé"
      />

      {data?.meta && data.meta.last_page > 1 && (
        <Pagination page={page} lastPage={data.meta.last_page} onChange={setPage} />
      )}
    </div>
  );
}
