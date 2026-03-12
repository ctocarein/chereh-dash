"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, ArrowRight, Clock, UserPlus, Building2, ClipboardList, Share2 } from "lucide-react";
import type { Identity } from "@/types";

function getPrimaryRole(identity: Identity): string | null {
  return identity.memberships?.find((m) => m.status === "active")?.role ?? null;
}

export default function OrgLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [pending, setPending]   = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPending(false);

    try {
      const res = await apiClient.post("/identity/login", {
        credential_type: "email",
        identifier: email,
        secret: password,
      });

      const identity: Identity = res.data.identity;
      const role = getPrimaryRole(identity);

      if (role !== "OrgManager" && role !== "Practitioner") {
        setError("Cet espace est réservé aux responsables d'organisation et praticiens.");
        return;
      }

      const mustChangePwd = res.data.must_change_password === true;
      login(res.data.token, identity, res.data.security_gate, email, mustChangePwd);
      router.push(mustChangePwd ? "/change-password" : "/dashboard");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

      if (status === 423) {
        setPending(true);
      } else {
        setError(msg ?? "Identifiants incorrects");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── LEFT – Brand panel ── */}
      <div
        style={{
          width: "44%",
          flexShrink: 0,
          background: "var(--brand)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div aria-hidden style={{ position: "absolute", top: -100, right: -80, width: 340, height: 340, borderRadius: "50%", background: "rgba(0,0,0,0.07)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -80, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(0,0,0,0.05)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "35%", right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "10px" }}>
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="rgba(10,11,15,0.15)" stroke="rgba(10,11,15,0.3)" strokeWidth="1" />
            <rect x="13" y="8" width="6" height="16" rx="2" fill="#0A0B0F" />
            <rect x="8" y="13" width="16" height="6" rx="2" fill="#0A0B0F" />
            <circle cx="16" cy="16" r="2.5" fill="var(--brand)" />
          </svg>
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0A0B0F", letterSpacing: "-0.02em" }}>
            CherehDash
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(10,11,15,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            Espace partenaire
          </p>
          <h1 style={{ fontSize: "2.6rem", fontWeight: 900, color: "#0A0B0F", letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "16px" }}>
            Bienvenue,<br />OrgManager.
          </h1>
          <p style={{ fontSize: "0.88rem", color: "rgba(10,11,15,0.65)", lineHeight: 1.65, marginBottom: "36px", maxWidth: "300px" }}>
            Gérez votre organisation, vos patients référés et suivez les évaluations de votre réseau.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: Building2,    label: "Gestion de votre organisation" },
              { icon: ClipboardList, label: "Suivi des évaluations patients" },
              { icon: Share2,       label: "Réseau d'ambassadeurs & referrals" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "rgba(10,11,15,0.10)", borderRadius: "10px" }}>
                <Icon size={14} color="#0A0B0F" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.8rem", color: "#0A0B0F", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", zIndex: 1, fontSize: "0.7rem", color: "rgba(10,11,15,0.45)" }}>
          Chereh © {new Date().getFullYear()} — Plateforme médicale sécurisée
        </p>
      </div>

      {/* ── RIGHT – Form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          position: "relative",
        }}
      >
        {/* Subtle grid + glow */}
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.4, pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", top: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 65%)", pointerEvents: "none" }} />

        <div style={{ width: "100%", maxWidth: "400px", position: "relative", zIndex: 1 }}>

          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "8px" }}>
              Bon retour
            </h2>
            <p style={{ fontSize: "0.84rem", color: "var(--text-3)" }}>
              Pas encore partenaire ?{" "}
              <Link href="/onboard/org-manager" style={{ color: "var(--brand)", fontWeight: 600, textDecoration: "none" }}>
                Créer un accès
              </Link>
            </p>
          </div>

          {/* Pending notice */}
          {pending && (
            <div style={{ marginBottom: "20px", padding: "14px 16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px", display: "flex", gap: "10px" }}>
              <Clock size={15} color="var(--warning)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--warning)", marginBottom: "4px" }}>Compte en attente</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
                  Votre demande est en cours d&apos;examen. Vous recevrez un email dès validation.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="vous@organisation.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
              />
            </div>

            <div>
              <label style={labelStyle}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="••••••••"
                  style={{ ...inputStyle, paddingRight: "42px" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtnStyle}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--danger)" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "var(--surface-3)" : "var(--brand)",
                border: "none", borderRadius: "10px",
                color: loading ? "var(--text-3)" : "#0A0B0F",
                fontSize: "0.88rem", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Connexion…" : <><span>Se connecter</span><ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Onboarding link */}
          <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
            <Link
              href="/onboard/org-manager"
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", textDecoration: "none" }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "8px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <UserPlus size={15} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>Devenir responsable d&apos;organisation</p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0 }}>Soumettre une demande d&apos;accès partenaire</p>
              </div>
              <ArrowRight size={13} color="var(--text-3)" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
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
