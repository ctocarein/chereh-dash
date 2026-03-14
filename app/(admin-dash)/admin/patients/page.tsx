"use client";

import { useState } from "react";
import { useOrgPatients } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, Users, X, Phone, Mail, MapPin, Calendar, HeartPulse, AlertTriangle, CheckCircle, User } from "lucide-react";

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
  roles: string[];
  organization: { id: string; name: string } | null;
  personal: PatientPersonal | null;
  medical: PatientMedical | null;
  last_session: LastSession | null;
}

const roleCfg: Record<string, { label: string; variant: "brand" | "info" | "warning" | "success" }> = {
  Beneficiary: { label: "Bénéficiaire", variant: "brand"    },
  Ambassador:  { label: "Ambassadeur",  variant: "success"  },
  AgentField:  { label: "Agent terrain", variant: "warning" },
};

const riskCfg: Record<string, { label: string; variant: "success" | "info" | "warning" | "danger" }> = {
  low:      { label: "Faible",   variant: "success" },
  moderate: { label: "Modéré",   variant: "info"    },
  high:     { label: "Élevé",    variant: "warning" },
  critical: { label: "Critique", variant: "danger"  },
};

const cancerLabels: [keyof PatientMedical, string][] = [
  ["has_breast_cancer",  "Sein"],
  ["has_ovarian_cancer", "Ovarien"],
  ["has_cervical_cancer","Col"],
  ["has_other_cancer",   "Autre"],
];

const COLS = "1.8fr 0.8fr 0.7fr 0.7fr 1.2fr 1fr 1.1fr";

function makeMatricule(p: PatientRow): string {
  const d = new Date(p.created_at);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const suffix = p.id.replace(/-/g, "").slice(-4).toUpperCase();
  return `Care-${dd}${mm}${yy}-${suffix}`;
}

const eduLabels: Record<string, string> = {
  none: "Aucun",
  primary: "Primaire",
  secondary: "Secondaire",
  university: "Universitaire",
};

export default function PatientsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selected, setSelected] = useState<PatientRow | null>(null);

  const { data, isLoading } = useOrgPatients(page, debouncedSearch, "", roleFilter);
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
    return (fn + " " + ln).trim() || p._email || p._phone || p.id.slice(0, 12);
  };

  const initials = (p: PatientRow) => {
    const fn = p.personal?.first_name?.[0] ?? "";
    const ln = p.personal?.last_name?.[0]  ?? "";
    return (fn + ln).toUpperCase() || (p._email?.[0] ?? p._phone?.[0] ?? "P").toUpperCase();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Matricule, commune, téléphone…"
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{ padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", cursor: "pointer" }}
        >
          <option value="">Tous les rôles</option>
          <option value="Beneficiary">Bénéficiaires</option>
          <option value="Ambassador">Ambassadeurs</option>
          <option value="AgentField">Agents terrain</option>
        </select>

        {meta && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)", marginLeft: "auto" }}>
            {meta.total} patient(s)
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Matricule", "Genre", "Âge", "CMU", "Éducation", "Commune", "Téléphone"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: COLS, padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 7 }).map((_, j) => (
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
              style={{ display: "grid", gridTemplateColumns: COLS, padding: "12px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.12s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              {/* Matricule */}
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--brand)", margin: 0, fontFamily: "monospace" }}>{makeMatricule(p)}</p>
                <p style={{ fontSize: "0.65rem", color: "var(--text-3)", margin: 0 }}>{fullName(p)}</p>
              </div>

              {/* Genre */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
                {p.personal?.gender ?? "—"}
              </span>

              {/* Âge */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
                {p.personal?.age != null ? `${p.personal.age} ans` : "—"}
              </span>

              {/* CMU */}
              <span style={{ fontSize: "0.75rem" }}>
                {p.personal?.cmu == null
                  ? <span style={{ color: "var(--text-3)" }}>—</span>
                  : p.personal.cmu
                    ? <Badge variant="success">Oui</Badge>
                    : <Badge variant="default">Non</Badge>
                }
              </span>

              {/* Éducation */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
                {p.personal?.education_level
                  ? (eduLabels[p.personal.education_level] ?? p.personal.education_level)
                  : "—"}
              </span>

              {/* Commune */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>
                {p.personal?.commune ?? "—"}
              </span>

              {/* Téléphone */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontFamily: "monospace" }}>
                {p._phone ?? "—"}
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

            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--brand-dim)", border: "2px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--brand)" }}>
                  {initials(selected)}
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{fullName(selected)}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--brand)", fontFamily: "monospace", margin: "2px 0 0" }}>{makeMatricule(selected)}</p>
                  <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                    {selected.roles?.map((r) => {
                      const cfg = roleCfg[r] ?? { label: r, variant: "default" as const };
                      return <Badge key={r} variant={cfg.variant}>{cfg.label}</Badge>;
                    })}
                    {selected.organization && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>· {selected.organization.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Contact */}
              <Section title="Contact" icon={<Phone size={13} color="var(--brand)" />}>
                <InfoRow icon={<Phone size={12} />}  label="Téléphone" value={selected._phone ?? "—"} />
                <InfoRow icon={<Mail size={12} />}   label="Email"     value={selected._email ?? "—"} />
                <InfoRow icon={<MapPin size={12} />} label="Commune"   value={selected.personal?.commune ?? "—"} />
              </Section>

              {/* Infos personnelles */}
              {selected.personal && (
                <Section title="Informations personnelles" icon={<User size={13} color="var(--brand)" />}>
                  <InfoRow icon={<Calendar size={12} />}    label="Date de naissance"  value={selected.personal.birth_date ? formatDate(selected.personal.birth_date) : "—"} />
                  <InfoRow icon={<User size={12} />}        label="Âge"                value={selected.personal.age != null ? `${selected.personal.age} ans` : "—"} />
                  <InfoRow icon={<User size={12} />}        label="Genre"              value={selected.personal.gender ?? "—"} />
                  <InfoRow icon={<User size={12} />}        label="Occupation"         value={selected.personal.occupation ?? "—"} />
                  <InfoRow icon={<User size={12} />}        label="Niveau scolaire"    value={selected.personal.education_level ? (eduLabels[selected.personal.education_level] ?? selected.personal.education_level) : "—"} />
                  <InfoRow icon={<CheckCircle size={12} />} label="CMU"                value={selected.personal.cmu == null ? "—" : selected.personal.cmu ? "Oui" : "Non"} />
                  <InfoRow icon={<Calendar size={12} />}    label="Date d'inscription" value={formatDate(selected.created_at)} />
                </Section>
              )}

              {/* Profil médical */}
              {selected.medical && (
                <Section title="Profil médical" icon={<HeartPulse size={13} color="var(--brand)" />}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {cancerLabels.map(([key, label]) =>
                      selected.medical![key] ? (
                        <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 99, background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: "0.7rem", fontWeight: 600 }}>
                          <AlertTriangle size={10} /> {label}
                        </span>
                      ) : null
                    )}
                    {!cancerLabels.some(([k]) => selected.medical![k]) && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>Aucun antécédent</span>
                    )}
                  </div>
                  <InfoRow icon={<HeartPulse size={12} />} label="Groupe sanguin"        value={selected.medical.blood_type ?? "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Antécédents familiaux" value={selected.medical.family_cancer_history ? "Oui" : "Non"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Dernier dépistage"     value={selected.medical.last_screening_date ? formatDate(selected.medical.last_screening_date) : "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Ménopause"             value={selected.medical.menopause_status ?? "—"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Enceinte"              value={selected.medical.is_pregnant ? "Oui" : "Non"} />
                  <InfoRow icon={<HeartPulse size={12} />} label="Exposée au tabac"      value={selected.medical.exposed_to_smoke ? "Oui" : "Non"} />
                  {selected.medical.weight && <InfoRow icon={<HeartPulse size={12} />} label="Poids / Taille" value={`${selected.medical.weight} kg / ${selected.medical.height ?? "—"} cm`} />}
                </Section>
              )}

              {/* Dernière évaluation */}
              {selected.last_session && (
                <Section title="Dernière évaluation" icon={<CheckCircle size={13} color="var(--brand)" />}>
                  <InfoRow icon={<CheckCircle size={12} />}  label="Statut"          value={selected.last_session.status} />
                  {selected.last_session.score != null && (
                    <InfoRow icon={<CheckCircle size={12} />} label="Score"          value={String(selected.last_session.score)} />
                  )}
                  {selected.last_session.risk_level && (
                    <InfoRow icon={<AlertTriangle size={12} />} label="Niveau risque" value={riskCfg[selected.last_session.risk_level]?.label ?? selected.last_session.risk_level} />
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
