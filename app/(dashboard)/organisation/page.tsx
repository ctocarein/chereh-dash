"use client";

import { useMyOrganization } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Building2, MapPin, Calendar, CheckCircle, XCircle,
  Users, ClipboardList, Zap, Globe, Palette,
} from "lucide-react";

const PLAN_CFG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  features: { icon: React.ReactNode; text: string; included: boolean }[];
}> = {
  Freemium: {
    label: "Freemium",
    color: "var(--text-2)",
    bg: "var(--surface-2)",
    border: "var(--border-2)",
    icon: <Zap size={16} />,
    features: [
      { icon: <ClipboardList size={13} />, text: "1 500 sessions d'évaluation",  included: true  },
      { icon: <Users size={13} />,         text: "500 patients maximum",          included: true  },
      { icon: <Globe size={13} />,         text: "Accès API",                     included: false },
      { icon: <Palette size={13} />,       text: "Personnalisation / Marque Blanche", included: false },
    ],
  },
  Premium: {
    label: "Premium",
    color: "var(--brand)",
    bg: "var(--brand-dim)",
    border: "rgba(20,184,166,0.35)",
    icon: <Zap size={16} />,
    features: [
      { icon: <ClipboardList size={13} />, text: "Sessions illimitées",           included: true  },
      { icon: <Users size={13} />,         text: "Patients illimités",            included: true  },
      { icon: <Globe size={13} />,         text: "Accès API",                     included: false },
      { icon: <Palette size={13} />,       text: "Personnalisation / Marque Blanche", included: false },
    ],
  },
  Entreprise: {
    label: "Entreprise / Marque Blanche",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    icon: <Zap size={16} />,
    features: [
      { icon: <ClipboardList size={13} />, text: "Sessions illimitées",           included: true  },
      { icon: <Users size={13} />,         text: "Patients illimités",            included: true  },
      { icon: <Globe size={13} />,         text: "Accès API",                     included: true  },
      { icon: <Palette size={13} />,       text: "Personnalisation / Marque Blanche", included: true  },
    ],
  },
};

export default function OrganisationPage() {
  const { data: org, isLoading } = useMyOrganization();

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[220, 160, 200].map((h, i) => (
          <div key={i} style={{ height: h, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, animation: "pulse 1.5s ease infinite" }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <Building2 size={32} color="var(--text-3)" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: "0.9rem", color: "var(--text-3)", margin: 0 }}>Aucune organisation trouvée.</p>
      </div>
    );
  }

  const plan   = PLAN_CFG[org.plan] ?? PLAN_CFG["Freemium"];
  const status = org.status === "active";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>

      {/* Profile card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Cover */}
        <div style={{ height: 80, background: `linear-gradient(135deg, var(--brand-dim) 0%, rgba(20,184,166,0.06) 100%)`, borderBottom: "1px solid var(--border)" }} />

        {/* Identity */}
        <div style={{ padding: "0 28px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -28, marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--surface)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
              <Building2 size={24} color="var(--brand)" />
            </div>
            <div style={{ paddingBottom: 4 }}>
              <h1 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>{org.name}</h1>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", margin: "2px 0 0" }}>{org.type ?? "Organisation"}</p>
            </div>
          </div>

          {/* Meta chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {/* Status */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: status ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${status ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"}`, fontSize: "0.72rem", fontWeight: 600, color: status ? "var(--success)" : "var(--danger)" }}>
              {status ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {status ? "Active" : "Inactive"}
            </span>

            {/* Plan badge */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: plan.bg, border: `1px solid ${plan.border}`, fontSize: "0.72rem", fontWeight: 600, color: plan.color }}>
              <Zap size={11} /> {plan.label}
            </span>

            {/* Location */}
            {(org.city || org.country) && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--text-3)" }}>
                <MapPin size={11} /> {[org.city, org.country].filter(Boolean).join(", ")}
              </span>
            )}

            {/* Created */}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--text-3)" }}>
              <Calendar size={11} /> Depuis {formatDate(org.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Settings section */}
      <Section title="Paramètres" icon={<Building2 size={13} color="var(--brand)" />}>
        <InfoRow label="Nom"          value={org.name}          />
        <InfoRow label="Type"         value={org.type ?? "—"}   />
        <InfoRow label="Adresse"      value={org.address ?? "—"} />
        <InfoRow label="Ville"        value={org.city ?? "—"}   />
        <InfoRow label="Pays"         value={org.country ?? "—"} />
        <InfoRow label="Statut"       value={status ? "Active" : "Inactive"} highlight={status ? "success" : "danger"} />
      </Section>

      {/* Plan section */}
      <Section title="Plan actuel" icon={<Zap size={13} color="var(--brand)" />}>
        {/* Plan header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: plan.bg, border: `1px solid ${plan.border}`, marginBottom: 4 }}>
          <div style={{ color: plan.color }}>{plan.icon}</div>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 800, color: plan.color, margin: 0 }}>{plan.label}</p>
            <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: "2px 0 0" }}>
              Plan actif de votre organisation
            </p>
          </div>
        </div>

        {/* Features list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {plan.features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: f.included ? "var(--success)" : "var(--text-3)" }}>
                {f.included ? <CheckCircle size={14} /> : <XCircle size={14} />}
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: f.included ? "var(--text)" : "var(--text-3)", fontSize: "0.78rem", fontWeight: f.included ? 500 : 400 }}>
                <span style={{ color: f.included ? "var(--text-3)" : "var(--text-3)" }}>{f.icon}</span>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* Upgrade hint for Freemium */}
        {org.plan === "Freemium" && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.25)", fontSize: "0.72rem", color: "var(--brand)" }}>
            Contactez votre administrateur pour passer à un plan supérieur.
          </div>
        )}
      </Section>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)" }}>
        {icon}
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "danger" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-3)", minWidth: 100 }}>{label}</span>
      <span style={{
        fontSize: "0.8rem", fontWeight: 500,
        color: highlight === "success" ? "var(--success)" : highlight === "danger" ? "var(--danger)" : "var(--text)",
      }}>
        {value}
      </span>
    </div>
  );
}
