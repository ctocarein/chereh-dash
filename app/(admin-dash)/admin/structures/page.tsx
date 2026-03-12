"use client";

import { useState } from "react";
import { useOnboardingRequests, useApproveOnboardingRequest, useRejectOnboardingRequest } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Building2, Clock, CheckCircle, XCircle, AlertCircle,
  MapPin, Mail, RefreshCw, ChevronDown,
} from "lucide-react";

type RequestStatus = "email_unverified" | "pending_validation" | "approved" | "rejected";

const STATUS_CFG: Record<RequestStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  email_unverified:   { label: "Email non vérifié", variant: "default" },
  pending_validation: { label: "En attente",        variant: "warning" },
  approved:           { label: "Approuvée",         variant: "success" },
  rejected:           { label: "Rejetée",           variant: "danger"  },
};

const REJECT_REASONS = [
  { value: "incomplete_info", label: "Informations incomplètes" },
  { value: "unknown_org",     label: "Organisation inconnue" },
  { value: "duplicate",       label: "Demande en double" },
  { value: "other",           label: "Autre raison" },
];

const TABS: { value: string | undefined; label: string; icon: typeof Clock }[] = [
  { value: undefined,          label: "Toutes",    icon: RefreshCw    },
  { value: "pending_validation", label: "En attente", icon: Clock        },
  { value: "approved",           label: "Approuvées", icon: CheckCircle  },
  { value: "rejected",           label: "Rejetées",   icon: XCircle      },
];

export default function StructuresPage() {
  const [activeTab,  setActiveTab]  = useState<string | undefined>(undefined);
  const [rejectModal, setRejectModal] = useState<{ id: number; orgName: string } | null>(null);
  const [reasonCode,  setReasonCode]  = useState("incomplete_info");
  const [reasonDetail, setReasonDetail] = useState("");

  const { data, isLoading, refetch } = useOnboardingRequests(activeTab);
  const approve = useApproveOnboardingRequest();
  const reject  = useRejectOnboardingRequest();

  const requests: OnboardingRequest[] = data?.data ?? [];
  const meta = data?.meta;

  async function handleApprove(id: number) {
    await approve.mutateAsync(id);
  }

  async function handleReject() {
    if (!rejectModal) return;
    await reject.mutateAsync({ id: rejectModal.id, reason_code: reasonCode, reason_detail: reasonDetail || undefined });
    setRejectModal(null);
    setReasonCode("incomplete_info");
    setReasonDetail("");
  }

  const pendingCount = requests.filter((r) => r.status === "pending_validation").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
            Structures & Demandes
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Gérez les demandes d'onboarding des organisations partenaires
          </p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px" }}>
            <AlertCircle size={14} color="var(--warning)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--warning)" }}>
              {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={String(tab.value)}
              onClick={() => setActiveTab(tab.value)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px",
                background: active ? "var(--brand-dim)" : "transparent",
                border: `1px solid ${active ? "rgba(20,184,166,0.3)" : "transparent"}`,
                borderRadius: "7px",
                color: active ? "var(--brand)" : "var(--text-3)",
                fontSize: "0.78rem",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto", gap: "0", borderBottom: "1px solid var(--border)", padding: "10px 20px", background: "var(--surface-2)" }}>
          {["Structure", "Responsable", "Localisation", "Statut", "Date", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto", gap: "0", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "70%", background: "var(--surface-2)", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : requests.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Building2 size={28} color="var(--text-3)" style={{ marginBottom: "10px" }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucune demande trouvée</p>
          </div>
        ) : (
          requests.map((req) => {
            const cfg = STATUS_CFG[req.status as RequestStatus] ?? { label: req.status, variant: "default" as const };
            const isPending = req.status === "pending_validation";
            return (
              <div
                key={req.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto",
                  gap: "0",
                  padding: "14px 20px",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                  background: isPending ? "rgba(245,158,11,0.02)" : undefined,
                  transition: "background 0.15s",
                }}
              >
                {/* Structure */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "9px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Building2 size={15} color="var(--brand)" />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                      {req.organization?.name ?? "—"}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0 }}>
                      {req.organization?.type ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Responsable */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Mail size={12} color="var(--text-3)" />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{req.email ?? "—"}</span>
                </div>

                {/* Localisation */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={11} color="var(--text-3)" />
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                    {req.organization?.city && req.organization?.country
                      ? `${req.organization.city}, ${req.organization.country}`
                      : "—"}
                  </span>
                </div>

                {/* Statut */}
                <div>
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                {/* Date */}
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                  {formatDate(req.created_at)}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={approve.isPending}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "7px", color: "var(--success)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        <CheckCircle size={12} /> Approuver
                      </button>
                      <button
                        onClick={() => setRejectModal({ id: req.id, orgName: req.organization?.name ?? "" })}
                        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "7px", color: "var(--danger)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        <XCircle size={12} /> Rejeter
                      </button>
                    </>
                  )}
                  {!isPending && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-3)", padding: "6px 0" }}>—</span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Footer */}
        {meta && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
              {meta.total} demande{meta.total !== 1 ? "s" : ""} au total
            </span>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}
          onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "420px", maxWidth: "90vw" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={18} color="var(--danger)" />
              </div>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Rejeter la demande</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", margin: 0 }}>{rejectModal.orgName}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Motif du rejet</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={reasonCode}
                    onChange={(e) => setReasonCode(e.target.value)}
                    style={{ ...selectStyle }}
                  >
                    {REJECT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} color="var(--text-3)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Détail (optionnel)</label>
                <textarea
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="Précisez si nécessaire…"
                  rows={3}
                  style={{ ...selectStyle, resize: "vertical", lineHeight: 1.5 }}
                />
              </div>

              {reject.isError && (
                <p style={{ fontSize: "0.75rem", color: "var(--danger)", margin: 0 }}>
                  Une erreur est survenue. Réessayez.
                </p>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setRejectModal(null)} style={ghostBtn}>
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={reject.isPending}
                  style={{ padding: "9px 18px", background: "var(--danger)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: reject.isPending ? 0.6 : 1 }}
                >
                  {reject.isPending ? "Rejet…" : "Confirmer le rejet"}
                </button>
              </div>
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

interface OnboardingRequest {
  id: number;
  status: string;
  email: string | null;
  created_at: string;
  organization: {
    id: string;
    name: string;
    type: string;
    country: string;
    city: string;
    address: string;
    status: string;
  } | null;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "var(--text-2)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--surface-2)",
  border: "1px solid var(--border-2)",
  borderRadius: "8px",
  color: "var(--text)",
  fontSize: "0.83rem",
  outline: "none",
  appearance: "none",
  boxSizing: "border-box",
};

const ghostBtn: React.CSSProperties = {
  padding: "9px 16px",
  background: "transparent",
  border: "1px solid var(--border-2)",
  borderRadius: "8px",
  color: "var(--text-2)",
  fontSize: "0.82rem",
  fontWeight: 500,
  cursor: "pointer",
};
