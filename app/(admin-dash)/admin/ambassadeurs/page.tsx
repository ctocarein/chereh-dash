"use client";

import { useState } from "react";
import { useAdminAmbassadors, useActivateAmbassador, useIdentityPhoneSearch } from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Share2, CheckCircle, UserPlus, Search,
  Star, TrendingUp, Users, Award, Phone,
} from "lucide-react";

interface AmbassadorRow {
  id: string;
  status: string;
  activated_at: string | null;
  email: string | null;
  identity_id: string;
  level: string | null;
  badges_count: number;
  referrals_total: number;
  referrals_used: number;
}

export default function AmbassadeursPage() {
  const [page, setPage]               = useState(1);
  const [promoteModal, setPromoteModal] = useState(false);
  const [identitySearch, setIdentitySearch] = useState("");
  const [selectedIdentity, setSelectedIdentity] = useState<{ id: string; phone: string } | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  const { data, isLoading } = useAdminAmbassadors(page);
  const activate            = useActivateAmbassador();
  const { data: searchData, isFetching: searching } = useIdentityPhoneSearch(identitySearch);

  const ambassadors: AmbassadorRow[] = data?.data ?? [];
  const meta = data?.meta;

  const searchResults = (searchData?.data ?? []) as Array<{ id: string; _phone?: string; _email?: string }>;

  const kpis = [
    { label: "Total ambassadeurs", value: meta?.total ?? "—",                                      icon: Users,    color: "var(--brand)",   bg: "var(--brand-dim)"       },
    { label: "Actifs",             value: ambassadors.filter((a) => a.status === "active").length,  icon: CheckCircle, color: "var(--success)", bg: "rgba(16,185,129,0.1)" },
    { label: "Referrals totaux",   value: ambassadors.reduce((s, a) => s + a.referrals_total, 0),   icon: Share2,   color: "var(--info)",    bg: "rgba(59,130,246,0.1)"  },
    { label: "Referrals utilisés", value: ambassadors.reduce((s, a) => s + a.referrals_used, 0),    icon: TrendingUp, color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
  ];

  async function handleActivate() {
    if (!selectedIdentity) return;
    setActivateError(null);
    try {
      await activate.mutateAsync({ identity_id: selectedIdentity.id });
      setPromoteModal(false);
      setSelectedIdentity(null);
      setIdentitySearch("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setActivateError(msg ?? "Une erreur est survenue.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
            Ambassadeurs
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Gérez le réseau d'ambassadeurs et promouvoir des bénéficiaires
          </p>
        </div>
        <button
          onClick={() => setPromoteModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "var(--brand)", border: "none", borderRadius: "9px", color: "#0A0B0F", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}
        >
          <UserPlus size={15} /> Promouvoir un bénéficiaire
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "9px", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={15} color={kpi.color} />
              </div>
            </div>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>
              {kpi.value}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0, fontWeight: 500 }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Ambassadeur", "Statut", "Niveau", "Badges", "Referrals", "Activé le"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid var(--border)", gap: "0" }}>
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "65%", background: "var(--surface-2)", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : ambassadors.length === 0 ? (
          <div style={{ padding: "48px 20px", textAlign: "center" }}>
            <Award size={28} color="var(--text-3)" style={{ marginBottom: "10px" }} />
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucun ambassadeur pour le moment</p>
          </div>
        ) : (
          ambassadors.map((amb) => (
            <div
              key={amb.id}
              style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}
            >
              {/* Email */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                  {amb.email?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{amb.email ?? "—"}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-3)", margin: 0, fontFamily: "monospace" }}>{amb.id.slice(0, 12)}…</p>
                </div>
              </div>

              {/* Status */}
              <Badge variant={amb.status === "active" ? "success" : "default"}>
                {amb.status === "active" ? "Actif" : "Inactif"}
              </Badge>

              {/* Level */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Star size={11} color="var(--warning)" />
                <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 600 }}>{amb.level ?? "—"}</span>
              </div>

              {/* Badges */}
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{amb.badges_count}</span>

              {/* Referrals */}
              <div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{amb.referrals_used}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>/{amb.referrals_total}</span>
              </div>

              {/* Date */}
              <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(amb.activated_at ?? "")}</span>
            </div>
          ))
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
              Page {meta.current_page} / {meta.last_page} · {meta.total} ambassadeurs
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>Préc.</button>
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} style={pageBtn}>Suiv.</button>
            </div>
          </div>
        )}
      </div>

      {/* Promote modal */}
      {promoteModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}
          onClick={(e) => e.target === e.currentTarget && setPromoteModal(false)}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", width: "460px", maxWidth: "90vw" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus size={18} color="var(--brand)" />
              </div>
              <div>
                <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>Promouvoir en ambassadeur</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", margin: 0 }}>Sélectionnez un bénéficiaire à activer</p>
              </div>
            </div>

            {/* Phone search */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <Phone size={13} color="var(--text-3)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="tel"
                value={identitySearch}
                onChange={(e) => setIdentitySearch(e.target.value)}
                placeholder="Ex : +225 07 00 00 00 00"
                style={{ width: "100%", padding: "10px 14px 10px 34px", background: "var(--surface-2)", border: "1px solid var(--border-2)", borderRadius: "8px", color: "var(--text)", fontSize: "0.83rem", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
              />
              {searching && (
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, border: "2px solid var(--border-2)", borderTopColor: "var(--brand)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              )}
            </div>

            {/* Hint */}
            {identitySearch.trim().length < 3 && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textAlign: "center", padding: "8px 0 12px", margin: 0 }}>
                Saisissez au moins 3 caractères pour rechercher
              </p>
            )}

            {/* Results */}
            <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px", marginBottom: "16px", paddingRight: "2px" }}>
              {identitySearch.trim().length >= 3 && !searching && searchResults.length === 0 ? (
                <p style={{ fontSize: "0.78rem", color: "var(--text-3)", textAlign: "center", padding: "16px 0" }}>Aucun bénéficiaire trouvé</p>
              ) : (
                searchResults.map((identity) => {
                  const isSelected = selectedIdentity?.id === identity.id;
                  const display = identity._phone ?? identity._email ?? identity.id;
                  return (
                    <button
                      key={identity.id}
                      type="button"
                      onClick={() => setSelectedIdentity({ id: identity.id, phone: display })}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px",
                        background: isSelected ? "var(--brand-dim)" : "var(--surface-2)",
                        border: `1.5px solid ${isSelected ? "var(--brand)" : "transparent"}`,
                        borderRadius: "8px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.1s",
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: isSelected ? "rgba(20,184,166,0.2)" : "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Phone size={12} color={isSelected ? "var(--brand)" : "var(--text-3)"} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.8rem", color: isSelected ? "var(--brand)" : "var(--text-2)", fontWeight: isSelected ? 600 : 400, margin: 0 }}>
                          {identity._phone ?? "—"}
                        </p>
                        {identity._email && (
                          <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0 }}>{identity._email}</p>
                        )}
                      </div>
                      {isSelected && <CheckCircle size={14} color="var(--brand)" style={{ marginLeft: "auto" }} />}
                    </button>
                  );
                })
              )}
            </div>

            {activateError && (
              <p style={{ fontSize: "0.75rem", color: "var(--danger)", margin: "0 0 12px" }}>{activateError}</p>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setPromoteModal(false); setSelectedIdentity(null); setActivateError(null); }} style={ghostBtn}>
                Annuler
              </button>
              <button
                onClick={handleActivate}
                disabled={!selectedIdentity || activate.isPending}
                style={{ padding: "9px 18px", background: selectedIdentity ? "var(--brand)" : "var(--surface-3)", border: "none", borderRadius: "8px", color: selectedIdentity ? "#0A0B0F" : "var(--text-3)", fontSize: "0.82rem", fontWeight: 700, cursor: selectedIdentity ? "pointer" : "not-allowed", transition: "all 0.15s" }}
              >
                {activate.isPending ? "Activation…" : "Activer comme ambassadeur"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 4px; }
      `}</style>
    </div>
  );
}

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

const pageBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "var(--surface)",
  border: "1px solid var(--border-2)",
  borderRadius: "6px",
  color: "var(--text-2)",
  fontSize: "0.72rem",
  cursor: "pointer",
};
