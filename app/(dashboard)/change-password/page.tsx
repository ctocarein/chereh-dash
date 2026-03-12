"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useChangePassword } from "@/hooks/useApi";
import { KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { clearMustChangePassword } = useAuthStore();
  const { mutateAsync, isPending } = useChangePassword();

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await mutateAsync({ password, password_confirmation: confirm });
      setSuccess(true);
      clearMustChangePassword();
      setTimeout(() => router.replace("/dashboard"), 1500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Une erreur est survenue. Veuillez réessayer.");
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Icon header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KeyRound size={24} color="var(--brand)" />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", margin: "0 0 6px" }}>
              Créer votre mot de passe
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
              Un mot de passe temporaire vous a été attribué.<br />Veuillez le remplacer pour sécuriser votre compte.
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 28px" }}>

          {success ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: 99, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={22} color="var(--success)" />
              </div>
              <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--success)", margin: 0 }}>Mot de passe mis à jour</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0 }}>Redirection en cours…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* New password */}
              <div>
                <label style={labelStyle}>Nouveau mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 caractères"
                    style={{ ...inputStyle, paddingRight: 42 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label style={labelStyle}>Confirmer le mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="Répétez le mot de passe"
                    style={{ ...inputStyle, paddingRight: 42 }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
                  />
                  <button type="button" onClick={() => setShowConf(!showConf)} style={eyeBtn}>
                    {showConf ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: "0.8rem", color: "var(--danger)" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                style={{
                  width: "100%", padding: "12px",
                  background: isPending ? "var(--surface-3)" : "var(--brand)",
                  border: "none", borderRadius: 10,
                  color: isPending ? "var(--text-3)" : "#0A0B0F",
                  fontSize: "0.88rem", fontWeight: 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s",
                }}
              >
                {isPending ? "Mise à jour…" : "Enregistrer le nouveau mot de passe"}
              </button>
            </form>
          )}
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
  background: "var(--surface-2)",
  border: "1px solid var(--border-2)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: "0.85rem",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const eyeBtn: React.CSSProperties = {
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
