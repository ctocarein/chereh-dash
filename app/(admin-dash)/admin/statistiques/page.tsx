"use client";

import { useAdminSessions, useQuestions, useReferrals } from "@/hooks/useApi";
import { StatCard } from "@/components/ui/StatCard";
import { ClipboardList, BookOpen, Share2, CheckCircle, XCircle, Clock, Activity } from "lucide-react";

export default function StatistiquesPage() {
  const { data: sessions } = useAdminSessions();
  const { data: questions } = useQuestions();
  const { data: referrals } = useReferrals();

  const referralArray = Array.isArray(referrals) ? referrals : [];
  const sessionData = sessions?.data ?? [];

  const completed  = sessionData.filter((s) => s.status === "completed").length;
  const cancelled  = sessionData.filter((s) => s.status === "cancelled").length;
  const active     = sessionData.filter((s) => s.status === "pending" || s.status === "in_progress").length;
  const withScore  = sessionData.filter((s) => s.score !== null);
  const avgScore   = withScore.length > 0
    ? (withScore.reduce((a, s) => a + (s.score ?? 0), 0) / withScore.length).toFixed(1)
    : "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      <Section title="Sessions d'évaluation">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
          <StatCard title="Total sessions"        value={sessions?.meta?.total ?? "—"} icon={ClipboardList} color="blue" />
          <StatCard title="Terminées"             value={completed}                    icon={CheckCircle}   color="teal" />
          <StatCard title="En cours / En attente" value={active}                       icon={Clock}         color="amber" />
          <StatCard title="Annulées"              value={cancelled}                    icon={XCircle}       color="red" />
        </div>
      </Section>

      <Section title="Score moyen de risque">
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--brand-dim)",
              border: "2px solid var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--brand)",
              flexShrink: 0,
            }}
          >
            {avgScore}
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>
              Score de risque moyen
            </p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
              Calculé sur {withScore.length} session(s) avec score
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Complétées", value: completed, color: "var(--success)" },
              { label: "Actives",    value: active,    color: "var(--brand)" },
              { label: "Annulées",   value: cancelled, color: "var(--danger)" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)", minWidth: 80 }}>{item.label}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Questionnaires">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
          <StatCard title="Questions totales" value={questions?.meta?.total ?? "—"} icon={BookOpen}   color="blue" />
          <StatCard title="Questions actives" value={questions?.data?.filter((q) => q.is_active).length ?? "—"} icon={Activity} color="teal" />
        </div>
      </Section>

      <Section title="Referrals ambassadeurs">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          <StatCard title="Total referrals"    value={referralArray.length}                                    icon={Share2}      color="indigo" />
          <StatCard title="Referrals utilisés" value={referralArray.filter((r) => r.status === "used").length} icon={CheckCircle} color="teal" />
          <StatCard title="Referrals expirés"  value={referralArray.filter((r) => r.status === "expired").length} icon={XCircle} color="red" />
        </div>
      </Section>

    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}
