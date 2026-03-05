interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand";
}

const styles: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: "rgba(255,255,255,0.05)", color: "var(--text-3)",  border: "rgba(255,255,255,0.1)" },
  success: { bg: "rgba(16,185,129,0.12)",  color: "#10B981",        border: "rgba(16,185,129,0.3)" },
  warning: { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B",        border: "rgba(245,158,11,0.3)" },
  danger:  { bg: "rgba(239,68,68,0.12)",   color: "#EF4444",        border: "rgba(239,68,68,0.3)" },
  info:    { bg: "rgba(59,130,246,0.12)",  color: "#3B82F6",        border: "rgba(59,130,246,0.3)" },
  brand:   { bg: "var(--brand-dim)",       color: "var(--brand)",   border: "rgba(20,184,166,0.3)" },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "99px",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
