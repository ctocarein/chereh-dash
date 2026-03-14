"use client";

import {
  Users, Share2, ClipboardList, ArrowRight,
  Activity, Stethoscope, MapPin, MessageCircle, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAdminSessions, useReferrals, useAmbassadorMetrics } from "@/hooks/useApi";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { EvaluationSession } from "@/types";

const sessionStatusMap: Record<EvaluationSession["status"], { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  completed:   { label: "Terminée",   variant: "success" },
  in_progress: { label: "En cours",   variant: "info"    },
  pending:     { label: "En attente", variant: "warning"  },
  cancelled:   { label: "Annulée",    variant: "danger"   },
};

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

function todayLabel() {
  const d = new Date();
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function OrgDashboardPage() {
  const { data: sessions }  = useAdminSessions();
  const { data: referrals } = useReferrals();
  const { data: metrics }   = useAmbassadorMetrics();
  const { identity }        = useAuthStore();

  const referralArray  = Array.isArray(referrals) ? referrals : [];
  const firstName      = identity?._email?.split("@")[0] ?? null;
  const totalSessions  = sessions?.meta?.total ?? 0;
  const completedCount = sessions?.data?.filter((s: EvaluationSession) => s.status === "completed").length ?? 0;
  const completionPct  = totalSessions > 0 ? Math.round((completedCount / Math.min(totalSessions, sessions?.data?.length ?? 1)) * 100) : 0;

  const recentSessions: EvaluationSession[] = sessions?.data?.slice(0, 5) ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>

      {/* ── 1. Greeting ── */}
      <div className="fade-up" style={{ animationDelay: "0ms", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500, marginBottom: "4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {todayLabel()}
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", lineHeight: 1.1, margin: 0 }}>
            Bonjour{firstName ? `, ${firstName}` : ""}&nbsp;👋
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "6px" }}>
            Voici un aperçu de votre activité aujourd'hui.
          </p>
        </div>

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "99px", flexShrink: 0, marginTop: "4px" }}>
          <span className="pulse-dot" style={{ width: 7, height: 7, background: "var(--success)", display: "inline-block" }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-2)" }}>Système actif</span>
        </div>
      </div>

      {/* ── 2. Hero CTA ── */}
      <div
        className="fade-up lift-card"
        style={{
          animationDelay: "60ms",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          padding: "28px 32px",
        }}
      >
        {/* Glow orbs */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "16px" }}>
          <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 65%)" }} />
          <div style={{ position: "absolute", left: -40, bottom: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Label pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: "99px", padding: "3px 11px", fontSize: "0.68rem", fontWeight: 700, color: "var(--brand)", marginBottom: "14px", letterSpacing: "0.03em", textTransform: "uppercase" }}>
            <Stethoscope size={10} />
            Action principale
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
                Évaluez vos symptômes
              </h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "0 0 20px", lineHeight: 1.5 }}>
                Démarrez une nouvelle session de triage ou suivez les bilans en cours.
              </p>

              {/* Progress bar */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 500 }}>Taux de complétion</span>
                  <span style={{ fontSize: "0.68rem", color: "var(--brand)", fontWeight: 700 }}>{completionPct}%</span>
                </div>
                <div style={{ height: "5px", background: "var(--surface-3)", borderRadius: "99px", overflow: "hidden" }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, var(--brand), #6366F1)",
                      borderRadius: "99px",
                      "--fill-w": `${completionPct}%`,
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link href="/triage">
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 18px", background: "var(--brand)", border: "none", borderRadius: "9px", color: "#0A0B0F", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
                    <Zap size={13} /> Nouveau triage
                  </button>
                </Link>
                <Link href="/evaluations">
                  <button style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 16px", background: "transparent", border: "1px solid var(--border-2)", borderRadius: "9px", color: "var(--text-2)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                    Voir les bilans <ArrowRight size={13} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Inline mini stats */}
            <div style={{ display: "flex", gap: "1px", background: "var(--border)", borderRadius: "12px", overflow: "hidden", flexShrink: 0 }}>
              {[
                { label: "Évaluations",  value: totalSessions,                         color: "var(--brand)",   icon: ClipboardList },
                { label: "Referrals",    value: referralArray.length,                  color: "var(--warning)", icon: Share2        },
                { label: "Ambassadeurs", value: metrics?.total_ambassadors ?? "—",     color: "var(--accent)",  icon: Users         },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--surface)", padding: "18px 22px", minWidth: "90px", textAlign: "center" }}>
                  <s.icon size={14} color={s.color} style={{ marginBottom: "8px" }} />
                  <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, letterSpacing: "-0.04em", margin: "0 0 3px", lineHeight: 1 }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: "0.62rem", color: "var(--text-3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bilans récents ── */}
      <div className="fade-up" style={{ animationDelay: "120ms" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={13} color="var(--text-3)" />
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Bilans récents
            </span>
          </div>
          <Link href="/evaluations" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
            Tout voir <ArrowRight size={11} />
          </Link>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          {recentSessions.length ? (
            recentSessions.map((s, i) => {
              const cfg = sessionStatusMap[s.status] ?? { label: s.status, variant: "default" as const };
              return (
                <div
                  key={s.uuid ?? i}
                  className="fade-in lift-card"
                  style={{
                    animationDelay: `${140 + i * 50}ms`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: i < recentSessions.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "default",
                  }}
                >
                  {/* Left — uuid + date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "9px", background: "var(--surface-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ClipboardList size={13} color="var(--text-3)" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.78rem", fontFamily: "monospace", color: "var(--text-2)", fontWeight: 600 }}>
                        {s.uuid?.slice(0, 16) ?? "—"}…
                      </span>
                      <p style={{ fontSize: "0.67rem", color: "var(--text-3)", margin: "2px 0 0" }}>{formatDate(s.created_at)}</p>
                    </div>
                  </div>

                  {/* Right — score + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {s.score !== null && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)", padding: "3px 10px", borderRadius: "7px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                        {s.score}
                      </span>
                    )}
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <ArrowRight size={12} color="var(--text-3)" />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: "48px 20px", textAlign: "center" }}>
              <ClipboardList size={28} color="var(--surface-3)" style={{ marginBottom: "10px" }} />
              <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0 }}>Aucun bilan pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Actions rapides ── */}
      <div className="fade-up" style={{ animationDelay: "200ms" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Actions rapides
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            {
              icon: MapPin,
              color: "var(--info)",
              bg: "rgba(59,130,246,0.12)",
              title: "Trouver un patient",
              desc: "Rechercher parmi vos patients référés",
              href: "/patients",
            },
            {
              icon: MessageCircle,
              color: "var(--accent)",
              bg: "var(--accent-dim)",
              title: "Parler à un ambassadeur",
              desc: "Gérer votre réseau de referrals actifs",
              href: "/ambassadeurs",
            },
            {
              icon: Users,
              color: "var(--warning)",
              bg: "rgba(245,158,11,0.12)",
              title: "Gérer les utilisateurs",
              desc: "Membres et accès de votre organisation",
              href: "/utilisateurs",
            },
            {
              icon: Activity,
              color: "var(--brand)",
              bg: "var(--brand-dim)",
              title: "Tableau de triage",
              desc: "Évaluations en attente de traitement",
              href: "/triage",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="action-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px 18px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                textDecoration: "none",
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon size={16} color={item.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: "2px 0 0" }}>{item.desc}</p>
              </div>
              <ArrowRight size={14} color="var(--text-3)" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
