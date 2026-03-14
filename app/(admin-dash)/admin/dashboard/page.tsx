"use client";

import { Users, Share2, ClipboardList, BookOpen, ArrowRight, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { useAdminSessions, useQuestions, useReferrals } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { EvaluationSession } from "@/types";

const quickLinks = [
  { label: "Gérer les questions",    href: "/admin/questionnaires",  desc: "Catalogue & blocs thématiques" },
  { label: "Voir les évaluations",   href: "/admin/evaluations",     desc: "Sessions patients en cours" },
  { label: "Ambassadeurs actifs",    href: "/admin/ambassadeurs",    desc: "Referrals & niveaux" },
  { label: "Modèles de risque",      href: "/admin/decisions",       desc: "Scoring & versions" },
];

const sessionStatusMap: Record<EvaluationSession["status"], { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  completed:   { label: "Terminée",   variant: "success" },
  in_progress: { label: "En cours",   variant: "info" },
  pending:     { label: "En attente", variant: "warning" },
  cancelled:   { label: "Annulée",    variant: "danger" },
};

export default function DashboardPage() {
  const { data: sessions }  = useAdminSessions();
  const { data: questions } = useQuestions();
  const { data: referrals } = useReferrals();

  const referralArray = Array.isArray(referrals) ? referrals : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Hero welcome */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div aria-hidden style={{ position: "absolute", right: -40, top: -40, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: "99px", padding: "3px 10px", fontSize: "0.68rem", fontWeight: 600, color: "var(--brand)", marginBottom: "12px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--brand)" }} />
            Plateforme active
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            Bienvenue sur Chereh Dash
          </h1>
          <p style={{ fontSize: "0.84rem", color: "var(--text-3)" }}>
            Supervision temps réel · Gestion des patients et évaluations médicales
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", zIndex: 1 }}>
          <Link href="/admin/patients">
            <button style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", background: "var(--brand)", border: "none", borderRadius: "8px", color: "#0A0B0F", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
              Voir les patients <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard title="Sessions d'évaluation" value={sessions?.meta?.total ?? "—"} icon={ClipboardList} color="blue"   />
        <StatCard title="Questions actives"     value={questions?.meta?.total ?? "—"} icon={BookOpen}     color="teal"   />
        <StatCard title="Referrals générés"     value={referralArray.length}          icon={Share2}       color="amber"  />
        <StatCard title="Patients"              value="—"                             icon={Users}        color="indigo" />
      </div>

      {/* 2-col */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>

        {/* Sessions récentes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Sessions récentes</p>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px" }}>{sessions?.meta?.total ?? 0} au total</p>
            </div>
            <Link href="/admin/evaluations" style={{ fontSize: "0.72rem", color: "var(--brand)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}>
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          <div>
            {sessions?.data?.length ? (
              sessions.data.slice(0, 6).map((s, i) => {
                const cfg = sessionStatusMap[s.status] ?? { label: s.status, variant: "default" as const };
                return (
                  <div key={s.uuid ?? i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "var(--text-2)" }}>{s.uuid?.slice(0, 12) ?? "—"}…</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>{formatDate(s.created_at)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {s.score !== null && (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-2)", background: "var(--surface-2)", padding: "2px 8px", borderRadius: "6px" }}>
                          {s.score}
                        </span>
                      )}
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ padding: "32px 20px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-3)" }}>Aucune session</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "0 4px 8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={14} color="var(--text-3)" />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Accès rapides</span>
          </div>
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}
              className="group"
            >
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px" }}>{item.desc}</p>
              </div>
              <ArrowRight size={13} color="var(--text-3)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
