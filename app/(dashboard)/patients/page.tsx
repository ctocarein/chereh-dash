"use client";

import { useState } from "react";
import { useOrgPatients } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Search, Users, X, Phone, Mail, MapPin, Calendar,
  HeartPulse, AlertTriangle, CheckCircle, User,
} from "lucide-react";

interface PatientPersonal {
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  age: number | null;
  commune: string | null;
  birth_date: string | null;
  education_level: string | null;
  occupation: string | null;
  cmu: boolean | null;
}

interface PatientMedical {
  has_breast_cancer: boolean;
  has_ovarian_cancer: boolean;
  has_cervical_cancer: boolean;
  has_other_cancer: boolean;
  blood_type: string | null;
  is_pregnant: boolean;
  family_cancer_history: boolean;
  last_screening_date: string | null;
  menopause_status: string | null;
  exposed_to_smoke: boolean;
  weight: number | null;
  height: number | null;
}

interface LastSession {
  uuid: string;
  status: string;
  score: number | null;
  risk_level: string | null;
  started_at: string | null;
}

interface PatientRow {
  id: string;
  status: string;
  created_at: string;
  _email: string | null;
  _phone: string | null;
  organization: { id: string; name: string } | null;
  personal: PatientPersonal | null;
  medical: PatientMedical | null;
  last_session: LastSession | null;
}

const riskCfg: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  low:      { label: "Faible",   variant: "success" },
  moderate: { label: "Modéré",   variant: "info"    },
  high:     { label: "Élevé",    variant: "warning" },
  critical: { label: "Critique", variant: "danger"  },
};

const cancerLabels: [keyof PatientMedical, string][] = [
  ["has_breast_cancer",   "Cancer du sein"],
  ["has_ovarian_cancer",  "Cancer ovarien"],
  ["has_cervical_cancer", "Cancer du col"],
  ["has_other_cancer",    "Autre cancer"],
];

const eduLabels: Record<string, string> = {
  none: "Aucun",
  primary: "Primaire",
  secondary: "Secondaire",
  university: "Universitaire",
};

const menopauseLabels: Record<string, string> = {
  pre: "Non ménopausée",
  post: "Ménopausée",
  unknown: "Inconnu",
};

// 8 colonnes : Patient | Téléphone | Âge / Naissance | Éducation / Occupation | CMU | Commune | Ménopause | Groupe sanguin
const COLS = "1.8fr 1fr 1.1fr 1.4fr 0.6fr 0.9fr 1.1fr 0.8fr";

export default function PatientsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<PatientRow | null>(null);

  const { data, isLoading } = useOrgPatients(page, debouncedSearch);
  const patients: PatientRow[] = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as { _st?: number })._st);
    (window as unknown as { _st?: number })._st = window.setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 400);
  }

  const fullName = (p: PatientRow) => {
    const fn = p.personal?.first_name ?? "";
    const ln = p.personal?.last_name  ?? "";
    return (fn + " " + ln).trim() || p._email || p.id.slice(0, 12);
  };

  const initials = (p: PatientRow) => {
    const fn = p.personal?.first_name?.[0] ?? "";
    const ln = p.personal?.last_name?.[0]  ?? "";
    return (fn + ln).toUpperCase() || (p._email?.[0] ?? "P").toUpperCase();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ position: "relative", flex: "0 0 300px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Nom, téléphone, commune…"
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>
        {meta && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
            {meta.total} patient(s)
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Patient", "Téléphone", "Âge / Né(e)", "Éducation / Métier", "CMU", "Commune", "Ménopause", "Sang"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: COLS, padding: "16px 20px", borderBottom: "1px solid var(--border)", gap: 0 }}>
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "60%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : patients.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Users size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucun patient trouvé</p>
          </div>
        ) : (
          patients.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{ display: "grid", gridTemplateColumns: COLS, padding: "11px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              {/* Patient */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                  {initials(p)}
                </div>
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{fullName(p)}</p>
                  <p style={{ fontSize: "0.63rem", color: "var(--text-3)", margin: 0 }}>{p._email ?? ""}</p>
                </div>
              </div>

              {/* Téléphone */}
              <span style={{ fontSize: "0.74rem", color: "var(--text-2)", fontFamily: "monospace" }}>
                {p._phone ?? "—"}
              </span>

              {/* Âge / Naissance */}
              <div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-2)", margin: 0 }}>
                  {p.personal?.age != null ? `${p.personal.age} ans` : "—"}
                </p>
                {p.personal?.birth_date && (
                  <p style={{ fontSize: "0.63rem", color: "var(--text-3)", margin: 0 }}>
                    {formatDate(p.personal.birth_date)}
                  </p>
                )}
              </div>

              {/* Éducation / Occupation */}
              <div>
                <p style={{ fontSize: "0.74rem", color: "var(--text-2)", margin: 0 }}>
                  {p.personal?.education_level
                    ? (eduLabels[p.personal.education_level] ?? p.personal.education_level)
                    : "—"}
                </p>
                {p.personal?.occupation && (
                  <p style={{ fontSize: "0.63rem", color: "var(--text-3)", margin: 0 }}>
                    {p.personal.occupation}
                  </p>
                )}
              </div>

              {/* CMU */}
              <span>
                {p.personal?.cmu == null
                  ? <span style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>—</span>
                  : p.personal.cmu
                    ? <Badge variant="success">Oui</Badge>
                    : <Badge variant="default">Non</Badge>
                }
              </span>

              {/* Commune */}
              <span style={{ fontSize: "0.74rem", color: "var(--text-2)" }}>
                {p.personal?.commune ?? "—"}
              </span>

              {/* Ménopause */}
              <span style={{ fontSize: "0.74rem", color: "var(--text-2)" }}>
                {p.medical?.menopause_status
                  ? (menopauseLabels[p.medical.menopause_status] ?? p.medical.menopause_status)
                  : "—"}
              </span>

              {/* Groupe sanguin */}
              <span style={{ fontSize: "0.74rem", color: "var(--text-2)", fontWeight: p.medical?.blood_type ? 600 : 400 }}>
                {p.medical?.blood_type ?? "—"}
              </span>
            </div>
          ))
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>Page {meta.current_page} / {meta.last_page} · {meta.total} patients</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>Préc.</button>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} style={pageBtn}>Suiv.</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile drawer */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "flex-end", zIndex: 1000, backdropFilter: "blur(2px)" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div style={{ width: "480px", maxWidth: "92vw", height: "100%", background: "var(--surface)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>

            {/* Drawer header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--brand-dim)", border: "2px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--brand)" }}>
                  {initials(selected)}
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{fullName(selected)}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0 }}>
                    Patient · {selected.organization?.name ?? "Aucune org"}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Contacts */}
              <Section title="Contact" icon={<Phone size={13} color="var(--brand)" />}>
                <InfoRow icon={<Phone size={12} />} label="Téléphone" value={selected._phone ?? "—"} />
                <InfoRow icon={<Mail size={12} />} label="Email" value={selected._email ?? "—"} />
                <InfoRow icon={<MapPin size={12} />} label="Commune" value={selected.personal?.commune ?? "—"} />
              </Section>

              {/* Infos personnelles */}
              {selected.personal && (
                <Section title="Informations personnelles" icon={<User size={13} color="var(--brand)" />}>
                  <InfoRow icon={<User size={12} />} label="Prénom" value={selected.personal.first_name ?? "—"} />
                  <InfoRow icon={<User size={12} />} label="Nom" value={selected.personal.last_name ?? "—"} />
                  <InfoRow icon={<Calendar size={12} />} label="Date de naissance" value={selected.personal.birth_date ? formatDate(selected.personal.birth_date) : "—"} />
                  <InfoRow icon={<User size={12} />} label="Âge" value={selected.personal.age != null ? `${selected.personal.age} ans` : "—"} />
                  <InfoRow icon={<User size={12} />} label="Genre" value={selected.personal.gender ?? "—"} />
                  <InfoRow icon={<User size={12} />} label="Occupation" value={selected.personal.occupation ?? "—"} />
                  <InfoRow icon={<User size={12} />} label="Niveau scolaire" value={selected.personal.education_level ? (eduLabels[selected.personal.education_level] ?? selected.personal.education_level) : "—"} />
                  <InfoRow icon={<CheckCircle size={12} />} label="CMU" value={selected.personal.cmu == null ? "—" : selected.personal.cmu ? "Oui" : "Non"} />
                </Section>
              )}

              {/* Profil médical */}
              {selected.medical && (
                <Section title="Profil médical" icon={<HeartPulse size={13} color="var(--brand)" />}>
                  <InfoRow icon={<HeartPulse size={12} />} label="Ménopause" value={selected.medical.menopause_status ? (menopauseLabels[selected.medical.menopause_status] ?? selected.medical.menopause_status) : "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Groupe sanguin" value={selected.medical.blood_type ?? "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Enceinte" value={selected.medical.is_pregnant ? "Oui" : "Non"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Antécédents familiaux" value={selected.medical.family_cancer_history ? "Oui" : "Non"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Dernier dépistage" value={selected.medical.last_screening_date ? formatDate(selected.medical.last_screening_date) : "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Exposée au tabac" value={selected.medical.exposed_to_smoke ? "Oui" : "Non"} />
                  {selected.medical.weight && (
                    <InfoRow icon={<HeartPulse size={12} />} label="Poids / Taille" value={`${selected.medical.weight} kg / ${selected.medical.height ?? "—"} cm`} />
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
                    {cancerLabels.map(([key, label]) =>
                      selected.medical![key] ? (
                        <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: "0.7rem", fontWeight: 600 }}>
                          <AlertTriangle size={10} /> {label}
                        </span>
                      ) : null
                    )}
                    {!cancerLabels.some(([k]) => selected.medical![k]) && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Aucun antécédent de cancer</span>
                    )}
                  </div>
                </Section>
              )}

              {/* Dernière évaluation */}
              {selected.last_session && (
                <Section title="Dernière évaluation" icon={<CheckCircle size={13} color="var(--brand)" />}>
                  <InfoRow icon={<CheckCircle size={12} />} label="Statut" value={selected.last_session.status} />
                  {selected.last_session.score != null && (
                    <InfoRow icon={<CheckCircle size={12} />} label="Score" value={String(selected.last_session.score)} />
                  )}
                  {selected.last_session.risk_level && (
                    <InfoRow icon={<AlertTriangle size={12} />} label="Niveau de risque" value={riskCfg[selected.last_session.risk_level]?.label ?? selected.last_session.risk_level} />
                  )}
                  <InfoRow icon={<Calendar size={12} />} label="Démarrée le" value={selected.last_session.started_at ? formatDate(selected.last_session.started_at) : "—"} />
                </Section>
              )}

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)" }}>
        {icon}
        <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{value}</span>
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};
