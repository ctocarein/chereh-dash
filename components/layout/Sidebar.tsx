"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Share2,
  ClipboardList,
  BookOpen,
  Brain,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";

const navigation = [
  { name: "Dashboard",      href: "/dashboard",       icon: LayoutDashboard },
  { name: "Patients",       href: "/patients",        icon: Users },
  { name: "Ambassadeurs",   href: "/ambassadeurs",    icon: Share2 },
  { name: "Evaluations",    href: "/evaluations",     icon: ClipboardList },
  { name: "Questionnaires", href: "/questionnaires",  icon: BookOpen },
  { name: "Décisions",      href: "/decisions",       icon: Brain },
  { name: "Statistiques",   href: "/statistiques",    icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, identity } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try { await apiClient.post("/identity/logout"); } catch {}
    logout();
    router.push("/login");
  }

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
        gap: 0,
        flexShrink: 0,
        position: "relative",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "28px" }}>
        <CherehLogo />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%", padding: "0 12px" }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <NavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%", padding: "0 12px" }}>
        {/* Avatar */}
        <div
          title={identity?._email ?? identity?.id ?? "Compte"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--brand-dim)",
            border: "1.5px solid var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--brand)",
            cursor: "default",
          }}
        >
          {identity?._email?.[0]?.toUpperCase() ?? "A"}
        </div>

        {/* Logout */}
        <Tooltip label="Déconnexion">
          <button
            onClick={handleLogout}
            className="nav-link"
            aria-label="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

function NavItem({ item, isActive }: { item: typeof navigation[0]; isActive: boolean }) {
  return (
    <Tooltip label={item.name}>
      <Link
        href={item.href}
        className={`nav-link${isActive ? " active" : ""}`}
        aria-label={item.name}
      >
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
        style={{
          position: "absolute",
          left: "calc(100% + 10px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "var(--surface-3)",
          border: "1px solid var(--border-2)",
          color: "var(--text)",
          fontSize: "0.72rem",
          fontWeight: 500,
          padding: "4px 10px",
          borderRadius: "6px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.15s",
          zIndex: 100,
        }}
        className="group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

function CherehLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fond circulaire */}
      <circle cx="16" cy="16" r="15" fill="var(--brand-dim)" stroke="var(--brand)" strokeWidth="1" />
      {/* Croix médicale stylisée */}
      <rect x="13" y="8" width="6" height="16" rx="2" fill="var(--brand)" />
      <rect x="8" y="13" width="16" height="6" rx="2" fill="var(--brand)" />
      {/* Point central lumineux */}
      <circle cx="16" cy="16" r="2.5" fill="var(--bg)" />
    </svg>
  );
}
