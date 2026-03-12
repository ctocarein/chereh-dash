"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { getPrimaryRole } from "@/types";
import type { Identity } from "@/types";
import Link from "next/link";
import {
  LayoutDashboard, Users, ClipboardList, LogOut, Building2,
  UserCog, Activity, Brain,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useThemeStore } from "@/stores/themeStore";
import { Sun, Moon, Bell } from "lucide-react";

const navigation = [
  { name: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { name: "Patients",      href: "/patients",      icon: Users            },
  { name: "Utilisateurs",  href: "/utilisateurs",  icon: UserCog          },
  { name: "Évaluations",   href: "/evaluations",   icon: ClipboardList    },
  { name: "Triage",        href: "/triage",        icon: Activity         },
  { name: "Décisions",     href: "/decisions",     icon: Brain            },
  { name: "Organisation",  href: "/organisation",  icon: Building2        },
];

export default function OrgDashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated, identity, logout, mustChangePassword } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    const role = identity ? getPrimaryRole(identity) : null;
    if (role !== "OrgManager" && role !== "Practitioner") {
      router.replace("/login");
      return;
    }
    if (mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
    }
  }, [hasHydrated, isAuthenticated, identity, router, mustChangePassword, pathname]);

  if (!hasHydrated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", opacity: 0.3 + i * 0.25 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  async function handleLogout() {
    try { await apiClient.post("/identity/logout"); } catch {}
    logout();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <OrgSidebar identity={identity} onLogout={handleLogout} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <OrgHeader identity={identity} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar ── */
function OrgSidebar({ identity, onLogout }: { identity: Identity | null; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        paddingBottom: "16px",
        flexShrink: 0,
        position: "relative",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "28px" }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" fill="var(--brand-dim)" stroke="var(--brand)" strokeWidth="1" />
          <rect x="13" y="8" width="6" height="16" rx="2" fill="var(--brand)" />
          <rect x="8" y="13" width="16" height="6" rx="2" fill="var(--brand)" />
          <circle cx="16" cy="16" r="2.5" fill="var(--bg)" />
        </svg>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%", padding: "0 12px" }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <OrgNavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%", padding: "0 12px" }}>
        <div
          title={identity?._email ?? "Compte"}
          style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--brand)", cursor: "default" }}
        >
          {identity?._email?.[0]?.toUpperCase() ?? "O"}
        </div>
        <Tooltip label="Déconnexion">
          <button onClick={onLogout} className="nav-link" aria-label="Déconnexion">
            <LogOut size={16} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

function OrgNavItem({ item, isActive }: { item: typeof navigation[0]; isActive: boolean }) {
  return (
    <Tooltip label={item.name}>
      <Link href={item.href} className={`nav-link${isActive ? " active" : ""}`} aria-label={item.name}>
        <item.icon size={17} />
      </Link>
    </Tooltip>
  );
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "flex" }} className="group">
      {children}
      <span
        style={{ position: "absolute", left: "calc(100% + 10px)", top: "50%", transform: "translateY(-50%)", background: "var(--surface-3)", border: "1px solid var(--border-2)", color: "var(--text)", fontSize: "0.72rem", fontWeight: 500, padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap", pointerEvents: "none", opacity: 0, transition: "opacity 0.15s", zIndex: 100 }}
        className="group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

/* ── Header ── */
function OrgHeader({ identity }: { identity: Identity | null }) {
  const { theme, toggleTheme } = useThemeStore();
  const pathname = usePathname();

  const breadcrumbs: Record<string, string[]> = {
    "/dashboard":    ["Dashboard"],
    "/patients":     ["Dashboard", "Patients"],
    "/utilisateurs": ["Dashboard", "Utilisateurs"],
    "/evaluations":  ["Dashboard", "Évaluations"],
    "/triage":       ["Dashboard", "Triage"],
    "/decisions":    ["Dashboard", "Décisions"],
    "/organisation":    ["Dashboard", "Organisation"],
    "/change-password": ["Dashboard", "Changer le mot de passe"],
  };
  const crumbs = breadcrumbs[pathname] ?? ["Dashboard"];

  return (
    <header style={{ height: "56px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
      <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && <span style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>/</span>}
            <span style={{ fontSize: "0.82rem", fontWeight: i === crumbs.length - 1 ? 600 : 400, color: i === crumbs.length - 1 ? "var(--text)" : "var(--text-3)" }}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Theme toggle */}
        <button onClick={toggleTheme} title={theme === "dark" ? "Mode clair" : "Mode sombre"} style={iconBtnStyle}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Bell */}
        <button style={{ ...iconBtnStyle, position: "relative" }}>
          <Bell size={14} />
          <span style={{ position: "absolute", top: "7px", right: "7px", width: "6px", height: "6px", borderRadius: "50%", background: "var(--brand)" }} />
        </button>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-2)" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brand-dim)", border: "1.5px solid var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
            {identity?._email?.[0]?.toUpperCase() ?? "O"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text)" }}>
              {identity?._email ?? "Compte"}
            </span>
            <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>{identity ? (getPrimaryRole(identity) ?? "Membre") : "Membre"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 34, height: 34,
  borderRadius: "8px",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-3)",
  cursor: "pointer",
};
