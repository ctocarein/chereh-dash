"use client";

import { useOrgTriageStats } from "@/hooks/useApi";
import { Activity, MapPin, Users, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

interface TriageStats {
  profiles_total: number;
  cancer_types: {
    breast: number;
    ovarian: number;
    cervical: number;
    other: number;
    none: number;
  };
  age_groups: {
    "<18": number;
    "18-35": number;
    "36-50": number;
    "51-65": number;
    ">65": number;
  };
  communes: Array<{ commune: string; count: number }>;
  risk_levels: Record<string, number>;
  sessions: {
    total: number;
    completed: number;
    in_progress: number;
    cancelled: number;
  };
  avg_score: number | null;
}

const cancerLabels: Array<{ key: keyof TriageStats["cancer_types"]; label: string; color: string; bg: string }> = [
  { key: "breast",   label: "Cancer du sein",   color: "#EF4444", bg: "rgba(239,68,68,0.12)"  },
  { key: "ovarian",  label: "Cancer ovarien",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  { key: "cervical", label: "Cancer du col",    color: "#8B5CF6", bg: "rgba(139,92,246,0.12)"  },
  { key: "other",    label: "Autre type",       color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
  { key: "none",     label: "Aucun antécédent", color: "#10B981", bg: "rgba(16,185,129,0.12)"  },
];

const riskColors: Record<string, { color: string; bg: string; label: string }> = {
  low:      { color: "#10B981", bg: "rgba(16,185,129,0.15)",  label: "Faible"   },
  moderate: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)",  label: "Modéré"   },
  high:     { color: "#EF4444", bg: "rgba(239,68,68,0.15)",   label: "Élevé"    },
  critical: { color: "#DC2626", bg: "rgba(220,38,38,0.15)",   label: "Critique" },
};

const ageOrder = ["<18", "18-35", "36-50", "51-65", ">65"] as const;

function Bar({ value, max, color, bg }: { value: number; max: number; color: string; bg: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 6, width: "100%", background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

export default function TriagePage() {
  const { data, isLoading } = useOrgTriageStats();
  const stats = data as TriageStats | undefined;

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 180, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  if (!stats) return null;

  const cancerMax = Math.max(...cancerLabels.map((c) => stats.cancer_types[c.key]));
  const ageMax    = Math.max(...ageOrder.map((k) => stats.age_groups[k] ?? 0));
  const riskTotal = Object.values(stats.risk_levels).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Profils patients",    value: stats.profiles_total,       icon: Users,        color: "var(--brand)",   bg: "var(--brand-dim)"       },
          { label: "Sessions totales",    value: stats.sessions.total,       icon: Activity,     color: "var(--info)",    bg: "rgba(59,130,246,0.1)"   },
          { label: "Sessions terminées",  value: stats.sessions.completed,   icon: CheckCircle,  color: "var(--success)", bg: "rgba(16,185,129,0.1)"   },
          { label: "Score moyen",         value: stats.avg_score ?? "—",     icon: TrendingUp,   color: "var(--warning)", bg: "rgba(245,158,11,0.1)"   },
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

      {/* 2-col: Cancer types + Risk levels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Cancer types */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <AlertTriangle size={14} color="var(--danger)" />
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Répartition par type de cancer</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cancerLabels.map(({ key, label, color, bg }) => {
              const val = stats.cancer_types[key];
              const pct = stats.profiles_total > 0 ? ((val / stats.profiles_total) * 100).toFixed(1) : "0.0";
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "1px 7px", borderRadius: 99, background: bg, color, fontSize: "0.68rem", fontWeight: 700 }}>{pct}%</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)", minWidth: 24, textAlign: "right" }}>{val}</span>
                    </div>
                  </div>
                  <Bar value={val} max={cancerMax || 1} color={color} bg={bg} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk levels */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Activity size={14} color="var(--brand)" />
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Distribution des niveaux de risque</p>
          </div>
          {riskTotal === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-3)", textAlign: "center", padding: "24px 0" }}>Aucune évaluation complétée</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(riskColors).map(([key, cfg]) => {
                const val = stats.risk_levels[key] ?? 0;
                const pct = riskTotal > 0 ? ((val / riskTotal) * 100).toFixed(1) : "0.0";
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.78rem", color: "var(--text-2)", fontWeight: 500 }}>{cfg.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ padding: "1px 7px", borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: "0.68rem", fontWeight: 700 }}>{pct}%</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-3)", minWidth: 24, textAlign: "right" }}>{val}</span>
                      </div>
                    </div>
                    <Bar value={val} max={riskTotal} color={cfg.color} bg={cfg.bg} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2-col: Age groups + Communes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Age groups */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Users size={14} color="var(--info)" />
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Répartition par tranche d'âge</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ageOrder.map((key) => {
              const val  = stats.age_groups[key] ?? 0;
              const pct  = ageMax > 0 ? Math.round((val / ageMax) * 100) : 0;
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-3)", minWidth: 40, textAlign: "right" }}>{key}</span>
                  <div style={{ flex: 1, height: 18, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{ height: "100%", width: `${ageMax > 0 ? (val / ageMax) * 100 : 0}%`, background: "var(--info)", borderRadius: 4, transition: "width 0.6s ease" }} />
                    {val > 0 && (
                      <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-2)" }}>
                        {val}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-3)", minWidth: 28, textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Communes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <MapPin size={14} color="var(--accent)" />
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Cartographie par commune</p>
          </div>
          {stats.communes.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-3)", textAlign: "center", padding: "24px 0" }}>Aucune donnée de localisation</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
              {stats.communes.map((c, i) => {
                const maxCount = stats.communes[0]?.count ?? 1;
                const pct = Math.round((c.count / maxCount) * 100);
                return (
                  <div key={c.commune} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)", minWidth: 18 }}>#{i + 1}</span>
                    <span style={{ flex: 1, fontSize: "0.78rem", color: "var(--text-2)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.commune}</span>
                    <div style={{ width: 80, height: 6, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text)", minWidth: 22, textAlign: "right" }}>{c.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }
      `}</style>
    </div>
  );
}
