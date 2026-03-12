"use client";

import { useState } from "react";
import { useAdminSessions } from "@/hooks/useApi";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import type { EvaluationSession } from "@/types";

const statusCfg: Record<EvaluationSession["status"], { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  completed:   { label: "Terminée",   variant: "success" },
  in_progress: { label: "En cours",   variant: "info" },
  pending:     { label: "En attente", variant: "warning" },
  cancelled:   { label: "Annulée",    variant: "danger" },
};

const riskZone: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: "Faible",    color: "#10B981", bg: "rgba(16,185,129,0.1)" },
  moderate: { label: "Modéré",    color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  high:     { label: "Élevé",     color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  critical: { label: "Critique",  color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
};

export default function EvaluationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminSessions(page);

  async function handleCancel(uuid: string) {
    if (!confirm("Annuler cette session ?")) return;
    await apiClient.post(`/admin/sessions/${uuid}/cancel`);
    refetch();
  }

  const columns = [
    {
      key: "uuid",
      label: "Session",
      render: (val: unknown) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 6px", borderRadius: "4px" }}>
          {(val as string).slice(0, 12)}…
        </span>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (val: unknown) => {
        const cfg = statusCfg[val as EvaluationSession["status"]] ?? { label: String(val), variant: "default" as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "score",
      label: "Score",
      render: (val: unknown) =>
        val !== null
          ? <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)" }}>{String(val)}</span>
          : <span style={{ color: "var(--text-3)" }}>—</span>,
    },
    {
      key: "risk_zone",
      label: "Zone",
      render: (val: unknown) => {
        if (!val) return <span style={{ color: "var(--text-3)" }}>—</span>;
        const z = riskZone[val as string];
        if (!z) return <span style={{ color: "var(--text-2)" }}>{String(val)}</span>;
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 8px", borderRadius: "99px", background: z.bg, color: z.color, fontSize: "0.7rem", fontWeight: 600 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: z.color }} />
            {z.label}
          </span>
        );
      },
    },
    {
      key: "started_at",
      label: "Démarré",
      render: (val: unknown) => <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
    {
      key: "completed_at",
      label: "Terminé",
      render: (val: unknown) => <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
    {
      key: "actions",
      label: "",
      width: "80px",
      render: (_: unknown, row: EvaluationSession) =>
        row.status !== "cancelled" && row.status !== "completed" ? (
          <button
            onClick={() => handleCancel(row.uuid)}
            style={{ fontSize: "0.72rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Annuler
          </button>
        ) : null,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
          {data?.meta?.total ?? 0} session(s) au total
        </p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        keyExtractor={(row) => row.uuid}
        emptyMessage="Aucune session trouvée"
      />

      {data?.meta && data.meta.last_page > 1 && (
        <Pagination page={page} lastPage={data.meta.last_page} onChange={setPage} />
      )}
    </div>
  );
}
