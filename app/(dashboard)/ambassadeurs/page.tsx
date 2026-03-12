"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { formatDate } from "@/lib/utils";
import { Share2, Users, TrendingUp, CheckCircle, Search, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Ambassador {
  id: string;
  identity_id: string;
  organization_id: string | null;
  status: string;
  referral_code: string;
  total_referrals: number;
  successful_referrals: number;
  created_at: string;
  identity?: {
    id: string;
    _phone?: string;
    _email?: string;
    personal?: { first_name?: string; last_name?: string };
  };
}

interface AmbassadorMetrics {
  total_ambassadors: number;
  active_ambassadors: number;
  total_referrals: number;
  successful_referrals: number;
}

function useOrgAmbassadors(page = 1, search = "") {
  return useQuery({
    queryKey: ["org", "ambassadors", page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (search) params.set("search", search);
      return apiClient.get(`/ambassador/admin/list?${params}`).then((r) => r.data);
    },
  });
}

function useOrgAmbassadorMetrics() {
  return useQuery({
    queryKey: ["org", "ambassador-metrics"],
    queryFn: () => apiClient.get("/ambassador/metrics").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

function getDisplayName(amb: Ambassador): string {
  const p = amb.identity?.personal;
  if (p?.first_name || p?.last_name) return [p.first_name, p.last_name].filter(Boolean).join(" ");
  return amb.identity?._phone ?? amb.identity?._email ?? "—";
}

export default function AmbassadeursPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [debSearch, setDebSearch] = useState("");

  const { data, isLoading } = useOrgAmbassadors(page, debSearch);
  const { data: metrics }   = useOrgAmbassadorMetrics();

  const ambassadors: Ambassador[] = data?.data ?? [];
  const meta = data?.meta;
  const m: AmbassadorMetrics | undefined = metrics;

  function handleSearch(val: string) {
    setSearch(val);
    clearTimeout((window as unknown as { _ast?: number })._ast);
    (window as unknown as { _ast?: number })._ast = window.setTimeout(() => {
      setDebSearch(val);
      setPage(1);
    }, 400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total ambassadeurs",  value: m?.total_ambassadors      ?? "—", icon: Users,       color: "var(--brand)",   bg: "var(--brand-dim)"     },
          { label: "Actifs",              value: m?.active_ambassadors     ?? "—", icon: CheckCircle, color: "var(--success)", bg: "rgba(16,185,129,0.1)" },
          { label: "Référrals total",     value: m?.total_referrals        ?? "—", icon: Share2,      color: "var(--info)",    bg: "rgba(59,130,246,0.1)" },
          { label: "Référrals validés",   value: m?.successful_referrals   ?? "—", icon: TrendingUp,  color: "var(--warning)", bg: "rgba(245,158,11,0.1)" },
        ].map((kpi) => (
          <div key={kpi.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <kpi.icon size={15} color={kpi.color} />
            </div>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", margin: "0 0 4px", letterSpacing: "-0.04em", lineHeight: 1 }}>{kpi.value}</p>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", margin: 0, fontWeight: 500 }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: "0 0 280px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone…"
            style={{ width: "100%", paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text)", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e)  => (e.target.style.borderColor = "var(--border-2)")}
          />
        </div>
        {meta && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{meta.total} ambassadeur(s)</span>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }}>
          {["Ambassadeur", "Code de référral", "Référrals", "Validés", "Statut", "Depuis le"].map((h) => (
            <span key={h} style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} style={{ height: 12, width: "60%", background: "var(--surface-2)", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
              ))}
            </div>
          ))
        ) : ambassadors.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <Share2 size={30} color="var(--text-3)" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-2)", margin: "0 0 4px" }}>Aucun ambassadeur</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: 0 }}>Les ambassadeurs actifs de votre organisation apparaîtront ici.</p>
          </div>
        ) : (
          ambassadors.map((amb) => {
            const conversionRate = amb.total_referrals > 0
              ? Math.round((amb.successful_referrals / amb.total_referrals) * 100)
              : 0;

            return (
              <div key={amb.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                {/* Name + contact */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.72rem", fontWeight: 700, color: "var(--brand)" }}>
                    {getDisplayName(amb)[0]?.toUpperCase() ?? "A"}
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>{getDisplayName(amb)}</p>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-3)", margin: 0 }}>
                      {amb.identity?._phone ?? amb.identity?._email ?? ""}
                    </p>
                  </div>
                </div>

                {/* Referral code */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <code style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--brand)", background: "var(--brand-dim)", padding: "2px 8px", borderRadius: 6, letterSpacing: "0.05em" }}>
                    {amb.referral_code}
                  </code>
                  <ExternalLink size={11} color="var(--text-3)" />
                </div>

                {/* Total referrals */}
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>{amb.total_referrals}</span>

                {/* Successful + rate */}
                <div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--success)" }}>{amb.successful_referrals}</span>
                  {amb.total_referrals > 0 && (
                    <span style={{ fontSize: "0.65rem", color: "var(--text-3)", marginLeft: 5 }}>{conversionRate}%</span>
                  )}
                </div>

                {/* Status */}
                <Badge variant={amb.status === "active" ? "success" : "default"}>
                  {amb.status === "active" ? "Actif" : "Inactif"}
                </Badge>

                {/* Date */}
                <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(amb.created_at)}</span>
              </div>
            );
          })
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

const pageBtn: React.CSSProperties = {
  padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border-2)",
  borderRadius: 6, color: "var(--text-2)", fontSize: "0.72rem", cursor: "pointer",
};
