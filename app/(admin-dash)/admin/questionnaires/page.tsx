"use client";

import { useState } from "react";
import { useQuestions, useToggleQuestion, useThematicBlocs, useQuestionGroups } from "@/hooks/useApi";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { ToggleLeft, ToggleRight } from "lucide-react";
import type { QuestionTemplate } from "@/types";

type Tab = "questions" | "groups" | "blocs";

const tabs: { id: Tab; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "groups",    label: "Groupes" },
  { id: "blocs",     label: "Blocs thématiques" },
];

export default function QuestionnairesPage() {
  const [tab, setTab] = useState<Tab>("questions");
  const [page, setPage] = useState(1);

  const { data: questionsData, isLoading: qLoading } = useQuestions(page);
  const { data: groupsData,    isLoading: gLoading } = useQuestionGroups();
  const { data: blocsData,     isLoading: bLoading } = useThematicBlocs();
  const { mutate: toggleQuestion } = useToggleQuestion();

  const questionColumns = [
    {
      key: "key",
      label: "Clé",
      render: (val: unknown) => (
        <code style={{ fontSize: "0.72rem", background: "var(--surface-2)", color: "var(--brand)", padding: "2px 6px", borderRadius: "4px" }}>
          {val as string}
        </code>
      ),
    },
    { key: "label", label: "Question" },
    {
      key: "type",
      label: "Type",
      render: (val: unknown) => <Badge variant="info">{val as string}</Badge>,
    },
    {
      key: "risk_weight",
      label: "Poids",
      render: (val: unknown) => (
        <span style={{ fontWeight: 600, color: val !== null ? "var(--text)" : "var(--text-3)" }}>
          {val !== null ? String(val) : "—"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Actif",
      render: (val: unknown, row: QuestionTemplate) => (
        <button
          onClick={() => toggleQuestion(row.id)}
          style={{ display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", color: val ? "var(--brand)" : "var(--text-3)", fontSize: "0.78rem", padding: 0 }}
        >
          {val ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {val ? "Oui" : "Non"}
        </button>
      ),
    },
    {
      key: "created_at",
      label: "Créé le",
      render: (val: unknown) => <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{formatDate(val as string)}</span>,
    },
  ];

  const simpleColumns = [
    {
      key: "key",
      label: "Clé",
      render: (val: unknown) => (
        <code style={{ fontSize: "0.72rem", background: "var(--surface-2)", color: "var(--brand)", padding: "2px 6px", borderRadius: "4px" }}>
          {val as string}
        </code>
      ),
    },
    { key: "label", label: "Nom" },
    { key: "order", label: "Ordre" },
    {
      key: "is_active",
      label: "Actif",
      render: (val: unknown) => <Badge variant={val ? "success" : "default"}>{val ? "Actif" : "Inactif"}</Badge>,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Tab switcher */}
      <div
        style={{
          display: "inline-flex",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "9px",
          padding: "3px",
          gap: "2px",
        }}
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPage(1); }}
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              border: "none",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              background: tab === id ? "var(--brand)" : "transparent",
              color: tab === id ? "#0A0B0F" : "var(--text-3)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <>
          <DataTable columns={questionColumns} data={questionsData?.data ?? []} isLoading={qLoading} keyExtractor={(row) => row.id} emptyMessage="Aucune question" />
          {questionsData?.meta && questionsData.meta.last_page > 1 && (
            <Pagination page={page} lastPage={questionsData.meta.last_page} onChange={setPage} />
          )}
        </>
      )}
      {tab === "groups" && (
        <DataTable columns={simpleColumns} data={groupsData?.data ?? []} isLoading={gLoading} keyExtractor={(row) => row.id} emptyMessage="Aucun groupe" />
      )}
      {tab === "blocs" && (
        <DataTable columns={simpleColumns} data={blocsData?.data ?? []} isLoading={bLoading} keyExtractor={(row) => row.id} emptyMessage="Aucun bloc thématique" />
      )}
    </div>
  );
}
