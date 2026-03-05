import type { LucideIcon } from "lucide-react";

type Color = "teal" | "blue" | "amber" | "red" | "indigo";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; up?: boolean };
  color?: Color;
}

const colorTokens: Record<Color, { badge: string; icon: string }> = {
  teal:   { badge: "rgba(20,184,166,0.12)",  icon: "var(--brand)" },
  blue:   { badge: "rgba(59,130,246,0.12)",  icon: "#3B82F6" },
  amber:  { badge: "rgba(245,158,11,0.12)",  icon: "#F59E0B" },
  red:    { badge: "rgba(239,68,68,0.12)",   icon: "#EF4444" },
  indigo: { badge: "rgba(99,102,241,0.12)",  icon: "#6366F1" },
};

export function StatCard({ title, value, icon: Icon, trend, color = "teal" }: StatCardProps) {
  const c = colorTokens[color];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 500, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {title}
        </p>
        <div style={{ width: 34, height: 34, borderRadius: "8px", background: c.badge, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={c.icon} />
        </div>
      </div>
      <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </p>
      {trend && (
        <p style={{ fontSize: "0.72rem", color: trend.up === false ? "var(--danger)" : "var(--success)" }}>
          {trend.up === false ? "▼" : "▲"} {trend.value}
        </p>
      )}
    </div>
  );
}
