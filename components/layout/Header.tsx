"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { getPrimaryRole } from "@/types";

const breadcrumbs: Record<string, string[]> = {
  "/dashboard":      ["Dashboard"],
  "/patients":       ["Dashboard", "Patients"],
  "/ambassadeurs":   ["Dashboard", "Ambassadeurs"],
  "/evaluations":    ["Dashboard", "Evaluations"],
  "/questionnaires": ["Dashboard", "Questionnaires"],
  "/decisions":      ["Dashboard", "Décisions"],
  "/statistiques":   ["Dashboard", "Statistiques"],
};

export function Header() {
  const pathname = usePathname();
  const { identity } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const crumbs = breadcrumbs[pathname] ?? ["Dashboard"];

  return (
    <header
      style={{
        height: "56px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb */}
      <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && (
              <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>/</span>
            )}
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
                color: i === crumbs.length - 1 ? "var(--text)" : "var(--text-3)",
              }}
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Search */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "6px 14px",
            color: "var(--text-3)",
            fontSize: "0.78rem",
            cursor: "pointer",
          }}
        >
          <Search size={13} />
          <span>Rechercher…</span>
          <kbd
            style={{
              marginLeft: "16px",
              padding: "1px 5px",
              background: "var(--surface-3)",
              border: "1px solid var(--border-2)",
              borderRadius: "4px",
              fontSize: "0.68rem",
              color: "var(--text-3)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          style={{
            width: 34, height: 34,
            borderRadius: "8px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-3)",
            cursor: "pointer",
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Bell */}
        <button
          style={{
            width: 34, height: 34,
            borderRadius: "8px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-3)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Bell size={14} />
          <span
            style={{
              position: "absolute",
              top: "7px", right: "7px",
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "var(--brand)",
            }}
          />
        </button>

        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
          }}
        >
          <div
            style={{
              width: 26, height: 26,
              borderRadius: "50%",
              background: "var(--brand-dim)",
              border: "1.5px solid var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--brand)",
              flexShrink: 0,
            }}
          >
            {identity?._email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)" }}>
              {identity?._email ?? identity?.id?.slice(0, 8) ?? "Compte"}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>
              {identity ? getPrimaryRole(identity) : "—"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
