"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import {
  ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle,
  Building2, Check, Mail, Shield, ChevronDown,
  Landmark, Briefcase, MapPin,
} from "lucide-react";

type Step = 1 | 2 | 3;
type OrgType = "ONG" | "Entreprise";

const STEPS = [
  { n: 1, label: "Organisation", desc: "Informations de votre structure" },
  { n: 2, label: "Votre compte",  desc: "Créez vos identifiants" },
  { n: 3, label: "Confirmation",  desc: "Demande envoyée" },
] as const;

/* ─── Country list ─── */
const COUNTRIES: string[] = [
  "Algérie", "Angola", "Bénin", "Botswana", "Burkina Faso", "Burundi",
  "Cameroun", "Cap-Vert", "Comores", "Congo (Brazzaville)", "Congo (RDC)",
  "Côte d'Ivoire", "Djibouti", "Égypte", "Érythrée", "Éthiopie", "Gabon",
  "Gambie", "Ghana", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Kenya",
  "Lesotho", "Liberia", "Libye", "Madagascar", "Malawi", "Mali", "Maroc",
  "Maurice", "Mauritanie", "Mozambique", "Namibie", "Niger", "Nigeria",
  "Ouganda", "Rwanda", "Sao Tomé-et-Príncipe", "Sénégal", "Seychelles",
  "Sierra Leone", "Somalie", "Soudan", "Soudan du Sud", "Swaziland",
  "Tanzanie", "Tchad", "Togo", "Tunisie", "Zambie", "Zimbabwe",
  // Autres
  "France", "Belgique", "Suisse", "Canada", "Haïti", "États-Unis",
  "Royaume-Uni", "Allemagne", "Espagne", "Portugal", "Italie",
];

/* ─── Password strength ─── */
function getStrength(pwd: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8)            score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  const labels = ["", "Faible", "Moyen", "Bon", "Fort"];
  const colors = ["", "var(--danger)", "var(--warning)", "var(--info)", "var(--success)"];
  return { score: score as 0 | 1 | 2 | 3 | 4, label: labels[score] ?? "", color: colors[score] ?? "" };
}

export default function OrgManagerOnboardPage() {
  const [step, setStep] = useState<Step>(1);

  /* Step 1 – Organisation */
  const [orgType,    setOrgType]    = useState<OrgType | "">("");
  const [orgName,    setOrgName]    = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgCity,    setOrgCity]    = useState("");
  const [orgAddress, setOrgAddress] = useState("");

  /* Step 2 – Compte */
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [showConfirmPwd,  setShowConfirmPwd]  = useState(false);

  /* Shared */
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleStep1() {
    const errors: Record<string, string> = {};
    if (!orgType)         errors.org_type    = "Veuillez choisir un type de structure.";
    if (!orgName.trim())  errors.org_name    = "Le nom de la structure est requis.";
    if (!orgCountry)      errors.org_country = "Le pays est requis.";
    if (!orgCity.trim())  errors.org_city    = "La ville / commune est requise.";
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setError(null);
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirm_password: "Les mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/identity/onboard/org-manager", {
        email,
        password,
        org_type:    orgType,
        org_name:    orgName,
        org_country: orgCountry,
        org_city:    orgCity,
        org_address: orgAddress || undefined,
      });
      setStep(3);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response?.data;
      if (res?.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(res.errors)) {
          flat[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setFieldErrors(flat);
      } else {
        setError(res?.message ?? "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── LEFT – Steps sidebar ── */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "36px 28px",
        }}
      >
        {/* Logo */}
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "48px" }}>
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="var(--brand-dim)" stroke="var(--brand)" strokeWidth="1" />
            <rect x="13" y="8" width="6" height="16" rx="2" fill="var(--brand)" />
            <rect x="8" y="13" width="16" height="6" rx="2" fill="var(--brand)" />
            <circle cx="16" cy="16" r="2.5" fill="var(--bg)" />
          </svg>
          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Chereh<span style={{ color: "var(--brand)" }}>Dash</span>
          </span>
        </Link>

        {/* Step list */}
        <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {STEPS.map((s, idx) => {
            const done   = step > s.n;
            const active = step === s.n;
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={s.n} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "11px 12px",
                    borderRadius: "10px",
                    background: active ? "var(--brand-dim)" : "transparent",
                    border: `1px solid ${active ? "rgba(20,184,166,0.25)" : "transparent"}`,
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        width: 30, height: 30,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: done ? "var(--success)" : active ? "var(--brand)" : "var(--surface-2)",
                        border: `2px solid ${done ? "var(--success)" : active ? "var(--brand)" : "var(--border-2)"}`,
                        transition: "all 0.2s",
                      }}
                    >
                      {done
                        ? <Check size={13} color="#fff" strokeWidth={3} />
                        : <span style={{ fontSize: "0.72rem", fontWeight: 700, color: active ? "#0A0B0F" : "var(--text-3)" }}>{s.n}</span>
                      }
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: active ? 700 : 500, color: active ? "var(--brand)" : done ? "var(--text)" : "var(--text-3)", margin: 0, lineHeight: 1.3, transition: "color 0.2s" }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0, marginTop: "1px" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div style={{ marginLeft: "23px", width: "2px", height: "20px", background: step > s.n ? "var(--success)" : "var(--border-2)", borderRadius: "1px", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Info box */}
        <div style={{ padding: "14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Shield size={12} color="var(--brand)" />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Validation sous 48h</span>
          </div>
          <p style={{ fontSize: "0.68rem", color: "var(--text-3)", lineHeight: 1.55, margin: 0 }}>
            Après envoi, un admin Chereh examinera votre dossier et activera votre accès par email.
          </p>
        </div>

        <p style={{ fontSize: "0.68rem", color: "var(--text-3)", lineHeight: 1.5 }}>
          Déjà un compte ?{" "}
          <Link href="/login" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
            Se connecter
          </Link>
        </p>
      </div>

      {/* ── RIGHT – Step content ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: "15%", right: "10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "10%", left: "5%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, var(--accent-dim) 0%, transparent 65%)", pointerEvents: "none" }} />

        {/* Progress bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "var(--border)" }}>
          <div style={{ height: "100%", background: "var(--brand)", width: `${(step / 3) * 100}%`, transition: "width 0.4s ease", borderRadius: "0 2px 2px 0" }} />
        </div>

        <div style={{ width: "100%", maxWidth: "580px", position: "relative", zIndex: 1 }}>
          {step === 1 && (
            <Step1
              orgType={orgType} setOrgType={setOrgType}
              orgName={orgName} setOrgName={setOrgName}
              orgCountry={orgCountry} setOrgCountry={setOrgCountry}
              orgCity={orgCity} setOrgCity={setOrgCity}
              orgAddress={orgAddress} setOrgAddress={setOrgAddress}
              fieldErrors={fieldErrors}
              onNext={handleStep1}
            />
          )}
          {step === 2 && (
            <Step2
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPwd={showPwd} setShowPwd={setShowPwd}
              showConfirmPwd={showConfirmPwd} setShowConfirmPwd={setShowConfirmPwd}
              loading={loading} error={error} fieldErrors={fieldErrors}
              orgType={orgType as OrgType} orgName={orgName} orgCountry={orgCountry} orgCity={orgCity}
              onBack={() => setStep(1)} onSubmit={handleStep2}
            />
          )}
          {step === 3 && <Step3 email={email} />}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Step 1 – Organisation ─────────── */
function Step1({
  orgType, setOrgType, orgName, setOrgName,
  orgCountry, setOrgCountry, orgCity, setOrgCity,
  orgAddress, setOrgAddress, fieldErrors, onNext,
}: {
  orgType: OrgType | ""; setOrgType: (v: OrgType) => void;
  orgName: string; setOrgName: (v: string) => void;
  orgCountry: string; setOrgCountry: (v: string) => void;
  orgCity: string; setOrgCity: (v: string) => void;
  orgAddress: string; setOrgAddress: (v: string) => void;
  fieldErrors: Record<string, string>;
  onNext: () => void;
}) {
  const typeCards: { value: OrgType; label: string; desc: string; Icon: typeof Landmark }[] = [
    { value: "ONG",        label: "ONG",        desc: "Organisation non gouvernementale",  Icon: Landmark },
    { value: "Entreprise", label: "Entreprise",  desc: "Société, clinique ou cabinet",      Icon: Briefcase },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={20} color="var(--brand)" />
        </div>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
            Votre structure
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0 }}>
            Renseignez les informations de votre organisation
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Type cards */}
        <div>
          <label style={labelStyle}>Type de structure</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "2px" }}>
            {typeCards.map(({ value, label, desc, Icon }) => {
              const selected = orgType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrgType(value)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "16px",
                    background: selected ? "var(--brand-dim)" : "var(--surface)",
                    border: `1.5px solid ${selected ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {selected && (
                    <div style={{ position: "absolute", top: "10px", right: "10px", width: 20, height: 20, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={11} color="#0A0B0F" strokeWidth={3} />
                    </div>
                  )}
                  <div style={{ width: 36, height: 36, borderRadius: "9px", background: selected ? "rgba(20,184,166,0.2)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                    <Icon size={18} color={selected ? "var(--brand)" : "var(--text-3)"} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: selected ? "var(--brand)" : "var(--text)", margin: 0, lineHeight: 1.2 }}>
                      {label}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: "3px 0 0", lineHeight: 1.4 }}>
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          {fieldErrors.org_type && <FieldError msg={fieldErrors.org_type} />}
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Nom de la structure</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Ex : Clinique Espoir, ONG Santé Plus…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
          {fieldErrors.org_name && <FieldError msg={fieldErrors.org_name} />}
        </div>

        {/* 2-col: Country + City */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

          {/* Country */}
          <div>
            <label style={labelStyle}>Pays</label>
            <div style={{ position: "relative" }}>
              <select
                value={orgCountry}
                onChange={(e) => setOrgCountry(e.target.value)}
                style={{ ...inputStyle, appearance: "none", paddingRight: "36px", cursor: "pointer" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-2)")}
              >
                <option value="">Sélectionner…</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={14} color="var(--text-3)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {fieldErrors.org_country && <FieldError msg={fieldErrors.org_country} />}
          </div>

          {/* City */}
          <div>
            <label style={labelStyle}>Ville / Commune</label>
            <input
              type="text"
              value={orgCity}
              onChange={(e) => setOrgCity(e.target.value)}
              placeholder="Ex : Dakar, Abidjan…"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
            />
            {fieldErrors.org_city && <FieldError msg={fieldErrors.org_city} />}
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>
            <MapPin size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
            Adresse
            <span style={{ fontWeight: 400, color: "var(--text-3)", marginLeft: "4px", textTransform: "none", letterSpacing: 0 }}>(optionnelle)</span>
          </label>
          <input
            type="text"
            value={orgAddress}
            onChange={(e) => setOrgAddress(e.target.value)}
            placeholder="Rue, quartier, boîte postale…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onNext} style={primaryBtn}>
            Continuer <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Step 2 – Compte ─────────── */
function Step2({
  email, setEmail, password, setPassword,
  confirmPassword, setConfirmPassword,
  showPwd, setShowPwd, showConfirmPwd, setShowConfirmPwd,
  loading, error, fieldErrors,
  orgType, orgName, orgCountry, orgCity,
  onBack, onSubmit,
}: {
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPwd: boolean; setShowPwd: (v: boolean) => void;
  showConfirmPwd: boolean; setShowConfirmPwd: (v: boolean) => void;
  loading: boolean; error: string | null;
  fieldErrors: Record<string, string>;
  orgType: OrgType; orgName: string; orgCountry: string; orgCity: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const strength = getStrength(password);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Vos informations de compte
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0 }}>
          Ces identifiants vous serviront à vous connecter
        </p>
      </div>

      {/* Org recap */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 14px",
          background: "var(--brand-dim)",
          border: "1px solid rgba(20,184,166,0.2)",
          borderRadius: "10px",
          marginBottom: "24px",
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(20,184,166,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Building2 size={14} color="var(--brand)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--brand)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {orgName}
          </p>
          <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0, marginTop: "1px" }}>
            {orgType} · {orgCity}, {orgCountry}
          </p>
        </div>
        <button type="button" onClick={onBack} style={{ fontSize: "0.68rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", flexShrink: 0 }}>
          Modifier
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Email */}
        <div>
          <label style={labelStyle}>
            <Mail size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
            Email professionnel
          </label>
          <input
            type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            required placeholder="vous@organisation.com"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
          {fieldErrors.email && <FieldError msg={fieldErrors.email} />}
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Mot de passe</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              required minLength={8} placeholder="Minimum 8 caractères"
              style={{ ...inputStyle, paddingRight: "42px" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtnStyle}>
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {password.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= strength.score ? strength.color : "var(--surface-3)", transition: "background 0.2s" }} />
                ))}
              </div>
              <p style={{ fontSize: "0.68rem", color: strength.color, margin: 0, fontWeight: 600 }}>{strength.label}</p>
            </div>
          )}
          {fieldErrors.password && <FieldError msg={fieldErrors.password} />}
        </div>

        {/* Confirm password */}
        <div>
          <label style={labelStyle}>Confirmer le mot de passe</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPwd ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                ...inputStyle,
                paddingRight: "42px",
                borderColor: confirmPassword && confirmPassword === password ? "var(--success)" : undefined,
              }}
              onFocus={(e) => (e.target.style.borderColor = confirmPassword === password && confirmPassword ? "var(--success)" : "var(--brand)")}
              onBlur={(e)  => (e.target.style.borderColor = confirmPassword === password && confirmPassword ? "var(--success)" : "var(--border-2)")}
            />
            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={eyeBtnStyle}>
              {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {confirmPassword && confirmPassword === password && (
              <Check size={14} color="var(--success)" style={{ position: "absolute", right: "38px", top: "50%", transform: "translateY(-50%)" }} />
            )}
          </div>
          {fieldErrors.confirm_password && <FieldError msg={fieldErrors.confirm_password} />}
        </div>

        {/* Password criteria */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
          {[
            { label: "8 caractères min.",   ok: password.length >= 8 },
            { label: "Une majuscule",        ok: /[A-Z]/.test(password) },
            { label: "Un chiffre",           ok: /[0-9]/.test(password) },
            { label: "Un caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
          ].map((c) => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.ok ? "rgba(16,185,129,0.15)" : "var(--surface-2)", border: `1.5px solid ${c.ok ? "var(--success)" : "var(--border-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                {c.ok && <Check size={8} color="var(--success)" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: "0.68rem", color: c.ok ? "var(--text-2)" : "var(--text-3)", transition: "color 0.15s" }}>{c.label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <button type="button" onClick={onBack} style={ghostBtn}>
            <ArrowLeft size={14} /> Précédent
          </button>
          <button
            type="submit" disabled={loading}
            style={{ ...primaryBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading
              ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(10,11,15,0.3)", borderTopColor: "#0A0B0F", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Envoi…</>
              : <><span>Soumettre ma demande</span><ArrowRight size={15} /></>
            }
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─────────── Step 3 – Confirmation ─────────── */
function Step3({ email }: { email: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={36} color="var(--success)" />
        </div>
        <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid rgba(16,185,129,0.15)", animation: "ping 2s ease-out infinite" }} />
      </div>

      <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text)", marginBottom: "10px", letterSpacing: "-0.03em" }}>
        Demande envoyée !
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, maxWidth: "400px", margin: "0 auto 32px" }}>
        Un email de vérification a été envoyé à{" "}
        <strong style={{ color: "var(--text)" }}>{email}</strong>.<br />
        Confirmez votre adresse, puis patientez pendant qu&apos;un administrateur examine votre dossier.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px", textAlign: "left" }}>
        {[
          { label: "Vérification de l'email",      sub: "Cliquez sur le lien reçu par email",        done: true  },
          { label: "Examen par un administrateur", sub: "Votre dossier sera traité sous 48h",         done: false },
          { label: "Activation de votre accès",    sub: "Vous recevrez un email de confirmation",     done: false },
        ].map((item, idx) => (
          <div
            key={item.label}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px",
              background: item.done ? "rgba(16,185,129,0.05)" : "var(--surface)",
              border: `1px solid ${item.done ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
              borderRadius: "10px",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.done ? "rgba(16,185,129,0.15)" : "var(--surface-2)", border: `2px solid ${item.done ? "var(--success)" : "var(--border-2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {item.done
                ? <Check size={12} color="var(--success)" strokeWidth={3} />
                : <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)" }}>{idx + 1}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: item.done ? "var(--text)" : "var(--text-3)", margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0, marginTop: "1px" }}>{item.sub}</p>
            </div>
            {item.done && <CheckCircle size={14} color="var(--success)" style={{ flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "28px", textAlign: "left" }}>
        <Mail size={14} color="var(--text-3)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
          Pensez à vérifier votre dossier spam si vous ne recevez pas l&apos;email dans les 5 minutes.
        </p>
      </div>

      <Link
        href="/login"
        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "var(--brand)", borderRadius: "10px", color: "#0A0B0F", fontSize: "0.88rem", fontWeight: 700, textDecoration: "none" }}
      >
        Aller à la connexion <ArrowRight size={14} />
      </Link>

      <style>{`@keyframes ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }`}</style>
    </div>
  );
}

/* ─────────── Shared ─────────── */
function FieldError({ msg }: { msg: string }) {
  return <p style={{ fontSize: "0.72rem", color: "var(--danger)", margin: "4px 0 0" }}>{msg}</p>;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.72rem",
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: "6px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--surface)",
  border: "1px solid var(--border-2)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: "0.85rem",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const eyeBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "var(--text-3)",
  cursor: "pointer",
  padding: 0,
  display: "flex",
};

const primaryBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 22px",
  background: "var(--brand)",
  border: "none",
  borderRadius: "9px",
  color: "#0A0B0F",
  fontSize: "0.88rem",
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "12px 16px",
  background: "transparent",
  border: "1px solid var(--border-2)",
  borderRadius: "9px",
  color: "var(--text-2)",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
};
