"use client";

import { useState } from "react";
import { useRiskModels, useModelVersions } from "@/hooks/useApi";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/apiClient";
import { Brain, Layers } from "lucide-react";
import type { RiskModel, ModelVersion } from "@/types";

type Tab = "models" | "versions";

export default function DecisionsPage() {
  const [tab, setTab] = useState<Tab>("models");
  const { data: modelsData, isLoading: modelsLoading, refetch: refetchModels } = useRiskModels();
  const { data: versionsData, isLoading: versionsLoading, refetch: refetchVersions } = useModelVersions();

  async function handleToggleModel(id: number) {
    await apiClient.patch(`/admin/risk-models/${id}/toggle`);
    refetchModels();
  }

  async function handleActivateVersion(id: number) {
    await apiClient.patch(`/admin/model-versions/${id}/activate`);
    refetchVersions();
  }

  const modelColumns = [
    { key: "key", label: "Clé", render: (val: unknown) => <code className="text-xs bg-gray-100 px-1 rounded">{val as string}</code> },
    { key: "name", label: "Nom" },
    { key: "description", label: "Description", render: (val: unknown) => (val as string) ?? "—" },
    {
      key: "is_active",
      label: "Actif",
      render: (val: unknown) => <Badge variant={val ? "success" : "default"}>{val ? "Actif" : "Inactif"}</Badge>,
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: RiskModel) => (
        <button
          onClick={() => handleToggleModel(row.id)}
          className="text-xs text-emerald-600 hover:underline"
        >
          {row.is_active ? "Désactiver" : "Activer"}
        </button>
      ),
    },
  ];

  const versionColumns = [
    { key: "name", label: "Nom" },
    { key: "version", label: "Version" },
    {
      key: "is_active",
      label: "Active",
      render: (val: unknown) => <Badge variant={val ? "success" : "default"}>{val ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "created_at",
      label: "Créée le",
      render: (val: unknown) => formatDate(val as string),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: ModelVersion) =>
        !row.is_active ? (
          <button
            onClick={() => handleActivateVersion(row.id)}
            className="text-xs text-emerald-600 hover:underline"
          >
            Activer
          </button>
        ) : (
          <span className="text-xs text-gray-400">Version courante</span>
        ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit">
        {([
          { id: "models", label: "Modèles de risque", icon: Brain },
          { id: "versions", label: "Versions", icon: Layers },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === id ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "models" && (
        <DataTable
          columns={modelColumns}
          data={modelsData?.data ?? []}
          isLoading={modelsLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Aucun modèle de risque"
        />
      )}

      {tab === "versions" && (
        <DataTable
          columns={versionColumns}
          data={versionsData?.data ?? []}
          isLoading={versionsLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Aucune version de modèle"
        />
      )}
    </div>
  );
}
