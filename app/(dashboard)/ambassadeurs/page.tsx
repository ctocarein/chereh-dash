"use client";

import { useReferrals, useAmbassadorMetrics } from "@/hooks/useApi";
import { DataTable } from "@/components/ui/DataTable";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Share2, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Referral } from "@/types";

export default function AmbassadeursPage() {
  const { data: metrics } = useAmbassadorMetrics();
  const { data: referrals, isLoading } = useReferrals();

  const referralArray = Array.isArray(referrals) ? referrals : [];

  const statusCfg: Record<Referral["status"], { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
    pending: { label: "En attente", variant: "warning" },
    used:    { label: "Utilisé",    variant: "success" },
    expired: { label: "Expiré",     variant: "danger" },
    revoked: { label: "Révoqué",    variant: "default" },
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (val: unknown) => (
        <code style={{ fontSize: "0.75rem", background: "var(--surface-2)", color: "var(--brand)", padding: "2px 8px", borderRadius: "5px", letterSpacing: "0.05em" }}>
          {val as string}
        </code>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (val: unknown) => {
        const cfg = statusCfg[val as Referral["status"]] ?? { label: String(val), variant: "default" as const };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: "expires_at",
      label: "Expiration",
      render: (val: unknown) => <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
    {
      key: "used_at",
      label: "Utilisé le",
      render: (val: unknown) => <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
    {
      key: "created_at",
      label: "Créé le",
      render: (val: unknown) => <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        <StatCard title="Total referrals" value={referralArray.length} icon={Share2} color="blue" />
        <StatCard title="Utilisés" value={referralArray.filter((r) => r.status === "used").length} icon={CheckCircle} color="teal" />
        <StatCard title="En attente" value={referralArray.filter((r) => r.status === "pending").length} icon={Clock} color="amber" />
        <StatCard title="Expirés / Révoqués" value={referralArray.filter((r) => r.status === "expired" || r.status === "revoked").length} icon={XCircle} color="red" />
      </div>

      {/* Level & badges */}
      {metrics && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "12px", background: "var(--brand-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "1.3rem" }}>🏆</span>
          </div>
          <div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Niveau ambassadeur</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--brand)" }}>{metrics.level ?? "—"}</p>
          </div>
          {metrics.badges?.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginLeft: "auto" }}>
              {metrics.badges.map((b: { key: string; label: string }) => (
                <Badge key={b.key} variant="brand">{b.label}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={referralArray}
        isLoading={isLoading}
        keyExtractor={(row) => row.uuid}
        emptyMessage="Aucun referral"
      />
    </div>
  );
}
