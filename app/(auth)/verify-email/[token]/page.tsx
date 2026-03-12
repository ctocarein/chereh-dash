"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState<string>("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;

    apiClient.get(`/identity/verify-email/${token}`)
      .then((r) => {
        setMessage(r.data.message ?? "Votre email a été vérifié avec succès.");
        setStatus("success");
      })
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setMessage(msg ?? "Ce lien de vérification est invalide ou a déjà été utilisé.");
        setStatus("error");
      });
  }, [token]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>

        {status === "loading" && (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <Loader2 size={40} color="var(--brand)" style={{ animation: "spin 1s linear infinite" }} />
            </div>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text)", marginBottom: "8px" }}>
              Vérification en cours…
            </h1>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
              Merci de patienter quelques instants.
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle size={28} color="var(--success)" />
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Email vérifié !
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "28px" }}>
              {message}
            </p>

            <div style={{ padding: "16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "28px", textAlign: "left" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                Un administrateur va examiner votre dossier sous <strong style={{ color: "var(--text)" }}>48 heures</strong>. Vous recevrez un email de confirmation dès validation.
              </p>
            </div>

            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "var(--brand)",
                border: "none",
                borderRadius: "8px",
                color: "#0A0B0F",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Aller à la connexion <ArrowRight size={14} />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <XCircle size={28} color="var(--danger)" />
            </div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginBottom: "10px", letterSpacing: "-0.02em" }}>
              Lien invalide
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "28px" }}>
              {message}
            </p>
            <Link
              href="/onboard/org-manager"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-2)",
                borderRadius: "8px",
                color: "var(--text)",
                fontSize: "0.85rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Soumettre une nouvelle demande <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
