"use client";

import { Users, Share2, ClipboardList, ArrowRight, TrendingUp, Activity, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAdminSessions, useReferrals, useAmbassadorMetrics } from "@/hooks/useApi";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { EvaluationSession } from "@/types";

const quickLinks = [
  { label: "Mes patients",          href: "/patients",     desc: "Patients référés par mon organisation" },
  { label: "Mes évaluations",       href: "/evaluations",  desc: "Sessions en cours et terminées" },
  { label: "Mes ambassadeurs",      href: "/ambassadeurs", desc: "Réseau de referrals actifs" },
  { label: "Mon organisation",      href: "/organisation", desc: "Paramètres et informations" },
];

const sessionStatusMap: Record<EvaluationSession["status"], { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  completed:   { label: "Terminée",   variant: "success" },
  in_progress: { label: "En cours",   variant: "info" },
  pending:     { label: "En attente", variant: "warning" },
  cancelled:   { label: "Annulée",    variant: "danger" },
};

export default function OrgDashboardPage() {
  const { data: sessions }   = useAdminSessions();
  const { data: referrals }  = useReferrals();
  const { data: metrics }    = useAmbassadorMetrics();
  const { identity }         = useAuthStore();

  const referralArray = Array.isArray(referrals) ? referrals : [];
  const firstName     = identity?._email?.split("@")[0] ?? null;
  const orgName       = null; // organization name not provided by API (only organization_id)

  const kpis = [
    { label: "Évaluations",  value: sessions?.meta?.total  ?? "—", icon: ClipboardList, color: "var(--brand)",   bg: "var(--brand-dim)",     trend: null },
    { label: "Patients",     value: "—",                           icon: Users,         color: "var(--info)",    bg: "rgba(59,130,246,0.10)", trend: null },
    { label: "Referrals",    value: referralArray.length,          icon: Share2,        color: "var(--warning)", bg: "rgba(245,158,11,0.10)", trend: "+8%" },
    { label: "Ambassadeurs", value: metrics?.total_ambassadors ?? "—", icon: Building2, color: "var(--accent)",  bg: "var(--accent-dim)",    trend: null },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Hero ── */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          overflow: "hidden",
          position: "relative",
          display: "grid",
          gridTemplateColumns: "1fr auto",
        }}
      >
        <div aria-hidden style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Left text */}
        <div style={{ padding: "28px 32px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: "99px", padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, color: "var(--brand)", marginBottom: "12px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--brand)" }} />
            {orgName ?? "Espace partenaire"}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "6px", lineHeight: 1.2 }}>
            Bienvenue{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "20px" }}>
            Tableau de bord OrgManager · Suivez vos patients et votre réseau
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/patients">
              <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "var(--brand)", border: "none", borderRadius: "8px", color: "#0A0B0F", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                Voir mes patients <ArrowRight size={14} />
              </button>
            </Link>
            <Link href="/evaluations">
              <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-2)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                Évaluations
              </button>
            </Link>
          </div>
        </div>

        {/* Right – inline stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            borderLeft: "1px solid var(--border)",
            position: "relative",
            zIndex: 1,
            minWidth: "300px",
          }}
        >
          {[
            { label: "Évaluations",  value: sessions?.meta?.total  ?? "—", color: "var(--brand)"   },
            { label: "Patients",     value: "—",                           color: "var(--info)"    },
            { label: "Referrals",    value: referralArray.length,          color: "var(--warning)" },
            { label: "Ambassadeurs", value: metrics?.total_ambassadors ?? "—", color: "var(--accent)"  },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "var(--surface)", padding: "18px 22px" }}>
              <p style={{ fontSize: "1.7rem", fontWeight: 800, color: stat.color, letterSpacing: "-0.04em", margin: 0, lineHeight: 1 }}>
                {stat.value}
              </p>
              <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: "5px 0 0", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "9px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={16} color={kpi.color} />
              </div>
              {kpi.trend && (
                <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "0.7rem", fontWeight: 600, color: "var(--success)" }}>
                  <TrendingUp size={11} /> {kpi.trend}
                </span>
              )}
            </div>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", margin: "0 0 4px", lineHeight: 1 }}>
              {kpi.value}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-3)", margin: 0, fontWeight: 500 }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── 2-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "14px" }}>

        {/* Sessions récentes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={14} color="var(--brand)" />
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>Évaluations récentes</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0 }}>{sessions?.meta?.total ?? 0} au total</p>
              </div>
            </div>
            <Link href="/evaluations" style={{ fontSize: "0.72rem", color: "var(--brand)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none", fontWeight: 500 }}>
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>

          {sessions?.data?.length ? (
            sessions.data.slice(0, 6).map((s: EvaluationSession, i: number) => {
              const cfg = sessionStatusMap[s.status] ?? { label: s.status, variant: "default" as const };
              return (
                <div key={s.uuid ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "var(--text-2)" }}>{s.uuid?.slice(0, 14) ?? "—"}…</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{formatDate(s.created_at)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {s.score !== null && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                        {s.score}
                      </span>
                    )}
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ padding: "40px 20px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-3)" }}>
              Aucune évaluation pour le moment
            </p>
          )}
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 2px 8px" }}>
            <TrendingUp size={13} color="var(--text-3)" />
            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Accès rapides
            </span>
          </div>
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", textDecoration: "none", transition: "border-color 0.15s" }}
              className="group"
            >
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: "2px 0 0" }}>{item.desc}</p>
              </div>
              <ArrowRight size={13} color="var(--text-3)" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
