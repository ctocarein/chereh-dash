"use client";

import { useState } from "react";
import {
  useOnboardingRequests, useApproveOnboardingRequest, useRejectOnboardingRequest,
  useOrganizations, useUpdateOrganization,
} from "@/hooks/useApi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  Building2, Clock, CheckCircle, XCircle, AlertCircle,
  MapPin, Mail, RefreshCw, ChevronDown, Search, X,
  Calendar, Settings, Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type RequestStatus = "email_unverified" | "pending_validation" | "approved" | "rejected";

interface OnboardingRequest {
  id: number;
  status: string;
  email: string | null;
  created_at: string;
  organization: {
    id: string; name: string; type: string;
    country: string; city: string; address: string; status: string;
  } | null;
}

interface OrgRow {
  id: string; name: string; type: string | null;
  status: string; plan: string;
  country: string | null; city: string | null; address: string | null;
  created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<RequestStatus, { label: string; variant: "success" | "warning" | "danger" | "info" | "default" }> = {
  email_unverified:   { label: "Email non vérifié", variant: "default"  },
  pending_validation: { label: "En attente",        variant: "warning"  },
  approved:           { label: "Approuvée",         variant: "success"  },
  rejected:           { label: "Rejetée",           variant: "danger"   },
};

const REJECT_REASONS = [
  { value: "incomplete_info", label: "Informations incomplètes" },
  { value: "unknown_org",     label: "Organisation inconnue"    },
  { value: "duplicate",       label: "Demande en double"        },
  { value: "other",           label: "Autre raison"             },
];

const REQUEST_TABS = [
  { value: undefined,            label: "Toutes",    icon: RefreshCw   },
  { value: "pending_validation", label: "En attente",icon: Clock       },
  { value: "approved",           label: "Approuvées",icon: CheckCircle },
  { value: "rejected",           label: "Rejetées",  icon: XCircle     },
] as const;

const PLANS = [
  { value: "Freemium",   label: "Freemium",               variant: "default" as const, limits: ["1 500 sessions max", "500 patients max"]              },
  { value: "Premium",    label: "Premium",                variant: "brand"   as const, limits: ["Sessions illimitées", "Patients illimités"]            },
  { value: "Entreprise", label: "Entreprise / Marque Blanche", variant: "warning" as const, limits: ["Accès API", "Personnalisation", "Marque blanche"] },
];

const planCfg   = Object.fromEntries(PLANS.map((p) => [p.value, p]));
const statusCfg: Record<string,{ label: string; variant: "success"|"danger"|"default" }> = {
  active:   { label: "Active",   variant: "success" },
  inactive: { label: "Inactive", variant: "danger"  },
};

const ORG_COLS = "2fr 1fr 1fr 1fr 1.2fr 56px";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StructuresPage() {
  const [mainTab, setMainTab] = useState<"demandes" | "organisations">("demandes");

  // ── Demandes state ──
  const [reqTab,       setReqTab]      = useState<string | undefined>(undefined);
  const [rejectModal,  setRejectModal] = useState<{ id: number; orgName: string } | null>(null);
  const [reasonCode,   setReasonCode]  = useState("incomplete_info");
  const [reasonDetail, setReasonDetail]= useState("");

  // ── Organisations state ──
  const [orgPage,      setOrgPage]     = useState(1);
  const [orgSearch,    setOrgSearch]   = useState("");
  const [orgDebSearch, setOrgDebSearch]= useState("");
  const [orgStatusF,   setOrgStatusF]  = useState("");
  const [selected,     setSelected]    = useState<OrgRow | null>(null);
  const [editPlan,     setEditPlan]    = useState("");
  const [editStatus,   setEditStatus]  = useState("");
  const [saving,       setSaving]      = useState(false);
  const [saved,        setSaved]       = useState(false);

  // ── Queries ──
  const { data: reqData, isLoading: reqLoading } = useOnboardingRequests(reqTab);
  const approve = useApproveOnboardingRequest();
  const reject  = useRejectOnboardingRequest();
  const requests: OnboardingRequest[] = reqData?.data ?? [];
  const pendingCount = requests.filter((r) => r.status === "pending_validation").length;

  const { data: orgData, isLoading: orgLoading } = useOrganizations(orgPage, orgDebSearch, orgStatusF);
  const update = useUpdateOrganization();
  const orgs: OrgRow[] = orgData?.data ?? [];
  const orgMeta = orgData?.meta;

  // ── Handlers ──
  async function handleApprove(id: number) { await approve.mutateAsync(id); }

  async function handleReject() {
    if (!rejectModal) return;
    await reject.mutateAsync({ id: rejectModal.id, reason_code: reasonCode, reason_detail: reasonDetail || undefined });
    setRejectModal(null); setReasonCode("incomplete_info"); setReasonDetail("");
  }

  function handleOrgSearch(val: string) {
    setOrgSearch(val);
    clearTimeout((window as unknown as { _st?: number })._st);
    (window as unknown as { _st?: number })._st = window.setTimeout(() => { setOrgDebSearch(val); setOrgPage(1); }, 400);
  }

  function openOrgDrawer(org: OrgRow) {
    setSelected(org);
    setEditPlan(org.plan ?? "Freemium");
    setEditStatus(org.status ?? "active");
    setSaved(false);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await update.mutateAsync({ id: selected.id, plan: editPlan, status: editStatus });
      setSaved(true);
      setSelected((prev) => prev ? { ...prev, plan: editPlan, status: editStatus } : prev);
    } finally { setSaving(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.02em" }}>
            Structures & Organisations
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Demandes d'onboarding et gestion des organisations partenaires
          </p>
        </div>
        {pendingCount > 0 && mainTab === "demandes" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "10px" }}>
            <AlertCircle size={14} color="var(--warning)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--warning)" }}>
              {pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente
            </span>
          </div>
        )}
      </div>

      {/* Main tabs */}
      <div style={{ display: "flex", gap: "4px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {([
          { key: "demandes",       label: "Demandes d'onboarding", icon: Clock      },
          { key: "organisations",  label: "Organisations",          icon: Building2  },
        ] as const).map(({ key, label, icon: Icon }) => {
          const active = mainTab === key;
          return (
            <button key={key} onClick={() => setMainTab(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: active ? "var(--brand-dim)" : "transparent", border: `1px solid ${active ? "rgba(20,184,166,0.3)" : "transparent"}`, borderRadius: "7px", color: active ? "var(--brand)" : "var(--text-3)", fontSize: "0.8rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
              <Icon size={13} /> {label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: DEMANDES ─────────────────────────────────────────────────────── */}
      {mainTab === "demandes" && (
        <>
          {/* Sub-tabs */}
          <div style={{ display: "flex", gap: "6px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "4px" }}>
            {REQUEST_TABS.map((tab) => {
              const active = reqTab === tab.value;
              return (
                <button key={String(tab.value)} onClick={() => setReqTab(tab.value)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 13px", background: active ? "var(--brand-dim)" : "transparent", border: `1px solid ${active ? "rgba(20,184,166,0.3)" : "transparent"}`, borderRadius: "7px", color: active ? "var(--brand)" : "var(--text-3)", fontSize: "0.78rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  <tab.icon size={13} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Requests table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              {["Structure", "Responsable", "Localisation", "Statut", "Date", "Actions"].map((h) => (
                <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>

            {reqLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
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
                  <div key={req.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr auto", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", background: isPending ? "rgba(245,158,11,0.02)" : undefined, transition: "background 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "9px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={15} color="var(--brand)" />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{req.organization?.name ?? "—"}</p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: 0 }}>{req.organization?.type ?? "—"}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Mail size={12} color="var(--text-3)" />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{req.email ?? "—"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={11} color="var(--text-3)" />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        {req.organization?.city && req.organization?.country ? `${req.organization.city}, ${req.organization.country}` : "—"}
                      </span>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(req.created_at)}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {isPending ? (
                        <>
                          <button onClick={() => handleApprove(req.id)} disabled={approve.isPending} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "7px", color: "var(--success)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
                            <CheckCircle size={12} /> Approuver
                          </button>
                          <button onClick={() => setRejectModal({ id: req.id, orgName: req.organization?.name ?? "" })} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "7px", color: "var(--danger)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
                            <XCircle size={12} /> Rejeter
                          </button>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.7rem", color: "var(--text-3)", padding: "6px 0" }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {reqData?.meta && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{reqData.meta.total} demande{reqData.meta.total !== 1 ? "s" : ""} au total</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB: ORGANISATIONS ────────────────────────────────────────────────── */}
      {mainTab === "organisations" && (
        <>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "0 0 260px" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
              <input value={orgSearch} onChange={(e) => handleOrgSearch(e.target.value)} placeholder="Nom d'organisation…" style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.target.style.borderColor = "var(--brand)")} onBlur={(e) => (e.target.style.borderColor = "var(--border-2)")} />
            </div>
            <div style={{ position: "relative" }}>
              <select value={orgStatusF} onChange={(e) => { setOrgStatusF(e.target.value); setOrgPage(1); }} style={{ padding: "8px 32px 8px 12px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", cursor: "pointer", appearance: "none" }}>
                <option value="">Tous les statuts</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={12} color="var(--text-3)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {orgMeta && <span style={{ fontSize: "0.75rem", color: "var(--text-3)", marginLeft: "auto" }}>{orgMeta.total} organisation(s)</span>}
          </div>

          {/* Orgs table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: ORG_COLS, padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
              {["Organisation", "Type", "Plan", "Statut", "Localisation", ""].map((h) => (
                <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
              ))}
            </div>

            {orgLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: ORG_COLS, padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{ height: 12, width: "65%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                  ))}
                </div>
              ))
            ) : orgs.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center" }}>
                <Building2 size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-3)", margin: 0 }}>Aucune organisation trouvée</p>
              </div>
            ) : (
              orgs.map((org) => {
                const plan   = planCfg[org.plan]   ?? { label: org.plan,   variant: "default" as const };
                const status = statusCfg[org.status] ?? { label: org.status, variant: "default" as const };
                return (
                  <div key={org.id} onClick={() => openOrgDrawer(org)} style={{ display: "grid", gridTemplateColumns: ORG_COLS, padding: "13px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", cursor: "pointer", transition: "background 0.12s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={14} color="var(--brand)" />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{org.name}</p>
                        <p style={{ fontSize: "0.63rem", color: "var(--text-3)", margin: 0, fontFamily: "monospace" }}>{org.id.slice(0, 12)}…</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{org.type ?? "—"}</span>
                    <Badge variant={plan.variant}>{plan.label}</Badge>
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={11} color="var(--text-3)" />
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        {org.city && org.country ? `${org.city}, ${org.country}` : org.city ?? org.country ?? "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <Settings size={14} color="var(--text-3)" />
                    </div>
                  </div>
                );
              })
            )}

            {orgMeta && orgMeta.last_page > 1 && (
              <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>Page {orgMeta.current_page} / {orgMeta.last_page} · {orgMeta.total} orgs</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setOrgPage((p) => Math.max(1, p - 1))} disabled={orgPage === 1} style={pageBtn}>Préc.</button>
                  <button onClick={() => setOrgPage((p) => Math.min(orgMeta.last_page, p + 1))} disabled={orgPage === orgMeta.last_page} style={pageBtn}>Suiv.</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Reject modal ──────────────────────────────────────────────────────── */}
      {rejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }} onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}>
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
                <label style={labelSt}>Motif du rejet</label>
                <div style={{ position: "relative" }}>
                  <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} style={{ ...selectSt }}>
                    {REJECT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <ChevronDown size={13} color="var(--text-3)" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>
              <div>
                <label style={labelSt}>Détail (optionnel)</label>
                <textarea value={reasonDetail} onChange={(e) => setReasonDetail(e.target.value)} placeholder="Précisez si nécessaire…" rows={3} style={{ ...selectSt, resize: "vertical", lineHeight: 1.5 }} />
              </div>
              {reject.isError && <p style={{ fontSize: "0.75rem", color: "var(--danger)", margin: 0 }}>Une erreur est survenue. Réessayez.</p>}
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button onClick={() => setRejectModal(null)} style={ghostBtn}>Annuler</button>
                <button onClick={handleReject} disabled={reject.isPending} style={{ padding: "9px 18px", background: "var(--danger)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", opacity: reject.isPending ? 0.6 : 1 }}>
                  {reject.isPending ? "Rejet…" : "Confirmer le rejet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Org settings drawer ───────────────────────────────────────────────── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "flex-end", zIndex: 1000, backdropFilter: "blur(2px)" }} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={{ width: "440px", maxWidth: "92vw", height: "100%", background: "var(--surface)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>

            {/* Drawer header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--brand-dim)", border: "2px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={18} color="var(--brand)" />
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>{selected.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0 }}>{selected.type ?? "Organisation"}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Infos */}
              <DrawerSection title="Informations" icon={<Building2 size={13} color="var(--brand)" />}>
                <InfoRow icon={<MapPin size={12} />}   label="Localisation" value={[selected.city, selected.country].filter(Boolean).join(", ") || "—"} />
                <InfoRow icon={<Calendar size={12} />} label="Créée le"     value={formatDate(selected.created_at)} />
              </DrawerSection>

              {/* Plan */}
              <DrawerSection title="Type de paiement" icon={<Zap size={13} color="var(--brand)" />}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PLANS.map((p) => {
                    const active = editPlan === p.value;
                    return (
                      <button key={p.value} onClick={() => setEditPlan(p.value)} style={{ padding: "12px 14px", borderRadius: 9, border: `1.5px solid ${active ? "var(--brand)" : "var(--border-2)"}`, background: active ? "var(--brand-dim)" : "var(--surface)", cursor: "pointer", transition: "all 0.15s", textAlign: "left" }}>
                        <p style={{ fontSize: "0.82rem", fontWeight: 700, color: active ? "var(--brand)" : "var(--text)", margin: 0 }}>{p.label}</p>
                        <p style={{ fontSize: "0.68rem", color: "var(--text-3)", margin: "4px 0 0", lineHeight: 1.5 }}>{p.limits.join(" · ")}</p>
                      </button>
                    );
                  })}
                </div>
              </DrawerSection>

              {/* Statut */}
              <DrawerSection title="Statut de la page" icon={<Settings size={13} color="var(--brand)" />}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditStatus("active")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${editStatus === "active" ? "var(--success)" : "var(--border-2)"}`, background: editStatus === "active" ? "rgba(16,185,129,0.1)" : "var(--surface)", color: editStatus === "active" ? "var(--success)" : "var(--text-2)", fontSize: "0.78rem", fontWeight: editStatus === "active" ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                    <CheckCircle size={13} /> Active
                  </button>
                  <button onClick={() => setEditStatus("inactive")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${editStatus === "inactive" ? "var(--danger)" : "var(--border-2)"}`, background: editStatus === "inactive" ? "rgba(239,68,68,0.08)" : "var(--surface)", color: editStatus === "inactive" ? "var(--danger)" : "var(--text-2)", fontSize: "0.78rem", fontWeight: editStatus === "inactive" ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                    <XCircle size={13} /> Inactive
                  </button>
                </div>
              </DrawerSection>

              {/* Save */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={handleSave} disabled={saving} style={{ padding: "10px 22px", background: "var(--brand)", border: "none", borderRadius: 9, color: "#fff", fontSize: "0.84rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
                {saved && !saving && (
                  <span style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle size={13} /> Sauvegardé
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DrawerSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</span>
      </div>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
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
      <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};

const labelSt: React.CSSProperties = {
  display: "block", fontSize: "0.7rem", fontWeight: 600, color: "var(--text-2)",
  marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em",
};

const selectSt: React.CSSProperties = {
  width: "100%", padding: "10px 14px", background: "var(--surface-2)",
  border: "1px solid var(--border-2)", borderRadius: "8px", color: "var(--text)",
  fontSize: "0.83rem", outline: "none", appearance: "none", boxSizing: "border-box",
};

const ghostBtn: React.CSSProperties = {
  padding: "9px 16px", background: "transparent", border: "1px solid var(--border-2)",
  borderRadius: "8px", color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
};
