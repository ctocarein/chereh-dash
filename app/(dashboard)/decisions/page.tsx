"use client";

import { useState } from "react";
import { useOrgDecisions, useOrgDecisionStats } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Brain, AlertTriangle, CheckCircle, TrendingUp, ShieldAlert, Filter } from "lucide-react";

interface DecisionInsight {
  id: number;
  identity_id: string;
  evaluation_session_id: number;
  risk_score: number | null;
  risk_level: string | null;
  confidence_score: number | null;
  suggested_action: string | null;
  requires_human_validation: boolean;
  final_decision: Record<string, unknown> | null;
  explanations: Array<{ key: string; label: string; weight: number }> | null;
  created_at: string;
  session?: { public_id: string; status: string; started_at: string | null };
}

interface DecisionStats {
  total: number;
  requires_validation: number;
  avg_confidence: number;
  avg_risk_score: number;
  risk_distribution: Array<{ risk_level: string; count: number; avg_score: number }>;
  suggested_actions: Record<string, number>;
}

const riskCfg: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  low:      { label: "Faible",   variant: "success" },
  moderate: { label: "Modéré",   variant: "info"    },
  high:     { label: "Élevé",    variant: "warning" },
  critical: { label: "Critique", variant: "danger"  },
};

const riskColors: Record<string, string> = {
  low: "#10B981", moderate: "#F59E0B", high: "#EF4444", critical: "#DC2626",
};

function ScoreCircle({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct  = Math.min(100, (value / max) * 100);
  const r    = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
      <circle
        cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {Math.round(value)}
      </text>
    </svg>
  );
}

export default function DecisionsPage() {
  const [page, setPage]       = useState(1);
  const [riskFilter, setRisk] = useState("");

  const { data: statsData, isLoading: statsLoading } = useOrgDecisionStats();
  const { data, isLoading }                           = useOrgDecisions(page, riskFilter);

  const stats    = statsData as DecisionStats | undefined;
  const insights = (data?.data ?? []) as DecisionInsight[];
  const meta     = data?.meta;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Décisions totales",     value: stats?.total              ?? "—", icon: Brain,       color: "var(--brand)",   bg: "var(--brand-dim)"       },
          { label: "Validations requises",  value: stats?.requires_validation ?? "—", icon: ShieldAlert, color: "var(--danger)",  bg: "rgba(239,68,68,0.1)"    },
          { label: "Score risque moyen",    value: stats?.avg_risk_score      ?? "—", icon: TrendingUp,  color: "var(--warning)", bg: "rgba(245,158,11,0.1)"   },
          { label: "Confiance moyenne",     value: stats?.avg_confidence != null ? `${Math.round(stats.avg_confidence * 100)}%` : "—", icon: CheckCircle, color: "var(--success)", bg: "rgba(16,185,129,0.1)" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <kpi.icon size={15} color={kpi.color} />
            </div>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0, fontWeight: 500 }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Risk distribution */}
      {stats && stats.risk_distribution.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", margin: "0 0 16px" }}>Distribution des décisions par niveau de risque</p>
          <div style={{ display: "flex", gap: 12 }}>
            {stats.risk_distribution.map((r) => {
              const color = riskColors[r.risk_level] ?? "var(--text-3)";
              const maxCount = Math.max(...stats.risk_distribution.map((x) => x.count));
              return (
                <div key={r.risk_level} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <ScoreCircle value={r.avg_score} color={color} />
                  <div style={{ width: "100%", background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", height: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ background: color, height: `${maxCount > 0 ? (r.count / maxCount) * 100 : 0}%`, borderRadius: 4, transition: "height 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>
                    {riskCfg[r.risk_level]?.label ?? r.risk_level}
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{r.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Filter size={13} color="var(--text-3)" />
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 600 }}>Risque :</span>
        {["", "low", "moderate", "high", "critical"].map((r) => {
          const cfg = r ? riskCfg[r] : null;
          const isActive = riskFilter === r;
          return (
            <button key={r || "all"} onClick={() => { setRisk(r); setPage(1); }} style={{ padding: "4px 12px", borderRadius: 99, border: "1px solid", borderColor: isActive ? "var(--brand)" : "var(--border-2)", background: isActive ? "var(--brand-dim)" : "transparent", color: isActive ? "var(--brand)" : "var(--text-3)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
              {cfg ? cfg.label : "Tous"}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Session", "Risque", "Score", "Confiance", "Action suggérée", "Validation"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "65%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : insights.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Brain size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucune décision pour le moment</p>
          </div>
        ) : (
          insights.map((ins) => {
            const riskBadge = ins.risk_level ? riskCfg[ins.risk_level] : null;
            const confPct   = ins.confidence_score != null ? Math.round(ins.confidence_score * 100) : null;
            return (
              <div key={ins.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                {/* Session */}
                <div>
                  <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 6px", borderRadius: 4 }}>
                    {ins.session?.public_id?.slice(0, 12) ?? `#${ins.evaluation_session_id}`}…
                  </span>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-3)", margin: "2px 0 0" }}>{formatDate(ins.created_at)}</p>
                </div>

                {/* Risk */}
                {riskBadge
                  ? <Badge variant={riskBadge.variant}>{riskBadge.label}</Badge>
                  : <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>—</span>}

                {/* Score */}
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: ins.risk_level ? (riskColors[ins.risk_level] ?? "var(--text)") : "var(--text)" }}>
                  {ins.risk_score != null ? ins.risk_score.toFixed(1) : "—"}
                </span>

                {/* Confidence */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {confPct != null ? (
                    <>
                      <div style={{ width: 40, height: 4, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${confPct}%`, background: confPct >= 70 ? "#10B981" : confPct >= 40 ? "#F59E0B" : "#EF4444", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-2)", fontWeight: 600 }}>{confPct}%</span>
                    </>
                  ) : <span style={{ color: "var(--text-3)", fontSize: "0.75rem" }}>—</span>}
                </div>

                {/* Suggested action */}
                <span style={{ fontSize: "0.72rem", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ins.suggested_action ?? "—"}
                </span>

                {/* Validation */}
                {ins.requires_human_validation ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#EF4444" }}>
                    <AlertTriangle size={12} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Requise</span>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#10B981" }}>
                    <CheckCircle size={12} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>OK</span>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>Page {meta.current_page} / {meta.last_page} · {meta.total} décisions</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>Préc.</button>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} style={pageBtn}>Suiv.</button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};
