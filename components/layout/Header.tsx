"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Sun, Moon, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { apiClient } from "@/lib/apiClient";
import { getPrimaryRole } from "@/types";

const breadcrumbs: Record<string, string[]> = {
  "/admin/dashboard":      ["Admin", "Dashboard"],
  "/admin/structures":     ["Admin", "Structures"],
  "/admin/patients":       ["Admin", "Patients"],
  "/admin/ambassadeurs":   ["Admin", "Ambassadeurs"],
  "/admin/evaluations":    ["Admin", "Evaluations"],
  "/admin/questionnaires": ["Admin", "Questionnaires"],
  "/admin/decisions":      ["Admin", "Décisions"],
  "/admin/statistiques":   ["Admin", "Statistiques"],
};

export function Header() {
  const pathname = usePathname();
  const { identity, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const crumbs = breadcrumbs[pathname] ?? ["Dashboard"];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    try { await apiClient.post("/identity/logout"); } catch {}
    logout();
    router.push("/login");
  }

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

        {/* Avatar + name + dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: `1px solid ${menuOpen ? "var(--brand)" : "var(--border)"}`,
              background: "var(--surface-2)",
              cursor: "pointer",
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
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, textAlign: "left" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)" }}>
                {identity?._email ?? identity?.id?.slice(0, 8) ?? "Compte"}
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>
                {identity ? getPrimaryRole(identity) : "—"}
              </span>
            </div>
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: "160px",
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "8px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                zIndex: 200,
                overflow: "hidden",
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  color: "var(--danger, #ef4444)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <LogOut size={13} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
