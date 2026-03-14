"use client";

import { useState } from "react";
import { useAdminSessions } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { ClipboardList, Filter, X } from "lucide-react";
import type { EvaluationSession } from "@/types";

const statusCfg: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" | "default" }> = {
  completed:   { label: "Terminée",   variant: "success" },
  in_progress: { label: "En cours",   variant: "info"    },
  pending:     { label: "En attente", variant: "warning" },
  cancelled:   { label: "Annulée",    variant: "danger"  },
};

const riskCfg: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: "Faible",   color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  moderate: { label: "Modéré",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  high:     { label: "Élevé",    color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
  critical: { label: "Critique", color: "#DC2626", bg: "rgba(220,38,38,0.1)"   },
};

export default function EvaluationsOrgPage() {
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatus] = useState("");
  const [selected, setSelected]   = useState<EvaluationSession | null>(null);

  const { data, isLoading, refetch } = useAdminSessions(page);
  const sessions = (data?.data ?? []).filter((s) => !statusFilter || s.status === statusFilter);
  const meta = data?.meta;

  async function handleCancel(uuid: string) {
    if (!confirm("Annuler cette session ?")) return;
    await apiClient.post(`/admin/sessions/${uuid}/cancel`);
    refetch();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Filters bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Filter size={13} color="var(--text-3)" />
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>Statut :</span>
        {["", "in_progress", "completed", "pending", "cancelled"].map((s) => {
          const cfg = s ? statusCfg[s] : null;
          const isActive = statusFilter === s;
          return (
            <button
              key={s || "all"}
              onClick={() => setStatus(s)}
              style={{
                padding: "4px 12px",
                borderRadius: 99,
                border: "1px solid",
                borderColor: isActive ? "var(--brand)" : "var(--border-2)",
                background: isActive ? "var(--brand-dim)" : "transparent",
                color: isActive ? "var(--brand)" : "var(--text-3)",
                fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              {cfg ? cfg.label : "Tous"}
            </button>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--text-3)" }}>
          {data?.meta?.total ?? 0} session(s)
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Session", "Statut", "Score", "Risque", "Démarrée", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "60%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : sessions.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <ClipboardList size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucune session trouvée</p>
          </div>
        ) : (
          sessions.map((s, i) => {
            const cfg  = statusCfg[s.status] ?? { label: s.status, variant: "default" as const };
            const risk = s.risk_zone ? riskCfg[s.risk_zone] : null;
            return (
              <div
                key={s.uuid ?? i}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer" }}
                onClick={() => setSelected(s)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 7px", borderRadius: 4, width: "fit-content" }}>
                  {s.uuid?.slice(0, 14) ?? "—"}…
                </span>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
                  {s.score != null ? s.score : "—"}
                </span>
                {risk ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: risk.bg, color: risk.color, fontSize: "0.7rem", fontWeight: 600, width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: risk.color }} />
                    {risk.label}
                  </span>
                ) : <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>—</span>}
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(s.started_at ?? "")}</span>
                <div onClick={(e) => e.stopPropagation()}>
                  {s.status !== "cancelled" && s.status !== "completed" ? (
                    <button
                      onClick={() => handleCancel(s.uuid)}
                      style={{ fontSize: "0.72rem", color: "var(--danger)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      Annuler
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>Page {meta.current_page} / {meta.last_page} · {meta.total} sessions</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>Préc.</button>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} style={pageBtn}>Suiv.</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: 480, maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClipboardList size={16} color="var(--brand)" />
                </div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Détail de la session</p>
                  <p style={{ fontSize: "0.68rem", fontFamily: "monospace", color: "var(--text-3)", margin: 0 }}>{selected.uuid}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)" }}><X size={18} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Statut",          value: statusCfg[selected.status]?.label ?? selected.status },
                { label: "Score",           value: selected.score != null ? String(selected.score) : "—" },
                { label: "Zone de risque",  value: selected.risk_zone ? (riskCfg[selected.risk_zone]?.label ?? selected.risk_zone) : "—" },
                { label: "Démarrée le",     value: formatDate(selected.started_at ?? "") },
                { label: "Terminée le",     value: formatDate(selected.completed_at ?? "") },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};
