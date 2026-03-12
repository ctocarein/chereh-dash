"use client";

import { useState } from "react";
import { useOrgUsers, useCreatePractitioner, useCreateFieldAgent } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Search, UserCog, Stethoscope, ShieldCheck, Plus, X, Mail, Phone, User } from "lucide-react";

interface UserRow {
  id: string;
  status: string;
  created_at: string;
  _email: string | null;
  _phone: string | null;
  role: string | null;
  organization: { id: string; name: string } | null;
}

type RoleTab = "" | "Practitioner" | "FieldAgent";

const roleLabels: Record<string, string> = {
  Practitioner: "Praticien",
  FieldAgent:   "Agent de terrain",
};

const roleTabs: { id: RoleTab; label: string; icon: React.ElementType }[] = [
  { id: "",              label: "Tous",              icon: UserCog      },
  { id: "Practitioner",  label: "Praticiens",         icon: Stethoscope  },
  { id: "FieldAgent",    label: "Agents de terrain",  icon: ShieldCheck  },
];

/* ── Modal générique ── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 440, zIndex: 1, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", padding: 4 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Create Practitioner Modal ── */
function CreatePractitionerModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCreatePractitioner();
  const [email, setEmail]         = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [done, setDone]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await mutateAsync({ email, first_name: firstName, last_name: lastName });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Une erreur est survenue.");
    }
  }

  return (
    <Modal title="Créer un praticien" onClose={onClose}>
      {done ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 99, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <Mail size={20} color="var(--success)" />
          </div>
          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--success)", marginBottom: 6 }}>Invitation envoyée !</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "0 0 20px" }}>
            Le praticien recevra un email avec ses identifiants de connexion temporaires.
          </p>
          <button onClick={onClose} style={primaryBtn}>Fermer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, fontSize: "0.78rem", color: "var(--info)", lineHeight: 1.5 }}>
            Un mot de passe temporaire sera généré et envoyé par email. Le praticien devra le changer à sa première connexion.
          </div>

          <Field label="Email" icon={Mail}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="praticien@organisation.com" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Prénom" icon={User}>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
            </Field>
            <Field label="Nom" icon={User}>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Dupont" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
            </Field>
          </div>

          {error && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: "0.78rem", color: "var(--danger)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Annuler</button>
            <button type="submit" disabled={isPending} style={{ ...primaryBtn, flex: 1, opacity: isPending ? 0.6 : 1 }}>
              {isPending ? "Création…" : "Créer et envoyer l'invitation"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ── Create FieldAgent Modal ── */
function CreateFieldAgentModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending } = useCreateFieldAgent();
  const [phone, setPhone]         = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [done, setDone]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await mutateAsync({ phone, first_name: firstName, last_name: lastName });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Une erreur est survenue.");
    }
  }

  return (
    <Modal title="Créer un agent de terrain" onClose={onClose}>
      {done ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 99, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <ShieldCheck size={20} color="var(--warning)" />
          </div>
          <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--warning)", marginBottom: 6 }}>Agent créé !</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "0 0 20px" }}>
            L'agent peut maintenant se connecter sur <strong>my.chereh.com</strong> avec son numéro de téléphone.
          </p>
          <button onClick={onClose} style={primaryBtn}>Fermer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: "0.78rem", color: "var(--warning)", lineHeight: 1.5 }}>
            L'agent de terrain se connecte sur <strong>my.chereh.com</strong> et n'a pas accès à ce tableau de bord.
          </div>

          <Field label="Numéro de téléphone" icon={Phone}>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+225 07 00 00 00 00" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Prénom" icon={User}>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Aminata" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
            </Field>
            <Field label="Nom" icon={User}>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Koné" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
            </Field>
          </div>

          {error && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: "0.78rem", color: "var(--danger)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Annuler</button>
            <button type="submit" disabled={isPending} style={{ ...primaryBtn, flex: 1, opacity: isPending ? 0.6 : 1 }}>
              {isPending ? "Création…" : "Créer l'agent"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ── Field helper ── */
function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}><Icon size={10} style={{ marginRight: 4 }} />{label}</label>
      {children}
    </div>
  );
}

/* ── Main page ── */
export default function UtilisateursPage() {
  const [tab, setTab]       = useState<RoleTab>("");
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [showPractModal, setShowPractModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);

  const { data, isLoading } = useOrgUsers(tab, page, debSearch);
  const users: UserRow[] = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as { _ust?: number })._ust);
    (window as unknown as { _ust?: number })._ust = window.setTimeout(() => {
      setDebSearch(val);
      setPage(1);
    }, 400);
  }

  function handleTabChange(t: RoleTab) {
    setTab(t);
    setPage(1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Modals */}
      {showPractModal && <CreatePractitionerModal onClose={() => setShowPractModal(false)} />}
      {showAgentModal && <CreateFieldAgentModal  onClose={() => setShowAgentModal(false)} />}

      {/* Tabs + Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 4, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: 4 }}>
          {roleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px",
                borderRadius: 7,
                border: "none",
                background: tab === id ? "var(--surface)" : "transparent",
                boxShadow: tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                color: tab === id ? "var(--text)" : "var(--text-3)",
                fontSize: "0.78rem", fontWeight: tab === id ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <Icon size={13} />
              {label}
              {meta && tab === id && (
                <span style={{ marginLeft: 2, background: "var(--brand-dim)", color: "var(--brand)", borderRadius: 99, padding: "0 6px", fontSize: "0.65rem", fontWeight: 700 }}>
                  {meta.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Create buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAgentModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 8, color: "var(--warning)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} /> Agent de terrain
          </button>
          <button onClick={() => setShowPractModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--brand)", border: "none", borderRadius: 8, color: "#0A0B0F", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
            <Plus size={13} /> Praticien
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par email ou téléphone…"
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>
        {meta && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{meta.total} utilisateur(s)</span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Utilisateur", "Organisation", "Rôle", "Statut", "Inscrit le"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "65%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : users.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <UserCog size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: u.role === "Practitioner" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)", border: `1.5px solid ${u.role === "Practitioner" ? "rgba(59,130,246,0.4)" : "rgba(245,158,11,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {u.role === "Practitioner"
                    ? <Stethoscope size={14} color="var(--info)" />
                    : <ShieldCheck size={14} color="var(--warning)" />}
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{u._email ?? "—"}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-3)", margin: 0 }}>{u._phone ?? ""}</p>
                </div>
              </div>

              <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{u.organization?.name ?? "—"}</span>

              <Badge variant={u.role === "Practitioner" ? "info" : "warning"}>
                {u.role ? (roleLabels[u.role] ?? u.role) : "—"}
              </Badge>

              <Badge variant={u.status === "active" ? "success" : "default"}>
                {u.status === "active" ? "Actif" : "Inactif"}
              </Badge>

              <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(u.created_at)}</span>
            </div>
          ))
        )}

        {meta && meta.last_page > 1 && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>Page {meta.current_page} / {meta.last_page}</span>
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.68rem",
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: "5px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--surface-2)",
  border: "1px solid var(--border-2)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: "0.83rem",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  padding: "11px 18px",
  background: "var(--brand)",
  border: "none",
  borderRadius: 9,
  color: "#0A0B0F",
  fontSize: "0.82rem",
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  padding: "11px 18px",
  background: "var(--surface-2)",
  border: "1px solid var(--border-2)",
  borderRadius: 9,
  color: "var(--text-2)",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
};

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};
