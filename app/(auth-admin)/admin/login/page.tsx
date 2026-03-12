"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { Eye, EyeOff, ArrowRight, Activity, Shield, Users, BarChart2, Clock, UserPlus } from "lucide-react";
import type { Identity } from "@/types";

function getPrimaryRole(identity: Identity): string | null {
  return identity.memberships?.find((m) => m.status === "active")?.role ?? null;
}

const ALLOWED_ROLES = ["PlatformAdmin", "OrgManager"];

export default function LoginPage() {
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

      if (!role || !ALLOWED_ROLES.includes(role)) {
        setError("Accès réservé aux administrateurs et responsables d'organisation.");
        return;
      }

      login(res.data.token, identity, res.data.security_gate, email);
      router.push(role === "PlatformAdmin" ? "/admin/dashboard" : "/dashboard");
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

      {/* Left – Form */}
      <div
        style={{
          flex: "0 0 420px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
          <CherehLogoSVG size={36} />
          <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Chereh<span style={{ color: "var(--brand)" }}>Dash</span>
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px", letterSpacing: "-0.02em" }}>
          Connexion
        </h1>
        <p style={{ fontSize: "0.84rem", color: "var(--text-3)", marginBottom: "32px" }}>
          Accédez à votre espace backoffice
        </p>

        {pending && (
          <div style={{ marginBottom: "20px", padding: "16px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Clock size={15} color="var(--warning)" />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--warning)" }}>Compte en attente de validation</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>
              Votre demande est en cours d&apos;examen. Vous recevrez un email dès qu&apos;un administrateur aura statué sur votre dossier.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-2)", marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="admin@chereh.com"
              style={{ width: "100%", padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "8px", color: "var(--text)", fontSize: "0.85rem", outline: "none", transition: "border-color 0.15s" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
              onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-2)", marginBottom: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••"
                style={{ width: "100%", padding: "10px 40px 10px 14px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "8px", color: "var(--text)", fontSize: "0.85rem", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 0, display: "flex" }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", fontSize: "0.8rem", color: "#EF4444" }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: "100%", padding: "11px", background: loading ? "var(--surface-3)" : "var(--brand)", border: "none", borderRadius: "8px", color: loading ? "var(--text-3)" : "#0A0B0F", fontSize: "0.85rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.15s", letterSpacing: "0.01em" }}
          >
            {loading ? "Connexion…" : <><span>Se connecter</span> <ArrowRight size={15} /></>}
          </button>
        </form>

        <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
          <Link
            href="/onboard/org-manager"
            style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "10px", textDecoration: "none" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <UserPlus size={14} color="var(--accent)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>Devenir responsable d&apos;organisation</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0 }}>Soumettre une demande d&apos;accès partenaire</p>
            </div>
            <ArrowRight size={13} color="var(--text-3)" />
          </Link>
        </div>

        <p style={{ marginTop: "24px", fontSize: "0.7rem", color: "var(--text-3)", textAlign: "center" }}>
          Chereh © {new Date().getFullYear()} — Backoffice
        </p>
      </div>

      {/* Right – Branding */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "64px 72px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.5 }} />
        <div aria-hidden style={{ position: "absolute", top: "30%", left: "40%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "480px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--brand-dim)", border: "1px solid rgba(20,184,166,0.3)", borderRadius: "99px", padding: "4px 12px", fontSize: "0.72rem", fontWeight: 600, color: "var(--brand)", marginBottom: "24px", letterSpacing: "0.05em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand)" }} />
            Plateforme de triage médical
          </div>

          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "16px" }}>
            Accès sécurisé au<br />
            <span style={{ color: "var(--brand)" }}>backoffice</span> Chereh
          </h2>

          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", lineHeight: 1.75, marginBottom: "40px" }}>
            Gérez les patients, évaluations de risque, ambassadeurs et questionnaires depuis une interface unifiée et sécurisée.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: Shield,    label: "Authentification sécurisée (Sanctum Bearer)" },
              { icon: Activity,  label: "Moteur de scoring factuel temps réel" },
              { icon: Users,     label: "Gestion multi-rôles (Admin · OrgManager)" },
              { icon: BarChart2, label: "Statistiques et aide à la décision clinique" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px" }}>
                <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color="var(--brand)" />
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CherehLogoSVG({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="var(--brand-dim)" stroke="var(--brand)" strokeWidth="1" />
      <rect x="13" y="8" width="6" height="16" rx="2" fill="var(--brand)" />
      <rect x="8" y="13" width="16" height="6" rx="2" fill="var(--brand)" />
      <circle cx="16" cy="16" r="2.5" fill="var(--bg)" />
    </svg>
  );
}
